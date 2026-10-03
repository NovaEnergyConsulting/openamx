import { ref } from "vue";
import type { DesktopRPCClient, DesktopJobIdentity, DesktopJobSnapshot, DesktopJobResult, OpenDocument, WorkbenchState } from "../../../src/shared/rpc";

const projectRoot = "/sprint042-browser-fixture";
const activePath = `${projectRoot}/report.amx`;
let documentRevision = 0;
let generation = 0;
let inputSettingsRevision = 0;
let currentText = "# Sprint 042 report\n\n```amx\nexport let result: Number = 1 + 2\n```\n";
let inputSettingsKey = "[]";
let nextJobId = 0;
let selectedId = 0;
const jobs = new Map<number, DesktopJobSnapshot>();
export const failNextPreview = ref(false);

function identity(): WorkbenchState["requestIdentity"] {
	return {
		canonicalActiveUri: "file:///sprint042-browser-fixture/report.amx",
		projectGeneration: generation,
		documentRevision,
		inputSettingsRevision
	};
}

function state(): WorkbenchState {
	return {
		tabs: [{ path: activePath, kind: "amx", dirty: false, conflict: false, revision: documentRevision }],
		active: activePath, generation, inputSettingsRevision, requestIdentity: identity()
	};
}

function document(): OpenDocument {
	return { path: activePath, kind: "amx", text: currentText, diskHash: "fixture", dirty: documentRevision > 0, conflict: false, revision: documentRevision };
}

function finishJob(operation: string, requestIdentity: NonNullable<WorkbenchState["requestIdentity"]>): DesktopJobSnapshot {
	const jobIdentity: DesktopJobIdentity = { ...requestIdentity, jobId: ++nextJobId };
	let result: DesktopJobResult | undefined;
	let diagnostics: DesktopJobSnapshot["diagnostics"] = [];
	let status: DesktopJobSnapshot["status"] = "succeeded";
	if (operation === "discover-outputs") result = { kind: "output-discovery", outputs: [{ name: "result", type: "Number", formats: ["json"] }] };
	else if (operation === "preview") {
		if (failNextPreview.value) {
			failNextPreview.value = false;
			status = "failed";
			diagnostics = [{ code: "AMX3001", message: "Simulated current-buffer diagnostic", file: activePath, line: 3, column: 1 }];
		} else result = { kind: "preview", html: "<!doctype html><html><body><h1>Current preview</h1><p>3</p></body></html>" };
	} else if (operation === "run") result = { kind: "run", summary: { values: [{ name: "result", value: 3 }] } };
	else result = { kind: "export", outputId: `mock-output-${jobIdentity.jobId}`, fileName: `report.${operation === "export-data" ? "json" : operation}`, bytes: 256, ...(operation === "export-data" ? { name: "result" } : {}) };
	const job: DesktopJobSnapshot = { identity: jobIdentity, operation: operation as DesktopJobSnapshot["operation"], status, cleanupPending: false, diagnostics, result };
	jobs.set(jobIdentity.jobId, job);
	return job;
}

const request = {
	async ping({ nonce }: { nonce: string }) { return { nonce, runtime: "bun" as const, version: "browser-harness" }; },
	async pickProject() { generation++; return { ok: true as const, cancelled: false, root: projectRoot }; },
	async getWorkbench() { return { ok: true as const, state: state() }; },
	async getProjectContext() { return { ok: true as const, root: projectRoot, state: state() }; },
	async listProjectFiles() { return { ok: true as const, files: [{ path: activePath, kind: "amx" as const }], folders: [] }; },
	async getRecents() { return { ok: true as const, projects: [] }; },
	async getRecovery() { return { ok: true as const, available: false, items: [] }; },
	async readDocument() { return { ok: true as const, document: document() }; },
	async openDocument() { return { ok: true as const, document: document() }; },
	async selectTab() { return { ok: true as const, document: document() }; },
	async setInputSettings({ inputMappings, validation }: { inputMappings: string[]; validation: "aggregate" | "fail-fast" }) {
		const next = JSON.stringify({ inputMappings, validation });
		if (next !== inputSettingsKey) { inputSettingsKey = next; inputSettingsRevision++; }
		return { ok: true as const, state: state() };
	},
	async getInputConfiguration() { return { ok: true as const, configuration: { inputs: [], diagnostics: [] } }; },
	async analyzeBuffer() { return { ok: true as const, analysis: { diagnostics: [], completions: [] } }; },
	async updateBuffer({ text }: { text: string }) {
		currentText = text;
		documentRevision++;
		return { ok: true as const, document: document() };
	},
	async startJob({ operation, identity: requestIdentity }: { operation: string; identity: NonNullable<WorkbenchState["requestIdentity"]> }) {
		return { ok: true as const, job: finishJob(operation, requestIdentity) };
	},
	async getJob({ jobId }: { jobId: number }) {
		const job = jobs.get(jobId);
		return job ? { ok: true as const, job } : { ok: false as const, error: { code: "MISSING", message: "Job missing" } };
	},
	async cancelJob({ jobId }: { jobId: number }) {
		const prior = jobs.get(jobId);
		if (!prior) return { ok: false as const, error: { code: "MISSING", message: "Job missing" } };
		const job = { ...prior, status: "cancelled" as const, result: undefined };
		jobs.set(jobId, job);
		return { ok: true as const, job };
	},
	async pickDestination({ extension }: { extension: string }) {
		return { ok: true as const, cancelled: false, selectionId: `selection-${++selectedId}`, fileName: `report${extension}` };
	},
	async openExportedOutput() { return { ok: true as const }; },
	async setPanelSizes() { return { ok: true as const, state: state() }; },
	async saveDocument() { documentRevision++; return { ok: true as const, document: document() }; }
};

export const rpc = { request } as unknown as DesktopRPCClient;
