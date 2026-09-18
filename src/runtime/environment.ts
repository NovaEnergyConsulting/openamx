import { throwUndefinedIdentifier } from '../diagnostics/errors';
import { SourceLocation } from '../ast/types';

/**
 * Runtime environment for variable storage during evaluation.
 * Variables are stored in declaration order (source order).
 * get() throws AMX1004 for undefined identifiers.
 */
export class Environment {
  private store: Map<string, unknown> = new Map();

  /**
   * Set or overwrite a variable value.
   */
  set(name: string, value: unknown): void {
    this.store.set(name, value);
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
