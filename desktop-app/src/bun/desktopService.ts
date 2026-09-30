import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { AmxError, type AmxDiagnostic } from "../../../src/diagnostics/errors";
import { parseDocumentText } from "../../../src/parser/parseDocument";
import { formatAmx } from "../../../src/formatter/formatAmx";
import { checkingActivated, checkDocument } from "../../../src/typechecker/checkDocument";
import { loadEntryModule } from "../../../src/runtime/moduleLoader";
import { renderHtml } from "../../../src/renderer/renderHtml";
import type { DesktopRPCClient, DesktopRPCError, DesktopRPCResponse, OpenDocument, ProjectFile, TextAnalysis } from "../shared/rpc";

const MAX_TEXT = 2_000_000;
const MAX_HTML = 8_000_000;

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

function projectError(message: string): DesktopRPCError {
	return { code: "DESKTOP_PROJECT", message };
}

interface SessionDocument extends OpenDocument {
	path: string;
}

export interface DesktopService extends DesktopRPCClient {
	setProjectRoot(root: string): void;
}

export function createDesktopService(initialRoot?: string): DesktopService {
	let projectRoot = initialRoot && realpathSync(initialRoot);
	let current: SessionDocument | undefined;

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
		return { path: file, text, diskHash: hash(text), dirty: false, conflict: false };
	}

	const service = {
		setProjectRoot(root: string) {
			const canonical = realpathSync(resolve(root));
			if (!statSync(canonical).isDirectory()) throw new Error("Project root must be a directory.");
			projectRoot = canonical;
		},
		request: {
			async openProject({ path }: { path: string }) {
				try {
					const candidate = realpathSync(resolve(path));
					service.setProjectRoot(statSync(candidate).isDirectory() ? candidate : join(candidate, ".."));
					return { ok: true, root: projectRoot! };
				} catch (error) {
					return errorResult<string>(projectError(error instanceof Error ? error.message : String(error)));
				}
			},
			async openDocument({ path }: { path: string }) {
				try {
					const file = within(requireRoot(), path);
					if (!file || !validAmxFile(file)) return errorResult<{ document: OpenDocument }>(projectError("Only contained .amx files can be opened."));
					current = readEntry(file);
					return { ok: true, document: current };
				} catch (error) {
					return errorResult<{ document: OpenDocument }>(projectError(error instanceof Error ? error.message : String(error)));
				}
			},
			async listProjectFiles() {
				try {
					const root = requireRoot();
					const files: ProjectFile[] = [];
					function visit(directory: string) {
						for (const entry of readdirSync(directory, { withFileTypes: true })) {
							if (entry.name === ".openamx" || entry.name.startsWith(".")) continue;
							const candidate = join(directory, entry.name);
							if (entry.isSymbolicLink()) continue;
							if (entry.isDirectory()) visit(candidate);
							else if (entry.isFile() && entry.name.endsWith(".amx")) files.push({ path: relative(root, candidate), kind: "module" });
						}
					}
					visit(root);
					return { ok: true, files };
				} catch (error) {
					return errorResult<{ files: ProjectFile[] }>(projectError(error instanceof Error ? error.message : String(error)));
				}
			},
			async readDocument() {
				try { return { ok: true, document: requireCurrent() }; }
				catch (error) { return errorResult<{ document: OpenDocument }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async updateBuffer({ text }: { text: string }) {
				try {
					if (text.length > MAX_TEXT) return errorResult<{ document: OpenDocument }>(projectError(`Document exceeds the ${MAX_TEXT}-character limit.`));
					const document = requireCurrent();
					document.text = text;
					document.dirty = hash(text) !== document.diskHash;
					return { ok: true, document };
				} catch (error) { return errorResult<{ document: OpenDocument }>(projectError(error instanceof Error ? error.message : String(error))); }
			},
			async saveDocument() {
				try {
					const document = requireCurrent();
					const diskText = readFileSync(document.path, "utf8");
					if (hash(diskText) !== document.diskHash) {
						document.conflict = true;
						return errorResult<{ document: OpenDocument }>({ code: "DESKTOP_CONFLICT", message: "The file changed on disk; reload or explicitly resolve the conflict before saving." });
					}
					writeFileSync(document.path, document.text, "utf8");
					document.diskHash = hash(document.text);
					document.dirty = false;
					document.conflict = false;
					return { ok: true, document };
				} catch (error) { return errorResult<{ document: OpenDocument }>(projectError(error instanceof Error ? error.message : String(error))); }
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
					return { ok: true, analysis: { diagnostics: [diagnostic(error, current?.path)], completions: [] } };
				}
			},
			async previewBuffer() {
				try {
					const document = requireCurrent();
					const loaded = await loadEntryModule(document.path, { entryText: document.text });
					const html = renderHtml(loaded.doc, document.path, loaded.env);
					if (html.length > MAX_HTML) return errorResult<{ html: string; diagnostics: TextAnalysis["diagnostics"] }>(projectError(`Preview exceeds the ${MAX_HTML}-character limit.`));
					return { ok: true, html, diagnostics: [] };
				} catch (error) {
					return { ok: true, html: "", diagnostics: [diagnostic(error, current?.path)] };
				}
			}
		}
	} as DesktopService;
	return service;
}