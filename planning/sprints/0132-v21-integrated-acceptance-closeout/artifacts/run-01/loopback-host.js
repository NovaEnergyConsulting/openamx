// @bun
// planning/sprints/0132-v21-integrated-acceptance-closeout/artifacts/run-01/loopback-host.ts
import { appendFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
var bunRuntime = globalThis.Bun;
var scenario = process.env.OPENAMX_S132_SCENARIO ?? "available";
if (scenario !== "available" && scenario !== "no-update") {
  throw new Error("OPENAMX_S132_SCENARIO must be 'available' or 'no-update'.");
}
var hostRoot = join(dirname(fileURLToPath(import.meta.url)), "host");
var scenarioRoot = join(hostRoot, scenario);
var logPath = join(hostRoot, "requests.jsonl");
var allowedFiles = new Set([
  "stable-win-x64-update.json",
  "stable-win-x64-OpenAMXDesktop.tar.zst",
  "stable-win-x64-checksum.json"
]);
var server = bunRuntime.serve({
  hostname: "127.0.0.1",
  port: 4184,
  async fetch(request, server) {
    const fileName = new URL(request.url).pathname.slice(1);
    const clientAddress = server.requestIP(request)?.address ?? "unknown";
    let status = 200;
    let file;
    if (clientAddress !== "127.0.0.1")
      status = 403;
    else if (request.method !== "GET" && request.method !== "HEAD")
      status = 405;
    else if (!allowedFiles.has(fileName))
      status = 404;
    else {
      const candidate = bunRuntime.file(join(scenarioRoot, fileName));
      if (await candidate.exists())
        file = candidate;
      else
        status = 404;
    }
    await appendFile(logPath, `${JSON.stringify({ time: new Date().toISOString(), scenario, method: request.method, path: new URL(request.url).pathname, clientAddress, status })}
`);
    const headers = new Headers({ "Cache-Control": "no-store" });
    if (file) {
      headers.set("Content-Length", String(file.size));
      headers.set("Content-Type", fileName.endsWith(".json") ? "application/json" : "application/octet-stream");
    }
    return new Response(request.method === "HEAD" || status !== 200 ? null : file, { status, headers });
  }
});
console.log(`S132 ${scenario} fixture host listening at http://${server.hostname}:${server.port}`);
