import { throwUndefinedIdentifier } from '../diagnostics/errors';
/**
 * Runtime environment for variable storage during evaluation.
 * Variables are stored in declaration order (source order).
 * get() throws AMX1004 for undefined identifiers.
 */
export class Environment {
    store = new Map();
    recordTypes;
    enumDeclarations = new Map();
    enumValues = new Map();
    functions;
    bindingTypes = new Map();
    dimensionRegistry;
    viewDefinitions = new Map();
    viewEmissions = [];
    diagramEmissions = [];
    immutableValues = new WeakSet();
    currentDocumentNodeIndex = -1;
    currentStatementIndex = -1;
    validationMode = 'aggregate';
    constructor(recordTypes = new Map(), functions = new Map(), dimensionRegistry) {
        this.recordTypes = recordTypes;
        this.functions = functions;
        this.dimensionRegistry = dimensionRegistry;
    }
    /**
     * Create an isolated call frame sharing this module's record types and functions
     * but containing only the supplied parameter bindings. Used to evaluate pure
     * function bodies without exposing document/module state.
     */
    createCallFrame(parameters) {
        const frame = new Environment(this.recordTypes, this.functions, this.dimensionRegistry);
        frame.validationMode = this.validationMode;
        for (const [name, type] of this.bindingTypes)
            frame.bindingTypes.set(name, type);
        for (const [name, declaration] of this.enumDeclarations)
            frame.enumDeclarations.set(name, declaration);
        for (const [name, values] of this.enumValues)
            frame.enumValues.set(name, values);
        for (const [name, value] of Object.entries(parameters)) {
            frame.set(name, value);
            if (this.isImmutable(value))
                frame.markImmutable(value);
        }
        return frame;
    }
    /**
     * Set or overwrite a variable value.
     */
    set(name, value) {
        this.store.set(name, value);
    }
    markImmutable(value) {
        const visit = (item) => {
            if (!item || typeof item !== 'object' || this.immutableValues.has(item))
                return;
            this.immutableValues.add(item);
            if (Array.isArray(item))
                item.forEach(visit);
            else
                Object.values(item).forEach(visit);
        };
        visit(value);
    }
    isImmutable(value) {
        return !!value && typeof value === 'object' && this.immutableValues.has(value);
    }
    update(name, value, source, file) {
        if (!this.store.has(name)) {
            throwUndefinedIdentifier(name, source, file);
        }
        this.store.set(name, value);
    }
    delete(name) {
        this.store.delete(name);
    }
    /**
     * Get a variable value. Throws AMX1004 if not defined.
     */
    get(name, source, file) {
        if (!this.store.has(name)) {
            throwUndefinedIdentifier(name, source, file);
        }
        return this.store.get(name);
    }
    /**
     * Check existence (used internally by evaluator for forward-ref detection).
     */
    has(name) {
        return this.store.has(name);
    }
    /**
     * Return a plain object snapshot of current bindings (for evaluateDocument result).
     */
    toObject() {
        const obj = {};
        for (const [k, v] of this.store.entries()) {
            obj[k] = v;
        }
        return obj;
    }
    /**
     * Clear all bindings (useful for tests).
     */
    clear() {
        this.store.clear();
        this.immutableValues = new WeakSet();
        this.viewDefinitions.clear();
        this.viewEmissions.length = 0;
        this.diagramEmissions.length = 0;
    }
}
//# sourceMappingURL=environment.js.map