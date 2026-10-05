import * as zlib from "node:zlib";

export const MAX_UNCOMPRESSED_ARCHIVE_BYTES = 512 * 1024 * 1024;

export function validateArchiveMemberPath(member: string): void {
	const normalized = member.replace(/^(?:\.\/)+/, "");
	if (!normalized || normalized === ".") return;
	const segments = normalized.replace(/\/$/, "").split("/");
	if (normalized.startsWith("/") || normalized.startsWith("\\") || /^[A-Za-z]:/.test(normalized)
		|| normalized.includes("\\") || segments.some((part) => part === ".." || part === "." || part === "")) {
		throw new Error(`Installer archive contains an unsafe member path: ${member}`);
	}
}

function octalField(header: Buffer, start: number, length: number): number {
	const text = header.subarray(start, start + length).toString("ascii").replace(/\0.*$/, "").trim();
	if (!text) return 0;
	if (!/^[0-7]+$/.test(text)) throw new Error("Installer TAR contains an invalid size field.");
	const size = Number.parseInt(text, 8);
	if (!Number.isSafeInteger(size) || size < 0) throw new Error("Installer TAR contains an invalid member size.");
	return size;
}

export function inspectTarMembers(tar: Buffer): Map<string, Buffer> {
	if (tar.byteLength > MAX_UNCOMPRESSED_ARCHIVE_BYTES) throw new Error("Installer TAR exceeds the archive inspection size limit.");
	const names = new Set<string>();
	const files = new Map<string, Buffer>();
	let offset = 0;
	let ended = false;
	let memberCount = 0;
	while (offset + 512 <= tar.byteLength) {
		const header = tar.subarray(offset, offset + 512);
		if (header.every((byte) => byte === 0)) {
			ended = true;
			break;
		}
		memberCount++;
		if (memberCount > 100_000) throw new Error("Installer TAR has too many members.");
		const declaredChecksum = octalField(header, 148, 8);
		let actualChecksum = 0;
		for (let index = 0; index < header.length; index++) actualChecksum += index >= 148 && index < 156 ? 0x20 : header[index]!;
		if (declaredChecksum !== actualChecksum) throw new Error("Installer TAR header checksum is invalid.");
		const rawName = header.subarray(0, 100).toString("utf8").replace(/\0.*$/, "");
		const prefix = header.subarray(345, 500).toString("utf8").replace(/\0.*$/, "");
		const member = prefix ? `${prefix}/${rawName}` : rawName;
		validateArchiveMemberPath(member);
		const type = String.fromCharCode(header[156] ?? 0);
		if (!["\0", "0", "5"].includes(type)) throw new Error(`Installer TAR contains a link or unsupported member type at ${member || "<root>"}.`);
		const normalizedName = member.replace(/^(?:\.\/)+/, "").replace(/\/$/, "");
		if (normalizedName && names.has(normalizedName)) throw new Error(`Installer TAR contains a duplicate member path: ${normalizedName}`);
		if (normalizedName) names.add(normalizedName);
		const size = octalField(header, 124, 12);
		const bodyStart = offset + 512;
		if (bodyStart + size > tar.byteLength) throw new Error(`Installer TAR member is truncated: ${member}`);
		if (type !== "5") files.set(normalizedName, tar.subarray(bodyStart, bodyStart + size));
		offset = bodyStart + Math.ceil(size / 512) * 512;
	}
	if (!ended) throw new Error("Installer TAR has no valid end-of-archive marker.");
	return files;
}

export function inspectTarZstdMembers(archiveBytes: Uint8Array): Map<string, Buffer> {
	if (typeof zlib.zstdDecompressSync !== "function") throw new Error("Compressed Electrobun inspection requires a Bun version with node:zlib Zstandard support; upgrade Bun and retry.");
	let tar: Buffer;
	try {
		tar = zlib.zstdDecompressSync(archiveBytes, { maxOutputLength: MAX_UNCOMPRESSED_ARCHIVE_BYTES });
	} catch (cause) {
		throw new Error("Electrobun TAR.ZST is malformed or exceeds the archive inspection size limit.", { cause });
	}
	return inspectTarMembers(tar);
}
