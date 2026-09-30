import { createHash, randomUUID } from "node:crypto";
import { closeSync, existsSync, fchmodSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { AmxError, type AmxDiagnostic } from "../../../src/diagnostics/errors";
import { parseDocumentText } from "../../../src/parser/parseDocument";
import { formatAmx } from "../../../src/formatter/formatAmx";
import { checkingActivated, checkDocument } from "../../../src/typechecker/checkDocument";
import { loadEntryModule } from "../../../src/runtime/moduleLoader";
import { renderHtml } from "../../../src/renderer/renderHtml";
import { preparePdfReport, serializePdfReport } from "../../../src/renderer/reportPdf";
import { preparePdfDestination, writePdfAtomically } from "../../../src/runtime/pdfDestination";
import { prepareDocxReport, serializeDocxReport } from "../../../src/renderer/reportDocx";
import { prepareDocxDestination, writeDocxAtomically } from "../../../src/runtime/docxDestination";
import { resolveDesktopInputs, validateDesktopDestination, writeDesktopHtml } from "./desktopWorkflow";
import { createPingResponse, type DesktopRPCClient, type DesktopRPCError, type DesktopRPCResponse, type OpenDocument, type ProjectFile, type RunSummary, type TextAnalysis, type TextDiagnostic, type WorkbenchState, type RecentProject, type TransitionAction } from "../shared/rpc";

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
	return { code: "AMX3001", message: error instanceof Error ? error.message : String(error), file };
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

function validAmxFile(file: string): boolean {
	return file.endsWith(".amx") && lstatSync(file).isFile();
}

function allowedFile(root: string, file: string): boolean {
	const parts = relative(root, file).split(sep);
	if (!parts.length || parts.some(part => !part || part.startsWith(".") || IGNORED.has(part))) return false;
	let candidate = root;
	for (const part of parts) {
		candidate = join(candidate, part);
		if (lstatSync(candidate).isSymbolicLink()) return false;
	}
	return validAmxFile(file);
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
	let entryPath: string | undefined;
	let generation = 0;
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
			return { root: item.root, active: safePath(item.active), entry: safePath(item.entry),
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
			entry: entryPath ? relative(projectRoot, entryPath) : undefined,
			explorerWidth: prior?.explorerWidth, previewWidth: prior?.previewWidth }, ...recents.filter(item => item.root !== projectRoot)].slice(0, 10);
		persist();
	}

	function state(): WorkbenchState {
		return { tabs: [...tabs.values()].map(({ path, dirty, conflict, revision }) => ({ path, dirty, conflict, revision })), active: current?.path, entry: entryPath, generation };
	}

	function requireEntry(): SessionDocument {
		const document = entryPath && tabs.get(entryPath);
		if (!document) throw new Error("Designate an entry tab before running or exporting.");
		const visited = new Set<string>();
		function checkImports(file: string, text: string) {
			if (visited.has(file)) return;
			visited.add(file);
			for (const node of parseDocumentText(text).nodes) {
				if (node.type !== "executableCodeBlock") continue;
				for (const statement of node.statements) {
					if (statement.type !== "importDeclaration") continue;
					const dependency = within(dirname(file), statement.path);
					if (!dependency) continue;
					const tab = tabs.get(dependency);
					if (tab?.dirty || tab?.conflict) throw new Error(`Save unsaved dependency ${relative(requireRoot(), dependency)} before reporting.`);
					if (!visited.has(dependency)) checkImports(dependency, readFileSync(dependency, "utf8"));
				}
			}
		}
		checkImports(document.path, document.text);
		return document;
	}

	function requireRoot(): string {
		if (!projectRoot) throw new Error("Open a project before using project files.");
		return projectRoot;
	}

	function requireCurrent(): SessionDocument {
		if (!current) throw new Error("Open an .amx document first.");
		return current;
	}

	function readEntry(file: string): SessionDocument {
		const text = readFileSync(file, "utf8");
		if (text.length > MAX_TEXT) throw new Error(`Document exceeds the ${MAX_TEXT}-character limit.`);
		return { path: file, text, diskHash: hash(text), dirty: false, conflict: false, revision: 0 };
	}

	function saveTab(document: SessionDocument): DesktopRPCResponse<{ document: OpenDocument }> {
		let temporary: string | undefined;
		try {
			if (!allowedFile(requireRoot(), document.path)) throw new Error("File is no longer an allowed project document.");
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
			if (projectRoot !== canonical) { tabs.clear(); editSequences.clear(); current = undefined; entryPath = undefined; generation++; }
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
					const action = projectRoot !== candidate && [...tabs.values()].some(tab => tab.dirty || tab.conflict)
						? await picker?.confirmTransition?.("project") ?? "cancel" : undefined;
					if (started !== generation || action === "cancel") return { ok: true, cancelled: true };
					service.setProjectRoot(candidate, action);
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
					const document = requireEntry();
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
				for (const path of [saved.entry, saved.active]) {
					if (path) await service.request.openDocument({ path });
				}
				if (saved.entry && tabs.has(resolve(root, saved.entry))) entryPath = resolve(root, saved.entry);
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
					if (!file || !allowedFile(requireRoot(), resolve(requireRoot(), path))) return errorResult<{ document: OpenDocument }>(projectError("Only visible, contained regular .amx files can be opened."));
					current = tabs.get(file) ?? readEntry(file);
					tabs.set(file, current);
					refreshConflicts();
					entryPath ??= file;
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
				record();
				return { ok: true, document: tab };
			},
			async getWorkbench() { refreshConflicts(); return { ok: true, state: state() }; },
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
			async setEntry({ path }: { path: string }) {
				if (!tabs.has(path)) return errorResult<{ state: WorkbenchState }>(projectError("Entry must be an open project tab."));
				entryPath = path;
				record();
				return { ok: true, state: state() };
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
				if (entryPath === path) entryPath = undefined;
				if (current?.path === path) current = tabs.values().next().value;
				generation++;
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
							else if (entry.isFile() && entry.name.endsWith(".amx")) {
								if (files.length >= MAX_FILES) throw new Error("Project exceeds the explorer file limit.");
								files.push({ path: relative(root, candidate), kind: "module" });
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
					return { ok: true, document };
				} catch (error) { return errorResult<{ document: OpenDocument }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async saveDocument() {
				try { return saveTab(requireCurrent()); }
				catch (error) { return errorResult<{ document: OpenDocument }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async formatBuffer() {
				try { return { ok: true, text: formatAmx(requireCurrent().text) }; }
				catch (error) { return errorResult<{ text: string }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async analyzeBuffer() {
				try {
					const document = requireCurrent();
					const parsed = parseDocumentText(document.text);
					if (checkingActivated(parsed)) checkDocument(parsed, document.path);
					const analysis: TextAnalysis = { diagnostics: [], completions: ["let", "for", "match", "type", "fn", "import", "table", "chart", "show"] };
					return { ok: true, analysis };
				} catch (error) {
					return { ok: true, analysis: { diagnostics: diagnostics(error, current?.path), completions: [] } };
				}
			},
			async getInputConfiguration({ inputMappings = [] }: { inputMappings?: string[] } = {}) {
				try {
					const document = requireEntry();
					const resolved = resolveDesktopInputs(requireRoot(), document.text, inputMappings);
					return { ok: true, configuration: resolved.configuration };
				} catch (error) {
					return { ok: true, configuration: { inputs: [], diagnostics: diagnostics(error, current?.path) } };
				}
			},
			async runBuffer({ inputMappings = [], validation }: { inputMappings?: string[]; validation?: "aggregate" | "fail-fast" } = {}) {
				let privatePaths: string[] = [];
				try {
					const document = requireEntry();
					const resolved = resolveDesktopInputs(requireRoot(), document.text, inputMappings, validation);
					privatePaths = resolved.privatePaths;
					if (resolved.configuration.diagnostics.length) {
						return { ok: true, summary: { values: [] }, diagnostics: resolved.configuration.diagnostics };
					}
					const loaded = await loadEntryModule(document.path, {
						entryText: document.text,
						inputMappings: resolved.mappings,
						validation
					});
					return { ok: true, summary: summarizeBindings(loaded), diagnostics: [] };
				} catch (error) {
					return { ok: true, summary: { values: [] }, diagnostics: diagnostics(error, current?.path, privatePaths) };
				}
			},
			async previewBuffer({ inputMappings = [], validation }: { inputMappings?: string[]; validation?: "aggregate" | "fail-fast" } = {}) {
				let privatePaths: string[] = [];
				try {
					const document = requireEntry();
					const resolved = resolveDesktopInputs(requireRoot(), document.text, inputMappings, validation);
					privatePaths = resolved.privatePaths;
					if (resolved.configuration.diagnostics.length) return { ok: true, html: "", diagnostics: resolved.configuration.diagnostics };
					const loaded = await loadEntryModule(document.path, { entryText: document.text, inputMappings: resolved.mappings, validation });
					const html = renderHtml(loaded.doc, document.path, loaded.env);
					if (html.length > MAX_HTML) return errorResult<{ html: string; diagnostics: TextAnalysis["diagnostics"] }>(projectError(`Preview exceeds the ${MAX_HTML}-character limit.`));
					return { ok: true, html, diagnostics: [] };
				} catch (error) {
					return { ok: true, html: "", diagnostics: diagnostics(error, current?.path, privatePaths) };
				}
			},
			async saveHtml({ path, inputMappings = [], validation }: { path: string; inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }) {
			let privatePaths: string[] = [];
			try {
				const document = requireEntry();
				const resolved = resolveDesktopInputs(requireRoot(), document.text, inputMappings, validation);
				privatePaths = resolved.privatePaths;
				if (resolved.configuration.diagnostics.length) return { ok: true, path: "", diagnostics: resolved.configuration.diagnostics };
				const loaded = await loadEntryModule(document.path, { entryText: document.text, inputMappings: resolved.mappings, validation });
				const html = renderHtml(loaded.doc, document.path, loaded.env);
				if (html.length > MAX_HTML) throw new Error(`HTML output exceeds the ${MAX_HTML}-character limit.`);
				const inputPaths = resolved.mappings.map(mapping => mapping.slice(mapping.indexOf("=") + 1));
				const outputPath = await writeDesktopHtml(requireRoot(), path, document.path, inputPaths, html);
				return { ok: true, path: outputPath, diagnostics: [] };
			} catch (error) {
				return { ok: true, path: "", diagnostics: diagnostics(error, current?.path, privatePaths) };
			}
			},
			async exportPdf({ path, inputMappings = [], validation }: { path: string; inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }) {
			let privatePaths: string[] = [];
			try {
				const document = requireEntry();
				const resolved = resolveDesktopInputs(requireRoot(), document.text, inputMappings, validation);
				privatePaths = resolved.privatePaths;
				if (resolved.configuration.diagnostics.length) return { ok: true, path: "", bytes: 0, diagnostics: resolved.configuration.diagnostics };
				const loaded = await loadEntryModule(document.path, { entryText: document.text, inputMappings: resolved.mappings, validation });
				const inputPaths = resolved.mappings.map(mapping => mapping.slice(mapping.indexOf("=") + 1));
				const validated = validateDesktopDestination(requireRoot(), path, ".pdf", [document.path, ...inputPaths]);
				const destination = await preparePdfDestination(validated.path, document.path, resolved.mappings);
				const report = preparePdfReport(loaded.doc, loaded.env);
				const bytes = await serializePdfReport(report);
				await writePdfAtomically(destination, bytes);
				return { ok: true, path: destination.path, bytes: bytes.length, diagnostics: [] };
			} catch (error) {
				return { ok: true, path: "", bytes: 0, diagnostics: diagnostics(error, current?.path, privatePaths) };
				}
			},
			async exportDocx({ path, inputMappings = [], validation }: { path: string; inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }) {
				let privatePaths: string[] = [];
				try {
					const document = requireEntry();
					const resolved = resolveDesktopInputs(requireRoot(), document.text, inputMappings, validation);
					privatePaths = resolved.privatePaths;
					if (resolved.configuration.diagnostics.length) return { ok: true, path: "", bytes: 0, diagnostics: resolved.configuration.diagnostics };
					const loaded = await loadEntryModule(document.path, { entryText: document.text, inputMappings: resolved.mappings, validation });
					const inputPaths = resolved.mappings.map(mapping => mapping.slice(mapping.indexOf("=") + 1));
					const validated = validateDesktopDestination(requireRoot(), path, ".docx", [document.path, ...inputPaths]);
					const destination = await prepareDocxDestination(validated.path, document.path, resolved.mappings);
					const report = prepareDocxReport(loaded.doc, loaded.env);
					const bytes = await serializeDocxReport(report);
					await writeDocxAtomically(destination, bytes);
					return { ok: true, path: destination.path, bytes: bytes.length, diagnostics: [] };
				} catch (error) {
					return { ok: true, path: "", bytes: 0, diagnostics: diagnostics(error, current?.path, privatePaths) };
				}
			}
		}
	} as DesktopService;
	return service;
}