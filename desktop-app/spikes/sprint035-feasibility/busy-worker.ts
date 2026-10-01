declare var self: Worker;

self.onmessage = (event: MessageEvent<{ jobId: string; source: string }>) => {
	const { jobId, source } = event.data;
	if (typeof jobId !== "string" || typeof source !== "string" || source.length > 65_536) {
		self.postMessage({ kind: "rejected", jobId: typeof jobId === "string" ? jobId : "" });
		return;
	}
	self.postMessage({ kind: "running", jobId, sourceCharacters: source.length });
	const startedAt = performance.now();
	while (performance.now() - startedAt < 60_000) {}
	self.postMessage({ kind: "prepared", jobId });
};