import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { DESKTOP_GUIDE_STAGE_RELATIVE_PATH, stageDesktopGuideResources } from "../src/bun/guideResources";

const desktopRoot = path.resolve(import.meta.dir, "..");
const canonicalExamples = path.resolve(desktopRoot, "..", "examples");
const destination = path.resolve(desktopRoot, DESKTOP_GUIDE_STAGE_RELATIVE_PATH);
const stagingParent = path.dirname(destination);
if (!existsSync(stagingParent)) mkdirSync(stagingParent, { recursive: false, mode: 0o700 });
const manifest = stageDesktopGuideResources(canonicalExamples, destination);

console.log(JSON.stringify({
	source: canonicalExamples,
	staged: destination,
	fileCount: manifest.length,
	files: manifest
}, null, 2));
