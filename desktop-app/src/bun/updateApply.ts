import type { DesktopRPCResponse, DesktopUpdaterApplyResult, DesktopUpdaterState } from "../shared/rpc";

export type QuitEvent = { response?: { allow: boolean } };

interface QuitPermit {
	phase: "before-quit" | "will-close";
	timer?: ReturnType<typeof setTimeout>;
}

export function createUpdateApplyCoordinator(dependencies: {
	getState(): DesktopUpdaterState;
	confirmQuit(): Promise<DesktopRPCResponse<{ ready: boolean }>>;
	applyUpdate(): Promise<void>;
	permitTimeoutMs?: number;
}) {
	let applyInFlight: Promise<DesktopUpdaterApplyResult> | undefined;
	let permit: QuitPermit | undefined;

	function clearPermit(expected: QuitPermit) {
		if (permit !== expected) return;
		if (expected.timer) clearTimeout(expected.timer);
		permit = undefined;
	}

	function beforeQuit(event: QuitEvent): boolean {
		if (permit?.phase !== "before-quit") {
			event.response = { allow: false };
			return false;
		}
		const activePermit = permit;
		activePermit.phase = "will-close";
		activePermit.timer = setTimeout(() => clearPermit(activePermit), dependencies.permitTimeoutMs ?? 5000);
		activePermit.timer.unref?.();
		return true;
	}

	function willClose(event: QuitEvent): boolean {
		if (permit?.phase !== "will-close") {
			event.response = { allow: false };
			return false;
		}
		clearPermit(permit);
		return true;
	}

	async function runApply(): Promise<DesktopUpdaterApplyResult> {
		if (dependencies.getState().status !== "ready") return { status: "not-ready" };
		let confirmation: DesktopRPCResponse<{ ready: boolean }>;
		try {
			confirmation = await dependencies.confirmQuit();
		} catch {
			return { status: "failed", message: "Unable to confirm that all tabs are safe to close." };
		}
		if (!confirmation.ok) return { status: "failed", message: confirmation.error.message };
		if (!confirmation.ready) return { status: "cancelled" };
		if (dependencies.getState().status !== "ready") return { status: "not-ready" };

		const activePermit: QuitPermit = { phase: "before-quit" };
		permit = activePermit;
		try {
			await dependencies.applyUpdate();
			if (activePermit.phase === "before-quit") clearPermit(activePermit);
			return { status: "applied" };
		} catch {
			clearPermit(activePermit);
			return { status: "failed", message: "The update could not be applied. It remains ready to retry." };
		}
	}

	function apply(): Promise<DesktopUpdaterApplyResult> {
		if (applyInFlight) return applyInFlight;
		if (permit) return Promise.resolve({ status: "busy" });
		const operation = runApply();
		applyInFlight = operation;
		void operation.then(() => {
			if (applyInFlight === operation) applyInFlight = undefined;
		});
		return operation;
	}

	return { apply, beforeQuit, willClose };
}