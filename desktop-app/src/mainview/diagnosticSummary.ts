export interface DiagnosticSummaryInput {
	generatedAt: string;
	openTabs: number;
	dirtyTabs: number;
	diagnosticCodes: string[];
	events: Array<{ at: string; codes: string[] }>;
}

export function createDiagnosticSummary(input: DiagnosticSummaryInput): string {
	const counts: Record<string, number> = {};
	const cleanCodes = (codes: string[]) => codes.slice(0, 100).filter(code => /^[A-Z][A-Z0-9_-]{0,31}$/.test(code));
	const safeDate = (value: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) ? value : "";
	for (const code of input.diagnosticCodes.slice(0, 500)) {
		if (!/^[A-Z][A-Z0-9_-]{0,31}$/.test(code)) continue;
		counts[code] = (counts[code] ?? 0) + 1;
	}
	const events = input.events.slice(-20).map(event => ({
		at: safeDate(event.at),
		codes: cleanCodes(event.codes)
	}));
	return JSON.stringify({
		product: "OpenAMX",
		generatedAt: safeDate(input.generatedAt),
		workbench: {
			openTabs: Number.isFinite(input.openTabs) ? Math.max(0, Math.min(100, Math.trunc(input.openTabs))) : 0,
			dirtyTabs: Number.isFinite(input.dirtyTabs) ? Math.max(0, Math.min(100, Math.trunc(input.dirtyTabs))) : 0
		},
		diagnosticCodeCounts: Object.fromEntries(Object.entries(counts).slice(0, 50)),
		recentDiagnosticEvents: events
	}, null, 2);
}