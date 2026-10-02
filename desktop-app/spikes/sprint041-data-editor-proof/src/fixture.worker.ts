self.onmessage = (event: MessageEvent<{ rows: number; format: "csv" | "json" }>) => {
	const { rows: rowCount, format } = event.data;
	if (format === "json") {
		const values = Array.from({ length: rowCount }, (_, index) => ({
			asset: `ASSET-${String(index + 1).padStart(6, "0")}`,
			status: index % 7 === 0 ? "Review" : "Active",
			value: (index % 997) / 10
		}));
		const text = `${JSON.stringify(values)}\n`;
		self.postMessage({ text, bytes: new TextEncoder().encode(text).byteLength });
		return;
	}
	const records = new Array<string>(rowCount + 1);
	records[0] = "asset,status,value";
	for (let index = 0; index < rowCount; index++) {
		records[index + 1] = `ASSET-${String(index + 1).padStart(6, "0")},${index % 7 === 0 ? "Review" : "Active"},${(index % 997) / 10}`;
	}
	const text = `${records.join("\n")}\n`;
	self.postMessage({ text, bytes: new TextEncoder().encode(text).byteLength });
};