import { describe, expect, test } from "bun:test";
import { sharpRuntimePackages } from "../desktop-app/scripts/sharp-runtime-packages";

describe("Sharp native runtime package selection", () => {
	test.each(["win32-x64", "win32-arm64", "win32-ia32"])("uses bundled libvips for %s", (target) => {
		const binding = `@img/sharp-${target}`;
		expect(sharpRuntimePackages(target, { [binding]: "0.35.5" })).toEqual([binding]);
	});

	test.each(["linux-x64", "linux-arm64", "linuxmusl-x64", "linuxmusl-arm64", "darwin-x64", "darwin-arm64"])("requires the libvips companion for %s", (target) => {
		const binding = `@img/sharp-${target}`;
		const libvips = `@img/sharp-libvips-${target}`;
		expect(sharpRuntimePackages(target, { [binding]: "0.35.5", [libvips]: "1.3.4" })).toEqual([binding, libvips]);
		expect(() => sharpRuntimePackages(target, { [binding]: "0.35.5" })).toThrow(`sharp does not declare native runtime ${libvips}.`);
	});

	test("rejects undeclared bindings rather than silently skipping them", () => {
		for (const target of ["win32-x64", "linux-x64", "darwin-arm64", "win32-unknown"]) {
			expect(() => sharpRuntimePackages(target)).toThrow(`sharp does not declare native runtime @img/sharp-${target}.`);
		}
	});
});