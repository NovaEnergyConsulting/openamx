import { existsSync, lstatSync, readFileSync, realpathSync, statSync } from "node:fs";
import { open, rename, unlink } from "node:fs/promises";
import { basename, extname, isAbsolute, join, relative, resolve } from "node:path";
import { outputError } from "../../../src/diagnostics/errors";
import { parseDocumentText } from "../../../src/parser/parseDocument";
import type { InputConfiguration, TextDiagnostic } from "../shared/rpc";

const MAX_MAPPINGS = 100;
const MAX_PATH_LENGTH = 4096;
const INPUT_NAME = /^[A-Za-z][A-Za-z0-9_]*$/;

interface InputConfig {
	inputs: Record<string, string>;
}

export interface ResolvedDesktopInputs {
	mappings: string[];
	privatePaths: string[];
	configuration: InputConfiguration;
}

function within(root: string, candidate: string): boolean {
	const pathFromRoot = relative(root, candidate);
	return pathFromRoot === "" || (!pathFromRoot.startsWith("..") && !isAbsolute(pathFromRoot));
}

function configDiagnostic(message: string): TextDiagnostic {
	return { code: "DESKTOP_CONFIG", message: message.slice(0, 1000) };
}

function readInputConfig(root: string, filename: "project.json" | "local.json", diagnostics: TextDiagnostic[]): InputConfig {
	const file = join(root, ".openamx", filename);
	if (!existsSync(file)) return { inputs: {} };
	try {
		const fileStat = statSync(file);
		if (lstatSync(file).isSymbolicLink() || !fileStat.isFile() || !within(root, realpathSync(file))) {
			diagnostics.push(configDiagnostic(`.openamx/${filename} must be a regular file inside the project.`));
			return { inputs: {} };
		}
		if (filename === "local.json" && process.platform !== "win32") {
			const wrongOwner = typeof process.getuid === "function" && fileStat.uid !== process.getuid();
			if (wrongOwner || (fileStat.mode & 0o077) !== 0) {
				diagnostics.push(configDiagnostic(".openamx/local.json permissions must be restricted to the current user and the file must be owned by that user."));
				return { inputs: {} };
			}
		}
		const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("The root must be an object.");
		const config = parsed as Record<string, unknown>;
		const unknown = Object.keys(config).filter(key => key !== "version" && key !== "inputs");
		if (unknown.length) throw new Error(`Unknown key '${unknown[0]}'.`);
		if (config.version !== 1) throw new Error("The required version is 1.");
		if (typeof config.inputs !== "object" || config.inputs === null || Array.isArray(config.inputs)) {
			throw new Error("'inputs' must be an object of logical input names and paths.");
		}
		const entries = Object.entries(config.inputs as Record<string, unknown>);
		if (entries.length > MAX_MAPPINGS) throw new Error(`At most ${MAX_MAPPINGS} inputs are allowed.`);
		const inputs: Record<string, string> = {};
		for (const [name, value] of entries) {
			if (!INPUT_NAME.test(name) || typeof value !== "string" || value.length === 0 || value.length > MAX_PATH_LENGTH) {
				throw new Error(`Input '${name.slice(0, 100)}' must have a valid name and non-empty path.`);
			}
			inputs[name] = value;
		}
		return { inputs };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Invalid JSON.";
		diagnostics.push(configDiagnostic(`Invalid .openamx/${filename}: ${message}`));
		return { inputs: {} };
	}
}

function inputNames(text: string): string[] {
	const document = parseDocumentText(text);
	const names: string[] = [];
	for (const node of document.nodes) {
		if (node.type !== "executableCodeBlock") continue;
		for (const statement of node.statements) {
			if (statement.type === "inputDeclaration") names.push(statement.name);
		}
	}
	return names;
}

function resolveInputPath(root: string, name: string, value: string, portable: boolean, diagnostics: TextDiagnostic[]): string | undefined {
	if (value.length > MAX_PATH_LENGTH || value.includes("\0") || value.includes("://") || value.startsWith("\\\\") || value.startsWith("//")) {
		diagnostics.push(configDiagnostic(`Input '${name}' has an invalid local path.`));
		return undefined;
	}
	if (portable && isAbsolute(value)) {
		diagnostics.push(configDiagnostic(`Project input '${name}' must use a path relative to the project root.`));
		return undefined;
	}
	const candidate = isAbsolute(value) ? resolve(value) : resolve(root, value);
	if (extname(candidate) !== ".json" && extname(candidate) !== ".csv") {
		diagnostics.push(configDiagnostic(`Input '${name}' must use the exact lowercase .json or .csv extension.`));
		return undefined;
	}
	if (portable) {
		try {
			if (!within(root, realpathSync(candidate)) || !statSync(candidate).isFile()) {
				diagnostics.push(configDiagnostic(`Project input '${name}' must resolve to a file inside the project.`));
				return undefined;
			}
		} catch {
			diagnostics.push(configDiagnostic(`Project input '${name}' is missing or unreadable.`));
			return undefined;
		}
	}
	return candidate;
}

export function resolveDesktopInputs(root: string, text: string, rawOverrides: string[] = [], validation?: unknown): ResolvedDesktopInputs {
	const diagnostics: TextDiagnostic[] = [];
	if (validation !== undefined && validation !== "aggregate" && validation !== "fail-fast") {
		diagnostics.push({ code: "AMX4001", message: "Validation mode must be 'aggregate' or 'fail-fast'." });
	}
	const project = readInputConfig(root, "project.json", diagnostics);
	const local = readInputConfig(root, "local.json", diagnostics);
	const declaredInputs = inputNames(text);
	if (declaredInputs.length > MAX_MAPPINGS) diagnostics.push(configDiagnostic(`At most ${MAX_MAPPINGS} declared inputs are supported by the desktop workflow.`));
	const declarations = declaredInputs.slice(0, MAX_MAPPINGS);
	const perRun: Record<string, string> = {};
	if (!Array.isArray(rawOverrides)) diagnostics.push(configDiagnostic("Per-run input mappings must be an array."));
	const overrides = Array.isArray(rawOverrides) ? rawOverrides : [];
	if (overrides.length > MAX_MAPPINGS) diagnostics.push(configDiagnostic(`At most ${MAX_MAPPINGS} per-run input mappings are allowed.`));
	for (const mapping of overrides.slice(0, MAX_MAPPINGS)) {
		if (typeof mapping !== "string" || mapping.length > MAX_PATH_LENGTH + 101) {
			diagnostics.push(configDiagnostic("Per-run mappings must be bounded text values."));
			continue;
		}
		const separator = mapping.indexOf("=");
		const name = separator < 0 ? "" : mapping.slice(0, separator);
		const value = separator < 0 ? "" : mapping.slice(separator + 1);
		if (!INPUT_NAME.test(name) || !value || value.length > MAX_PATH_LENGTH || Object.hasOwn(perRun, name)) {
			diagnostics.push(configDiagnostic("Per-run mappings must be unique name=path values with valid input names and paths."));
			continue;
		}
		perRun[name] = value;
	}
	const paths = new Map<string, { source: "project" | "local" | "per-run"; path: string }>();
	const privatePaths: string[] = [];
	for (const name of new Set([...declarations, ...Object.keys(project.inputs), ...Object.keys(local.inputs), ...Object.keys(perRun)])) {
		const selected = Object.hasOwn(perRun, name) ? { source: "per-run" as const, value: perRun[name] }
			: Object.hasOwn(local.inputs, name) ? { source: "local" as const, value: local.inputs[name] }
				: Object.hasOwn(project.inputs, name) ? { source: "project" as const, value: project.inputs[name] }
					: undefined;
		if (!selected) continue;
		const absolute = resolveInputPath(root, name, selected.value, selected.source === "project", diagnostics);
		if (!absolute) continue;
		paths.set(name, { source: selected.source, path: absolute });
		if (selected.source !== "project") privatePaths.push(absolute);
	}
	const configuration: InputConfiguration = {
		inputs: declarations.map(name => ({ name: name.slice(0, 100), source: paths.get(name)?.source ?? "missing" })),
		diagnostics
	};
	return {
		mappings: [...paths].map(([name, value]) => `${name}=${value.path}`),
		privatePaths,
		configuration
	};
}

export function validateDesktopDestination(root: string, target: string, extension: ".html" | ".pdf", conflicts: string[]): { path: string; parent: string } {
	if (typeof target !== "string" || !target || target.length > MAX_PATH_LENGTH || extname(target) !== extension) outputError("AMX6001", `Destination must use an explicit exact lowercase ${extension} path.`);
	const canonicalRoot = realpathSync(root);
	const absolute = isAbsolute(target) ? resolve(target) : resolve(canonicalRoot, target);
	let canonicalParent: string;
	try { canonicalParent = realpathSync(resolve(absolute, "..")); }
	catch { return outputError("AMX6001", "Destination parent must already exist."); }
	if (!within(canonicalRoot, canonicalParent)) outputError("AMX6001", "Destination must be inside the project root.");
	const destination = join(canonicalParent, basename(absolute));
	const canonicalConflicts = conflicts.map(file => {
		try { return realpathSync(file); } catch { return resolve(file); }
	});
	if (canonicalConflicts.includes(destination)) outputError("AMX6001", "Destination conflicts with the entry document or an input file.");
	try {
		const targetStat = lstatSync(destination);
		if (targetStat.isSymbolicLink() || !targetStat.isFile()) outputError("AMX6001", "Destination must be a regular file, not a symlink.");
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") outputError("AMX6001", "Cannot inspect HTML destination.");
	}
	return { path: destination, parent: canonicalParent };
}

export async function writeDesktopHtml(root: string, target: string, entryPath: string, inputPaths: string[], contents: string): Promise<string> {
	const prepared = validateDesktopDestination(root, target, ".html", [entryPath, ...inputPaths]);
	const temporary = join(prepared.parent, `.${basename(prepared.path)}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`);
	let handle: Awaited<ReturnType<typeof open>> | undefined;
	try {
		handle = await open(temporary, "wx");
		await handle.writeFile(contents, "utf8");
		await handle.sync();
		await handle.close();
		handle = undefined;
		await rename(temporary, prepared.path);
		return prepared.path;
	} catch (error) {
		if (handle) await handle.close().catch(() => undefined);
		await unlink(temporary).catch(() => undefined);
		const detail = error instanceof Error ? error.message : String(error);
		return outputError("AMX6002", `Failed to write HTML: ${detail.slice(0, 500)}`);
	}
}