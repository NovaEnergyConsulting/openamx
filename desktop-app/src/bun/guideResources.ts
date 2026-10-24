import { createHash } from "node:crypto";
import {
	closeSync, existsSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync,
	readdirSync, realpathSync, rmdirSync, unlinkSync, writeFileSync, type Stats
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

export const DESKTOP_GUIDE_STAGE_RELATIVE_PATH = ".cottontail-tmp/sprint-093-guide-attempt-2";

export const DESKTOP_GUIDE_FILES = [
	"00_Table_of_Contents.amx",
	"01_First_Computable_Document.amx",
	"02_Expressions_and_Decisions.amx",
	"03_Collections_and_Functions.amx",
	"04_Typed_Records_Enums_and_Modules.amx",
	"05_Measurements_and_Units.amx",
	"06_Mapped_Data_and_Validation.amx",
	"07_Tables_Charts_and_Named_Outputs.amx",
	"08_Formula_Driven_Diagrams.amx",
	"09_Runtime_Type_Checks.amx",
	"10_Mathematics_and_Measurement_Operations.amx",
	"11_Text_and_Numeric_Formatting.amx",
	"12_Complete_Asset_Screening_Report.amx",
	"13_Route_Measurement_Report.amx",
	"14_Battery_Resistor_Circuit.amx",
	"15_Function_Bodies.amx",
	"data/asset.json",
	"data/screenings.csv",
	"data/reviewed-at.json",
	"data/measurement-trips.json",
	"fixtures/invalid/asset.json",
	"fixtures/invalid/screenings.csv",
	"fixtures/invalid/missing-function-return.amx",
	"libraries/asset-management.amx",
	"libraries/screening.amx",
	"libraries/travel-measurements.amx",
] as const;

const DESKTOP_GUIDE_DIRECTORIES = [
	"data",
	"fixtures",
	"fixtures/invalid",
	"libraries",
] as const;

interface GuideResource {
	path: typeof DESKTOP_GUIDE_FILES[number];
	contents: Buffer;
	sha256: string;
}

export interface DesktopGuideManifestEntry {
	path: string;
	bytes: number;
	sha256: string;
}

export function resolveDesktopGuideResourceDirectory(runtimeDirectory: string): string {
	const packaged = join(runtimeDirectory, "guide");
	return existsSync(packaged)
		? packaged
		: resolve(runtimeDirectory, "../..", DESKTOP_GUIDE_STAGE_RELATIVE_PATH);
}

function fileHash(contents: Uint8Array): string {
	return createHash("sha256").update(contents).digest("hex");
}

function isContained(root: string, target: string): boolean {
	const path = relative(root, target);
	return path !== "" && path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

function assertRealDirectory(path: string, description: string): string {
	const absolute = resolve(path);
	let metadata: Stats;
	try {
		metadata = lstatSync(absolute);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") throw new Error(`${description} is unavailable.`);
		throw error;
	}
	if (metadata.isSymbolicLink() || !metadata.isDirectory()) {
		throw new Error(`${description} must be a real directory.`);
	}
	const canonical = realpathSync(absolute);
	if (canonical !== absolute) throw new Error(`${description} must be a real directory.`);
	return canonical;
}

function readResourceFile(root: string, path: typeof DESKTOP_GUIDE_FILES[number]): Buffer {
	const parts = path.split("/");
	if (parts.some(part => !part || part === "." || part === ".." || part.includes("\\"))) {
		throw new Error(`Guide resource path is invalid: ${path}`);
	}
	let current = root;
	for (let index = 0; index < parts.length; index++) {
		current = join(current, parts[index]!);
		let metadata: Stats;
		try {
			metadata = lstatSync(current);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") throw new Error(`Required guide resource is missing: ${path}`);
			throw error;
		}
		const final = index === parts.length - 1;
		if (metadata.isSymbolicLink() || (final ? !metadata.isFile() : !metadata.isDirectory())) {
			throw new Error(`Guide resource is not a regular contained file: ${path}`);
		}
		if (!isContained(root, resolve(current))) throw new Error(`Guide resource escapes its root: ${path}`);
	}
	return readFileSync(current);
}

function readGuideResources(rootPath: string): GuideResource[] {
	const root = assertRealDirectory(rootPath, "Guide resource root");
	return DESKTOP_GUIDE_FILES.map(path => {
		const contents = readResourceFile(root, path);
		return { path, contents, sha256: fileHash(contents) };
	});
}

function listResourceTree(rootPath: string): { files: string[]; directories: string[] } {
	const root = assertRealDirectory(rootPath, "Guide resource root");
	const files: string[] = [];
	const directories: string[] = [];
	function visit(directory: string, prefix: string) {
		for (const name of readdirSync(directory)) {
			const path = prefix ? `${prefix}/${name}` : name;
			const absolute = join(directory, name);
			const metadata = lstatSync(absolute);
			if (metadata.isSymbolicLink()) throw new Error(`Guide resource tree contains a symlink: ${path}`);
			if (metadata.isDirectory()) {
				directories.push(path);
				visit(absolute, path);
			} else if (metadata.isFile()) {
				files.push(path);
			} else {
				throw new Error(`Guide resource tree contains an unsupported entry: ${path}`);
			}
		}
	}
	visit(root, "");
	return { files: files.sort(), directories: directories.sort() };
}

function verifyExactTree(rootPath: string) {
	const tree = listResourceTree(rootPath);
	const expectedFiles = [...DESKTOP_GUIDE_FILES].sort();
	const expectedDirectories = [...DESKTOP_GUIDE_DIRECTORIES].sort();
	if (JSON.stringify(tree.files) !== JSON.stringify(expectedFiles)) {
		throw new Error("Guide resource file set does not match the approved allowlist.");
	}
	if (JSON.stringify(tree.directories) !== JSON.stringify(expectedDirectories)) {
		throw new Error("Guide resource directory set does not match the approved layout.");
	}
}

function manifest(resources: GuideResource[]): DesktopGuideManifestEntry[] {
	return resources.map(resource => ({
		path: resource.path,
		bytes: resource.contents.byteLength,
		sha256: resource.sha256
	}));
}

export function verifyDesktopGuideParity(sourceRoot: string, resourceRoot: string): DesktopGuideManifestEntry[] {
	const source = readGuideResources(sourceRoot);
	verifyExactTree(resourceRoot);
	const resource = readGuideResources(resourceRoot);
	for (let index = 0; index < source.length; index++) {
		const expected = source[index]!;
		const actual = resource[index]!;
		if (expected.path !== actual.path || expected.sha256 !== actual.sha256 || !expected.contents.equals(actual.contents)) {
			throw new Error(`Guide resource differs from canonical source: ${expected.path}`);
		}
	}
	return manifest(resource);
}

function writeExclusive(path: string, contents: Uint8Array): void {
	const descriptor = openSync(path, "wx", 0o600);
	try {
		writeFileSync(descriptor, contents);
		fsyncSync(descriptor);
	} catch (error) {
		const cleanupErrors: string[] = [];
		try { closeSync(descriptor); } catch (closeError) { cleanupErrors.push(closeError instanceof Error ? closeError.message : String(closeError)); }
		try { unlinkSync(path); } catch (cleanupError) { cleanupErrors.push(cleanupError instanceof Error ? cleanupError.message : String(cleanupError)); }
		if (cleanupErrors.length) throw new Error(`Unable to write ${path}; cleanup failed: ${cleanupErrors.join("; ")}`);
		throw error;
	}
	try {
		closeSync(descriptor);
	} catch (error) {
		try {
			unlinkSync(path);
		} catch (cleanupError) {
			throw new Error(`Unable to close ${path}: ${error instanceof Error ? error.message : String(error)}; cleanup failed: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`);
		}
		throw error;
	}
}

function cleanupCreated(files: Array<{ path: string; sha256: string }>, directories: string[]): string[] {
	const errors: string[] = [];
	for (const file of [...files].reverse()) {
		try {
			const metadata = lstatSync(file.path);
			if (!metadata.isFile() || metadata.isSymbolicLink()) {
				errors.push(`preserved changed entry ${file.path}`);
				continue;
			}
			if (fileHash(readFileSync(file.path)) !== file.sha256) {
				errors.push(`preserved modified file ${file.path}`);
				continue;
			}
			unlinkSync(file.path);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
				errors.push(`could not remove ${file.path}: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
	}
	for (const directory of [...directories].reverse()) {
		try {
			const metadata = lstatSync(directory);
			if (!metadata.isDirectory() || metadata.isSymbolicLink()) {
				errors.push(`preserved changed directory entry ${directory}`);
				continue;
			}
			rmdirSync(directory);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
				errors.push(`could not remove ${directory}: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
	}
	return errors;
}

function rollbackOrThrow(error: unknown, files: Array<{ path: string; sha256: string }>, directories: string[]): never {
	const originalMessage = error instanceof Error ? error.message : String(error);
	const cleanupErrors = cleanupCreated(files, directories);
	if (cleanupErrors.length) {
		throw new Error(`${originalMessage}; guide rollback incomplete: ${cleanupErrors.join("; ")}`);
	}
	throw error;
}

function ensureNewParent(
	root: string,
	target: string,
	createdDirectories: string[],
	createdSet: Set<string>
): void {
	const parent = dirname(target);
	if (parent !== root && !isContained(root, parent)) throw new Error("Guide project destination escapes the selected folder.");
	const relativeParent = relative(root, parent);
	if (!relativeParent) return;
	let current = root;
	for (const segment of relativeParent.split(sep)) {
		current = join(current, segment);
		if (createdSet.has(current)) {
			const metadata = lstatSync(current);
			if (metadata.isSymbolicLink() || !metadata.isDirectory()) throw new Error("Guide project directory changed during creation.");
			continue;
		}
		mkdirSync(current, { recursive: false, mode: 0o700 });
		createdDirectories.push(current);
		createdSet.add(current);
	}
}

export function stageDesktopGuideResources(sourceRoot: string, destinationRoot: string): DesktopGuideManifestEntry[] {
	const source = readGuideResources(sourceRoot);
	if (existsSync(destinationRoot)) return verifyDesktopGuideParity(sourceRoot, destinationRoot);

	const destination = resolve(destinationRoot);
	const parent = dirname(destination);
	if (!existsSync(parent) || lstatSync(parent).isSymbolicLink() || !lstatSync(parent).isDirectory()) {
		throw new Error("Guide staging parent must be an existing real directory.");
	}
	const createdFiles: Array<{ path: string; sha256: string }> = [];
	const createdDirectories: string[] = [];
	const createdSet = new Set<string>();
	try {
		mkdirSync(destination, { recursive: false, mode: 0o700 });
		createdDirectories.push(destination);
		createdSet.add(destination);
		for (const resource of source) {
			const target = resolve(destination, ...resource.path.split("/"));
			if (!isContained(destination, target)) throw new Error(`Guide staging path escapes destination: ${resource.path}`);
			ensureNewParent(destination, target, createdDirectories, createdSet);
			writeExclusive(target, resource.contents);
			createdFiles.push({ path: target, sha256: resource.sha256 });
		}
		return verifyDesktopGuideParity(sourceRoot, destination);
	} catch (error) {
		rollbackOrThrow(error, createdFiles, createdDirectories);
	}
}

export function materializeDesktopGuide(resourceRoot: string, projectRootPath: string): { indexPath: string; indexText: string } {
	const resources = readGuideResources(resourceRoot);
	verifyExactTree(resourceRoot);
	const projectRoot = assertRealDirectory(projectRootPath, "Guide project destination");
	if (readdirSync(projectRoot).length) throw new Error("Guide creation requires an empty project directory.");

	const createdFiles: Array<{ path: string; sha256: string }> = [];
	const createdDirectories: string[] = [];
	const createdSet = new Set<string>();
	try {
		for (const resource of resources) {
			const target = resolve(projectRoot, ...resource.path.split("/"));
			if (!isContained(projectRoot, target)) throw new Error(`Guide project path escapes the selected folder: ${resource.path}`);
			ensureNewParent(projectRoot, target, createdDirectories, createdSet);
			writeExclusive(target, resource.contents);
			createdFiles.push({ path: target, sha256: resource.sha256 });
		}
		const config = join(projectRoot, ".openamx", "project.json");
		ensureNewParent(projectRoot, config, createdDirectories, createdSet);
		const configContents = Buffer.from('{"version":1,"inputs":{}}\n', "utf8");
		writeExclusive(config, configContents);
		createdFiles.push({ path: config, sha256: fileHash(configContents) });
		const index = resources.find(resource => resource.path === "00_Table_of_Contents.amx");
		if (!index) throw new Error("The approved guide index is missing.");
		return { indexPath: join(projectRoot, index.path), indexText: index.contents.toString("utf8") };
	} catch (error) {
		rollbackOrThrow(error, createdFiles, createdDirectories);
	}
}
