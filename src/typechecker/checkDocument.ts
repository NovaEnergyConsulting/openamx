import { FunctionDeclarationNode, OpenAmxDocument, RecordFieldNode, SourceLocation, StatementNode, TypeDeclarationNode, TypeReferenceNode, V02ExpressionNode } from '../ast/types';
import { moduleError, staticError } from '../diagnostics/errors';

export type CheckedType =
  | { kind: 'named'; name: string }
  | { kind: 'list' | 'nullable'; element: CheckedType }
  | { kind: 'null' };

/** Symbols made visible to a module because they were explicitly imported (immutable). */
export interface ModuleCheckContext {
  types?: Map<string, TypeDeclarationNode>;
  functions?: Map<string, FunctionDeclarationNode>;
  bindings?: Map<string, CheckedType>;
}

/** Symbols this module makes available to importers because they were declared with `export`. */
export interface ModuleCheckResult {
  exportedTypes: Map<string, TypeDeclarationNode>;
  exportedFunctions: Map<string, FunctionDeclarationNode>;
  exportedBindings: Map<string, CheckedType>;
}

const named = (name: string): CheckedType => ({ kind: 'named', name });
const list = (element: CheckedType): CheckedType => ({ kind: 'list', element });
const nullable = (element: CheckedType): CheckedType => ({ kind: 'nullable', element });
const primitives = new Set(['Number', 'String', 'Boolean', 'DateTime']);
const signatures: Record<string, { args: string[]; min: number }> = {
  sum: { args: ['Number[]'], min: 1 }, min: { args: ['Number[]'], min: 1 },
  max: { args: ['Number[]'], min: 1 }, mean: { args: ['Number[]'], min: 1 },
  round: { args: ['Number', 'Number'], min: 1 }, abs: { args: ['Number'], min: 1 },
  sqrt: { args: ['Number'], min: 1 }, pow: { args: ['Number', 'Number'], min: 2 }
};

function equal(left: CheckedType, right: CheckedType): boolean {
  return left.kind === right.kind && (left.kind === 'named'
    ? right.kind === 'named' && left.name === right.name
    : left.kind === 'null' || (right.kind !== 'named' && right.kind !== 'null' && equal(left.element, right.element)));
}

function assignable(actual: CheckedType, expected: CheckedType): boolean {
  if (equal(actual, expected)) return true;
  if (expected.kind === 'nullable') return actual.kind === 'null' || assignable(actual, expected.element);
  return actual.kind === 'list' && expected.kind === 'list' && assignable(actual.element, expected.element);
}

function common(left: CheckedType, right: CheckedType): CheckedType | undefined {
  if (assignable(left, right)) return right;
  if (assignable(right, left)) return left;
  return undefined;
}

function format(type: CheckedType): string {
  if (type.kind === 'named') return type.name;
  if (type.kind === 'null') return 'null';
  return type.kind === 'list' ? `${format(type.element)}[]` : `${format(type.element)}?`;
}

export function checkingActivated(doc: OpenAmxDocument): boolean {
  const expressionHasV03 = (expression: V02ExpressionNode): boolean => {
    switch (expression.type) {
      case 'nullLiteral': case 'recordConstructor': case 'fieldAccess': return true;
      case 'binaryExpression': return expressionHasV03(expression.left) || expressionHasV03(expression.right);
      case 'unaryExpression': return expressionHasV03(expression.argument);
      case 'conditionalExpression': return [expression.test, expression.consequent, expression.alternate].some(expressionHasV03);
      case 'listLiteral': return expression.elements.some(expressionHasV03);
      case 'functionCall': return expression.arguments.some(expressionHasV03);
      case 'rangeExpression': return expressionHasV03(expression.start) || expressionHasV03(expression.end);
      case 'matchExpression': return expressionHasV03(expression.expression) || expression.cases.some(arm => expressionHasV03(arm.expression)) || expressionHasV03(expression.defaultExpression);
      case 'forExpression': return expressionHasV03(expression.iterable) || expression.body.some(statementHasV03);
      default: return false;
    }
  };
  const statementHasV03 = (statement: StatementNode): boolean => statement.type === 'typeDeclaration'
    || statement.type === 'functionDeclaration'
    || statement.type === 'importDeclaration'
    || (statement.type === 'variableDeclaration' && (!!statement.annotation || !!statement.exported))
    || (statement.type === 'forStatement' && (expressionHasV03(statement.iterable) || statement.body.some(statementHasV03)))
    || ('expression' in statement && expressionHasV03(statement.expression));
  return doc.nodes.some(node => node.type === 'executableCodeBlock' && node.statements.some(statementHasV03));
}

const stdlibNames = new Set(['sum', 'min', 'max', 'mean', 'round', 'abs', 'sqrt', 'pow']);

function bodyContainsForExpression(expression: V02ExpressionNode): boolean {
  switch (expression.type) {
    case 'forExpression': return true;
    case 'binaryExpression': return bodyContainsForExpression(expression.left) || bodyContainsForExpression(expression.right);
    case 'unaryExpression': return bodyContainsForExpression(expression.argument);
    case 'conditionalExpression': return [expression.test, expression.consequent, expression.alternate].some(bodyContainsForExpression);
    case 'listLiteral': return expression.elements.some(bodyContainsForExpression);
    case 'functionCall': return expression.arguments.some(bodyContainsForExpression);
    case 'rangeExpression': return bodyContainsForExpression(expression.start) || bodyContainsForExpression(expression.end);
    case 'matchExpression': return bodyContainsForExpression(expression.expression) || expression.cases.some(arm => bodyContainsForExpression(arm.expression)) || bodyContainsForExpression(expression.defaultExpression);
    case 'recordConstructor': return expression.fields.some(field => bodyContainsForExpression(field.expression));
    case 'fieldAccess': return bodyContainsForExpression(expression.receiver);
    default: return false;
  }
}

export function checkDocument(doc: OpenAmxDocument, file?: string, context?: ModuleCheckContext): ModuleCheckResult {
  const types = new Map<string, TypeDeclarationNode>(context?.types ?? []);
  let bindings = new Map<string, CheckedType>(context?.bindings ?? []);
  const functions = new Map<string, FunctionDeclarationNode>(context?.functions ?? []);
  const immutableNames = new Set<string>([...(context?.bindings?.keys() ?? []), ...(context?.functions?.keys() ?? []), ...(context?.types?.keys() ?? [])]);
  const exportedTypes = new Map<string, TypeDeclarationNode>();
  const exportedFunctions = new Map<string, FunctionDeclarationNode>();
  const exportedBindings = new Map<string, CheckedType>();
  const fail = (code: 'AMX3001' | 'AMX3002' | 'AMX3003' | 'AMX3004' | 'AMX3005', message: string, source?: SourceLocation): never => staticError(code, message, source, file);

  function resolve(ref: TypeReferenceNode): CheckedType {
    if (ref.type === 'namedType') {
      if (!ref.name || (!primitives.has(ref.name) && !types.has(ref.name))) fail('AMX3001', `Unknown type '${ref.name}'`, ref.source);
      return named(ref.name!);
    }
    return ref.type === 'listType' ? list(resolve(ref.element!)) : nullable(resolve(ref.element!));
  }

  function requireType(actual: CheckedType, expected: CheckedType, source?: SourceLocation): void {
    if (!assignable(actual, expected)) fail('AMX3002', `Expected ${format(expected)}, got ${format(actual)}`, source);
  }

  function checkDateTime(value: string): boolean {
    const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/);
    if (!parts) return false;
    const [, year, month, day, hour, minute, second, offset] = parts;
    const date = new Date(0);
    date.setUTCFullYear(+year, +month - 1, +day);
    if (date.getUTCFullYear() !== +year || date.getUTCMonth() !== +month - 1 || date.getUTCDate() !== +day || +hour > 23 || +minute > 59 || +second > 59) return false;
    return offset === 'Z' || (+offset.slice(1, 3) <= 23 && +offset.slice(4) <= 59);
  }

  function infer(expression: V02ExpressionNode, expected?: CheckedType): CheckedType {
    switch (expression.type) {
      case 'numberLiteral': return named('Number');
      case 'booleanLiteral': return named('Boolean');
      case 'stringLiteral':
        if (expected?.kind === 'named' && expected.name === 'DateTime') {
          if (!checkDateTime(expression.value)) fail('AMX3002', 'Invalid DateTime literal', expression.source);
          return expected;
        }
        if (expected?.kind === 'nullable' && expected.element.kind === 'named' && expected.element.name === 'DateTime') {
          if (!checkDateTime(expression.value)) fail('AMX3002', 'Invalid DateTime literal', expression.source);
          return expected.element;
        }
        return named('String');
      case 'nullLiteral': return { kind: 'null' };
      case 'identifier': {
        const value = bindings.get(expression.name);
        if (!value) fail('AMX3001', `Unknown identifier '${expression.name}'`, expression.source);
        return value!;
      }
      case 'listLiteral': {
        const context = expected?.kind === 'nullable' ? expected.element : expected;
        const elementType = context?.kind === 'list' ? context.element : undefined;
        if (!expression.elements.length) {
          if (!elementType) fail('AMX3003', 'Empty list needs a list type', expression.source);
          return list(elementType!);
        }
        if (elementType) {
          for (const item of expression.elements) requireType(infer(item, elementType), elementType, item.source);
          return list(elementType);
        }
        let element = infer(expression.elements[0], elementType);
        if (element.kind === 'null') fail('AMX3003', 'Null list elements need a contextual element type', expression.elements[0].source);
        for (const item of expression.elements.slice(1)) {
          const next = infer(item, elementType);
          const merged = common(element, next);
          if (!merged) fail('AMX3002', 'List elements have incompatible types', item.source);
          element = merged!;
        }
        if (elementType) requireType(element, elementType, expression.source);
        return list(elementType ?? element);
      }
      case 'recordConstructor': {
        const declaration = types.get(expression.name);
        if (!declaration) fail('AMX3001', `Unknown record type '${expression.name}'`, expression.source);
        const seen = new Set<string>();
        for (const field of expression.fields) {
          if (seen.has(field.name)) fail('AMX3005', `Duplicate field '${field.name}'`, field.source);
          seen.add(field.name);
          const declared = declaration!.fields.find(item => item.name === field.name);
          if (!declared) fail('AMX3001', `Unknown field '${field.name}'`, field.source);
          const target = resolve(declared!.annotation);
          requireType(infer(field.expression, target), target, field.expression.source ?? field.source);
        }
        for (const field of declaration!.fields) {
          if (!seen.has(field.name) && !field.optional && !field.defaultExpression) fail('AMX3002', `Missing required field '${field.name}'`, expression.source);
        }
        return named(expression.name);
      }
      case 'fieldAccess': {
        const receiver = infer(expression.receiver);
        const declaration = receiver.kind === 'named' ? types.get(receiver.name) : undefined;
        if (!declaration) fail('AMX3003', 'Field access requires a non-null record', expression.source);
        const field = declaration!.fields.find(item => item.name === expression.field);
        if (!field) fail('AMX3001', `Unknown field '${expression.field}'`, expression.source);
        return resolve(field!.annotation);
      }
      case 'binaryExpression': {
        const left = infer(expression.left);
        const right = infer(expression.right, left.kind === 'named' && left.name === 'DateTime' ? left : undefined);
        if (['and', 'or'].includes(expression.operator)) {
          requireType(left, named('Boolean'), expression.left.source);
          requireType(right, named('Boolean'), expression.right.source);
        } else if (['==', '!='].includes(expression.operator)) {
          const scalar = (type: CheckedType) => type.kind === 'named' && primitives.has(type.name);
          if (!((scalar(left) && equal(left, right)) || (left.kind === 'null' && right.kind === 'nullable') || (right.kind === 'null' && left.kind === 'nullable'))) fail('AMX3003', 'Equality requires compatible scalar operands', expression.source);
        } else {
          requireType(left, named('Number'), expression.left.source);
          requireType(right, named('Number'), expression.right.source);
        }
        return ['and', 'or', '==', '!=', '>', '>=', '<', '<='].includes(expression.operator) ? named('Boolean') : named('Number');
      }
      case 'unaryExpression':
        requireType(infer(expression.argument), named(expression.operator === 'not' ? 'Boolean' : 'Number'), expression.argument.source);
        return named(expression.operator === 'not' ? 'Boolean' : 'Number');
      case 'conditionalExpression': {
        requireType(infer(expression.test), named('Boolean'), expression.test.source);
        const test = expression.test;
        const checkedName = test.type === 'binaryExpression' && ['==', '!='].includes(test.operator)
          ? test.left.type === 'identifier' && test.right.type === 'nullLiteral' ? test.left.name
            : test.right.type === 'identifier' && test.left.type === 'nullLiteral' ? test.right.name : undefined
          : undefined;
        const original = checkedName ? bindings.get(checkedName) : undefined;
        const branch = (value: V02ExpressionNode, narrowed: boolean): CheckedType => {
          if (checkedName && original?.kind === 'nullable' && narrowed) bindings.set(checkedName, original.element);
          try { return infer(value, expected); }
          finally { if (checkedName && original) bindings.set(checkedName, original); }
        };
        const nonNullInConsequent = test.type === 'binaryExpression' && test.operator === '!=';
        const consequent = branch(expression.consequent, nonNullInConsequent);
        const alternate = branch(expression.alternate, !nonNullInConsequent);
        const result = common(consequent, alternate);
        if (!result) fail('AMX3002', 'Conditional branches have incompatible types', expression.source);
        return result!;
      }
      case 'rangeExpression':
        requireType(infer(expression.start), named('Number'), expression.start.source);
        requireType(infer(expression.end), named('Number'), expression.end.source);
        return list(named('Number'));
      case 'functionCall': {
        const userFunction = functions.get(expression.callee);
        if (userFunction) {
          if (expression.arguments.length !== userFunction.parameters.length) fail('AMX3004', `Invalid arity for '${expression.callee}'`, expression.source);
          expression.arguments.forEach((argument, index) => {
            const target = resolve(userFunction.parameters[index].annotation);
            requireType(infer(argument, target), target, argument.source);
          });
          return resolve(userFunction.returnType);
        }
        const signature = signatures[expression.callee];
        if (!signature) fail('AMX3004', `Unknown function '${expression.callee}'`, expression.source);
        if (expression.arguments.length < signature.min || expression.arguments.length > signature.args.length) fail('AMX3004', `Invalid arity for '${expression.callee}'`, expression.source);
        expression.arguments.forEach((argument, index) => {
          const target = signature.args[index] === 'Number[]' ? list(named('Number')) : named('Number');
          requireType(infer(argument, target), target, argument.source);
        });
        return named('Number');
      }
      case 'matchExpression': {
        const scrutinee = infer(expression.expression);
        if (scrutinee.kind !== 'named' || !['Number', 'String', 'Boolean'].includes(scrutinee.name)) fail('AMX3003', 'Match needs a non-null scalar', expression.expression.source);
        let result: CheckedType | undefined;
        const arms = [...expression.cases.map(arm => ({ ...arm, isCase: true })),
          { expression: expression.defaultExpression, source: expression.defaultSource, isCase: false }]
          .sort((left, right) => (left.source?.line ?? 0) - (right.source?.line ?? 0) || (left.source?.column ?? 0) - (right.source?.column ?? 0));
        for (const arm of arms) {
          if (arm.isCase && 'value' in arm && !equal(infer(arm.value), scrutinee)) fail('AMX3002', 'Match case type differs from scrutinee', arm.source);
          const next = infer(arm.expression, expected);
          const merged = result ? common(result, next) : next;
          if (!merged) fail('AMX3002', 'Match arms have incompatible types', arm.source);
          result = merged;
        }
        return result!;
      }
      case 'forExpression': return checkLoop(expression.variable, expression.iterable, expression.body, expression.source, expected);
    }
  }

  function checkLoop(variable: string, iterable: V02ExpressionNode, body: StatementNode[], source?: SourceLocation, expected?: CheckedType): CheckedType {
    const target = infer(iterable);
    if (target.kind !== 'list') fail('AMX3003', 'For loop needs a list or range', iterable.source ?? source);
    const prior = bindings.get(variable);
    const existing = new Set(bindings.keys());
    bindings.set(variable, (target as { kind: 'list'; element: CheckedType }).element);
    let returned: CheckedType | undefined;
    for (const statement of body) {
      if (statement.type === 'returnStatement') returned = infer(statement.expression, expected?.kind === 'list' ? expected.element : undefined);
      else checkStatement(statement);
    }
    for (const name of bindings.keys()) if (!existing.has(name)) bindings.delete(name);
    if (prior) bindings.set(variable, prior);
    else bindings.delete(variable);
    return list(returned ?? named('Number'));
  }

  function checkDefault(expression: V02ExpressionNode, target: CheckedType): void {
    if (expression.type === 'listLiteral') {
      for (const item of expression.elements) checkDefault(item, target.kind === 'list' ? target.element : target);
    } else if (expression.type === 'recordConstructor') {
      for (const field of expression.fields) {
        const declaration = types.get(expression.name);
        const declared = declaration?.fields.find(item => item.name === field.name);
        if (declared) checkDefault(field.expression, resolve(declared.annotation));
      }
    } else if (!(expression.type === 'unaryExpression' && expression.operator === '-' && expression.argument.type === 'numberLiteral')
      && !['numberLiteral', 'stringLiteral', 'booleanLiteral', 'nullLiteral'].includes(expression.type)) {
      fail('AMX3005', 'Record default must be a literal', expression.source);
    }
    requireType(infer(expression, target), target, expression.source);
  }

  function checkStatement(statement: StatementNode): void {
    switch (statement.type) {
      case 'importDeclaration':
        return;
      case 'typeDeclaration': {
        if (primitives.has(statement.name) || types.has(statement.name) || bindings.has(statement.name) || functions.has(statement.name)) fail('AMX3005', `Duplicate type '${statement.name}'`, statement.source);
        const fields = new Set<string>();
        for (const field of statement.fields) {
          if (fields.has(field.name)) fail('AMX3005', `Duplicate field '${field.name}'`, field.source);
          fields.add(field.name);
          const target = resolve(field.annotation);
          if (field.optional && !field.defaultExpression && target.kind !== 'nullable') fail('AMX3005', `Optional field '${field.name}' needs a nullable type or default`, field.source);
        }
        types.set(statement.name, statement);
        for (const field of statement.fields) if (field.defaultExpression) checkDefault(field.defaultExpression, resolve(field.annotation));
        if (statement.exported) exportedTypes.set(statement.name, statement);
        return;
      }
      case 'functionDeclaration': {
        if (types.has(statement.name) || bindings.has(statement.name) || functions.has(statement.name)) fail('AMX3005', `Duplicate declaration '${statement.name}'`, statement.source);
        if (stdlibNames.has(statement.name)) fail('AMX3005', `Function '${statement.name}' cannot shadow a standard-library function`, statement.source);
        const paramNames = new Set<string>();
        const paramScope = new Map<string, CheckedType>();
        for (const parameter of statement.parameters) {
          if (paramNames.has(parameter.name)) fail('AMX3005', `Duplicate parameter '${parameter.name}'`, parameter.source);
          paramNames.add(parameter.name);
          paramScope.set(parameter.name, resolve(parameter.annotation));
        }
        const returnType = resolve(statement.returnType);
        if (bodyContainsForExpression(statement.body)) fail('AMX3003', 'Function bodies cannot contain a for expression', statement.body.source ?? statement.source);
        const outerBindings = bindings;
        bindings = paramScope;
        try {
          const actual = infer(statement.body, returnType);
          requireType(actual, returnType, statement.body.source ?? statement.source);
        } finally {
          bindings = outerBindings;
        }
        functions.set(statement.name, statement);
        if (statement.exported) exportedFunctions.set(statement.name, statement);
        return;
      }
      case 'variableDeclaration': {
        if (types.has(statement.name) || functions.has(statement.name)) fail('AMX3005', `Binding '${statement.name}' conflicts with a type or function`, statement.source);
        if (immutableNames.has(statement.name)) moduleError('AMX5002', `Cannot redeclare imported binding '${statement.name}'`, statement.source, file);
        const target = statement.annotation ? resolve(statement.annotation) : bindings.get(statement.name);
        const actual = infer(statement.expression, target);
        if (!target && actual.kind === 'null') fail('AMX3002', 'Null needs a nullable type annotation', statement.expression.source);
        if (target) requireType(actual, target, statement.expression.source ?? statement.source);
        const finalType = target ?? actual;
        bindings.set(statement.name, finalType);
        if (statement.exported) exportedBindings.set(statement.name, finalType);
        return;
      }
      case 'assignmentStatement': case 'compoundAssignmentStatement': {
        if (immutableNames.has(statement.name)) moduleError('AMX5002', `Cannot assign to imported binding '${statement.name}'`, statement.source, file);
        const target = bindings.get(statement.name);
        if (!target) fail('AMX3001', `Unknown identifier '${statement.name}'`, statement.source);
        if (statement.type === 'compoundAssignmentStatement') requireType(target!, named('Number'), statement.source);
        requireType(infer(statement.expression, target), target!, statement.expression.source ?? statement.source);
        return;
      }
      case 'forStatement': checkLoop(statement.variable, statement.iterable, statement.body, statement.source); return;
      case 'returnStatement': fail('AMX3003', 'Return outside expression loop', statement.source);
    }
  }

  let sawNonImport = false;
  for (const node of doc.nodes) {
    if (node.type !== 'executableCodeBlock') continue;
    for (const statement of node.statements) {
      if (statement.type === 'importDeclaration') {
        if (sawNonImport) fail('AMX3005', 'Import declarations must precede all other executable items', statement.source);
      } else {
        sawNonImport = true;
      }
      checkStatement(statement);
    }
  }

  return { exportedTypes, exportedFunctions, exportedBindings };
}