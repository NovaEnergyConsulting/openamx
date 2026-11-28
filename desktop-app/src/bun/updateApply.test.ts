import { describe, expect, test } from "bun:test";
import type { DesktopRPCResponse, DesktopUpdaterState } from "../shared/rpc";
import { createUpdateApplyCoordinator, type QuitEvent } from "./updateApply";

const ready: DesktopUpdaterState = { status: "ready", version: "0.21.0" };

function event(): QuitEvent {
	return {};
}

function createHarness(options: {
	state?: DesktopUpdaterState;
	confirm?: () => Promise<DesktopRPCResponse<{ ready: boolean }>>;
	apply?: () => Promise<void>;
	permitTimeoutMs?: number;
} = {}) {
	let state = options.state ?? ready;
	let confirmCalls = 0;
	let applyCalls = 0;
	const coordinator = createUpdateApplyCoordinator({
		getState: () => state,
		async confirmQuit() {
			confirmCalls++;
			return options.confirm ? options.confirm() : { ok: true, ready: true };
		},
		async applyUpdate() {
			applyCalls++;
			await options.apply?.();
		},
		permitTimeoutMs: options.permitTimeoutMs
	});
	return {
		coordinator,
		setState(value: DesktopUpdaterState) { state = value; },
		get confirmCalls() { return confirmCalls; },
		get applyCalls() { return applyCalls; }
	};
}

describe("quit-safe update apply", () => {
	test("requires a ready update before opening the quit guard", async () => {
		const harness = createHarness({ state: { status: "available", version: "0.21.0" } });
		expect(await harness.coordinator.apply()).toEqual({ status: "not-ready" });
		expect(harness.confirmCalls).toBe(0);
		expect(harness.applyCalls).toBe(0);
	});

	test("awaits the save guard before applying and allows one matching event pair", async () => {
		const order: string[] = [];
		let coordinator: ReturnType<typeof createUpdateApplyCoordinator>;
		coordinator = createUpdateApplyCoordinator({
			getState: () => ready,
			async confirmQuit() { order.push("confirm"); return { ok: true, ready: true }; },
			async applyUpdate() {
				order.push("apply");
				expect(coordinator.beforeQuit(event())).toBe(true);
				expect(coordinator.willClose(event())).toBe(true);
			}
		});
		expect(await coordinator.apply()).toEqual({ status: "applied" });
		expect(order).toEqual(["confirm", "apply"]);
		const unexpectedBeforeQuit = event();
		const unexpectedWillClose = event();
		expect(coordinator.beforeQuit(unexpectedBeforeQuit)).toBe(false);
		expect(unexpectedBeforeQuit.response).toEqual({ allow: false });
		expect(coordinator.willClose(unexpectedWillClose)).toBe(false);
		expect(unexpectedWillClose.response).toEqual({ allow: false });
	});

	test("Save All and Discard All approvals both reach apply only after confirmation", async () => {
		for (const choice of ["Save All", "Discard All"]) {
			const order: string[] = [];
			const harness = createHarness({
				confirm: async () => { order.push(`${choice}:confirmed`); return { ok: true, ready: true }; },
				apply: async () => { order.push(`${choice}:apply`); }
			});
			expect(await harness.coordinator.apply()).toEqual({ status: "applied" });
			expect(order).toEqual([`${choice}:confirmed`, `${choice}:apply`]);
		}
	});

	test("Cancel retains ready state and never starts native apply", async () => {
		const harness = createHarness({ confirm: async () => ({ ok: true, ready: false }) });
		expect(await harness.coordinator.apply()).toEqual({ status: "cancelled" });
		expect(harness.applyCalls).toBe(0);
		expect(harness.coordinator.beforeQuit(event())).toBe(false);
	});

	test("save/conflict errors block apply and preserve the ready update", async () => {
		const harness = createHarness({ confirm: async () => ({ ok: false, error: { code: "SAVE_CONFLICT", message: "A tab could not be saved." } }) });
		expect(await harness.coordinator.apply()).toEqual({ status: "failed", message: "A tab could not be saved." });
		expect(harness.applyCalls).toBe(0);
	});

	test("does not apply if readiness changes during the asynchronous guard", async () => {
		let releaseConfirmation!: (result: DesktopRPCResponse<{ ready: boolean }>) => void;
		const harness = createHarness({ confirm: () => new Promise(resolve => { releaseConfirmation = resolve; }) });
		const operation = harness.coordinator.apply();
		harness.setState({ status: "available", version: "0.21.0" });
		releaseConfirmation({ ok: true, ready: true });
		expect(await operation).toEqual({ status: "not-ready" });
		expect(harness.applyCalls).toBe(0);
	});

	test("coalesces duplicate apply interactions", async () => {
		let releaseApply!: () => void;
		const harness = createHarness({ apply: () => new Promise<void>(resolve => { releaseApply = resolve; }) });
		const first = harness.coordinator.apply();
		const second = harness.coordinator.apply();
		expect(first).toBe(second);
		await Promise.resolve();
		await Promise.resolve();
		expect(harness.confirmCalls).toBe(1);
		expect(harness.applyCalls).toBe(1);
		releaseApply();
		expect(await first).toEqual({ status: "applied" });
	});

	test("clears the permit on native failure and allows a later guarded retry", async () => {
		let fail = true;
		let coordinator: ReturnType<typeof createUpdateApplyCoordinator>;
		coordinator = createUpdateApplyCoordinator({
			getState: () => ready,
			async confirmQuit() { return { ok: true, ready: true }; },
			async applyUpdate() {
				expect(coordinator.beforeQuit(event())).toBe(true);
				if (fail) throw new Error("native rejection");
				expect(coordinator.willClose(event())).toBe(true);
			}
		});
		expect(await coordinator.apply()).toEqual({ status: "failed", message: "The update could not be applied. It remains ready to retry." });
		const rejected = event();
		expect(coordinator.willClose(rejected)).toBe(false);
		expect(rejected.response).toEqual({ allow: false });
		fail = false;
		expect(await coordinator.apply()).toEqual({ status: "applied" });
	});

	test("expires an unmatched will-close permit after the apply call returns", async () => {
		let coordinator: ReturnType<typeof createUpdateApplyCoordinator>;
		coordinator = createUpdateApplyCoordinator({
			getState: () => ready,
			async confirmQuit() { return { ok: true, ready: true }; },
			async applyUpdate() { expect(coordinator.beforeQuit(event())).toBe(true); },
			permitTimeoutMs: 5
		});
		expect(await coordinator.apply()).toEqual({ status: "applied" });
		expect(await coordinator.apply()).toEqual({ status: "busy" });
		await new Promise(resolve => setTimeout(resolve, 10));
		const lateClose = event();
		expect(coordinator.willClose(lateClose)).toBe(false);
		expect(lateClose.response).toEqual({ allow: false });
	});
});