import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { verifyRelease } from "./assembly";

const DEFAULT_REPOSITORY = "NovaEnergyConsulting/openamx";
const API_ROOT = "https://api.github.com";

interface GitHubRelease {
	id: number;
	tag_name: string;
	target_commitish: string;
	draft: boolean;
	upload_url: string;
	assets_url: string;
}

interface GitHubAsset {
	name: string;
	size: number;
	url: string;
}

export interface GitHubReleaseClient {
	getTagCommit(repository: string, tag: string): Promise<string | null>;
	commitExists(repository: string, commit: string): Promise<boolean>;
	getReleaseByTag(repository: string, tag: string): Promise<GitHubRelease | null>;
	createDraft(repository: string, input: { tagName: string; targetCommit: string; name: string; body: string }): Promise<GitHubRelease>;
	listAssets(repository: string, release: GitHubRelease): Promise<GitHubAsset[]>;
	downloadAsset(repository: string, asset: GitHubAsset): Promise<Uint8Array>;
	uploadAsset(repository: string, release: GitHubRelease, name: string, bytes: Uint8Array): Promise<void>;
}

function hash(bytes: Uint8Array): string {
	return createHash("sha256").update(bytes).digest("hex");
}

export function validateGitHubRepository(repository: string): string {
	if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error("Repository must be supplied as OWNER/REPOSITORY.");
	return repository;
}

function safeError(status: number): Error {
	if (status === 401 || status === 403) return new Error("GitHub authentication or authorization failed; verify gh auth login or GH_TOKEN/GITHUB_TOKEN permissions.");
	return new Error(`GitHub API request failed with HTTP ${status}.`);
}

async function readToken(): Promise<string> {
	const envToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
	if (envToken) return envToken;
	const result = spawnSync("gh", ["auth", "token", "--hostname", "github.com"], { encoding: "utf8", windowsHide: true });
	if (result.error || result.status !== 0 || !result.stdout.trim()) {
		throw new Error("GitHub authentication is unavailable; use gh auth login or GH_TOKEN/GITHUB_TOKEN.");
	}
	return result.stdout.trim();
}

export async function createGitHubReleaseClient(options: {
	token?: string;
	fetchImplementation?: typeof fetch;
} = {}): Promise<GitHubReleaseClient> {
	const token = options.token ?? await readToken();
	const request = options.fetchImplementation ?? fetch;
	const api = async <T>(url: string, init: RequestInit = {}, allowMissing = false): Promise<T | null> => {
		let response: Response;
		try {
			response = await request(url, {
				...init,
				headers: {
					Accept: "application/vnd.github+json",
					Authorization: `Bearer ${token}`,
					"X-GitHub-Api-Version": "2022-11-28",
					...init.headers,
				},
			});
		} catch {
			throw new Error("GitHub network request failed; credentials and response details were not logged.");
		}
		if (allowMissing && response.status === 404) return null;
		if (!response.ok) throw safeError(response.status);
		if (response.status === 204) return null;
		return await response.json() as T;
	};
	const refCommit = async (repository: string, tag: string): Promise<string | null> => {
		const ref = await api<{ object: { type: string; sha: string } }>(`${API_ROOT}/repos/${repository}/git/ref/tags/${encodeURIComponent(tag)}`, {}, true);
		if (!ref) return null;
		let object = ref.object;
		for (let depth = 0; object.type === "tag" && depth < 4; depth++) {
			const annotated = await api<{ object: { type: string; sha: string } }>(`${API_ROOT}/repos/${repository}/git/tags/${object.sha}`);
			if (!annotated) throw new Error("GitHub returned an incomplete annotated tag record.");
			object = annotated.object;
		}
		if (object.type !== "commit" || !/^[a-f0-9]{40}$/.test(object.sha)) throw new Error("Existing GitHub tag does not resolve to a commit.");
		return object.sha;
	};
	return {
		getTagCommit: refCommit,
		commitExists: async (repository, commit) => Boolean(await api(`${API_ROOT}/repos/${repository}/commits/${commit}`, {}, true)),
		getReleaseByTag: async (repository, tag) => api<GitHubRelease>(`${API_ROOT}/repos/${repository}/releases/tags/${encodeURIComponent(tag)}`, {}, true),
		createDraft: async (repository, input) => {
			const release = await api<GitHubRelease>(`${API_ROOT}/repos/${repository}/releases`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tag_name: input.tagName, target_commitish: input.targetCommit, name: input.name, body: input.body, draft: true, prerelease: false }),
			});
			if (!release) throw new Error("GitHub did not return the created draft release.");
			return release;
		},
		listAssets: async (repository, release) => (await api<GitHubAsset[]>(`${API_ROOT}/repos/${repository}/releases/${release.id}/assets`)) ?? [],
		downloadAsset: async (_repository, asset) => {
			const response = await request(asset.url, { headers: { Accept: "application/octet-stream", Authorization: `Bearer ${token}` } });
			if (!response.ok) throw safeError(response.status);
			return new Uint8Array(await response.arrayBuffer());
		},
		uploadAsset: async (_repository, release, name, bytes) => {
			const uploadUrl = release.upload_url.replace(/\{.*$/, "");
			const target = new URL(uploadUrl);
			target.searchParams.set("name", name);
			let upload: Response;
			try {
				upload = await request(target, {
					method: "POST",
					headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/octet-stream" },
					body: Buffer.from(bytes),
				});
			} catch {
				throw new Error("GitHub asset upload was interrupted; the draft is retained for a safe retry.");
			}
			if (!upload.ok) throw safeError(upload.status);
		},
	};
}

export async function publishRelease(options: {
	rootDirectory: string;
	releaseDirectory: string;
	repository?: string;
	allowPartial?: boolean;
	client?: GitHubReleaseClient;
	verify?: typeof verifyRelease;
}): Promise<{ repository: string; tag: string; draft: true; uploaded: string[]; confirmed: string[]; partialTargets: string[] }> {
	const repository = validateGitHubRepository(options.repository ?? DEFAULT_REPOSITORY);
	const verification = await (options.verify ?? verifyRelease)(options.rootDirectory, options.releaseDirectory);
	if (verification.licenseReadiness !== "ready") throw new Error(`Publication blocked by license/notices readiness: ${verification.blockers.join("; ")}`);
	const partialTargets = verification.targets.filter((target) => ["missing", "unverified", "unsupported"].includes(target.status)).map((target) => `${target.target}:${target.status}`);
	if (partialTargets.length && !options.allowPartial) throw new Error(`Partial release requires explicit --allow-partial acknowledgement: ${partialTargets.join(", ")}`);
	if (verification.blockers.length) throw new Error(`Publication preflight failed: ${verification.blockers.join("; ")}`);
	const manifest = JSON.parse(await readFile(path.join(options.releaseDirectory, "manifest.json"), "utf8")) as {
		version: string; sourceCommit: string; assets: Array<{ file: string; sizeBytes: number; sha256: string }>;
	};
	const client = options.client ?? await createGitHubReleaseClient();
	const tag = `v${manifest.version}`;
	const tagCommit = await client.getTagCommit(repository, tag);
	if (tagCommit && tagCommit !== manifest.sourceCommit) throw new Error(`Existing tag ${tag} points to ${tagCommit}, not the recorded source commit; tags are never moved.`);
	if (!tagCommit && !await client.commitExists(repository, manifest.sourceCommit)) throw new Error("Recorded source commit is not available in the remote repository; no release was created.");
	let release = await client.getReleaseByTag(repository, tag);
	if (release && (release.tag_name !== tag || !release.draft)) throw new Error(`Existing GitHub Release ${tag} is not an unpublished draft; publication will not modify it.`);
	if (!release) {
		release = await client.createDraft(repository, {
			tagName: tag,
			targetCommit: manifest.sourceCommit,
			name: `OpenAMX ${manifest.version}`,
			body: `Automated release assembly for ${manifest.version}.\n\nSource commit: ${manifest.sourceCommit}\n\nPartial target status: ${partialTargets.length ? partialTargets.join(", ") : "none"}\nMarketplace submission for the VS Code extension remains manual.`,
		});
	}
	if (release.tag_name !== tag) throw new Error("GitHub returned a release with a mismatched tag.");
	if (!release.draft) throw new Error("GitHub release is not a draft; refusing to mutate a published release.");
	const resolvedTagCommit = await client.getTagCommit(repository, tag);
	if (resolvedTagCommit !== manifest.sourceCommit) throw new Error(`GitHub tag ${tag} does not resolve to the recorded source commit; the draft is retained without uploading assets.`);
	const remoteAssets = await client.listAssets(repository, release);
	const uploaded: string[] = [];
	const confirmed: string[] = [];
	const requestedNames = new Set<string>();
	for (const asset of manifest.assets) {
		const localBytes = await readFile(path.join(options.releaseDirectory, asset.file));
		if (localBytes.byteLength !== asset.sizeBytes || hash(localBytes) !== asset.sha256) throw new Error(`Local release asset changed after verification: ${asset.file}`);
		const name = path.basename(asset.file);
		if (requestedNames.has(name)) throw new Error(`Local release contains ambiguous duplicate asset name ${name}.`);
		requestedNames.add(name);
		const existing = remoteAssets.find((item) => item.name === name);
		if (existing) {
			const remoteBytes = await client.downloadAsset(repository, existing);
			if (remoteBytes.byteLength !== localBytes.byteLength || hash(remoteBytes) !== asset.sha256) throw new Error(`Remote asset conflict for ${name}; existing assets are never replaced.`);
			confirmed.push(name);
			continue;
		}
		await client.uploadAsset(repository, release, name, localBytes);
		uploaded.push(name);
	}
	const finalAssets = await client.listAssets(repository, release);
	for (const asset of manifest.assets) {
		const name = path.basename(asset.file);
		const remote = finalAssets.find((candidate) => candidate.name === name);
		if (!remote) throw new Error(`Remote asset verification failed for ${name}; the draft remains retryable.`);
		const remoteBytes = await client.downloadAsset(repository, remote);
		if (remoteBytes.byteLength !== asset.sizeBytes || hash(remoteBytes) !== asset.sha256) throw new Error(`Remote asset verification failed for ${name}; the draft remains retryable.`);
	}
	return { repository, tag, draft: true, uploaded, confirmed, partialTargets };
}
