import { readFile } from "node:fs/promises";
import { inspectTarZstdMembers } from "../../../../../scripts/release/archive";

const [archivePath, expectedHost, forbiddenHost] = process.argv.slice(2);
if (!archivePath || !expectedHost || !forbiddenHost) {
	throw new Error("Usage: bun run inspect-embedded-update-host.ts <archive> <expected-host> <forbidden-host>");
}

const members = inspectTarZstdMembers(await readFile(archivePath));
const expectedBytes = Buffer.from(expectedHost);
const forbiddenBytes = Buffer.from(forbiddenHost);
const expectedMembers = [...members]
	.filter(([, contents]) => contents.includes(expectedBytes))
	.map(([name]) => name);
const forbiddenMembers = [...members]
	.filter(([, contents]) => contents.includes(forbiddenBytes))
	.map(([name]) => name);
const result = { archivePath, memberCount: members.size, expectedHost, expectedMembers, forbiddenHost, forbiddenMembers };
console.log(JSON.stringify(result, null, 2));
if (!expectedMembers.length || forbiddenMembers.length) process.exitCode = 1;
