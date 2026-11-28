import { appendFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface LocalBunFile extends Blob {
	exists(): Promise<boolean>;
}

interface LocalBunServer {
	hostname: string;
	port: number;
	requestIP(request: Request): { address: string } | null;
}

interface LocalBunRuntime {
	file(path: string): LocalBunFile;
	serve(options: {
		hostname: string;
		port: number;
		fetch(request: Request, server: LocalBunServer): Response | Promise<Response>;
	}): LocalBunServer;
}

const bunRuntime = (globalThis as typeof globalThis & { Bun: LocalBunRuntime }).Bun;
const scenario = process.env.OPENAMX_S132_SCENARIO ?? "available";
if (scenario !== "available" && scenario !== "no-update") {
	throw new Error("OPENAMX_S132_SCENARIO must be 'available' or 'no-update'.");
}

const hostRoot = join(dirname(fileURLToPath(import.meta.url)), "host");
const scenarioRoot = join(hostRoot, scenario);
const logPath = join(hostRoot, "requests.jsonl");
const allowedFiles = new Set([
	"stable-win-x64-update.json",
	"stable-win-x64-OpenAMXDesktop.tar.zst",
	"stable-win-x64-checksum.json",
]);

const server = bunRuntime.serve({
	hostname: "127.0.0.1",
	port: 4184,
	async fetch(request, server) {
		const fileName = new URL(request.url).pathname.slice(1);
		const clientAddress = server.requestIP(request)?.address ?? "unknown";
		let status = 200;
		let file: LocalBunFile | undefined;

		if (clientAddress !== "127.0.0.1") status = 403;
		else if (request.method !== "GET" && request.method !== "HEAD") status = 405;
		else if (!allowedFiles.has(fileName)) status = 404;
		else {
			const candidate = bunRuntime.file(join(scenarioRoot, fileName));
			if (await candidate.exists()) file = candidate;
			else status = 404;
		}

		await appendFile(logPath, `${JSON.stringify({ time: new Date().toISOString(), scenario, method: request.method, path: new URL(request.url).pathname, clientAddress, status })}\n`);
		const headers = new Headers({ "Cache-Control": "no-store" });
		if (file) {
			headers.set("Content-Length", String(file.size));
			headers.set("Content-Type", fileName.endsWith(".json") ? "application/json" : "application/octet-stream");
		}
		return new Response(request.method === "HEAD" || status !== 200 ? null : file, { status, headers });
	},
});

console.log(`S132 ${scenario} fixture host listening at http://${server.hostname}:${server.port}`);