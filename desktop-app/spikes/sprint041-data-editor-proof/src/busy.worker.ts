self.postMessage({ type: "started" });
const until = Date.now() + 30_000;
while (Date.now() < until) {}