export function sharpRuntimePackages(target: string, optionalDependencies: Record<string, string> = {}): string[] {
	const packages = [`@img/sharp-${target}`];
	if (!target.startsWith("win32-")) packages.push(`@img/sharp-libvips-${target}`);
	for (const packageName of packages) {
		if (!optionalDependencies[packageName]) throw new Error(`sharp does not declare native runtime ${packageName}.`);
	}
	return packages;
}