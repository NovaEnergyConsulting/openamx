import { createHash, randomUUID } from "node:crypto";
import { closeSync, existsSync, fchmodSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, readSync, readdirSync, realpathSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { AmxError, type AmxDiagnostic } from "../../../src/diagnostics/errors";
import { parseDocumentText } from "../../../src/parser/parseDocument";
import { analyzeEditorModules } from "../../../src/editor/moduleAnalysis";
import { editorCompletionFacts, prepareEditorCompletion } from "../../../src/editor/completion";
import { editorHighlightFacts } from "../../../src/editor/highlighting";
import { editorSymbolFacts } from "../../../src/editor/symbols";
import { editorCodeActionFacts, editorRenameFact, isSafeRenameIdentifier } from "../../../src/editor/refactoring";
import { sourceOffset } from "../../../src/editor/sourceRanges";
import { formatAmx } from "../../../src/formatter/formatAmx";
import { checkingActivated, checkDocument } from "../../../src/typechecker/checkDocument";
import { loadEntryModule } from "../../../src/runtime/moduleLoader";
import { renderPreparedHtml } from "../../../src/renderer/renderHtml";
import { preparePdfReport, serializePdfReport } from "../../../src/renderer/reportPdf";
import { preparePdfDestination, writePdfAtomically } from "../../../src/runtime/pdfDestination";
import { prepareDocxReport, serializeDocxReport } from "../../../src/renderer/reportDocx";
import { prepareDocxDestination, writeDocxAtomically } from "../../../src/runtime/docxDestination";
import { prepareReport } from "../../../src/renderer/reportPreparation";
import { effectiveReportAccent, validateReportSettings } from "../../../src/renderer/reportPreparation";
import { parseFrontMatter } from "../../../src/parser/parseFrontMatter";
import { readConfiguration, readConfigurationRevision, updateConfiguration } from "./configuration";
import { updateReportFrontmatter } from "./desktopSettings";
	import { resolveDesktopInputs, validateDesktopDestination, validateDesktopMappings, writeDesktopData, writeDesktopHtml } from "./desktopWorkflow";
import { desktopWorkerUrl } from "./workerEntrypoint";
import { createPingResponse, type ActiveDocumentRequestIdentity, type DesktopJobIdentity, type DesktopJobOperation, type DesktopJobResult, type DesktopJobSnapshot, type DesktopRPCClient, type DesktopRPCError, type DesktopRPCResponse, type DocumentKind, type OpenDocument, type ProjectFile, type ProjectFileKind, type RecoveryItem, type RunSummary, type TextAnalysis, type TextDiagnostic, type WorkbenchState, type RecentProject, type ReportSettingKey, type ReportSettingsSnapshot, type ReportSettingsValues, type TransitionAction } from "../shared/rpc";
import type { WorkerJobMessage, WorkerJobRequest, WorkerJobResult } from "./jobProtocol";

const MAX_TEXT = 2_000_000;
const MAX_DATA_TEXT = 20_000_000;
const MAX_HTML = 8_000_000;
const MAX_FILES = 5000;
const MAX_FOLDERS = 5000;
const IGNORED = new Set(["node_modules", "build", "dist", "artifacts", "generated", "out"]);
const REPORT_SETTING_KEYS: ReportSettingKey[] = ["organization", "logo", "logoAlt", "accent", "author", "status", "classification", "footer", "sourceVisible"];

function hash(text: string): string {
	return createHash("sha256").update(text).digest("hex");
}

function destinationSnapshot(path: string): DestinationSnapshot {
	try {
		const metadata = lstatSync(path);
		if (metadata.isSymbolicLink() || !metadata.isFile()) throw new Error("Export destination must be a regular file, not a symlink.");
		const file = openSync(path, "r");
		try {
			const digest = createHash("sha256");
			const chunk = Buffer.allocUnsafe(64 * 1024);
			let position = 0;
			while (true) {
				const bytes = readSync(file, chunk, 0, chunk.length, position);
				if (bytes === 0) break;
				digest.update(chunk.subarray(0, bytes));
				position += bytes;
			}
			return { exists: true, hash: digest.digest("hex") };
		} finally { closeSync(file); }
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return { exists: false };
		throw error;
	}
}

function sameDestinationSnapshot(left: DestinationSnapshot, right: DestinationSnapshot): boolean {
	return left.exists === right.exists && left.hash === right.hash;
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

function documentTextLimit(file: string): number {
	return extname(file) === ".csv" || extname(file) === ".json" ? MAX_DATA_TEXT : MAX_TEXT;
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

interface MappedInputBinding {
	inputName: string;
	dataFormat: "json" | "csv";
	ownerPath: string;
}

interface ExternalInputIdentity {
	publicUri: string;
	label: string;
	inputName: string;
	dataFormat: "json" | "csv";
}

interface SessionDocument extends OpenDocument {
	path: string;
	externalIdentity?: ExternalInputIdentity;
	mappedInput?: MappedInputBinding;
}

interface RecoverySnapshot {
	root: string;
	active?: string;
	documents: Array<{ path: string; text: string; diskHash: string; revision: number }>;
}

type ExportExtension = ".html" | ".pdf" | ".docx" | ".json" | ".csv";

interface DestinationSnapshot {
	exists: boolean;
	hash?: string;
}

interface ExportSelection {
	id: string;
	path: string;
	extension: ExportExtension;
	identity: ActiveDocumentRequestIdentity;
	snapshot: DestinationSnapshot;
}

interface ActiveJob extends DesktopJobSnapshot {
	worker?: Worker;
	documentPath: string;
	diagnosticPath: string;
	projectRoot: string;
	inputPaths: string[];
	privatePaths: string[];
	sourcePaths: string[];
	sourceRevisions: Array<{ path: string; revision?: number; diskHash?: string; present: boolean }>;
	destination?: string;
	destinationSelected?: boolean;
	destinationSelectionId?: string;
	destinationSnapshot?: DestinationSnapshot;
	workerResultReceived: boolean;
}

export interface DesktopService extends DesktopRPCClient {
	setProjectRoot(root: string, action?: TransitionAction): void;
}

export interface DesktopPicker {
	choose(options: { directory: boolean; extension?: string; fileName?: string; root?: string }): Promise<string | undefined>;
	confirmTransition?(operation: "project" | "quit"): Promise<TransitionAction>;
	confirmOverwrite?(fileName: string): boolean | Promise<boolean>;
	openPath?(path: string): boolean | Promise<boolean>;
	revealPath?(path: string): boolean | Promise<boolean>;
}

export function createDesktopService(initialRoot?: string, picker?: DesktopPicker, sessionFile?: string, workerFactory: (url: string) => Worker = url => new Worker(url)): DesktopService {
	let projectRoot = initialRoot && realpathSync(initialRoot);
	let current: SessionDocument | undefined;
	const tabs = new Map<string, SessionDocument>();
	const externalTabs = new Map<string, SessionDocument>();
	const editSequences = new Map<string, number>();
	let generation = 0;
	let inputSettingsRevision = 0;
	let inputSettingsKey = JSON.stringify({ inputMappings: [], validation: "aggregate" });
	let activeInputMappings: string[] = [];
	let activeValidation: "aggregate" | "fail-fast" = "aggregate";
	let autosaveEnabled = true;
	let autosaveDelayMs = 500;
	const autosaveTimers = new Map<string, ReturnType<typeof setTimeout>>();
	let nextJobId = 0;
	let latestJobId = 0;
	const jobs = new Map<number, ActiveJob>();
	const exportSelections = new Map<string, ExportSelection>();
	const exportedOutputs = new Map<string, { path: string; root: string; fileName: string }>();
	let recents: RecentProject[] = [];
	const recoveryFile = sessionFile ? `${sessionFile}.recovery.json` : undefined;
	let recovery: RecoverySnapshot | undefined;
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
			return { root: item.root, active: safePath(item.active),
				explorerWidth: typeof item.explorerWidth === "number" && item.explorerWidth >= 160 && item.explorerWidth <= 400 ? item.explorerWidth : undefined,
				previewWidth: typeof item.previewWidth === "number" && item.previewWidth >= 25 && item.previewWidth <= 65 ? item.previewWidth : undefined };
		});
	} catch { recents = []; }
	try {
		const stored: unknown = recoveryFile && existsSync(recoveryFile) ? JSON.parse(readFileSync(recoveryFile, "utf8")) : undefined;
		if (stored && typeof stored === "object" && typeof (stored as { root?: unknown }).root === "string" && Array.isArray((stored as { documents?: unknown }).documents)) {
			const candidate = (stored as { root: string }).root;
			if (existsSync(candidate) && !lstatSync(candidate).isSymbolicLink() && realpathSync(candidate) === candidate && statSync(candidate).isDirectory()) {
				const documents = (stored as RecoverySnapshot).documents.slice(0, 10).filter(item =>
					typeof item?.path === "string" && typeof item.text === "string" && item.text.length <= documentTextLimit(item.path) &&
					typeof item.diskHash === "string" && typeof item.revision === "number" && allowedFile(candidate, resolve(candidate, item.path))
				);
				if (documents.length) recovery = { root: candidate, active: typeof (stored as RecoverySnapshot).active === "string" ? (stored as RecoverySnapshot).active : undefined, documents };
			}
		}
	} catch { recovery = undefined; }

	function persist() {
		if (!sessionFile) return;
		mkdirSync(dirname(sessionFile), { recursive: true, mode: 0o700 });
		writeFileSync(sessionFile, JSON.stringify(recents), { encoding: "utf8", mode: 0o600 });
	}

	function persistRecovery() {
		if (!recoveryFile) return;
		const documents = projectRoot ? [...tabs.values()].filter(tab => tab.dirty && ["amx", "csv", "json"].includes(tab.kind) && allowedFile(projectRoot!, tab.path)).slice(0, 10).map(tab => ({
			path: relative(projectRoot!, tab.path), text: tab.text, diskHash: tab.diskHash, revision: tab.revision
		})) : [];
		if (!projectRoot || !documents.length || documents.reduce((total, item) => total + item.text.length, 0) > 5_000_000) {
			recovery = undefined;
			try { if (existsSync(recoveryFile)) unlinkSync(recoveryFile); } catch {}
			return;
		}
		recovery = { root: projectRoot, active: current ? relative(projectRoot, current.path) : undefined, documents };
		let temporary: string | undefined;
		try {
			mkdirSync(dirname(recoveryFile), { recursive: true, mode: 0o700 });
			temporary = `${recoveryFile}.${randomUUID()}.tmp`;
			const handle = openSync(temporary, "wx", 0o600);
			try { writeFileSync(handle, JSON.stringify(recovery), "utf8"); fsyncSync(handle); }
			finally { closeSync(handle); }
			renameSync(temporary, recoveryFile);
			temporary = undefined;
		} catch { /* Recovery failure must not prevent editing or saving. */ }
		finally { if (temporary) { try { unlinkSync(temporary); } catch {} } }
	}

	function record() {
		if (!projectRoot || !sessionFile) return;
		const prior = recents.find(item => item.root === projectRoot);
		let active: string | undefined;
		if (current && !current.externalIdentity) {
			try { if (allowedFile(projectRoot, current.path)) active = relative(projectRoot, current.path); } catch { active = undefined; }
		}
		recents = [{ root: projectRoot,
			active,
			explorerWidth: prior?.explorerWidth, previewWidth: prior?.previewWidth }, ...recents.filter(item => item.root !== projectRoot)].slice(0, 10);
		persist();
	}

	function publicPath(document: SessionDocument): string {
		return document.externalIdentity?.publicUri ?? document.path;
	}

	function publicDocument(document: SessionDocument): OpenDocument {
		if (!document.externalIdentity) return document;
		return {
			path: document.externalIdentity.publicUri,
			kind: "external-data",
			text: document.text,
			diskHash: document.diskHash,
			dirty: document.dirty,
			conflict: document.conflict,
			revision: document.revision,
			external: true,
			label: document.externalIdentity.label,
			inputName: document.externalIdentity.inputName,
			dataFormat: document.externalIdentity.dataFormat
		};
	}

	function allDocuments(): SessionDocument[] {
		return [...tabs.values(), ...externalTabs.values()];
	}

	function findDocument(path: string): SessionDocument | undefined {
		return tabs.get(path) ?? externalTabs.get(path) ?? [...externalTabs.values()].find(document => document.path === path);
	}

	function state(): WorkbenchState {
		return {
			tabs: allDocuments().map(document => ({
				path: publicPath(document), kind: document.kind, dirty: document.dirty, conflict: document.conflict, revision: document.revision,
				...(document.externalIdentity ? { label: document.externalIdentity.label } : {})
			})),
			active: current ? publicPath(current) : undefined,
			generation,
			inputSettingsRevision,
			requestIdentity: current ? {
				canonicalActiveUri: current.externalIdentity ? current.externalIdentity.publicUri : pathToFileURL(current.path).href,
				projectGeneration: generation,
				documentRevision: current.revision,
				inputSettingsRevision
			} : undefined
		};
	}

	function requireActive(documentOverride?: SessionDocument): { document: SessionDocument; sourceOverlay: ReadonlyMap<string, string>; sourceRevisions: ActiveJob["sourceRevisions"] } {
		const document = documentOverride ?? requireCurrent();
		const sourceOverlay = new Map<string, string>();
		const sourceRevisions: ActiveJob["sourceRevisions"] = [];
		const visited = new Set<string>();
		function collectOpenModules(file: string, text: string) {
			if (visited.has(file)) return;
			visited.add(file);
			const openTab = tabs.get(file);
			if (openTab) sourceOverlay.set(file, openTab.text);
			const diskText = readFileSync(file, "utf8");
			sourceRevisions.push({ path: file, revision: openTab?.revision, diskHash: hash(diskText), present: true });
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
		return { document, sourceOverlay, sourceRevisions };
	}

	function identityMatchesCurrent(identity: ActiveDocumentRequestIdentity): boolean {
		const currentIdentity = state().requestIdentity;
		return !!currentIdentity
			&& identity.canonicalActiveUri === currentIdentity.canonicalActiveUri
			&& identity.projectGeneration === currentIdentity.projectGeneration
			&& identity.documentRevision === currentIdentity.documentRevision
			&& identity.inputSettingsRevision === currentIdentity.inputSettingsRevision;
	}

	function sameRequestIdentity(left: ActiveDocumentRequestIdentity, right: ActiveDocumentRequestIdentity): boolean {
		return left.canonicalActiveUri === right.canonicalActiveUri
			&& left.projectGeneration === right.projectGeneration
			&& left.documentRevision === right.documentRevision
			&& left.inputSettingsRevision === right.inputSettingsRevision;
	}

	function jobIsCurrent(job: ActiveJob): boolean {
		if (!identityMatchesCurrent(job.identity)) return false;
		return job.sourceRevisions.every(source => {
			if (source.revision !== undefined && findDocument(source.path)?.revision !== source.revision) return false;
			if (!source.present) return !existsSync(source.path);
			if (source.diskHash === undefined) return existsSync(source.path);
			try { return hash(readFileSync(source.path, "utf8")) === source.diskHash; }
			catch { return false; }
		});
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
			if (job.status === "running" && !jobIsCurrent(job)) terminateJob(job, "superseded");
		}
	}

	function failJob(job: ActiveJob, error: unknown): void {
		if (job.status !== "running" && job.status !== "committing") return;
		job.status = "failed";
		job.stage = undefined;
		job.diagnostics = diagnostics(error, job.diagnosticPath, job.privatePaths);
	}

	async function commitJobExport(job: ActiveJob, result: Extract<WorkerJobResult, { kind: "export" }>): Promise<void> {
		if (!job.destination) throw new Error("Export job has no validated destination request.");
		if (job.identity.jobId !== latestJobId || !jobIsCurrent(job)) {
			terminateJob(job, "superseded");
			return;
		}
		refreshConflicts();
		if (tabs.get(job.documentPath)?.conflict || job.sourcePaths.some(file => tabs.get(file)?.conflict)) {
			throw new Error("Resolve active document or dependency disk conflicts before export.");
		}
		job.stage = "preparing-output";
		const conflicts = [job.documentPath, ...job.inputPaths];
		const beforeCommit = () => {
			if (job.status !== "running") throw new Error("Export was cancelled before atomic replacement.");
			if (job.identity.jobId !== latestJobId || !jobIsCurrent(job)) throw new Error("Export job became stale before its atomic commit.");
			if (job.destinationSelected && job.destination && job.destinationSnapshot && !sameDestinationSnapshot(destinationSnapshot(job.destination), job.destinationSnapshot))
				throw new Error("Export destination changed after overwrite confirmation; no output was written.");
			refreshConflicts();
			if (tabs.get(job.documentPath)?.conflict || job.sourcePaths.some(file => tabs.get(file)?.conflict)) {
				throw new Error("Resolve active document or dependency disk conflicts before export.");
			}
			job.status = "committing";
			job.stage = "committing";
		};
		if (result.format === "html") {
			const validated = validateDesktopDestination(job.projectRoot, job.destination, ".html", conflicts, job.destinationSelected);
			const path = await writeDesktopHtml(job.projectRoot, validated.path, job.documentPath, job.inputPaths, result.data, beforeCommit, job.destinationSelected);
			recordExportResult(job, path, result.bytes);
		} else if (result.format === "pdf") {
			const validated = validateDesktopDestination(job.projectRoot, job.destination, ".pdf", conflicts, job.destinationSelected);
			const destination = await preparePdfDestination(validated.path, job.documentPath, job.inputPaths.map(path => `input=${path}`));
			await writePdfAtomically(destination, new Uint8Array(result.data), beforeCommit);
			recordExportResult(job, destination.path, result.bytes);
		} else if (result.format === "docx") {
			const validated = validateDesktopDestination(job.projectRoot, job.destination, ".docx", conflicts, job.destinationSelected);
			const destination = await prepareDocxDestination(validated.path, job.documentPath, job.inputPaths.map(path => `input=${path}`));
			await writeDocxAtomically(destination, new Uint8Array(result.data), beforeCommit);
			recordExportResult(job, destination.path, result.bytes);
		} else if (result.format === "json" || result.format === "csv") {
			const extension = `.${result.format}` as ".json" | ".csv";
			const path = await writeDesktopData(job.projectRoot, job.destination, extension, conflicts, result.data, beforeCommit, job.destinationSelected);
			recordExportResult(job, path, result.bytes, result.name);
		} else {
			throw new Error("Unsupported export format.");
		}
		job.status = "succeeded";
		job.stage = undefined;
	}

	function recordExportResult(job: ActiveJob, path: string, bytes: number, name?: string): void {
		if (job.destinationSelectionId) {
			const fileName = basename(path);
			exportedOutputs.set(job.destinationSelectionId, { path, root: job.projectRoot, fileName });
			while (exportedOutputs.size > 50) exportedOutputs.delete(exportedOutputs.keys().next().value!);
			job.result = { kind: "export", outputId: job.destinationSelectionId, fileName, bytes, ...(name ? { name } : {}) };
		} else {
			job.result = { kind: "export", path, bytes, ...(name ? { name } : {}) };
		}
	}

	function handleWorkerMessage(job: ActiveJob, message: WorkerJobMessage): void {
		if (message.jobId !== job.identity.jobId || job.status !== "running") return;
		if (message.kind === "complete" || message.kind === "failed") job.workerResultReceived = true;
		if (message.kind === "progress") {
			if (latestJobId !== job.identity.jobId || !jobIsCurrent(job)) terminateJob(job, "superseded");
			else job.stage = message.stage;
			return;
		}
		if (latestJobId !== job.identity.jobId || !jobIsCurrent(job)) {
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
		if (message.result.kind === "output-discovery") {
			job.result = {
				kind: "output-discovery", outputs: message.result.outputs,
				...(message.result.outputsTruncated ? { outputsTruncated: true } : {})
			};
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
		inputInspection?: { name: string; format: "json" | "csv"; text: string },
		dataOutput?: { name: string; format: "json" | "csv" },
		destinationSelection?: ExportSelection
	): DesktopRPCResponse<{ job: DesktopJobSnapshot }> {
		let worker: Worker | undefined;
		try {
			const activeDocument = requireCurrent();
			let entryDocument = activeDocument;
			let sourceOverlay: ReadonlyMap<string, string>;
			let moduleRevisions: ActiveJob["sourceRevisions"];
			let jobInputInspection = inputInspection;
			if (operation === "validate-data" && ["csv", "json", "external-data"].includes(activeDocument.kind)) {
				const binding = activeDocument.mappedInput;
				if (!binding) throw new Error("Open this data document from a declared AMX input before schema validation.");
				const owner = tabs.get(binding.ownerPath);
				if (!owner || owner.kind !== "amx") throw new Error("The owning AMX document is no longer open.");
				entryDocument = owner;
				const ownerGraph = requireActive(owner);
				sourceOverlay = ownerGraph.sourceOverlay;
				moduleRevisions = ownerGraph.sourceRevisions;
				const expectedInspection = { name: binding.inputName, format: binding.dataFormat, text: activeDocument.text };
				if (inputInspection && (inputInspection.name !== expectedInspection.name || inputInspection.format !== expectedInspection.format || inputInspection.text !== expectedInspection.text))
					throw new Error("Data validation must use the current mapped document buffer and declared input.");
				jobInputInspection = expectedInspection;
			} else {
				if (!activeDocument.path.endsWith(".amx")) throw new Error("Run, preview, and report export require an active .amx document.");
				const activeGraph = requireActive(activeDocument);
				sourceOverlay = activeGraph.sourceOverlay;
				moduleRevisions = activeGraph.sourceRevisions;
			}
			const document = activeDocument;
			if (!identityMatchesCurrent(identity)) return errorResult({ code: "DESKTOP_STALE", message: "The active document or settings changed before the job started." });
			if (!["run", "preview", "html", "pdf", "docx", "export-data", "discover-outputs", "validate-data"].includes(operation)) throw new Error("Unsupported desktop job operation.");
			if (operation === "validate-data") {
				if (!jobInputInspection || !/^[A-Za-z][A-Za-z0-9_]{0,99}$/.test(jobInputInspection.name)
					|| (jobInputInspection.format !== "json" && jobInputInspection.format !== "csv")
					|| typeof jobInputInspection.text !== "string" || jobInputInspection.text.length > 20_000_000)
					throw new Error("In-memory data inspection exceeds its request bounds or has an invalid input.");
			} else if (jobInputInspection) throw new Error("Input inspection is valid only for a validate-data job.");
			if (operation === "export-data") {
				if (!dataOutput || !/^[A-Za-z][A-Za-z0-9_]{0,99}$/.test(dataOutput.name) || (dataOutput.format !== "json" && dataOutput.format !== "csv"))
					throw new Error("Named data export selection is invalid.");
			} else if (dataOutput) throw new Error("Named data export selection is valid only for export-data jobs.");
			const extension = operation === "html" ? ".html" : operation === "pdf" ? ".pdf" : operation === "docx" ? ".docx"
				: operation === "export-data" ? `.${dataOutput!.format}` as ".json" | ".csv" : undefined;
			if (extension && (!destination || extname(destination) !== extension)) throw new Error(`A ${extension} destination is required.`);
			for (const job of jobs.values()) if (job.status === "running") terminateJob(job, "superseded");
			const resolved = operation === "discover-outputs"
				? { mappings: [], privatePaths: [], configuration: { inputs: [], diagnostics: [] } }
				: resolveDesktopInputs(requireRoot(), entryDocument.text, activeInputMappings, activeValidation);
			const sourceRevisions = [...moduleRevisions];
			for (const mapping of resolved.mappings) {
				const inputPath = mapping.slice(mapping.indexOf("=") + 1);
				if (sourceRevisions.some(source => source.path === inputPath)) continue;
				const present = existsSync(inputPath);
				let diskHash: string | undefined;
				if (present) { try { diskHash = hash(readFileSync(inputPath, "utf8")); } catch {} }
				sourceRevisions.push({ path: inputPath, revision: findDocument(inputPath)?.revision, diskHash, present });
			}
			const jobId = ++nextJobId;
			latestJobId = jobId;
			const job: ActiveJob = {
				identity: { ...identity, jobId }, operation, status: "running", cleanupPending: false, stage: "starting", diagnostics: [],
				documentPath: document.path, diagnosticPath: publicPath(document), projectRoot: requireRoot(), inputPaths: resolved.mappings.map(mapping => mapping.slice(mapping.indexOf("=") + 1)),
				privatePaths: resolved.privatePaths, sourcePaths: sourceRevisions.map(source => source.path), sourceRevisions, destination, workerResultReceived: false,
				destinationSelected: !!destinationSelection, destinationSelectionId: destinationSelection?.id, destinationSnapshot: destinationSelection?.snapshot
			};
			jobs.set(jobId, job);
			if (resolved.configuration.diagnostics.length) {
				job.status = "failed";
				job.stage = undefined;
				job.diagnostics = resolved.configuration.diagnostics;
				return { ok: true, job: snapshotJob(job) };
			}
			if (extension) job.destination = validateDesktopDestination(job.projectRoot, destination!, extension, [job.documentPath, ...job.inputPaths], !!destinationSelection).path;
			worker = workerFactory(desktopWorkerUrl(import.meta.url));
			job.worker = worker;
			worker.addEventListener("message", event => handleWorkerMessage(job, event.data as WorkerJobMessage));
			worker.addEventListener("error", event => {
				if (!job.workerResultReceived) failJob(job, new Error(event.message || "Worker failed."));
			});
			worker.addEventListener("close", () => {
				if (job.status === "running" && !job.workerResultReceived) failJob(job, new Error("Worker exited before returning a result."));
				job.worker = undefined;
			});
			const request: WorkerJobRequest = {
				kind: "start", jobId, operation, entryPath: entryDocument.path, entryText: entryDocument.text,
				projectRoot: job.projectRoot, sourceOverlay: [...sourceOverlay],
				inputMappings: resolved.mappings, validation: activeValidation, inputInspection: jobInputInspection, dataOutput
			};
			worker.postMessage(request);
			return { ok: true, job: snapshotJob(job) };
		} catch (error) {
			worker?.terminate();
			return errorResult({ code: error instanceof AmxError ? error.code : "DESKTOP_JOB", message: error instanceof Error ? error.message.slice(0, 1000) : "Unable to start worker job." });
		}
	}

	async function runManagedJob(operation: DesktopJobOperation, inputMappings: string[], validation: "aggregate" | "fail-fast"): Promise<DesktopRPCResponse<{ job: DesktopJobSnapshot }>> {
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
		const started = beginJob(operation, identity);
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
		const kind = documentKind(file);
		if (!kind) throw new Error("Unsupported project file kind.");
		const text = readFileSync(file, "utf8");
		const limit = documentTextLimit(file);
		if (text.length > limit) throw new Error(`Document exceeds the ${limit}-character limit.`);
		return { path: file, kind, text, diskHash: hash(text), dirty: false, conflict: false, revision: 0 };
	}

	function saveTab(document: SessionDocument): DesktopRPCResponse<{ document: OpenDocument }> {
		let temporary: string | undefined;
		try {
			const external = !!document.externalIdentity;
			if ((!external && (!allowedFile(requireRoot(), document.path) || !["amx", "csv", "json"].includes(document.kind)))
				|| (external && (!lstatSync(document.path).isFile() || lstatSync(document.path).isSymbolicLink() || realpathSync(document.path) !== document.path)))
				throw new Error(external ? "The external input is no longer a regular local file." : "File is not an editable project document.");
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
			const targetStillValid = external
				? lstatSync(document.path).isFile() && !lstatSync(document.path).isSymbolicLink() && realpathSync(document.path) === document.path
				: allowedFile(requireRoot(), document.path);
			if (!targetStillValid || hash(readFileSync(document.path, "utf8")) !== document.diskHash) {
				document.conflict = true;
				return errorResult({ code: "DESKTOP_CONFLICT", message: "The file changed during save; no changes were written." });
			}
			renameSync(temporary, document.path);
			temporary = undefined;
			document.diskHash = hash(document.text);
			document.dirty = false;
			document.conflict = false;
			persistRecovery();
			return { ok: true, document: publicDocument(document) };
		} catch (error) {
			return errorResult(projectError(document.externalIdentity ? "Unable to save the external input. Check its location and resolve any disk conflict." : error instanceof Error ? error.message : String(error)));
		}
		finally { if (temporary) { try { unlinkSync(temporary); } catch {} } }
	}

	function refreshConflicts() {
		for (const tab of allDocuments()) {
			try {
				const valid = tab.externalIdentity
					? lstatSync(tab.path).isFile() && !lstatSync(tab.path).isSymbolicLink() && realpathSync(tab.path) === tab.path
					: allowedFile(requireRoot(), tab.path);
				if (!valid || hash(readFileSync(tab.path, "utf8")) !== tab.diskHash) tab.conflict = true;
			} catch { tab.conflict = true; }
		}
	}

	function cancelAutosave(path?: string) {
		if (path) {
			const timer = autosaveTimers.get(path);
			if (timer) clearTimeout(timer);
			autosaveTimers.delete(path);
			return;
		}
		for (const timer of autosaveTimers.values()) clearTimeout(timer);
		autosaveTimers.clear();
	}

	function scheduleAutosave(document: SessionDocument) {
		const key = publicPath(document);
		cancelAutosave(key);
		if (!autosaveEnabled || !document.dirty || document.conflict) return;
		autosaveTimers.set(key, setTimeout(() => {
			autosaveTimers.delete(key);
			if (findDocument(key) === document && document.dirty && !document.conflict) void saveTab(document);
		}, autosaveDelayMs));
	}

	function trashRoot(root = requireRoot()): string {
		return join(root, ".openamx", "trash");
	}

	function trashItem(id: string) {
		if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid trash item.");
		const directory = join(trashRoot(), id);
		const metadataPath = join(directory, "metadata.json");
		const payloadPath = join(directory, "payload");
		if (!existsSync(metadataPath) || !existsSync(payloadPath) || lstatSync(directory).isSymbolicLink() || lstatSync(metadataPath).isSymbolicLink() || lstatSync(payloadPath).isSymbolicLink())
			throw new Error("Trash item is unavailable.");
		const metadata: unknown = JSON.parse(readFileSync(metadataPath, "utf8"));
		if (!metadata || typeof metadata !== "object" || typeof (metadata as { path?: unknown }).path !== "string") throw new Error("Trash metadata is invalid.");
		const path = (metadata as { path: string }).path;
		const kind = documentKind(path);
		if (!kind || path.startsWith(".") || path.split(/[\\/]/).some(part => !part || part === "." || part === ".." || part.startsWith("."))) throw new Error("Trash metadata path is invalid.");
		return { id, path, kind, directory, payloadPath };
	}

	function createTarget(root: string, path: string): string {
		if (typeof path !== "string" || !path || path.length > 1024 || path.includes("\\") || path.startsWith("/")) throw new Error("Project path must be a bounded relative path.");
		const parts = path.split("/");
		if (parts.some(part => !part || part === "." || part === ".." || part.startsWith(".") || IGNORED.has(part))) throw new Error("Project path contains an unsupported segment.");
		const target = resolve(root, path);
		if (relative(root, target).startsWith("..") || existsSync(target)) throw new Error("Project destination is unavailable.");
		const parent = dirname(target);
		const canonicalParent = within(root, parent);
		if (!canonicalParent || !statSync(canonicalParent).isDirectory()) throw new Error("Project destination parent must be an existing contained directory.");
		return target;
	}

	function writeNewFile(path: string, text: string): void {
		let temporary: string | undefined;
		try {
			temporary = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`);
			const handle = openSync(temporary, "wx", 0o600);
			try {
				writeFileSync(handle, text, "utf8");
				fsyncSync(handle);
			} finally { closeSync(handle); }
			renameSync(temporary, path);
			temporary = undefined;
		} finally { if (temporary) { try { unlinkSync(temporary); } catch {} } }
	}

	function prepareTransition(action: TransitionAction): DesktopRPCResponse<{ ready: boolean; state: WorkbenchState }> {
		refreshConflicts();
		if (action === "cancel") return { ok: true, ready: false, state: state() };
		if (action !== "save-all" && action !== "discard-all") return errorResult(projectError("Invalid project transition."));
		if (action === "save-all") {
			for (const tab of allDocuments()) {
				if (tab.conflict) return errorResult({ code: "DESKTOP_CONFLICT", message: tab.externalIdentity ? "Resolve the external input disk conflict before saving all tabs." : { code: "DESKTOP_CONFLICT", message: `Resolve the disk conflict in ${relative(requireRoot(), tab.path)} before saving all tabs.` }.message });
			}
			for (const tab of allDocuments()) {
				if (!tab.dirty && !tab.conflict) continue;
				const saved = saveTab(tab);
				if (!saved.ok) return errorResult(saved.error);
			}
		}
		return { ok: true, ready: true, state: state() };
	}

	function inputConfiguration() {
		const { document } = requireActive();
		const resolved = resolveDesktopInputs(requireRoot(), document.text, activeInputMappings, activeValidation);
		return {
			...resolved.configuration,
			revisions: {
				local: readConfigurationRevision(requireRoot(), "local"),
				project: readConfigurationRevision(requireRoot(), "project")
			}
		};
	}

	async function reportSettingsSnapshot(): Promise<ReportSettingsSnapshot> {
		const { document } = requireActive();
		const root = requireRoot();
		const config = readConfiguration(root, "project");
		const project = config.report && typeof config.report === "object" && !Array.isArray(config.report) ? config.report as ReportSettingsValues : {};
		const frontmatter = parseFrontMatter(document.text);
		if (frontmatter.error) throw new Error("Current document has invalid YAML frontmatter.");
		const rawDocument = frontmatter.metadata.report;
		if (rawDocument !== undefined && (!rawDocument || typeof rawDocument !== "object" || Array.isArray(rawDocument))) throw new Error("Current document report frontmatter must be a mapping.");
		const current = (rawDocument ?? {}) as ReportSettingsValues;
		const effective = { ...project, ...current };
		if (effective.sourceVisible === undefined) effective.sourceVisible = true;
		if (effective.accent === undefined) effective.accent = "#146C94";
		const diagnostics: TextDiagnostic[] = [];
		let accentFallback = false;
		try {
			await validateReportSettings(project as Record<string, unknown>, root);
			if (current.logo !== undefined && current.logo !== null && !current.logoAlt) throw new Error("A current-document logo override requires its own logoAlt value.");
			await validateReportSettings(effective as Record<string, unknown>, root, document.path);
			const configuredAccent = typeof effective.accent === "string" ? effective.accent : "#146C94";
			const resolvedAccent = effectiveReportAccent(configuredAccent);
			accentFallback = resolvedAccent !== configuredAccent;
			effective.accent = resolvedAccent;
		} catch (error) {
			diagnostics.push({ code: "AMX6001", message: error instanceof Error ? error.message.slice(0, 1000) : "Report settings are invalid." });
		}
		return {
			project: { ...project }, document: { ...current }, effective,
			projectRevision: readConfigurationRevision(root, "project"), documentRevision: document.revision, accentFallback, diagnostics
		};
	}

	function applyReportChanges(target: Record<string, unknown>, values: ReportSettingsValues): void {
		if (!values || typeof values !== "object" || Array.isArray(values) || Object.keys(values).some(key => !REPORT_SETTING_KEYS.includes(key as ReportSettingKey))) {
			throw new Error("Report settings contain an unsupported field.");
		}
		for (const [key, value] of Object.entries(values)) {
			if (value === null) delete target[key];
			else target[key] = value;
		}
	}

	function markSettingsChanged(): WorkbenchState {
		inputSettingsRevision++;
		invalidateStaleJobs();
		return state();
	}

	async function validateProjectConfiguration(root: string, config: Record<string, unknown>): Promise<void> {
		const inputs = config.inputs as Record<string, string>;
		const diagnostics = validateDesktopMappings(root, inputs, true);
		if (diagnostics.length) throw new Error(diagnostics[0]!.message);
		const report = config.report && typeof config.report === "object" && !Array.isArray(config.report) ? config.report as Record<string, unknown> : {};
		await validateReportSettings(report, root);
	}

	function validateLocalConfiguration(root: string, config: Record<string, unknown>): void {
		const diagnostics = validateDesktopMappings(root, config.inputs as Record<string, string>, false);
		if (diagnostics.length) throw new Error(diagnostics[0]!.message);
	}

	function requireDeclaredInput(name: string): void {
		if (!/^[A-Za-z][A-Za-z0-9_]{0,99}$/.test(name)) throw new Error("Invalid logical input name.");
		const currentConfiguration = resolveDesktopInputs(requireRoot(), requireActive().document.text, activeInputMappings).configuration;
		if (!currentConfiguration.inputs.some(input => input.name === name)) throw new Error("That logical input is not declared by the active document.");
	}

	function validatedPickedFile(path: string, extensions: string[]): string {
		if (!path || path.length > 4096 || path.includes("\0") || path.includes("://") || path.startsWith("\\\\") || path.startsWith("//")) throw new Error("Selected file is not a supported local file.");
		if (!extensions.includes(extname(path))) throw new Error("Selected file has an unsupported extension.");
		if (lstatSync(path).isSymbolicLink() || !statSync(path).isFile()) throw new Error("Selected file must be a regular file, not a symlink.");
		return realpathSync(path);
	}

	function containedRelativeFile(root: string, path: string): string {
		const candidate = resolve(root, path);
		const relativePath = relative(root, candidate);
		if (!relativePath || relativePath.startsWith("..") || relativePath.startsWith(sep) || relativePath.split(sep).some(part => part.startsWith("."))) throw new Error("Selected file must be a visible file inside the project.");
		let current = root;
		for (const part of relativePath.split(sep)) {
			current = join(current, part);
			if (lstatSync(current).isSymbolicLink()) throw new Error("Selected project file must not use symlinks.");
		}
		if (!statSync(candidate).isFile() || realpathSync(candidate) !== candidate) throw new Error("Selected project file is unavailable.");
		return relativePath.split(sep).join("/");
	}

	const service = {
		setProjectRoot(root: string, action?: TransitionAction) {
			const canonical = realpathSync(resolve(root));
			if (!statSync(canonical).isDirectory()) throw new Error("Project root must be a directory.");
			if (projectRoot !== canonical && allDocuments().some(tab => tab.dirty || tab.conflict)) {
				if (!action) throw new Error("Save or discard unsaved tabs before switching projects.");
				const prepared = prepareTransition(action);
				if (!prepared.ok) throw new Error(prepared.error.message);
				if (!prepared.ready) throw new Error("Project change cancelled.");
			}
			if (projectRoot !== canonical) { cancelAutosave(); tabs.clear(); externalTabs.clear(); editSequences.clear(); current = undefined; generation++; invalidateStaleJobs(); persistRecovery(); }
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
					const action = projectRoot !== candidate && allDocuments().some(tab => tab.dirty || tab.conflict)
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
			async pickDestination({ extension, fileName }: { extension: ExportExtension; fileName: string }) {
				try {
					if (![".html", ".pdf", ".docx", ".json", ".csv"].includes(extension)) throw new Error("Invalid destination type.");
				if (typeof fileName !== "string" || fileName.length > 200 || !fileName || fileName.startsWith(".")
					|| /[\\/\0\r\n<>:"|?*]/.test(fileName) || extname(fileName) !== extension || basename(fileName) !== fileName)
					throw new Error("Export filename must be a visible filename with the selected extension.");
					const started = generation;
					const { document } = requireActive();
					if (document.kind !== "amx") throw new Error("Export requires an active AMX document.");
					const identity = state().requestIdentity;
					if (!identity) throw new Error("Export requires a current active-document identity.");
					const path = await picker?.choose({ directory: true, extension, fileName, root: requireRoot() });
					if (!path) return { ok: true, cancelled: true };
					if (started !== generation || !tabs.has(document.path) || !identityMatchesCurrent(identity)) return { ok: true, cancelled: true };
					const validated = validateDesktopDestination(requireRoot(), path, extension, [document.path], true);
					const id = randomUUID();
					const snapshot = destinationSnapshot(validated.path);
					if (snapshot.exists && !await picker?.confirmOverwrite?.(basename(validated.path))) return { ok: true, cancelled: true };
					exportSelections.set(id, { id, path: validated.path, extension, identity, snapshot });
					while (exportSelections.size > 20) exportSelections.delete(exportSelections.keys().next().value!);
					return { ok: true, cancelled: false, selectionId: id, fileName };
				} catch (error) { return errorResult<{ cancelled: boolean; selectionId?: string; fileName?: string }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async openExportedOutput({ outputId, action }: { outputId: string; action: "open" | "reveal" }) {
				const output = exportedOutputs.get(outputId);
				if (!output || (action !== "open" && action !== "reveal")) return errorResult<Record<string, never>>(projectError("Exported output is no longer available."));
				try {
					const opened = action === "open"
						? await picker?.openPath?.(output.path)
						: await picker?.revealPath?.(output.path);
					if (opened === false || opened === undefined) throw new Error("Native Open or Reveal is unavailable on this host.");
					return { ok: true };
				} catch {
					return errorResult<Record<string, never>>(projectError(`Unable to ${action} the exported file.`));
				}
			},
			async getRecents() { return { ok: true, projects: recents }; },
			async clearSession() {
				recents = [];
				persist();
				return { ok: true, projects: recents };
			},
			async getRecovery() {
				const items: RecoveryItem[] = recovery?.documents.map(item => ({ path: item.path, kind: documentKind(item.path) as "amx" | "csv" | "json" })).filter((item): item is RecoveryItem => !!item.kind) ?? [];
				return { ok: true, available: !!recovery && !!items.length, root: recovery?.root, items };
			},
			async resolveRecovery({ action }: { action: "restore" | "discard" }) {
				try {
					if (action !== "restore" && action !== "discard") throw new Error("Invalid recovery action.");
					if (!recovery) return { ok: true, state: state() };
					if (action === "discard") {
						recovery = undefined;
						if (recoveryFile && existsSync(recoveryFile)) unlinkSync(recoveryFile);
						return { ok: true, state: state() };
					}
					if (allDocuments().some(tab => tab.dirty || tab.conflict)) throw new Error("Resolve current unsaved tabs before restoring recovery.");
					const snapshot = recovery;
					service.setProjectRoot(snapshot.root, "discard-all");
					for (const item of snapshot.documents) {
						const path = within(snapshot.root, item.path);
						if (!path || !allowedFile(snapshot.root, path) || !["amx", "csv", "json"].includes(documentKind(path) ?? "")) continue;
						const document = readEntry(path);
						document.text = item.text;
						document.dirty = hash(document.text) !== document.diskHash;
						document.revision = Math.max(1, item.revision + 1);
						tabs.set(path, document);
					}
					const active = snapshot.active && within(snapshot.root, snapshot.active);
					current = active ? tabs.get(active) : tabs.values().next().value;
					persistRecovery();
					record();
					return { ok: true, root: projectRoot, state: state() };
				} catch (error) { return errorResult<{ root?: string; state: WorkbenchState }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async restoreProject({ root }: { root: string }) {
				const saved = recents.find(item => item.root === root);
				if (!saved) return errorResult<{ root: string; state: WorkbenchState }>(projectError("Project is not in recent history."));
				try {
					if (lstatSync(root).isSymbolicLink() || realpathSync(root) !== root || !statSync(root).isDirectory()) throw new Error("Recent project is no longer a real directory.");
					const started = generation;
					const action = projectRoot !== root && allDocuments().some(tab => tab.dirty || tab.conflict)
						? await picker?.confirmTransition?.("project") ?? "cancel" : undefined;
					if (started !== generation || action === "cancel") return errorResult<{ root: string; state: WorkbenchState }>({ code: "DESKTOP_CANCELLED", message: "Project change cancelled." });
					if (projectRoot === root && allDocuments().some(tab => tab.dirty || tab.conflict)) throw new Error("Project is already open with unsaved tabs.");
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
			async createProject({ path, action }: { path: string; action?: TransitionAction }) {
				let projectConfig: string | undefined;
				let report: string | undefined;
				let projectDirectory: string | undefined;
				try {
					const candidate = resolve(path);
					if (!existsSync(candidate) || lstatSync(candidate).isSymbolicLink()) throw new Error("Project creation requires an existing real empty directory.");
					projectDirectory = realpathSync(candidate);
					if (!statSync(projectDirectory).isDirectory() || readdirSync(projectDirectory).length) throw new Error("Project creation requires an empty directory.");
					if (projectRoot !== projectDirectory && allDocuments().some(tab => tab.dirty || tab.conflict)) {
						if (!action) throw new Error("Save or discard unsaved tabs before creating a project.");
						const prepared = prepareTransition(action);
						if (!prepared.ok) throw new Error(prepared.error.message);
						if (!prepared.ready) throw new Error("Project creation cancelled.");
					}
					const internalDirectory = join(projectDirectory, ".openamx");
					projectConfig = join(internalDirectory, "project.json");
					report = join(projectDirectory, "report.amx");
					const configTemporary = join(projectDirectory, `.project.${randomUUID()}.tmp`);
					const reportTemporary = join(projectDirectory, `.report.${randomUUID()}.tmp`);
					mkdirSync(internalDirectory, { recursive: false, mode: 0o700 });
					try {
						writeFileSync(configTemporary, '{"version":1,"inputs":{}}\n', { encoding: "utf8", mode: 0o600, flag: "wx" });
						writeFileSync(reportTemporary, '# New Report\n\n```amx\nexport let title: String = "New Report"\n```\n', { encoding: "utf8", mode: 0o600, flag: "wx" });
						renameSync(configTemporary, projectConfig);
						renameSync(reportTemporary, report);
					} catch (error) {
						for (const file of [configTemporary, reportTemporary, projectConfig, report]) {
							try { if (existsSync(file)) unlinkSync(file); } catch {}
						}
						try { if (existsSync(internalDirectory) && readdirSync(internalDirectory).length === 0) rmSync(internalDirectory); } catch {}
						throw error;
					}
					service.setProjectRoot(projectDirectory, action);
					const document = readEntry(report);
					current = document;
					tabs.set(report, document);
					record();
					return { ok: true, root: projectDirectory, document, state: state() };
				} catch (error) {
					return errorResult<{ root: string; document: OpenDocument; state: WorkbenchState }>(projectError(error instanceof Error ? error.message : String(error)));
				}
			},
			async pickCreateProject() {
				try {
					const started = generation;
					const path = await picker?.choose({ directory: true });
					if (!path || started !== generation) return { ok: true, cancelled: true };
					const action = allDocuments().some(tab => tab.dirty || tab.conflict)
						? await picker?.confirmTransition?.("project") ?? "cancel" : undefined;
					if (started !== generation || action === "cancel") return { ok: true, cancelled: true };
					const created = await service.request.createProject({ path, action });
					return created.ok
						? { ok: true, cancelled: false, root: created.root }
						: errorResult<{ cancelled: boolean; root?: string }>(created.error);
				} catch (error) { return errorResult<{ cancelled: boolean; root?: string }>(projectError(error instanceof Error ? error.message : String(error))); }
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
				const tab = findDocument(path);
				if (!tab) return errorResult<{ document: OpenDocument }>(projectError("Tab is not open."));
				current = tab;
				refreshConflicts();
				invalidateStaleJobs();
				record();
				return { ok: true, document: publicDocument(tab) };
			},
			async getWorkbench() { refreshConflicts(); return { ok: true, state: state() }; },
			async getProjectContext() { refreshConflicts(); return { ok: true, root: projectRoot, state: state() }; },
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
			async pickInputMapping({ name, expectedRevision }: { name: string; expectedRevision: string }) {
				try {
					requireDeclaredInput(name);
					const active = requireActive().document;
					const startedGeneration = generation;
					const startedRevision = active.revision;
					const root = requireRoot();
					const path = await picker?.choose({ directory: false, root });
					if (!path) return { ok: true, configuration: inputConfiguration(), state: state() };
					if (generation !== startedGeneration || current !== active || active.revision !== startedRevision) return errorResult<{ configuration: ReturnType<typeof inputConfiguration>; state: WorkbenchState }>({ code: "DESKTOP_STALE", message: "The active document changed while choosing an input." });
					const selected = validatedPickedFile(path, [".json", ".csv"]);
					const localConfig = readConfiguration(root, "local");
					const localInputs = { ...(localConfig.inputs as Record<string, string>), [name]: selected };
					validateLocalConfiguration(root, { ...localConfig, inputs: localInputs });
					const revision = updateConfiguration(root, "local", expectedRevision, config => {
						config.inputs = localInputs;
					});
					void revision;
					const nextState = markSettingsChanged();
					return { ok: true, configuration: inputConfiguration(), state: nextState };
				} catch (error) {
					return errorResult<{ configuration: ReturnType<typeof inputConfiguration>; state: WorkbenchState }>({ code: "DESKTOP_CONFIG", message: error instanceof Error ? error.message.slice(0, 1000) : "Unable to save the input mapping." });
				}
			},
			async clearInputMapping({ name, scope, expectedRevision }: { name: string; scope: "session" | "local" | "project"; expectedRevision?: string }) {
				try {
					requireDeclaredInput(name);
					if (scope === "session") {
						const next = activeInputMappings.filter(mapping => mapping.slice(0, mapping.indexOf("=")) !== name);
						const changed = next.length !== activeInputMappings.length;
						const configured = await service.request.setInputSettings({ inputMappings: next, validation: activeValidation });
						if (!configured.ok) return errorResult<{ configuration: ReturnType<typeof inputConfiguration>; state: WorkbenchState }>(configured.error);
						return { ok: true, configuration: inputConfiguration(), state: configured.state };
					}
					if (!expectedRevision) throw new Error("Reload the input settings before clearing this mapping.");
					const root = requireRoot();
					const currentConfig = readConfiguration(root, scope);
					if (!Object.hasOwn(currentConfig.inputs as object, name)) return { ok: true, configuration: inputConfiguration(), state: state() };
					const inputs = { ...(currentConfig.inputs as Record<string, string>) };
					delete inputs[name];
					if (scope === "project") await validateProjectConfiguration(root, { ...currentConfig, inputs });
					else validateLocalConfiguration(root, { ...currentConfig, inputs });
					updateConfiguration(root, scope, expectedRevision, config => { config.inputs = inputs; });
					const nextState = markSettingsChanged();
					return { ok: true, configuration: inputConfiguration(), state: nextState };
				} catch (error) {
					return errorResult<{ configuration: ReturnType<typeof inputConfiguration>; state: WorkbenchState }>({ code: "DESKTOP_CONFIG", message: error instanceof Error ? error.message.slice(0, 1000) : "Unable to clear the input mapping." });
				}
			},
			async promoteInputMapping({ name, expectedLocalRevision, expectedProjectRevision }: { name: string; expectedLocalRevision: string; expectedProjectRevision: string }) {
				try {
					requireDeclaredInput(name);
					const root = requireRoot();
					if (readConfigurationRevision(root, "local") !== expectedLocalRevision) throw new Error("Local input settings changed; reload before promoting.");
					const local = readConfiguration(root, "local");
					const value = (local.inputs as Record<string, unknown>)[name];
					if (typeof value !== "string") throw new Error("Choose a local input mapping before promoting it.");
					const selected = resolve(root, value);
					const mapped = containedRelativeFile(root, selected);
					if (![".json", ".csv"].includes(extname(mapped))) throw new Error("Only contained JSON and CSV files can be promoted.");
					const projectConfig = readConfiguration(root, "project");
					const projectInputs = { ...(projectConfig.inputs as Record<string, string>), [name]: mapped };
					await validateProjectConfiguration(root, { ...projectConfig, inputs: projectInputs });
					updateConfiguration(root, "project", expectedProjectRevision, config => {
						config.inputs = projectInputs;
					});
					return { ok: true, configuration: inputConfiguration(), state: markSettingsChanged() };
				} catch (error) {
					return errorResult<{ configuration: ReturnType<typeof inputConfiguration>; state: WorkbenchState }>({ code: "DESKTOP_CONFIG", message: error instanceof Error ? error.message.slice(0, 1000) : "Unable to promote the input mapping." });
				}
			},
			async openMappedInput({ name }: { name: string }) {
				try {
					requireDeclaredInput(name);
					const root = requireRoot();
					const { document, sourceOverlay } = requireActive();
					const resolved = resolveDesktopInputs(root, document.text, activeInputMappings, activeValidation);
					const mapping = resolved.mappings.find(value => value.slice(0, value.indexOf("=")) === name);
					if (!mapping) throw new Error("Choose a mapping before opening this input.");
					const mappedPath = mapping.slice(mapping.indexOf("=") + 1);
					const dataFormat = extname(mappedPath).slice(1);
					if (dataFormat !== "csv" && dataFormat !== "json") throw new Error("Mapped input format is unsupported.");
					const binding: MappedInputBinding = { inputName: name, dataFormat, ownerPath: document.path };
					const contained = within(root, mappedPath);
					if (contained) {
						const opened = await service.request.openDocument({ path: contained });
						if (!opened.ok) return errorResult<{ document: OpenDocument; inputName?: string }>(opened.error);
						const session = tabs.get(realpathSync(contained));
						if (session) session.mappedInput = binding;
						return { ok: true, document: opened.document, inputName: name };
					}
					const candidate = resolve(mappedPath);
					if (lstatSync(candidate).isSymbolicLink() || !statSync(candidate).isFile() || realpathSync(candidate) !== candidate)
						throw new Error("Mapped external input must be a regular local file without symlinked path segments.");
					let external = [...externalTabs.values()].find(tab => tab.path === candidate && tab.externalIdentity?.inputName === name);
					if (!external) {
						external = readEntry(candidate);
						const publicUri = `openamx-external:${name}:${randomUUID()}`;
						external.kind = "external-data";
						external.externalIdentity = { publicUri, label: `External / Private · ${name}`, inputName: name, dataFormat };
						externalTabs.set(publicUri, external);
					}
					external.mappedInput = binding;
					current = external;
					refreshConflicts();
					invalidateStaleJobs();
					record();
					return { ok: true, document: publicDocument(external), inputName: name };
				} catch (error) {
					return errorResult<{ document: OpenDocument; inputName?: string }>({ code: "DESKTOP_INPUT", message: "Unable to open the mapped data file. Check the mapping, file type, and local file permissions." });
				}
			},
			async getReportSettings() {
				try { return { ok: true, settings: await reportSettingsSnapshot() }; }
				catch (error) { return errorResult<{ settings: ReportSettingsSnapshot }>(projectError(error instanceof Error ? error.message : "Unable to load report settings.")); }
			},
			async pickReportLogo() {
				try {
					const active = requireActive().document;
					const startedGeneration = generation;
					const startedRevision = active.revision;
					const root = requireRoot();
					const selected = await picker?.choose({ directory: false, root });
					if (!selected) return { ok: true, cancelled: true };
					if (generation !== startedGeneration || current !== active || active.revision !== startedRevision) return errorResult<{ cancelled: boolean; path?: string }>({ code: "DESKTOP_STALE", message: "The active document changed while choosing a logo." });
					const canonical = validatedPickedFile(selected, [".png", ".jpg"]);
					const path = containedRelativeFile(root, canonical);
					await validateReportSettings({ logo: path, logoAlt: "Selected report logo" }, root, active.path);
					if (generation !== startedGeneration || current !== active || active.revision !== startedRevision) return errorResult<{ cancelled: boolean; path?: string }>({ code: "DESKTOP_STALE", message: "The active document changed while validating the logo." });
					return { ok: true, cancelled: false, path };
				} catch (error) {
					return errorResult<{ cancelled: boolean; path?: string }>({ code: "AMX6001", message: error instanceof Error ? error.message.slice(0, 1000) : "Selected logo is invalid." });
				}
			},
			async setProjectReportSettings({ values, expectedRevision }: { values: ReportSettingsValues; expectedRevision: string }) {
				try {
					const root = requireRoot();
					const startedGeneration = generation;
					const config = readConfiguration(root, "project");
					const report = config.report && typeof config.report === "object" && !Array.isArray(config.report) ? { ...(config.report as Record<string, unknown>) } : {};
					applyReportChanges(report, values);
					const candidateConfig = { ...config, ...(Object.keys(report).length ? { report } : {}) };
					if (!Object.keys(report).length) delete candidateConfig.report;
					await validateProjectConfiguration(root, candidateConfig);
					const active = current;
					if (active?.kind === "amx") {
						const frontmatter = parseFrontMatter(active.text);
						if (frontmatter.error) throw new Error("Current document has invalid YAML frontmatter.");
						const documentReport = frontmatter.metadata.report && typeof frontmatter.metadata.report === "object" ? frontmatter.metadata.report as Record<string, unknown> : {};
						await validateReportSettings({ ...report, ...documentReport }, root, active.path);
					}
					if (generation !== startedGeneration || projectRoot !== root) throw new Error("The active project changed while validating report settings.");
					updateConfiguration(root, "project", expectedRevision, configValue => {
						if (Object.keys(report).length) configValue.report = report;
						else delete configValue.report;
					});
					const nextState = markSettingsChanged();
					return { ok: true, settings: await reportSettingsSnapshot(), state: nextState };
				} catch (error) {
					return errorResult<{ settings: ReportSettingsSnapshot; state: WorkbenchState }>({ code: "DESKTOP_CONFIG", message: error instanceof Error ? error.message.slice(0, 1000) : "Unable to save project report settings." });
				}
			},
			async setDocumentReportSettings({ values, expectedRevision }: { values: ReportSettingsValues; expectedRevision: number }) {
				try {
					const active = requireActive().document;
					const root = requireRoot();
					const startedGeneration = generation;
					if (active.revision !== expectedRevision) throw new Error("The active document changed; reload its report settings before saving.");
					const nextText = updateReportFrontmatter(active.text, values);
					const frontmatter = parseFrontMatter(nextText);
					if (frontmatter.error) throw new Error("Updated report settings have invalid YAML frontmatter.");
					const report = frontmatter.metadata.report && typeof frontmatter.metadata.report === "object" && !Array.isArray(frontmatter.metadata.report) ? frontmatter.metadata.report as Record<string, unknown> : {};
					if (report.logo && !report.logoAlt) throw new Error("A current-document logo override requires its own logoAlt value.");
					const projectConfig = readConfiguration(root, "project");
					await validateProjectConfiguration(root, projectConfig);
					const projectReport = projectConfig.report && typeof projectConfig.report === "object" && !Array.isArray(projectConfig.report) ? projectConfig.report as Record<string, unknown> : {};
					await validateReportSettings(projectReport, root);
					await validateReportSettings(report, root, active.path);
					await validateReportSettings({ ...projectReport, ...report }, root, active.path);
					if (generation !== startedGeneration || current !== active || active.revision !== expectedRevision) throw new Error("The active document changed while validating report settings.");
					const updated = await service.request.updateBuffer({ path: active.path, text: nextText });
					if (!updated.ok) return errorResult<{ settings: ReportSettingsSnapshot; document: OpenDocument; state: WorkbenchState }>(updated.error);
					const nextState = markSettingsChanged();
					return { ok: true, settings: await reportSettingsSnapshot(), document: updated.document, state: nextState };
				} catch (error) {
					return errorResult<{ settings: ReportSettingsSnapshot; document: OpenDocument; state: WorkbenchState }>({ code: "AMX6001", message: error instanceof Error ? error.message.slice(0, 1000) : "Unable to save document report settings." });
				}
			},
			async setAutosave({ enabled, delayMs }: { enabled: boolean; delayMs: number }) {
				if (typeof enabled !== "boolean" || !Number.isSafeInteger(delayMs) || delayMs < 100 || delayMs > 10_000)
					return errorResult<{ enabled: boolean; delayMs: number }>(projectError("Autosave delay must be between 100 and 10000 milliseconds."));
				autosaveEnabled = enabled;
				autosaveDelayMs = delayMs;
				cancelAutosave();
				if (enabled) for (const tab of allDocuments()) scheduleAutosave(tab);
				return { ok: true, enabled: autosaveEnabled, delayMs: autosaveDelayMs };
			},
			async startJob({ operation, identity, selectionId, inputInspection, dataOutput }: { operation: DesktopJobOperation; identity: ActiveDocumentRequestIdentity; selectionId?: string; inputInspection?: { name: string; format: "json" | "csv"; text: string }; dataOutput?: { name: string; format: "json" | "csv" } }) {
				const exportExtension: ExportExtension | undefined = operation === "html" ? ".html" : operation === "pdf" ? ".pdf" : operation === "docx" ? ".docx"
					: operation === "export-data" && dataOutput ? `.${dataOutput.format}` as ".json" | ".csv" : undefined;
				if (exportExtension) {
					const selection = selectionId ? exportSelections.get(selectionId) : undefined;
					if (!selection || selection.extension !== exportExtension) return errorResult<{ job: DesktopJobSnapshot }>(projectError("Choose a native destination for this export first."));
					if (!sameRequestIdentity(identity, selection.identity) || !identityMatchesCurrent(identity)) {
						exportSelections.delete(selection.id);
						return errorResult<{ job: DesktopJobSnapshot }>({ code: "DESKTOP_STALE", message: "The active document changed after destination selection." });
					}
					exportSelections.delete(selection.id);
					return beginJob(operation, identity, selection.path, inputInspection, dataOutput, selection);
				}
				if (selectionId) return errorResult<{ job: DesktopJobSnapshot }>(projectError("A native destination is valid only for an export job."));
				return beginJob(operation, identity, undefined, inputInspection, dataOutput);
			},
			async getJob({ jobId }: { jobId: number }) {
				if (!Number.isSafeInteger(jobId) || jobId < 1) return errorResult<{ job: DesktopJobSnapshot }>(projectError("Invalid job identifier."));
				const job = jobs.get(jobId);
				if (!job) return errorResult<{ job: DesktopJobSnapshot }>(projectError("Job is no longer available."));
				if (job.status === "running" && (jobId !== latestJobId || !jobIsCurrent(job))) terminateJob(job, "superseded");
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
					if (!allDocuments().some(tab => tab.dirty || tab.conflict)) return { ok: true, ready: true };
					const started = generation;
					const action = await picker?.confirmTransition?.("quit") ?? "cancel";
					if (started !== generation) return { ok: true, ready: false };
					const prepared = prepareTransition(action);
					return prepared.ok ? { ok: true, ready: prepared.ready } : errorResult<{ ready: boolean }>(prepared.error);
				} catch (error) { return errorResult<{ ready: boolean }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async closeTab({ path, action }: { path: string; action: "save" | "discard" | "cancel" }) {
				const tab = findDocument(path);
				if (!tab || !["save", "discard", "cancel"].includes(action)) return errorResult<{ state: WorkbenchState }>(projectError("Invalid tab close request."));
				if (action === "cancel") return { ok: true, state: state() };
				if (tab.dirty || tab.conflict) {
					if (action === "save") {
						const saved = saveTab(tab);
						if (!saved.ok) return errorResult<{ state: WorkbenchState }>(saved.error);
					}
				}
				const key = publicPath(tab);
				cancelAutosave(key);
				if (tab.externalIdentity) externalTabs.delete(key);
				else tabs.delete(tab.path);
				if (current === tab) current = allDocuments()[0];
				generation++;
				invalidateStaleJobs();
				record();
				persistRecovery();
				return { ok: true, state: state() };
			},
			async reloadTab({ action }: { action: "discard" | "cancel" }) {
				try {
					const tab = requireCurrent();
					if (action === "cancel") return { ok: true, document: publicDocument(tab) };
					if (action !== "discard") throw new Error("Cannot reload this file.");
					if (tab.externalIdentity) {
						if (lstatSync(tab.path).isSymbolicLink() || !lstatSync(tab.path).isFile() || realpathSync(tab.path) !== tab.path) throw new Error("External input is no longer a regular local file.");
						const text = readFileSync(tab.path, "utf8");
						if (text.length > MAX_DATA_TEXT) throw new Error(`Document exceeds the ${MAX_DATA_TEXT}-character limit.`);
						tab.text = text;
						tab.diskHash = hash(text);
						tab.dirty = false;
						tab.conflict = false;
						tab.revision++;
						invalidateStaleJobs();
						return { ok: true, document: publicDocument(tab) };
					}
					if (!allowedFile(requireRoot(), tab.path)) throw new Error("Cannot reload this file.");
					const fresh = readEntry(tab.path);
					fresh.revision = tab.revision + 1;
					tabs.set(tab.path, fresh);
					current = fresh;
					persistRecovery();
					return { ok: true, document: publicDocument(fresh) };
				} catch (error) { return errorResult<{ document: OpenDocument }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async listProjectFiles() {
				try {
					const root = requireRoot();
					const files: ProjectFile[] = [];
					const folders: string[] = [];
					function visit(directory: string) {
						for (const entry of readdirSync(directory, { withFileTypes: true })) {
							if (entry.name.startsWith(".") || IGNORED.has(entry.name)) continue;
							const candidate = join(directory, entry.name);
							if (entry.isSymbolicLink()) continue;
							if (entry.isDirectory()) {
								if (folders.length >= MAX_FOLDERS) throw new Error("Project exceeds the explorer folder limit.");
								folders.push(relative(root, candidate));
								visit(candidate);
							}
							else if (entry.isFile()) {
								const kind = documentKind(candidate);
								if (!kind) continue;
								if (files.length >= MAX_FILES) throw new Error("Project exceeds the explorer file limit.");
								files.push({ path: relative(root, candidate), kind });
							}
						}
					}
					visit(root);
					return {
						ok: true,
						files: files.sort((left, right) => left.path.localeCompare(right.path)),
						folders: folders.sort((left, right) => left.localeCompare(right))
					};
				} catch (error) {
					return errorResult<{ files: ProjectFile[]; folders: string[] }>(projectError(error instanceof Error ? error.message : String(error)));
				}
			},
			async createProjectFile({ path, kind }: { path: string; kind: "amx" | "csv" | "json" }) {
				try {
					const root = requireRoot();
					const target = createTarget(root, path);
					if (documentKind(target) !== kind) throw new Error("Project file extension does not match its requested kind.");
					const text = kind === "amx" ? "# New Document\n\n```amx\n\n```\n" : kind === "csv" ? "\n" : "{}\n";
					writeNewFile(target, text);
					const document = readEntry(target);
					current = document;
					tabs.set(target, document);
					generation++;
					invalidateStaleJobs();
					record();
					return { ok: true, document, state: state() };
				} catch (error) { return errorResult<{ document: OpenDocument; state: WorkbenchState }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async createProjectFolder({ path }: { path: string }) {
				try {
					const target = createTarget(requireRoot(), path);
					mkdirSync(target, { recursive: false, mode: 0o700 });
					return { ok: true, state: state() };
				} catch (error) { return errorResult<{ state: WorkbenchState }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async duplicateProjectFile({ source, destination }: { source: string; destination: string }) {
				try {
					const root = requireRoot();
					const original = within(root, source);
					if (!original || !allowedFile(root, original) || !["amx", "csv", "json"].includes(documentKind(original) ?? "")) throw new Error("Only contained editable project files can be duplicated.");
					const target = createTarget(root, destination);
					if (extname(target) !== extname(original)) throw new Error("Duplicate destination must retain the source extension.");
					const text = readFileSync(original, "utf8");
					if (text.length > documentTextLimit(original)) throw new Error(`Document exceeds the ${documentTextLimit(original)}-character limit.`);
					writeNewFile(target, text);
					const document = readEntry(target);
					current = document;
					tabs.set(target, document);
					generation++;
					invalidateStaleJobs();
					record();
					return { ok: true, document, state: state() };
				} catch (error) { return errorResult<{ document: OpenDocument; state: WorkbenchState }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async moveProjectFile({ source, destination }: { source: string; destination: string }) {
				const temporaryFiles: string[] = [];
				const backups: Array<{ path: string; backup: string; installed: boolean }> = [];
				let destinationPath = "";
				let destinationInstalled = false;
				try {
					const root = requireRoot();
					const sourceCandidate = resolve(root, source);
					if (!within(root, sourceCandidate) || !allowedFile(root, sourceCandidate)) throw new Error("Only visible contained project files can be moved.");
					const sourcePath = realpathSync(sourceCandidate);
					const kind = documentKind(sourcePath)!;
					destinationPath = createTarget(root, destination);
					if (extname(destinationPath) !== extname(sourcePath)) throw new Error("Move destination must retain the source extension.");
					refreshConflicts();
					const sourceTab = tabs.get(sourcePath);
					const sourceBytes = readFileSync(sourcePath);
					const sourceDiskHash = createHash("sha256").update(sourceBytes).digest("hex");
					if (sourceTab?.conflict || (sourceTab && hash(sourceBytes.toString("utf8")) !== sourceTab.diskHash)) {
						return errorResult<{ state: WorkbenchState }>({ code: "DESKTOP_CONFLICT", message: "The file changed on disk; resolve its conflict before moving it." });
					}
					let movedText = sourceTab?.text ?? sourceBytes.toString("utf8");
					if (kind === "amx" && movedText.length > MAX_TEXT) throw new Error(`Document exceeds the ${MAX_TEXT}-character limit.`);

					const updates = new Map<string, { text: string; diskHash: string; mode: number; tab?: SessionDocument }>();
					if (kind === "amx") {
						const moduleFiles: string[] = [];
						const visit = (directory: string) => {
							for (const entry of readdirSync(directory, { withFileTypes: true })) {
								if (entry.name.startsWith(".") || IGNORED.has(entry.name) || entry.isSymbolicLink()) continue;
								const candidate = join(directory, entry.name);
								if (entry.isDirectory()) visit(candidate);
								else if (entry.isFile() && extname(candidate) === ".amx") moduleFiles.push(candidate);
							}
						};
						visit(root);
						if (moduleFiles.length > MAX_FILES) throw new Error("Project exceeds the AMX module scan limit.");
						const offsetAt = (text: string, line: number, column: number) => {
							if (!Number.isSafeInteger(line) || line < 1 || !Number.isSafeInteger(column) || column < 1) throw new Error("An import has no usable source location.");
							let offset = 0;
							for (let currentLine = 1; currentLine < line; currentLine++) {
								const newline = text.indexOf("\n", offset);
								if (newline < 0) throw new Error("An import source location is outside its document.");
								offset = newline + 1;
							}
							return offset + column - 1;
						};
						const relativeImport = (importer: string, target: string) => {
							let value = relative(dirname(importer), target).split(sep).join("/");
							if (!value.startsWith(".")) value = `./${value}`;
							if (!value.endsWith(".amx") || /[\"\0\r\n]/.test(value)) throw new Error("The move would require an unsupported AMX import path.");
							return value;
						};
						for (const importer of moduleFiles) {
							const tab = tabs.get(importer);
							const diskText = readFileSync(importer, "utf8");
							const text = importer === sourcePath ? movedText : tab?.text ?? diskText;
							if (text.length > MAX_TEXT) throw new Error(`AMX document exceeds the ${MAX_TEXT}-character move limit.`);
							const parsed = parseDocumentText(text);
							const replacements: Array<{ offset: number; oldPath: string; newPath: string }> = [];
							for (const node of parsed.nodes) {
								if (node.type !== "executableCodeBlock") continue;
								for (const statement of node.statements) {
									if (statement.type !== "importDeclaration") continue;
									const candidate = resolve(dirname(importer), statement.path);
									if (importer === sourcePath) {
										if (!existsSync(candidate) || !allowedFile(root, candidate)) throw new Error(`Cannot safely move a module with missing, outside, or symlinked import '${statement.path}'.`);
										const imported = realpathSync(candidate);
										const nextTarget = imported === sourcePath ? destinationPath : imported;
										const nextPath = relativeImport(destinationPath, nextTarget);
										if (nextPath !== statement.path) {
											if (!statement.pathSource) throw new Error("Cannot safely rewrite an import without a source location.");
											replacements.push({ offset: offsetAt(text, statement.pathSource.line, statement.pathSource.column), oldPath: statement.path, newPath: nextPath });
										}
									} else {
										if (!existsSync(candidate)) continue;
										if (realpathSync(candidate) !== sourcePath) continue;
										if (!allowedFile(root, candidate)) throw new Error("Cannot rewrite a dependent import that resolves through a symlink.");
										const nextPath = relativeImport(importer, destinationPath);
										if (!statement.pathSource) throw new Error("Cannot safely rewrite an import without a source location.");
										replacements.push({ offset: offsetAt(text, statement.pathSource.line, statement.pathSource.column), oldPath: statement.path, newPath: nextPath });
									}
								}
							}
							replacements.sort((left, right) => right.offset - left.offset);
							let updatedText = text;
							for (const replacement of replacements) {
								if (updatedText.slice(replacement.offset, replacement.offset + replacement.oldPath.length) !== replacement.oldPath)
									throw new Error("An import changed while its source location was being prepared.");
								updatedText = updatedText.slice(0, replacement.offset) + replacement.newPath + updatedText.slice(replacement.offset + replacement.oldPath.length);
							}
							if (importer === sourcePath) movedText = updatedText;
							else if (updatedText !== text) {
								if (tab?.conflict || (tab && hash(diskText) !== tab.diskHash)) {
										return errorResult<{ state: WorkbenchState }>({ code: "DESKTOP_CONFLICT", message: `A dependent AMX file changed on disk; resolve its conflict before moving ${relative(root, sourcePath)}.` });
								}
								updates.set(importer, { text: updatedText, diskHash: hash(diskText), mode: statSync(importer).mode & 0o777, tab });
							}
						}
					}

					const sourceContents = sourceTab ? Buffer.from(movedText, "utf8") : kind === "amx" ? Buffer.from(movedText, "utf8") : sourceBytes;
					const sourceMode = statSync(sourcePath).mode & 0o777;
					const stage = (path: string, contents: Buffer, mode: number) => {
						const temporary = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`);
						const handle = openSync(temporary, "wx", mode);
						temporaryFiles.push(temporary);
						try { fchmodSync(handle, mode); writeFileSync(handle, contents); fsyncSync(handle); }
						finally { closeSync(handle); }
						return temporary;
					};
					if (existsSync(destinationPath)) throw new Error("Move destination already exists.");
					const destinationTemporary = stage(destinationPath, sourceContents, sourceMode);
					const updateTemporaries = [...updates].map(([path, update]) => ({ path, update, temporary: stage(path, Buffer.from(update.text, "utf8"), update.mode) }));
					if (!allowedFile(root, sourcePath) || createHash("sha256").update(readFileSync(sourcePath)).digest("hex") !== sourceDiskHash)
						return errorResult<{ state: WorkbenchState }>({ code: "DESKTOP_CONFLICT", message: "The source changed during move preparation; no files were changed." });
					for (const [path, update] of updates) {
						if (!allowedFile(root, path) || hash(readFileSync(path, "utf8")) !== update.diskHash)
							return errorResult<{ state: WorkbenchState }>({ code: "DESKTOP_CONFLICT", message: "A dependent AMX file changed during move preparation; no files were changed." });
					}
					if (existsSync(destinationPath)) throw new Error("Move destination already exists.");
					try {
						renameSync(destinationTemporary, destinationPath);
						destinationInstalled = true;
						for (const { path, update, temporary } of updateTemporaries) {
							if (!allowedFile(root, path) || hash(readFileSync(path, "utf8")) !== update.diskHash)
								throw new Error("A dependent AMX file changed during commit.");
							const backup = join(dirname(path), `.${basename(path)}.${randomUUID()}.bak`);
							renameSync(path, backup);
							const item = { path, backup, installed: false };
							backups.push(item);
							renameSync(temporary, path);
							item.installed = true;
						}
						if (createHash("sha256").update(readFileSync(sourcePath)).digest("hex") !== sourceDiskHash)
							throw new Error("The source changed during commit.");
						unlinkSync(sourcePath);
					} catch (error) {
						const rollbackErrors: string[] = [];
						for (const item of [...backups].reverse()) {
							try {
								if (item.installed && existsSync(item.path)) unlinkSync(item.path);
								if (existsSync(item.backup)) renameSync(item.backup, item.path);
							} catch { rollbackErrors.push(relative(root, item.path)); }
						}
						if (destinationInstalled) {
							try { unlinkSync(destinationPath); } catch { rollbackErrors.push(relative(root, destinationPath)); }
						}
						if (rollbackErrors.length) throw new Error(`Move failed and rollback needs attention for: ${rollbackErrors.join(", ")}.`);
						throw error;
					}
					for (const item of backups) { try { unlinkSync(item.backup); } catch {} }
					cancelAutosave(sourcePath);
					tabs.delete(sourcePath);
					if (sourceTab) {
						sourceTab.path = destinationPath;
						sourceTab.text = movedText;
						sourceTab.diskHash = hash(movedText);
						sourceTab.dirty = false;
						sourceTab.conflict = false;
						sourceTab.revision++;
						tabs.set(destinationPath, sourceTab);
					}
					for (const [path, update] of updates) {
						cancelAutosave(path);
						if (update.tab) {
							update.tab.text = update.text;
							update.tab.diskHash = hash(update.text);
							update.tab.dirty = false;
							update.tab.conflict = false;
							update.tab.revision++;
						}
					}
					generation++;
					invalidateStaleJobs();
					record();
					persistRecovery();
					return { ok: true, state: state() };
				} catch (error) {
					return errorResult<{ state: WorkbenchState }>(projectError(error instanceof Error ? error.message : String(error)));
				} finally {
					for (const temporary of temporaryFiles) { try { if (existsSync(temporary)) unlinkSync(temporary); } catch {} }
				}
			},
			async deleteProjectFile({ path }: { path: string }) {
				try {
					const root = requireRoot();
					const source = within(root, path);
					if (!source || !allowedFile(root, source)) throw new Error("Only visible contained project files can be moved to trash.");
					const tab = tabs.get(source);
					if (tab?.dirty || tab?.conflict) throw new Error("Save or resolve the open file before moving it to trash.");
					const id = randomUUID();
					const directory = join(trashRoot(root), id);
					mkdirSync(directory, { recursive: true, mode: 0o700 });
					const metadata = join(directory, "metadata.json");
					const payload = join(directory, "payload");
					writeFileSync(metadata, JSON.stringify({ path: relative(root, source), deletedAt: Date.now() }), { encoding: "utf8", mode: 0o600, flag: "wx" });
					try { renameSync(source, payload); }
					catch (error) { rmSync(directory, { recursive: true, force: true }); throw error; }
					cancelAutosave(source);
					tabs.delete(source);
					if (current?.path === source) current = tabs.values().next().value;
					generation++;
					invalidateStaleJobs();
					record();
					return { ok: true, state: state() };
				} catch (error) { return errorResult<{ state: WorkbenchState }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async listTrash() {
				try {
					const root = trashRoot();
					if (!existsSync(root)) return { ok: true, items: [] };
					if (lstatSync(root).isSymbolicLink()) throw new Error("Trash directory is invalid.");
					const items = readdirSync(root, { withFileTypes: true }).flatMap(entry => {
						if (!entry.isDirectory() || entry.isSymbolicLink()) return [];
						try { const item = trashItem(entry.name); return [{ id: item.id, path: item.path, kind: item.kind }]; }
						catch { return []; }
					});
					return { ok: true, items: items.sort((left, right) => left.path.localeCompare(right.path)) };
				} catch (error) { return errorResult<{ items: import("../shared/rpc").TrashItem[] }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async restoreTrash({ id }: { id: string }) {
				try {
					const item = trashItem(id);
					const destination = resolve(requireRoot(), item.path);
					if (existsSync(destination) || dirname(destination) !== resolve(requireRoot(), dirname(item.path))) throw new Error("Restore destination is unavailable or collides with an existing file.");
					if (!lstatSync(item.payloadPath).isFile()) throw new Error("Only regular files can be restored.");
					renameSync(item.payloadPath, destination);
					rmSync(item.directory, { recursive: true, force: true });
					generation++;
					invalidateStaleJobs();
					return { ok: true, state: state() };
				} catch (error) { return errorResult<{ state: WorkbenchState }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async emptyTrash() {
				try {
					const root = trashRoot();
					if (existsSync(root)) {
						if (lstatSync(root).isSymbolicLink()) throw new Error("Trash directory is invalid.");
						rmSync(root, { recursive: true, force: true });
					}
					return { ok: true, state: state() };
				} catch (error) { return errorResult<{ state: WorkbenchState }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async readDocument() {
				try { return { ok: true, document: publicDocument(requireCurrent()) }; }
				catch (error) { return errorResult<{ document: OpenDocument }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async updateBuffer({ text, path, sequence }: { text: string; path?: string; sequence?: number }) {
				try {
					const document = path ? findDocument(path) : requireCurrent();
					if (!document) return errorResult<{ document: OpenDocument }>(projectError("Tab is no longer open."));
					const limit = document.kind === "amx" ? MAX_TEXT : MAX_DATA_TEXT;
					if (typeof text !== "string" || text.length > limit) return errorResult<{ document: OpenDocument }>(projectError(`Document exceeds the ${limit}-character limit.`));
					const key = publicPath(document);
					if (sequence !== undefined) {
						if (!Number.isSafeInteger(sequence) || sequence < 1 || sequence <= (editSequences.get(key) ?? 0))
							return errorResult<{ document: OpenDocument }>(projectError("Superseded edit request."));
						editSequences.set(key, sequence);
					}
					document.text = text;
					document.dirty = hash(text) !== document.diskHash;
					document.revision++;
					invalidateStaleJobs();
					scheduleAutosave(document);
					persistRecovery();
					return { ok: true, document: publicDocument(document) };
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
			async analyzeBuffer({ path: requestedPath, revision: requestedRevision, cursorOffset }: { path?: string; revision?: number; cursorOffset?: number } = {}) {
				try {
					const { document, sourceOverlay } = requireActive();
					if ((requestedPath !== undefined && requestedPath !== publicPath(document))
						|| (requestedRevision !== undefined && requestedRevision !== document.revision)) {
						return errorResult<{ analysis: TextAnalysis }>(projectError("Editor analysis request is stale."));
					}
					if (document.kind !== "amx") return { ok: true, analysis: { diagnostics: [], completions: [] } };
					const entryPath = realpathSync(document.path);
					const resolveEditorModule = (_fromFile: string, targetPath: string, importNode: import("../../../src/ast/types").ImportDeclarationNode) => {
						const root = requireRoot();
						if (!allowedFile(root, targetPath)) {
						throw new AmxError({ code: "AMX5001", message: `Module '${importNode.path}' is unavailable or outside the project`, file: document.path, line: importNode.pathSource?.line, column: importNode.pathSource?.column });
						}
						const canonical = realpathSync(targetPath);
						return { file: canonical, text: sourceOverlay.get(canonical) ?? readFileSync(canonical, "utf8") };
					};
					let moduleAnalysis: ReturnType<typeof analyzeEditorModules> | undefined;
					let analysisError: unknown;
					try { moduleAnalysis = analyzeEditorModules(document.text, entryPath, resolveEditorModule); }
					catch (error) { analysisError = error; }
					let parsedDocument = moduleAnalysis?.document;
					if (!parsedDocument) {
						try { parsedDocument = parseDocumentText(document.text); }
						catch { /* Incomplete syntax has no parser-proven token ranges. */ }
					}
					const offset = Number.isSafeInteger(cursorOffset) ? Math.max(0, Math.min(document.text.length, cursorOffset!)) : document.text.length;
					let completions: string[] = [];
					let actions: NonNullable<TextAnalysis["actions"]> = [];
					if (cursorOffset !== undefined) {
						const prepared = prepareEditorCompletion(document.text, offset);
						if (prepared) {
							try {
								const completionAnalysis = prepared.text === document.text && moduleAnalysis
									? moduleAnalysis : analyzeEditorModules(prepared.text, entryPath, resolveEditorModule);
								completions = editorCompletionFacts(prepared.text, offset, prepared.document, completionAnalysis, document.text)
									.map(item => item.label).slice(0, 200);
							} catch { /* Withhold candidates when the reachable source graph is invalid or ambiguous. */ }
						}
					}
					if (analysisError instanceof AmxError && analysisError.file === document.path && analysisError.line && analysisError.column) {
						const from = sourceOffset(document.text, { line: analysisError.line, column: analysisError.column });
						if (from !== undefined) {
							try {
								actions = editorCodeActionFacts(document.text, parseDocumentText(document.text), [{
									code: analysisError.code, message: analysisError.message, from, to: from + 1
								}]).map(action => ({ ...action, revision: document.revision })).slice(0, 20);
							} catch { actions = []; }
						}
					}
					const result: TextAnalysis = {
						diagnostics: analysisError ? diagnostics(analysisError, document.path) : [],
						completions,
						highlights: parsedDocument ? editorHighlightFacts(document.text, parsedDocument).slice(0, 20_000) : [],
						symbols: moduleAnalysis ? editorSymbolFacts(document.text, entryPath, moduleAnalysis.document, moduleAnalysis,
							new Map([...(moduleAnalysis.modules ?? new Map()).keys()].map(file => [file, sourceOverlay.get(file) ?? readFileSync(file, "utf8")])))
							.slice(0, 20_000) : [],
						actions
					};
					return { ok: true, analysis: result };
				} catch (error) {
					return { ok: true, analysis: { diagnostics: diagnostics(error, current?.path), completions: [], highlights: [] } };
				}
			},
			async renameSymbol({ offset, newName, expectedRevision }: { offset: number; newName: string; expectedRevision: number }) {
				const temporaryFiles: string[] = [];
				const backups: Array<{ path: string; backup: string; installed: boolean }> = [];
				try {
					const { document, sourceOverlay } = requireActive();
					if (document.kind !== "amx") throw new Error("Symbol rename is available only for AMX documents.");
					if (document.revision !== expectedRevision) throw new Error("The active document changed; refresh analysis before renaming.");
					if (!Number.isSafeInteger(offset) || offset < 0 || offset >= document.text.length || !isSafeRenameIdentifier(newName))
						throw new Error("The rename request is invalid.");
					const root = requireRoot();
					const entryPath = realpathSync(document.path);
					const resolveEditorModule = (_fromFile: string, targetPath: string, importNode: import("../../../src/ast/types").ImportDeclarationNode) => {
						if (!allowedFile(root, targetPath)) throw new AmxError({ code: "AMX5001", message: `Module '${importNode.path}' is unavailable or outside the project`, file: document.path, line: importNode.pathSource?.line, column: importNode.pathSource?.column });
						const canonical = realpathSync(targetPath);
						return { file: canonical, text: sourceOverlay.get(canonical) ?? readFileSync(canonical, "utf8") };
					};
					const analysis = analyzeEditorModules(document.text, entryPath, resolveEditorModule);
					const moduleSources = new Map([...(analysis.modules ?? new Map()).keys()].map(file => [file, sourceOverlay.get(file) ?? readFileSync(file, "utf8")]));
					const facts = editorSymbolFacts(document.text, entryPath, analysis.document, analysis, moduleSources);
					const plan = editorRenameFact(facts, entryPath, offset);
					if (!plan) throw new Error("No unambiguous symbol is available at this location.");
					if (plan.name === newName) return { ok: true, document, state: state() };
					if (facts.some(fact => fact.declaration && fact.name === newName
						&& (fact.target.file !== plan.target.file || fact.target.from !== plan.target.from || fact.target.to !== plan.target.to)))
						throw new Error(`A symbol named '${newName}' already exists in the reachable module graph.`);

					const edits = new Map<string, Array<{ from: number; to: number }>>();
					for (const edit of plan.edits) edits.set(edit.file, [...(edits.get(edit.file) ?? []), edit]);
					const prepared = [...edits].map(([file, ranges]) => {
						if (!allowedFile(root, file) || realpathSync(file) !== file) throw new Error("A rename target is no longer a contained regular project file.");
						const tab = tabs.get(file);
						const diskText = readFileSync(file, "utf8");
						if (tab?.conflict || (tab && hash(diskText) !== tab.diskHash)) throw new Error("Resolve every affected file conflict before renaming.");
						let text = tab?.text ?? diskText;
						for (const range of [...ranges].sort((left, right) => right.from - left.from)) {
							if (text.slice(range.from, range.to) !== plan.name) throw new Error("A symbol occurrence changed while the rename was prepared.");
						text = text.slice(0, range.from) + newName + text.slice(range.to);
						}
						return { file, tab, text, diskText, diskHash: hash(diskText), mode: statSync(file).mode & 0o777 };
					});
					const rewritten = new Map(prepared.map(item => [item.file, item.text]));
					analyzeEditorModules(rewritten.get(entryPath) ?? document.text, entryPath, (_fromFile, targetPath, importNode) => {
						if (!allowedFile(root, targetPath)) throw new AmxError({ code: "AMX5001", message: `Module '${importNode.path}' is unavailable or outside the project`, file: document.path, line: importNode.pathSource?.line, column: importNode.pathSource?.column });
						const canonical = realpathSync(targetPath);
						return { file: canonical, text: rewritten.get(canonical) ?? sourceOverlay.get(canonical) ?? readFileSync(canonical, "utf8") };
					});
					const stage = (file: string, text: string, mode: number) => {
						const temporary = join(dirname(file), `.${basename(file)}.${randomUUID()}.tmp`);
						const handle = openSync(temporary, "wx", mode);
						temporaryFiles.push(temporary);
						try { fchmodSync(handle, mode); writeFileSync(handle, text, "utf8"); fsyncSync(handle); }
						finally { closeSync(handle); }
						return temporary;
					};
					const staged = prepared.map(item => ({ ...item, temporary: stage(item.file, item.text, item.mode) }));
					for (const item of prepared) {
						if (!allowedFile(root, item.file) || hash(readFileSync(item.file, "utf8")) !== item.diskHash)
							throw new Error("An affected file changed during rename preparation; no files were changed.");
					}
					try {
						for (const item of staged) {
							if (!allowedFile(root, item.file) || hash(readFileSync(item.file, "utf8")) !== item.diskHash)
								throw new Error("An affected file changed during rename commit.");
							const backup = join(dirname(item.file), `.${basename(item.file)}.${randomUUID()}.bak`);
							renameSync(item.file, backup);
							const changed = { path: item.file, backup, installed: false };
							backups.push(changed);
							renameSync(item.temporary, item.file);
							changed.installed = true;
						}
					} catch (error) {
						const rollbackErrors: string[] = [];
						for (const item of [...backups].reverse()) {
							try {
								if (item.installed && existsSync(item.path)) unlinkSync(item.path);
								if (existsSync(item.backup)) renameSync(item.backup, item.path);
							} catch { rollbackErrors.push(relative(root, item.path)); }
						}
						if (rollbackErrors.length) throw new Error(`Rename failed and rollback needs attention for: ${rollbackErrors.join(", ")}.`);
						throw error;
					}
					for (const item of backups) { try { unlinkSync(item.backup); } catch {} }
					for (const item of staged) {
						if (!item.tab) continue;
						item.tab.text = item.text;
						item.tab.diskHash = hash(item.text);
						item.tab.dirty = false;
						item.tab.conflict = false;
						item.tab.revision++;
						cancelAutosave(item.file);
					}
					invalidateStaleJobs();
					persistRecovery();
					return { ok: true, document, state: state() };
				} catch (error) {
					return errorResult<{ document: OpenDocument; state: WorkbenchState }>(projectError(error instanceof Error ? error.message : String(error)));
				} finally {
					for (const temporary of temporaryFiles) { try { if (existsSync(temporary)) unlinkSync(temporary); } catch {} }
				}
			},
			async getInputConfiguration({ inputMappings = activeInputMappings }: { inputMappings?: string[] } = {}) {
				try {
					if (inputMappings !== activeInputMappings) {
						const { document } = requireActive();
						const resolved = resolveDesktopInputs(requireRoot(), document.text, inputMappings);
						return { ok: true, configuration: { ...resolved.configuration, revisions: { local: readConfigurationRevision(requireRoot(), "local"), project: readConfigurationRevision(requireRoot(), "project") } } };
					}
					return { ok: true, configuration: inputConfiguration() };
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
		}
	} as DesktopService;
	return service;
}