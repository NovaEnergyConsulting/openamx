import { createHash, randomUUID } from "node:crypto";
import { closeSync, existsSync, fchmodSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { AmxError, type AmxDiagnostic } from "../../../src/diagnostics/errors";
import { parseDocumentText } from "../../../src/parser/parseDocument";
import { formatAmx } from "../../../src/formatter/formatAmx";
import { checkingActivated, checkDocument } from "../../../src/typechecker/checkDocument";
import { loadEntryModule } from "../../../src/runtime/moduleLoader";
import { renderPreparedHtml } from "../../../src/renderer/renderHtml";
import { preparePdfReport, serializePdfReport } from "../../../src/renderer/reportPdf";
import { preparePdfDestination, writePdfAtomically } from "../../../src/runtime/pdfDestination";
import { prepareDocxReport, serializeDocxReport } from "../../../src/renderer/reportDocx";
import { prepareDocxDestination, writeDocxAtomically } from "../../../src/runtime/docxDestination";
import { prepareReport } from "../../../src/renderer/reportPreparation";
import { resolveDesktopInputs, validateDesktopDestination, writeDesktopHtml } from "./desktopWorkflow";
import { createPingResponse, type ActiveDocumentRequestIdentity, type DesktopJobIdentity, type DesktopJobOperation, type DesktopJobResult, type DesktopJobSnapshot, type DesktopRPCClient, type DesktopRPCError, type DesktopRPCResponse, type DocumentKind, type OpenDocument, type ProjectFile, type ProjectFileKind, type RunSummary, type TextAnalysis, type TextDiagnostic, type WorkbenchState, type RecentProject, type TransitionAction } from "../shared/rpc";
import type { WorkerJobMessage, WorkerJobRequest, WorkerJobResult } from "./jobProtocol";

const MAX_TEXT = 2_000_000;
const MAX_HTML = 8_000_000;
const MAX_FILES = 5000;
const IGNORED = new Set(["node_modules", "build", "dist", "artifacts", "generated", "out"]);

function hash(text: string): string {
	return createHash("sha256").update(text).digest("hex");
}

function errorResult<T>(error: DesktopRPCError): DesktopRPCResponse<T> {
	return { ok: false, error };
}

function diagnostic(error: unknown, file?: string): AmxDiagnostic {
	if (error instanceof AmxError) {
		return { code: error.code, message: error.message, file: error.file ?? file, line: error.line, column: error.column };
	}
	const message = error instanceof Error ? error.message : String(error);
	const location = message.match(/\bat (\d+):(\d+)/);
	return { code: "AMX3001", message, file, line: location ? Number(location[1]) : undefined, column: location ? Number(location[2]) : undefined };
}

function diagnostics(error: unknown, file?: string, privatePaths: string[] = []): TextDiagnostic[] {
	const errors = error instanceof AmxError && error.diagnostics?.length ? error.diagnostics : [diagnostic(error, file)];
	return errors.slice(0, 100).map(item => {
		let message = item.message;
		for (const privatePath of [...privatePaths].sort((left, right) => right.length - left.length)) {
			message = message.replaceAll(privatePath, "[local input]");
		}
		return {
			code: item.code.slice(0, 32), message: message.slice(0, 1000), file: item.file?.slice(0, 1000),
			line: item.line, column: item.column, inputName: item.inputName?.slice(0, 100),
			dataPath: item.dataPath?.slice(0, 500), dataLine: item.dataLine, dataColumn: item.dataColumn
		};
	});
}

function within(root: string, candidate: string): string | undefined {
	const canonicalRoot = realpathSync(root);
	const absolute = resolve(root, candidate);
	if (!existsSync(absolute)) return undefined;
	const canonical = realpathSync(absolute);
	const relation = relative(canonicalRoot, canonical);
	return relation === "" || (!relation.startsWith("..") && !relation.startsWith("/")) ? canonical : undefined;
}

function documentKind(file: string): ProjectFileKind | undefined {
	const extension = extname(file);
	if (extension === ".amx") return "amx";
	if (extension === ".csv") return "csv";
	if (extension === ".json") return "json";
	if (extension === ".html") return "html-output";
	if (extension === ".pdf") return "pdf-output";
	if (extension === ".docx") return "docx-output";
	return undefined;
}

function validProjectFile(file: string): boolean {
	return documentKind(file) !== undefined && lstatSync(file).isFile();
}

function allowedFile(root: string, file: string): boolean {
	const parts = relative(root, file).split(sep);
	if (!parts.length || parts.some(part => !part || part.startsWith(".") || IGNORED.has(part))) return false;
	let candidate = root;
	for (const part of parts) {
		candidate = join(candidate, part);
		if (lstatSync(candidate).isSymbolicLink()) return false;
	}
	return validProjectFile(file);
}

function projectError(message: string): DesktopRPCError {
	return { code: "DESKTOP_PROJECT", message };
}

function summarizeBindings(loaded: Awaited<ReturnType<typeof loadEntryModule>>): RunSummary {
	const inputNames = new Set<string>();
	for (const node of loaded.doc.nodes) {
		if (node.type === "executableCodeBlock") {
			for (const statement of node.statements) {
				if (statement.type === "inputDeclaration") inputNames.add(statement.name);
			}
		}
	}
	const values: RunSummary["values"] = [];
	for (const [name, value] of Object.entries(loaded.env.toObject())) {
		if (inputNames.has(name) || values.length >= 100) continue;
		if (value === null || typeof value === "boolean" || typeof value === "number") values.push({ name, value });
		else if (typeof value === "string") values.push({ name, value: value.slice(0, 500) });
		else if (Array.isArray(value)) values.push({ name, value: `[${value.length} items]` });
		else if (typeof value === "object") values.push({ name, value: "Record" });
	}
	return { values };
}

interface SessionDocument extends OpenDocument {
	path: string;
}

interface ActiveJob extends DesktopJobSnapshot {
	worker?: Worker;
	documentPath: string;
	projectRoot: string;
	inputPaths: string[];
	privatePaths: string[];
	sourcePaths: string[];
	destination?: string;
}

export interface DesktopService extends DesktopRPCClient {
	setProjectRoot(root: string, action?: TransitionAction): void;
}

export interface DesktopPicker {
	choose(options: { directory: boolean; extension?: string; root?: string }): Promise<string | undefined>;
	confirmTransition?(operation: "project" | "quit"): Promise<TransitionAction>;
}

export function createDesktopService(initialRoot?: string, picker?: DesktopPicker, sessionFile?: string): DesktopService {
	let projectRoot = initialRoot && realpathSync(initialRoot);
	let current: SessionDocument | undefined;
	const tabs = new Map<string, SessionDocument>();
	const editSequences = new Map<string, number>();
	let generation = 0;
	let inputSettingsRevision = 0;
	let inputSettingsKey = JSON.stringify({ inputMappings: [], validation: "aggregate" });
	let activeInputMappings: string[] = [];
	let activeValidation: "aggregate" | "fail-fast" = "aggregate";
	let nextJobId = 0;
	let latestJobId = 0;
	const jobs = new Map<number, ActiveJob>();
	let recents: RecentProject[] = [];
	try {
		const stored: unknown = sessionFile && existsSync(sessionFile) ? JSON.parse(readFileSync(sessionFile, "utf8")) : [];
		if (Array.isArray(stored)) recents = stored.slice(0, 10).filter((item): item is RecentProject =>
			typeof item?.root === "string" && item.root.length < 4096 && existsSync(item.root) &&
			realpathSync(item.root) === item.root && statSync(item.root).isDirectory()
		).map(item => {
			function safePath(path: unknown) {
				if (typeof path !== "string" || path.length > 4096) return undefined;
				try { return allowedFile(item.root, resolve(item.root, path)) ? relative(item.root, resolve(item.root, path)) : undefined; }
				catch { return undefined; }
			}
			const legacy = item as RecentProject & { entry?: unknown };
			return { root: item.root, active: safePath(item.active) ?? safePath(legacy.entry),
				explorerWidth: typeof item.explorerWidth === "number" && item.explorerWidth >= 160 && item.explorerWidth <= 400 ? item.explorerWidth : undefined,
				previewWidth: typeof item.previewWidth === "number" && item.previewWidth >= 25 && item.previewWidth <= 65 ? item.previewWidth : undefined };
		});
	} catch { recents = []; }

	function persist() {
		if (!sessionFile) return;
		mkdirSync(dirname(sessionFile), { recursive: true, mode: 0o700 });
		writeFileSync(sessionFile, JSON.stringify(recents), { encoding: "utf8", mode: 0o600 });
	}

	function record() {
		if (!projectRoot || !sessionFile) return;
		const prior = recents.find(item => item.root === projectRoot);
		recents = [{ root: projectRoot,
			active: current ? relative(projectRoot, current.path) : undefined,
			explorerWidth: prior?.explorerWidth, previewWidth: prior?.previewWidth }, ...recents.filter(item => item.root !== projectRoot)].slice(0, 10);
		persist();
	}

	function state(): WorkbenchState {
		return {
			tabs: [...tabs.values()].map(({ path, kind, dirty, conflict, revision }) => ({ path, kind, dirty, conflict, revision })),
			active: current?.path,
			generation,
			inputSettingsRevision,
			requestIdentity: current ? {
				canonicalActiveUri: pathToFileURL(current.path).href,
				projectGeneration: generation,
				documentRevision: current.revision,
				inputSettingsRevision
			} : undefined
		};
	}

	function requireActive(): { document: SessionDocument; sourceOverlay: ReadonlyMap<string, string> } {
		const document = requireCurrent();
		const sourceOverlay = new Map<string, string>();
		const visited = new Set<string>();
		function collectOpenModules(file: string, text: string) {
			if (visited.has(file)) return;
			visited.add(file);
			const openTab = tabs.get(file);
			if (openTab) sourceOverlay.set(file, openTab.text);
			let parsed;
			try { parsed = parseDocumentText(text); }
			catch { return; }
			for (const node of parsed.nodes) {
				if (node.type !== "executableCodeBlock") continue;
				for (const statement of node.statements) {
					if (statement.type !== "importDeclaration") continue;
					const dependency = within(requireRoot(), resolve(dirname(file), statement.path));
					if (!dependency) continue;
					const tab = tabs.get(dependency);
					if (!visited.has(dependency)) collectOpenModules(dependency, tab?.text ?? readFileSync(dependency, "utf8"));
				}
			}
		}
		collectOpenModules(document.path, document.text);
		return { document, sourceOverlay };
	}

	function identityMatchesCurrent(identity: ActiveDocumentRequestIdentity): boolean {
		const currentIdentity = state().requestIdentity;
		return !!currentIdentity
			&& identity.canonicalActiveUri === currentIdentity.canonicalActiveUri
			&& identity.projectGeneration === currentIdentity.projectGeneration
			&& identity.documentRevision === currentIdentity.documentRevision
			&& identity.inputSettingsRevision === currentIdentity.inputSettingsRevision;
	}

	function snapshotJob(job: ActiveJob): DesktopJobSnapshot {
		return {
			identity: job.identity,
			operation: job.operation,
			status: job.status,
			cleanupPending: !!job.worker,
			stage: job.stage,
			result: job.result,
			diagnostics: job.diagnostics.slice(0, 100)
		};
	}

	function terminateJob(job: ActiveJob, status: "cancelled" | "superseded"): void {
		if (job.status !== "running") return;
		job.status = status;
		job.stage = undefined;
		job.result = undefined;
		if (job.worker) void job.worker.terminate();
	}

	function invalidateStaleJobs(): void {
		for (const job of jobs.values()) {
			if (job.status === "running" && !identityMatchesCurrent(job.identity)) terminateJob(job, "superseded");
		}
	}

	function failJob(job: ActiveJob, error: unknown): void {
		if (job.status !== "running" && job.status !== "committing") return;
		job.status = "failed";
		job.stage = undefined;
		job.diagnostics = diagnostics(error, job.documentPath, job.privatePaths);
	}

	async function commitJobExport(job: ActiveJob, result: Extract<WorkerJobResult, { kind: "export" }>): Promise<void> {
		if (!job.destination) throw new Error("Export job has no validated destination request.");
		if (job.identity.jobId !== latestJobId || !identityMatchesCurrent(job.identity)) {
			terminateJob(job, "superseded");
			return;
		}
		refreshConflicts();
		if (tabs.get(job.documentPath)?.conflict || job.sourcePaths.some(file => tabs.get(file)?.conflict)) {
			throw new Error("Resolve active document or dependency disk conflicts before export.");
		}
		job.status = "committing";
		job.stage = "committing";
		const conflicts = [job.documentPath, ...job.inputPaths];
		const beforeCommit = () => {
			if (job.identity.jobId !== latestJobId || !identityMatchesCurrent(job.identity)) throw new Error("Export job became stale before its atomic commit.");
			refreshConflicts();
			if (tabs.get(job.documentPath)?.conflict || job.sourcePaths.some(file => tabs.get(file)?.conflict)) {
				throw new Error("Resolve active document or dependency disk conflicts before export.");
			}
		};
		if (result.format === "html") {
			const validated = validateDesktopDestination(job.projectRoot, job.destination, ".html", conflicts);
			const path = await writeDesktopHtml(job.projectRoot, validated.path, job.documentPath, job.inputPaths, result.data, beforeCommit);
			job.result = { kind: "export", path, bytes: result.bytes };
		} else if (result.format === "pdf") {
			const validated = validateDesktopDestination(job.projectRoot, job.destination, ".pdf", conflicts);
			const destination = await preparePdfDestination(validated.path, job.documentPath, job.inputPaths.map(path => `input=${path}`));
			await writePdfAtomically(destination, new Uint8Array(result.data), beforeCommit);
			job.result = { kind: "export", path: destination.path, bytes: result.bytes };
		} else {
			const validated = validateDesktopDestination(job.projectRoot, job.destination, ".docx", conflicts);
			const destination = await prepareDocxDestination(validated.path, job.documentPath, job.inputPaths.map(path => `input=${path}`));
			await writeDocxAtomically(destination, new Uint8Array(result.data), beforeCommit);
			job.result = { kind: "export", path: destination.path, bytes: result.bytes };
		}
		job.status = "succeeded";
		job.stage = undefined;
	}

	function handleWorkerMessage(job: ActiveJob, message: WorkerJobMessage): void {
		if (message.jobId !== job.identity.jobId || job.status !== "running") return;
		if (message.kind === "progress") {
			if (latestJobId !== job.identity.jobId || !identityMatchesCurrent(job.identity)) terminateJob(job, "superseded");
			else job.stage = message.stage;
			return;
		}
		if (latestJobId !== job.identity.jobId || !identityMatchesCurrent(job.identity)) {
			terminateJob(job, "superseded");
			return;
		}
		if (message.kind === "failed") {
			const first = message.diagnostics[0] ?? { code: "DESKTOP_JOB", message: "Worker operation failed." };
			failJob(job, new AmxError(first, message.diagnostics));
			return;
		}
		if (message.result.kind === "run") {
			job.result = { kind: "run", summary: message.result.summary };
			job.diagnostics = message.result.diagnostics;
			job.status = "succeeded";
			job.stage = undefined;
			return;
		}
		if (message.result.kind === "preview") {
			job.result = { kind: "preview", html: message.result.html };
			job.diagnostics = message.result.diagnostics;
			job.status = "succeeded";
			job.stage = undefined;
			return;
		}
		if (message.result.kind === "data-validation") {
			job.result = {
				kind: "data-validation", valid: message.result.valid, schema: message.result.schema,
				outputs: message.result.outputs,
				...(message.result.outputsTruncated ? { outputsTruncated: true } : {})
			};
			job.diagnostics = message.result.diagnostics;
			job.status = "succeeded";
			job.stage = undefined;
			return;
		}
		job.stage = "prepared";
		void commitJobExport(job, message.result).catch(error => failJob(job, error));
	}

	function beginJob(
		operation: DesktopJobOperation,
		identity: ActiveDocumentRequestIdentity,
		destination?: string,
		inputInspection?: { name: string; format: "json" | "csv"; text: string }
	): DesktopRPCResponse<{ job: DesktopJobSnapshot }> {
		let worker: Worker | undefined;
		try {
			const { document, sourceOverlay } = requireActive();
			if (!document.path.endsWith(".amx")) throw new Error("Run, preview, and report export require an active .amx document.");
			if (!identityMatchesCurrent(identity)) return errorResult({ code: "DESKTOP_STALE", message: "The active document or settings changed before the job started." });
			if (!["run", "preview", "html", "pdf", "docx", "validate-data"].includes(operation)) throw new Error("Unsupported desktop job operation.");
			if (operation === "validate-data") {
				if (!inputInspection || !/^[A-Za-z][A-Za-z0-9_]{0,99}$/.test(inputInspection.name)
					|| (inputInspection.format !== "json" && inputInspection.format !== "csv")
					|| typeof inputInspection.text !== "string" || inputInspection.text.length > 20_000_000)
					throw new Error("In-memory data inspection exceeds its request bounds or has an invalid input.");
			} else if (inputInspection) throw new Error("Input inspection is valid only for a validate-data job.");
			const extension = operation === "html" ? ".html" : operation === "pdf" ? ".pdf" : operation === "docx" ? ".docx" : undefined;
			if (extension && (!destination || extname(destination) !== extension)) throw new Error(`A ${extension} destination is required.`);
			for (const job of jobs.values()) if (job.status === "running") terminateJob(job, "superseded");
			const resolved = resolveDesktopInputs(requireRoot(), document.text, activeInputMappings, activeValidation);
			const jobId = ++nextJobId;
			latestJobId = jobId;
			const job: ActiveJob = {
				identity: { ...identity, jobId }, operation, status: "running", cleanupPending: false, stage: "starting", diagnostics: [],
				documentPath: document.path, projectRoot: requireRoot(), inputPaths: resolved.mappings.map(mapping => mapping.slice(mapping.indexOf("=") + 1)),
				privatePaths: resolved.privatePaths, sourcePaths: [...sourceOverlay.keys()], destination
			};
			jobs.set(jobId, job);
			if (resolved.configuration.diagnostics.length) {
				job.status = "failed";
				job.stage = undefined;
				job.diagnostics = resolved.configuration.diagnostics;
				return { ok: true, job: snapshotJob(job) };
			}
			if (extension) job.destination = validateDesktopDestination(job.projectRoot, destination!, extension, [job.documentPath, ...job.inputPaths]).path;
			worker = new Worker(new URL("./jobWorker.ts", import.meta.url).href);
			job.worker = worker;
			worker.addEventListener("message", event => handleWorkerMessage(job, event.data as WorkerJobMessage));
			worker.addEventListener("error", event => failJob(job, new Error(event.message || "Worker failed.")));
			worker.addEventListener("close", () => {
				if (job.status === "running") failJob(job, new Error("Worker exited before returning a result."));
				job.worker = undefined;
			});
			const request: WorkerJobRequest = {
				kind: "start", jobId, operation, entryPath: document.path, entryText: document.text,
				projectRoot: job.projectRoot, sourceOverlay: [...sourceOverlay],
				inputMappings: resolved.mappings, validation: activeValidation, inputInspection
			};
			worker.postMessage(request);
			return { ok: true, job: snapshotJob(job) };
		} catch (error) {
			worker?.terminate();
			return errorResult({ code: error instanceof AmxError ? error.code : "DESKTOP_JOB", message: error instanceof Error ? error.message.slice(0, 1000) : "Unable to start worker job." });
		}
	}

	async function runManagedJob(operation: DesktopJobOperation, inputMappings: string[], validation: "aggregate" | "fail-fast", destination?: string): Promise<DesktopRPCResponse<{ job: DesktopJobSnapshot }>> {
		const priorMappings = activeInputMappings;
		const priorValidation = activeValidation;
		const priorSettingsKey = inputSettingsKey;
		const configured = await service.request.setInputSettings({ inputMappings, validation });
		if (!configured.ok) return errorResult(configured.error);
		const temporaryRevision = configured.state.inputSettingsRevision;
		const restoreSettings = async () => {
			if (inputSettingsRevision === temporaryRevision && inputSettingsKey !== priorSettingsKey) {
				await service.request.setInputSettings({ inputMappings: priorMappings, validation: priorValidation });
			}
		};
		const identity = configured.state.requestIdentity;
		if (!identity) {
			await restoreSettings();
			return errorResult(projectError("Open an active AMX document before starting a job."));
		}
		const started = beginJob(operation, identity, destination);
		if (!started.ok) {
			await restoreSettings();
			return started;
		}
		const jobId = started.job.identity.jobId;
		for (let attempt = 0; attempt < 2000; attempt++) {
			const job = jobs.get(jobId);
			if (!job) return errorResult(projectError("Job is no longer available."));
			if (!["running", "committing"].includes(job.status)) {
				const result = { ok: true as const, job: snapshotJob(job) };
				await restoreSettings();
				return result;
			}
			await new Promise(resolve => setTimeout(resolve, 10));
		}
		const job = jobs.get(jobId);
		if (job?.status === "running") terminateJob(job, "cancelled");
		const result = job ? { ok: true as const, job: snapshotJob(job) } : errorResult<{ job: DesktopJobSnapshot }>(projectError("Job is no longer available."));
		await restoreSettings();
		return result;
	}

	function requireRoot(): string {
		if (!projectRoot) throw new Error("Open a project before using project files.");
		return projectRoot;
	}

	function requireCurrent(): SessionDocument {
		if (!current) throw new Error("Open a project document first.");
		return current;
	}

	function readEntry(file: string): SessionDocument {
		const text = readFileSync(file, "utf8");
		if (text.length > MAX_TEXT) throw new Error(`Document exceeds the ${MAX_TEXT}-character limit.`);
		const kind = documentKind(file);
		if (!kind) throw new Error("Unsupported project file kind.");
		return { path: file, kind, text, diskHash: hash(text), dirty: false, conflict: false, revision: 0 };
	}

	function saveTab(document: SessionDocument): DesktopRPCResponse<{ document: OpenDocument }> {
		let temporary: string | undefined;
		try {
			if (!allowedFile(requireRoot(), document.path) || !["amx", "csv", "json"].includes(document.kind)) throw new Error("File is not an editable project document.");
			const diskText = readFileSync(document.path, "utf8");
			if (hash(diskText) !== document.diskHash) {
				document.conflict = true;
				return errorResult({ code: "DESKTOP_CONFLICT", message: "The file changed on disk; reload or explicitly resolve the conflict before saving." });
			}
			temporary = join(dirname(document.path), `.${basename(document.path)}.${randomUUID()}.tmp`);
			const handle = openSync(temporary, "wx", 0o600);
			try {
				fchmodSync(handle, statSync(document.path).mode & 0o777);
				writeFileSync(handle, document.text, "utf8");
				fsyncSync(handle);
			} finally { closeSync(handle); }
			if (!allowedFile(requireRoot(), document.path) || hash(readFileSync(document.path, "utf8")) !== document.diskHash) {
				document.conflict = true;
				return errorResult({ code: "DESKTOP_CONFLICT", message: "The file changed during save; no changes were written." });
			}
			renameSync(temporary, document.path);
			temporary = undefined;
			document.diskHash = hash(document.text);
			document.dirty = false;
			document.conflict = false;
			return { ok: true, document };
		} catch (error) { return errorResult(projectError(error instanceof Error ? error.message : String(error))); }
		finally { if (temporary) { try { unlinkSync(temporary); } catch {} } }
	}

	function refreshConflicts() {
		for (const tab of tabs.values()) {
			try {
				if (!allowedFile(requireRoot(), tab.path) || hash(readFileSync(tab.path, "utf8")) !== tab.diskHash) tab.conflict = true;
			} catch { tab.conflict = true; }
		}
	}

	function prepareTransition(action: TransitionAction): DesktopRPCResponse<{ ready: boolean; state: WorkbenchState }> {
		refreshConflicts();
		if (action === "cancel") return { ok: true, ready: false, state: state() };
		if (action !== "save-all" && action !== "discard-all") return errorResult(projectError("Invalid project transition."));
		if (action === "save-all") {
			for (const tab of tabs.values()) {
				if (tab.conflict) return errorResult({ code: "DESKTOP_CONFLICT", message: `Resolve the disk conflict in ${relative(requireRoot(), tab.path)} before saving all tabs.` });
			}
			for (const tab of tabs.values()) {
				if (!tab.dirty && !tab.conflict) continue;
				const saved = saveTab(tab);
				if (!saved.ok) return errorResult(saved.error);
			}
		}
		return { ok: true, ready: true, state: state() };
	}

	const service = {
		setProjectRoot(root: string, action?: TransitionAction) {
			const canonical = realpathSync(resolve(root));
			if (!statSync(canonical).isDirectory()) throw new Error("Project root must be a directory.");
			if (projectRoot !== canonical && [...tabs.values()].some(tab => tab.dirty || tab.conflict)) {
				if (!action) throw new Error("Save or discard unsaved tabs before switching projects.");
				const prepared = prepareTransition(action);
				if (!prepared.ok) throw new Error(prepared.error.message);
				if (!prepared.ready) throw new Error("Project change cancelled.");
			}
			if (projectRoot !== canonical) { tabs.clear(); editSequences.clear(); current = undefined; generation++; invalidateStaleJobs(); }
			projectRoot = canonical;
		},
		request: {
			async ping({ nonce }: { nonce: string }) {
				return createPingResponse(nonce, process.versions.bun ?? "unknown");
			},
			async pickProject() {
				try {
					const started = generation;
					const path = await picker?.choose({ directory: true });
					if (!path) return { ok: true, cancelled: true };
					if (started !== generation) return { ok: true, cancelled: true };
					if (lstatSync(path).isSymbolicLink() || !statSync(path).isDirectory()) throw new Error("Project selection must be a real directory.");
					const candidate = realpathSync(path);
					const recent = recents.find(item => item.root === candidate);
					const switching = projectRoot !== candidate;
					const action = projectRoot !== candidate && [...tabs.values()].some(tab => tab.dirty || tab.conflict)
						? await picker?.confirmTransition?.("project") ?? "cancel" : undefined;
					if (started !== generation || action === "cancel") return { ok: true, cancelled: true };
					service.setProjectRoot(candidate, action);
					if (switching && recent) {
						if (recent.active) await service.request.openDocument({ path: recent.active });
					}
					record();
					return { ok: true, cancelled: false, root: candidate };
				} catch (error) { return errorResult<{ cancelled: boolean; root?: string }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async pickDocument() {
				try {
					const started = generation;
					const root = requireRoot();
					const path = await picker?.choose({ directory: false, extension: ".amx", root });
					if (!path) return { ok: true, cancelled: true };
					if (started !== generation || root !== requireRoot()) return { ok: true, cancelled: true };
					const result = await service.request.openDocument({ path });
					return result.ok ? { ok: true, cancelled: false, document: result.document } : errorResult<{ cancelled: boolean; document?: OpenDocument }>(result.error);
				} catch (error) { return errorResult<{ cancelled: boolean; document?: OpenDocument }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async pickDestination({ extension }: { extension: ".html" | ".pdf" | ".docx" }) {
				try {
					if (![".html", ".pdf", ".docx"].includes(extension)) throw new Error("Invalid destination type.");
					const started = generation;
					const { document } = requireActive();
					const path = await picker?.choose({ directory: false, extension, root: requireRoot() });
					if (!path) return { ok: true, cancelled: true };
					if (started !== generation || !tabs.has(document.path)) return { ok: true, cancelled: true };
					const validated = validateDesktopDestination(requireRoot(), path, extension, [document.path]);
					return { ok: true, cancelled: false, path: validated.path };
				} catch (error) { return errorResult<{ cancelled: boolean; path?: string }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async getRecents() { return { ok: true, projects: recents }; },
			async clearSession() {
				recents = [];
				persist();
				return { ok: true, projects: recents };
			},
			async restoreProject({ root }: { root: string }) {
				const saved = recents.find(item => item.root === root);
				if (!saved) return errorResult<{ root: string; state: WorkbenchState }>(projectError("Project is not in recent history."));
				try {
					if (lstatSync(root).isSymbolicLink() || realpathSync(root) !== root || !statSync(root).isDirectory()) throw new Error("Recent project is no longer a real directory.");
					const started = generation;
					const action = projectRoot !== root && [...tabs.values()].some(tab => tab.dirty || tab.conflict)
						? await picker?.confirmTransition?.("project") ?? "cancel" : undefined;
					if (started !== generation || action === "cancel") return errorResult<{ root: string; state: WorkbenchState }>({ code: "DESKTOP_CANCELLED", message: "Project change cancelled." });
					if (projectRoot === root && [...tabs.values()].some(tab => tab.dirty || tab.conflict)) throw new Error("Project is already open with unsaved tabs.");
					service.setProjectRoot(root, action);
				} catch (error) { return errorResult<{ root: string; state: WorkbenchState }>(projectError(error instanceof Error ? error.message : String(error))); }
				if (saved.active) await service.request.openDocument({ path: saved.active });
				record();
				return { ok: true, root, state: state() };
			},
			async setPanelSizes({ explorerWidth, previewWidth }: { explorerWidth: number; previewWidth: number }) {
				if (!Number.isFinite(explorerWidth) || explorerWidth < 160 || explorerWidth > 400 || !Number.isFinite(previewWidth) || previewWidth < 25 || previewWidth > 65)
					return errorResult<{ state: WorkbenchState }>(projectError("Panel sizes are out of bounds."));
				const recent = recents.find(item => item.root === projectRoot);
				if (recent) { recent.explorerWidth = explorerWidth; recent.previewWidth = previewWidth; persist(); }
				return { ok: true, state: state() };
			},
			async openProject({ path }: { path: string }) {
				try {
					const candidate = realpathSync(resolve(path));
					service.setProjectRoot(statSync(candidate).isDirectory() ? candidate : join(candidate, ".."));
					record();
					return { ok: true, root: projectRoot! };
				} catch (error) {
					return errorResult<string>(projectError(error instanceof Error ? error.message : String(error)));
				}
			},
			async openDocument({ path }: { path: string }) {
				try {
					const file = within(requireRoot(), path);
					const kind = file && documentKind(file);
					if (!file || !kind || !allowedFile(requireRoot(), resolve(requireRoot(), path))) return errorResult<{ document: OpenDocument }>(projectError("Only visible, contained supported project files can be opened."));
					if (!["amx", "csv", "json"].includes(kind)) return errorResult<{ document: OpenDocument }>(projectError("Generated reports are read-only and open through their system application."));
					current = tabs.get(file) ?? readEntry(file);
					tabs.set(file, current);
					refreshConflicts();
					invalidateStaleJobs();
					record();
					return { ok: true, document: current };
				} catch (error) {
					return errorResult<{ document: OpenDocument }>(projectError(error instanceof Error ? error.message : String(error)));
				}
			},
			async selectTab({ path }: { path: string }) {
				const tab = tabs.get(path);
				if (!tab) return errorResult<{ document: OpenDocument }>(projectError("Tab is not open."));
				current = tab;
				refreshConflicts();
				invalidateStaleJobs();
				record();
				return { ok: true, document: tab };
			},
			async getWorkbench() { refreshConflicts(); return { ok: true, state: state() }; },
			async setInputSettings({ inputMappings, validation }: { inputMappings: string[]; validation: "aggregate" | "fail-fast" }) {
				if (!Array.isArray(inputMappings) || inputMappings.length > 100 || inputMappings.some(mapping => typeof mapping !== "string" || mapping.length > 8192))
					return errorResult<{ state: WorkbenchState }>(projectError("Input settings exceed their request bounds."));
				if (validation !== "aggregate" && validation !== "fail-fast")
					return errorResult<{ state: WorkbenchState }>({ code: "AMX4001", message: "Validation mode must be 'aggregate' or 'fail-fast'." });
				const normalizedMappings = [...inputMappings];
				const key = JSON.stringify({ inputMappings: normalizedMappings, validation });
				if (key !== inputSettingsKey) {
					inputSettingsKey = key;
					activeInputMappings = normalizedMappings;
					activeValidation = validation;
					inputSettingsRevision++;
					invalidateStaleJobs();
				}
				return { ok: true, state: state() };
			},
			async startJob({ operation, identity, destination, inputInspection }: { operation: DesktopJobOperation; identity: ActiveDocumentRequestIdentity; destination?: string; inputInspection?: { name: string; format: "json" | "csv"; text: string } }) {
				return beginJob(operation, identity, destination, inputInspection);
			},
			async getJob({ jobId }: { jobId: number }) {
				if (!Number.isSafeInteger(jobId) || jobId < 1) return errorResult<{ job: DesktopJobSnapshot }>(projectError("Invalid job identifier."));
				const job = jobs.get(jobId);
				if (!job) return errorResult<{ job: DesktopJobSnapshot }>(projectError("Job is no longer available."));
				if (job.status === "running" && (jobId !== latestJobId || !identityMatchesCurrent(job.identity))) terminateJob(job, "superseded");
				return { ok: true, job: snapshotJob(job) };
			},
			async cancelJob({ jobId }: { jobId: number }) {
				if (!Number.isSafeInteger(jobId) || jobId < 1) return errorResult<{ job: DesktopJobSnapshot }>(projectError("Invalid job identifier."));
				const job = jobs.get(jobId);
				if (!job) return errorResult<{ job: DesktopJobSnapshot }>(projectError("Job is no longer available."));
				if (job.status === "running") terminateJob(job, "cancelled");
				return { ok: true, job: snapshotJob(job) };
			},
			async prepareTransition({ action }: { action: TransitionAction }) { return prepareTransition(action); },
			async confirmQuit() {
				try {
					refreshConflicts();
					if (![...tabs.values()].some(tab => tab.dirty || tab.conflict)) return { ok: true, ready: true };
					const started = generation;
					const action = await picker?.confirmTransition?.("quit") ?? "cancel";
					if (started !== generation) return { ok: true, ready: false };
					const prepared = prepareTransition(action);
					return prepared.ok ? { ok: true, ready: prepared.ready } : errorResult<{ ready: boolean }>(prepared.error);
				} catch (error) { return errorResult<{ ready: boolean }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async closeTab({ path, action }: { path: string; action: "save" | "discard" | "cancel" }) {
				const tab = tabs.get(path);
				if (!tab || !["save", "discard", "cancel"].includes(action)) return errorResult<{ state: WorkbenchState }>(projectError("Invalid tab close request."));
				if (action === "cancel") return { ok: true, state: state() };
				if (tab.dirty || tab.conflict) {
					if (action === "save") {
						const saved = saveTab(tab);
						if (!saved.ok) return errorResult<{ state: WorkbenchState }>(saved.error);
					}
				}
				tabs.delete(path);
				if (current?.path === path) current = tabs.values().next().value;
				generation++;
				invalidateStaleJobs();
				record();
				return { ok: true, state: state() };
			},
			async reloadTab({ action }: { action: "discard" | "cancel" }) {
				try {
					const tab = requireCurrent();
					if (action === "cancel") return { ok: true, document: tab };
					if (action !== "discard" || !allowedFile(requireRoot(), tab.path)) throw new Error("Cannot reload this file.");
					const fresh = readEntry(tab.path);
					fresh.revision = tab.revision + 1;
					tabs.set(tab.path, fresh);
					current = fresh;
					return { ok: true, document: fresh };
				} catch (error) { return errorResult<{ document: OpenDocument }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async listProjectFiles() {
				try {
					const root = requireRoot();
					const files: ProjectFile[] = [];
					function visit(directory: string) {
						for (const entry of readdirSync(directory, { withFileTypes: true })) {
							if (entry.name.startsWith(".") || IGNORED.has(entry.name)) continue;
							const candidate = join(directory, entry.name);
							if (entry.isSymbolicLink()) continue;
							if (entry.isDirectory()) visit(candidate);
							else if (entry.isFile()) {
								const kind = documentKind(candidate);
								if (!kind) continue;
								if (files.length >= MAX_FILES) throw new Error("Project exceeds the explorer file limit.");
								files.push({ path: relative(root, candidate), kind });
							}
						}
					}
					visit(root);
					return { ok: true, files: files.sort((left, right) => left.path.localeCompare(right.path)) };
				} catch (error) {
					return errorResult<{ files: ProjectFile[] }>(projectError(error instanceof Error ? error.message : String(error)));
				}
			},
			async readDocument() {
				try { return { ok: true, document: requireCurrent() }; }
				catch (error) { return errorResult<{ document: OpenDocument }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async updateBuffer({ text, path, sequence }: { text: string; path?: string; sequence?: number }) {
				try {
					if (typeof text !== "string" || text.length > MAX_TEXT) return errorResult<{ document: OpenDocument }>(projectError(`Document exceeds the ${MAX_TEXT}-character limit.`));
					const document = path ? tabs.get(path) : requireCurrent();
					if (!document) return errorResult<{ document: OpenDocument }>(projectError("Tab is no longer open."));
					if (sequence !== undefined) {
						if (!Number.isSafeInteger(sequence) || sequence < 1 || sequence <= (editSequences.get(document.path) ?? 0))
							return errorResult<{ document: OpenDocument }>(projectError("Superseded edit request."));
						editSequences.set(document.path, sequence);
					}
					document.text = text;
					document.dirty = hash(text) !== document.diskHash;
					document.revision++;
					invalidateStaleJobs();
					return { ok: true, document };
				} catch (error) { return errorResult<{ document: OpenDocument }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async saveDocument() {
				try { return saveTab(requireCurrent()); }
				catch (error) { return errorResult<{ document: OpenDocument }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async formatBuffer() {
				try {
					const document = requireCurrent();
					if (document.kind !== "amx") return errorResult<{ text: string }>({ code: "DESKTOP_FILE_KIND", message: "Canonical AMX formatting is available only for .amx documents." });
					return { ok: true, text: formatAmx(document.text) };
				}
				catch (error) { return errorResult<{ text: string }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async analyzeBuffer() {
				try {
					const document = requireCurrent();
					if (document.kind !== "amx") return { ok: true, analysis: { diagnostics: [], completions: [] } };
					const parsed = parseDocumentText(document.text);
					if (checkingActivated(parsed)) checkDocument(parsed, document.path);
					const analysis: TextAnalysis = { diagnostics: [], completions: ["let", "for", "match", "type", "fn", "import", "table", "chart", "show"] };
					return { ok: true, analysis };
				} catch (error) {
					return { ok: true, analysis: { diagnostics: diagnostics(error, current?.path), completions: [] } };
				}
			},
			async getInputConfiguration({ inputMappings = activeInputMappings }: { inputMappings?: string[] } = {}) {
				try {
					const { document } = requireActive();
					const resolved = resolveDesktopInputs(requireRoot(), document.text, inputMappings);
					return { ok: true, configuration: resolved.configuration };
				} catch (error) {
					return { ok: true, configuration: { inputs: [], diagnostics: diagnostics(error, current?.path) } };
				}
			},
			async runBuffer({ inputMappings = activeInputMappings, validation = activeValidation }: { inputMappings?: string[]; validation?: "aggregate" | "fail-fast" } = {}) {
				try {
					const result = await runManagedJob("run", inputMappings, validation);
					if (!result.ok) return { ok: true, summary: { values: [] }, diagnostics: [{ code: result.error.code, message: result.error.message }] };
					if (result.job.status === "succeeded" && result.job.result?.kind === "run") {
						return { ok: true, summary: result.job.result.summary ?? { values: [] }, diagnostics: result.job.diagnostics };
					}
					return { ok: true, summary: { values: [] }, diagnostics: result.job.diagnostics.length ? result.job.diagnostics : [{ code: "DESKTOP_JOB", message: `Run ${result.job.status}.` }] };
				} catch (error) {
					return { ok: true, summary: { values: [] }, diagnostics: diagnostics(error, current?.path) };
				}
			},
			async previewBuffer({ inputMappings = activeInputMappings, validation = activeValidation }: { inputMappings?: string[]; validation?: "aggregate" | "fail-fast" } = {}) {
				try {
					const result = await runManagedJob("preview", inputMappings, validation);
					if (!result.ok) return { ok: true, html: "", diagnostics: [{ code: result.error.code, message: result.error.message }] };
					if (result.job.status === "succeeded" && result.job.result?.kind === "preview") {
						return { ok: true, html: result.job.result.html ?? "", diagnostics: result.job.diagnostics };
					}
					return { ok: true, html: "", diagnostics: result.job.diagnostics.length ? result.job.diagnostics : [{ code: "DESKTOP_JOB", message: `Preview ${result.job.status}.` }] };
				} catch (error) {
					return { ok: true, html: "", diagnostics: diagnostics(error, current?.path) };
				}
			},
			async saveHtml({ path, inputMappings = activeInputMappings, validation = activeValidation }: { path: string; inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }) {
			const result = await runManagedJob("html", inputMappings, validation, path);
			if (!result.ok) return { ok: true, path: "", diagnostics: [{ code: result.error.code, message: result.error.message }] };
			if (result.job.status === "succeeded" && result.job.result?.kind === "export") return { ok: true, path: result.job.result.path ?? "", diagnostics: result.job.diagnostics };
			return { ok: true, path: "", diagnostics: result.job.diagnostics.length ? result.job.diagnostics : [{ code: "DESKTOP_JOB", message: `HTML export ${result.job.status}.` }] };
			},
			async exportPdf({ path, inputMappings = activeInputMappings, validation = activeValidation }: { path: string; inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }) {
			const result = await runManagedJob("pdf", inputMappings, validation, path);
			if (!result.ok) return { ok: true, path: "", bytes: 0, diagnostics: [{ code: result.error.code, message: result.error.message }] };
			if (result.job.status === "succeeded" && result.job.result?.kind === "export") return { ok: true, path: result.job.result.path ?? "", bytes: result.job.result.bytes ?? 0, diagnostics: result.job.diagnostics };
			return { ok: true, path: "", bytes: 0, diagnostics: result.job.diagnostics.length ? result.job.diagnostics : [{ code: "DESKTOP_JOB", message: `PDF export ${result.job.status}.` }] };
			},
			async exportDocx({ path, inputMappings = activeInputMappings, validation = activeValidation }: { path: string; inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }) {
				const result = await runManagedJob("docx", inputMappings, validation, path);
				if (!result.ok) return { ok: true, path: "", bytes: 0, diagnostics: [{ code: result.error.code, message: result.error.message }] };
				if (result.job.status === "succeeded" && result.job.result?.kind === "export") return { ok: true, path: result.job.result.path ?? "", bytes: result.job.result.bytes ?? 0, diagnostics: result.job.diagnostics };
				return { ok: true, path: "", bytes: 0, diagnostics: result.job.diagnostics.length ? result.job.diagnostics : [{ code: "DESKTOP_JOB", message: `DOCX export ${result.job.status}.` }] };
			}
		}
	} as DesktopService;
	return service;
}