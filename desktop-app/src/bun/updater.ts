import type { DesktopUpdaterState } from "../shared/rpc";

export const STABLE_UPDATE_BASE_URL = "https://github.com/NovaEnergyConsulting/openamx/releases/latest/download";

export interface UpdateLocalInfo {
	version: string;
	baseUrl: string;
	channel: string;
	name: string;
	displayName?: string;
	identifier: string;
	updateAuthority?: "direct" | "external" | "none";
}

export interface NativeUpdateInfo {
	version: string;
	updateAvailable: boolean;
	updateReady: boolean;
	error: string;
}

export interface UpdaterAdapter {
	getLocalInfo(): Promise<UpdateLocalInfo>;
	checkForUpdate(): Promise<NativeUpdateInfo>;
	updateInfo(): NativeUpdateInfo;
	downloadUpdate(): Promise<void>;
}

export interface UpdaterBuildInfo {
	isPackaged: boolean;
	channel: string;
	updateAuthority?: string;
}

export interface UpdaterIdentity {
	name: string;
	identifier: string;
}

type UnsupportedReason = "development" | "channel" | "authority" | "identity" | "configuration";

const CHECK_FAILURE: DesktopUpdaterState = {
	status: "failed", operation: "check", code: "UPDATE_CHECK_FAILED", message: "The update check failed. Try again later."
};
const DOWNLOAD_FAILURE: DesktopUpdaterState = {
	status: "failed", operation: "download", code: "UPDATE_DOWNLOAD_FAILED", message: "The update could not be prepared. Try again later."
};

function buildUnsupportedReason(build: UpdaterBuildInfo): "development" | "channel" | "authority" | undefined {
	if (!build.isPackaged) return "development";
	if (build.channel !== "stable") return "channel";
	if (build.updateAuthority !== undefined && build.updateAuthority !== "direct") return "authority";
	return undefined;
}

export function createUpdaterCoordinator(adapter: UpdaterAdapter, build: UpdaterBuildInfo, identity: UpdaterIdentity) {
	let state: DesktopUpdaterState = { status: "not-checked" };
	let localInfo: UpdateLocalInfo | undefined;
	let eligibility: Promise<Exclude<UnsupportedReason, "development"> | undefined> | undefined;
	let checkInFlight: Promise<DesktopUpdaterState> | undefined;
	let downloadInFlight: Promise<DesktopUpdaterState> | undefined;
	let startupCheck: Promise<DesktopUpdaterState> | undefined;

	async function unsupportedReason(): Promise<Extract<DesktopUpdaterState, { status: "unsupported" }> | undefined> {
		const buildReason = buildUnsupportedReason(build);
		if (buildReason) return { status: "unsupported", reason: buildReason };
		if (!eligibility) {
			eligibility = (async () => {
				try {
					localInfo = await adapter.getLocalInfo();
					if (localInfo.channel !== "stable") return "channel";
					if (localInfo.updateAuthority !== undefined && localInfo.updateAuthority !== "direct") return "authority";
					if (localInfo.identifier !== identity.identifier || (localInfo.displayName ?? localInfo.name) !== identity.name) return "identity";
					if (localInfo.baseUrl !== STABLE_UPDATE_BASE_URL) return "configuration";
					return undefined;
				} catch {
					return "configuration";
				}
			})();
		}
		const reason = await eligibility;
		return reason ? { status: "unsupported", reason } : undefined;
	}

	function checkForUpdates(): Promise<DesktopUpdaterState> {
		if (downloadInFlight) return downloadInFlight;
		if (checkInFlight) return checkInFlight;
		const buildReason = buildUnsupportedReason(build);
		if (buildReason) {
			state = { status: "unsupported", reason: buildReason };
			return Promise.resolve(state);
		}
		if (state.status === "ready") return Promise.resolve(state);

		state = { status: "checking" };
		const operation = (async (): Promise<DesktopUpdaterState> => {
			try {
				const unsupported = await unsupportedReason();
				if (unsupported) return state = unsupported;
				const update = await adapter.checkForUpdate();
				if (update.error) return state = CHECK_FAILURE;
				if (update.updateReady) return state = { status: "ready", version: update.version || localInfo!.version };
				if (update.updateAvailable) {
					if (!update.version) return state = CHECK_FAILURE;
					return state = { status: "available", version: update.version };
				}
				return state = { status: "up-to-date", version: localInfo!.version };
			} catch {
				return state = CHECK_FAILURE;
			}
		})();
		checkInFlight = operation;
		void operation.then(() => {
			if (checkInFlight === operation) checkInFlight = undefined;
		});
		return operation;
	}

	function downloadUpdate(): Promise<DesktopUpdaterState> {
		if (downloadInFlight) return downloadInFlight;
		if (checkInFlight) return checkInFlight.then(() => downloadUpdate());
		if (state.status !== "available") return Promise.resolve(state);

		const version = state.version;
		state = { status: "downloading", version };
		const operation = (async (): Promise<DesktopUpdaterState> => {
			try {
				await adapter.downloadUpdate();
				const update = adapter.updateInfo();
				if (update.error || !update.updateReady) return state = DOWNLOAD_FAILURE;
				return state = { status: "ready", version: update.version || version };
			} catch {
				return state = DOWNLOAD_FAILURE;
			}
		})();
		downloadInFlight = operation;
		void operation.then(() => {
			if (downloadInFlight === operation) downloadInFlight = undefined;
		});
		return operation;
	}

	function start(): Promise<DesktopUpdaterState> {
		startupCheck ??= checkForUpdates();
		return startupCheck;
	}

	return {
		getState: (): DesktopUpdaterState => state,
		start,
		checkForUpdates,
		downloadUpdate,
	};
}