import { expect, test } from "bun:test";

test("Bun worker termination closes a non-yielding job without a commit message", async () => {
	const worker = new Worker(new URL("./busy-worker.ts", import.meta.url).href);
	const messages: unknown[] = [];
	let resolveStarted!: (message: { kind: string; jobId: string; sourceCharacters: number }) => void;
	let resolveClosed!: () => void;
	const started = new Promise<{ kind: string; jobId: string; sourceCharacters: number }>(resolve => { resolveStarted = resolve; });
	const closed = new Promise<void>(resolve => { resolveClosed = resolve; });
	worker.addEventListener("message", event => {
		messages.push(event.data);
		if (event.data.kind === "running") resolveStarted(event.data);
	});
	worker.addEventListener("close", () => resolveClosed());
	worker.postMessage({ jobId: "job-035-a", source: "x".repeat(4096) });

	const startMessage = await Promise.race([
		started,
		new Promise<never>((_, reject) => setTimeout(() => reject(new Error("worker start timed out")), 2000))
	]);
	expect(startMessage).toEqual({ kind: "running", jobId: "job-035-a", sourceCharacters: 4096 });
	const terminationStarted = performance.now();
	worker.terminate();
	await Promise.race([
		closed,
		new Promise<never>((_, reject) => setTimeout(() => reject(new Error("worker close timed out")), 2000))
	]);
	const closeMilliseconds = performance.now() - terminationStarted;
	const activeJob = "job-035-cancelled";
	const commits = messages.filter(message => {
		const result = message as { kind?: string; jobId?: string };
		return result.kind === "prepared" && result.jobId === activeJob;
	});
	const serializedMessages = JSON.stringify(messages);

	expect(closeMilliseconds).toBeLessThan(250);
	expect(commits).toEqual([]);
	expect(serializedMessages).not.toContain("/home/");
	expect(serializedMessages.length).toBeLessThan(512);
	console.log(JSON.stringify({ workerCloseMilliseconds: Number(closeMilliseconds.toFixed(3)), serializedMessageCharacters: serializedMessages.length }));
});