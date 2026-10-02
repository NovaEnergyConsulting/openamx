import { createHash, randomUUID } from "node:crypto";
import { closeSync, existsSync, fchmodSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, realpathSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument as parseYamlDocument } from "yaml";

export type ConfigurationScope = "local" | "project";
export type ConfigurationUpdate = (config: Record<string, unknown>) => void;

function digest(text: string): string {
	return createHash("sha256").update(text).digest("hex");
}

function configPath(root: string, scope: ConfigurationScope, create = false): string {
	const directory = join(realpathSync(root), ".openamx");
	if (!existsSync(directory)) {
		if (!create) return join(directory, scope === "local" ? "local.json" : "project.json");
		mkdirSync(directory, { mode: 0o700 });
	}
	if (lstatSync(directory).isSymbolicLink() || !statSync(directory).isDirectory()) throw new Error("The project configuration directory is unavailable.");
	return join(directory, scope === "local" ? "local.json" : "project.json");
}

function readConfig(file: string, scope: ConfigurationScope): { text: string; config: Record<string, unknown> } {
	if (!existsSync(file)) return { text: "", config: { version: 1, inputs: {} } };
	if (lstatSync(file).isSymbolicLink() || !statSync(file).isFile()) throw new Error("Configuration must be a regular file.");
	const text = readFileSync(file, "utf8");
	if (parseYamlDocument(text).errors.length) throw new Error("Configuration contains malformed or duplicate keys.");
	const parsed: unknown = JSON.parse(text);
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Configuration must be a JSON object.");
	const config = parsed as Record<string, unknown>;
	const allowed = scope === "project" ? ["version", "inputs", "report"] : ["version", "inputs"];
	if (Object.keys(config).some(key => !allowed.includes(key)) || config.version !== 1
		|| !config.inputs || typeof config.inputs !== "object" || Array.isArray(config.inputs)) {
		throw new Error("Configuration is invalid; existing content was not changed.");
	}
	for (const [name, value] of Object.entries(config.inputs as Record<string, unknown>)) {
		if (!/^[A-Za-z][A-Za-z0-9_]{0,99}$/.test(name) || typeof value !== "string" || !value || value.length > 4096) {
			throw new Error("Configuration contains an invalid input mapping.");
		}
	}
	if (scope === "project" && config.report !== undefined && (!config.report || typeof config.report !== "object" || Array.isArray(config.report))) {
		throw new Error("Project report settings must be an object.");
	}
	if (scope === "local" && process.platform !== "win32") {
		const fileStat = statSync(file);
		if ((typeof process.getuid === "function" && fileStat.uid !== process.getuid()) || (fileStat.mode & 0o077) !== 0) {
			throw new Error("Local configuration permissions must be restricted to the current user.");
		}
	}
	return { text, config };
}

export function readConfigurationRevision(root: string, scope: ConfigurationScope): string {
	const file = configPath(root, scope);
	if (!existsSync(file)) return digest("");
	if (lstatSync(file).isSymbolicLink() || !statSync(file).isFile()) throw new Error("Configuration must be a regular file.");
	return digest(readFileSync(file, "utf8"));
}

export function readConfiguration(root: string, scope: ConfigurationScope): Record<string, unknown> {
	const file = configPath(root, scope);
	return readConfig(file, scope).config;
}

export function updateConfiguration(
	root: string,
	scope: ConfigurationScope,
	expectedRevision: string,
	update: ConfigurationUpdate
): string {
	const file = configPath(root, scope, true);
	const current = readConfig(file, scope);
	if (digest(current.text) !== expectedRevision) throw new Error("Configuration changed outside OpenAMX; reload it before saving.");
	update(current.config);
	const serialized = `${JSON.stringify(current.config, null, 2)}\n`;
	const temporary = `${file}.${randomUUID()}.tmp`;
	const mode = scope === "local" ? 0o600 : current.text ? statSync(file).mode & 0o777 : 0o600;
	let descriptor: number | undefined;
	try {
		descriptor = openSync(temporary, "wx", mode);
		fchmodSync(descriptor, mode);
		writeFileSync(descriptor, serialized, "utf8");
		fsyncSync(descriptor);
		closeSync(descriptor);
		descriptor = undefined;
		if (digest(readConfig(file, scope).text) !== expectedRevision) throw new Error("Configuration changed before the save could commit.");
		renameSync(temporary, file);
		return digest(serialized);
	} catch (error) {
		if (descriptor !== undefined) closeSync(descriptor);
		try { unlinkSync(temporary); } catch {}
		throw error;
	}
}