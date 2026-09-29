import { throwUndefinedIdentifier } from '../diagnostics/errors';
import { FunctionDeclarationNode, SourceLocation, TypeDeclarationNode } from '../ast/types';

/**
 * Runtime environment for variable storage during evaluation.
 * Variables are stored in declaration order (source order).
 * get() throws AMX1004 for undefined identifiers.
 */
export class Environment {
  private store: Map<string, unknown> = new Map();
  readonly recordTypes: Map<string, TypeDeclarationNode>;
  readonly functions: Map<string, FunctionDeclarationNode>;

  constructor(recordTypes: Map<string, TypeDeclarationNode> = new Map(), functions: Map<string, FunctionDeclarationNode> = new Map()) {
    this.recordTypes = recordTypes;
    this.functions = functions;
  }

  /**
   * Create an isolated call frame sharing this module's record types and functions
   * but containing only the supplied parameter bindings. Used to evaluate pure
   * function bodies without exposing document/module state.
   */
  createCallFrame(parameters: Record<string, unknown>): Environment {
    const frame = new Environment(this.recordTypes, this.functions);
    for (const [name, value] of Object.entries(parameters)) frame.set(name, value);
    return frame;
  }

  /**
   * Set or overwrite a variable value.
   */
  set(name: string, value: unknown): void {
    this.store.set(name, value);
  }

  update(name: string, value: unknown, source?: SourceLocation, file?: string): void {
    if (!this.store.has(name)) {
      throwUndefinedIdentifier(name, source, file);
    }
    this.store.set(name, value);
  }

  delete(name: string): void {
    this.store.delete(name);
  }

  /**
   * Get a variable value. Throws AMX1004 if not defined.
   */
  get(name: string, source?: SourceLocation, file?: string): unknown {
    if (!this.store.has(name)) {
      throwUndefinedIdentifier(name, source, file);
    }
    return this.store.get(name);
  }

  /**
   * Check existence (used internally by evaluator for forward-ref detection).
   */
  has(name: string): boolean {
    return this.store.has(name);
  }

  /**
   * Return a plain object snapshot of current bindings (for evaluateDocument result).
   */
  toObject(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of this.store.entries()) {
      obj[k] = v;
    }
    return obj;
  }

  /**
   * Clear all bindings (useful for tests).
   */
  clear(): void {
    this.store.clear();
  }
}
