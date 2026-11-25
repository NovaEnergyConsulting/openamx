const declaringRegistries = new WeakMap();
export function setDeclaringRegistry(declaration, registry) {
    declaringRegistries.set(declaration, registry);
}
export function fieldRegistry(declaration, fallback) {
    return declaringRegistries.get(declaration) ?? fallback;
}
//# sourceMappingURL=declarationRegistry.js.map