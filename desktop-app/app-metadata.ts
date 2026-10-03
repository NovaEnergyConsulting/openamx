import { readFileSync } from "node:fs";

const packageMetadata = JSON.parse(
	readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as { version: string };

export const appMetadata = {
	name: "OpenAMX Desktop",
	identifier: "dev.openamx.desktop",
	version: packageMetadata.version,
};