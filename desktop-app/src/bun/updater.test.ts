import { describe, expect, it } from "bun:test";
import {
	createUpdaterCoordinator,
	STABLE_UPDATE_BASE_URL,
	type NativeUpdateInfo,
	type UpdaterAdapter,
	type UpdaterBuildInfo,
	type UpdateLocalInfo,
} from "./updater";

const identity = { name: "OpenAMX Desktop", identifier: "dev.openamx.desktop" };
const stableBuild: UpdaterBuildInfo = { isPackaged: true, channel: "stable" };
const localInfo: UpdateLocalInfo = {
	version: "0.20.0", baseUrl: STABLE_UPDATE_BASE_URL, channel: "stable", ...identity
};
const availableUpdate: NativeUpdateInfo = { version: "0.21.0", updateAvailable: true, updateReady: false, error: "" };

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (error: Error) => void;
	const promise = new Promise<T>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});
	return { promise, resolve, reject };
}

function createFakeAdapter(options: {
	build?: UpdaterBuildInfo;
	localInfo?: UpdateLocalInfo;
	check?: () => Promise<NativeUpdateInfo>;
	download?: () => Promise<void>;
	updateInfo?: NativeUpdateInfo;
} = {}) {
	const calls = { localInfo: 0, check: 0, download: 0 };
	let currentInfo = options.updateInfo ?? availableUpdate;
	const adapter: UpdaterAdapter = {
		async getLocalInfo() {
			calls.localInfo++;
			return options.localInfo ?? localInfo;
		},
		async checkForUpdate() {
			calls.check++;
			return options.check ? options.check() : availableUpdate;
		},
		updateInfo() { return currentInfo; },
		async downloadUpdate() {
			calls.download++;
			if (options.download) await options.download();
			currentInfo = { version: "0.21.0", updateAvailable: true, updateReady: true, error: "" };
		},
	};
	return {
		adapter,
		calls,
		coordinator: createUpdaterCoordinator(adapter, options.build ?? stableBuild, identity),
		setUpdateInfo(update: NativeUpdateInfo) { currentInfo = update; },
	};
}

describe("main-process updater coordinator", () => {
	it("reports no update without downloading", async () => {
		const fake = createFakeAdapter({ check: async () => ({ version: "0.20.0", updateAvailable: false, updateReady: false, error: "" }) });
		expect(await fake.coordinator.start()).toEqual({ status: "up-to-date", version: "0.20.0" });
		expect(fake.calls).toEqual({ localInfo: 1, check: 1, download: 0 });
	});

	it("reports an available version without downloading", async () => {
		const fake = createFakeAdapter();
		expect(await fake.coordinator.start()).toEqual({ status: "available", version: "0.21.0" });
		expect(fake.calls.download).toBe(0);
	});

	it("maps check errors to a stable typed failure", async () => {
		const fake = createFakeAdapter({ check: async () => { throw new Error("private native detail"); } });
		expect(await fake.coordinator.start()).toEqual({
			status: "failed", operation: "check", code: "UPDATE_CHECK_FAILED", message: "The update check failed. Try again later."
		});
	});

	it("maps download errors to a stable typed failure", async () => {
		const fake = createFakeAdapter({ download: async () => { throw new Error("private native detail"); } });
		await fake.coordinator.start();
		expect(await fake.coordinator.downloadUpdate()).toEqual({
			status: "failed", operation: "download", code: "UPDATE_DOWNLOAD_FAILED", message: "The update could not be prepared. Try again later."
		});
	});

	it("reports ready only after explicit download preparation succeeds", async () => {
		const fake = createFakeAdapter();
		expect(await fake.coordinator.start()).toMatchObject({ status: "available" });
		expect(await fake.coordinator.downloadUpdate()).toEqual({ status: "ready", version: "0.21.0" });
		expect(fake.calls.download).toBe(1);
	});

	it("gates development and non-direct builds before local or host requests", async () => {
		for (const build of [
			{ isPackaged: false, channel: "dev" },
			{ isPackaged: true, channel: "canary" },
			{ isPackaged: true, channel: "stable", updateAuthority: "external" },
			{ isPackaged: true, channel: "stable", updateAuthority: "none" },
		]) {
			const fake = createFakeAdapter({ build });
			expect((await fake.coordinator.start()).status).toBe("unsupported");
			expect(fake.calls).toEqual({ localInfo: 0, check: 0, download: 0 });
		}
	});

	it("rejects local host or app identity mismatches before checking", async () => {
		for (const local of [
			{ ...localInfo, baseUrl: "https://example.invalid/updates" },
			{ ...localInfo, identifier: "dev.other.app" },
			{ ...localInfo, updateAuthority: "external" as const },
		]) {
			const fake = createFakeAdapter({ localInfo: local });
			expect((await fake.coordinator.start()).status).toBe("unsupported");
			expect(fake.calls.check).toBe(0);
		}
	});

	it("coalesces startup and explicit checks", async () => {
		const pending = deferred<NativeUpdateInfo>();
		const fake = createFakeAdapter({ check: () => pending.promise });
		const startup = fake.coordinator.start();
		const repeatedStartup = fake.coordinator.start();
		const explicit = fake.coordinator.checkForUpdates();
		expect(repeatedStartup).toBe(startup);
		expect(startup).toBe(explicit);
		await Promise.resolve();
		pending.resolve(availableUpdate);
		expect(await startup).toEqual({ status: "available", version: "0.21.0" });
		expect(fake.calls.check).toBe(1);
		expect(fake.calls.download).toBe(0);
	});

	it("coalesces duplicate downloads and blocks checks while preparing", async () => {
		const pending = deferred<void>();
		const fake = createFakeAdapter({ download: () => pending.promise });
		await fake.coordinator.start();
		const first = fake.coordinator.downloadUpdate();
		const second = fake.coordinator.downloadUpdate();
		const checkDuringDownload = fake.coordinator.checkForUpdates();
		expect(first).toBe(second);
		expect(checkDuringDownload).toBe(first);
		expect(fake.calls.download).toBe(1);
		expect(fake.calls.check).toBe(1);
		pending.resolve();
		expect(await first).toEqual({ status: "ready", version: "0.21.0" });
	});
});