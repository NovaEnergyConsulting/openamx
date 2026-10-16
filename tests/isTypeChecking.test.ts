import { describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AmxError } from '../src/diagnostics/errors';
import type { OpenAmxDocument, VariableDeclarationNode } from '../src/ast/types';
import { parseDocumentText } from '../src/parser/parseDocument';
import { parseExpression } from '../src/parser/parseExpression';
import { sourceTokenRange } from '../src/editor/sourceRanges';
import { Environment } from '../src/runtime/environment';
import { evaluateDocument } from '../src/runtime/evaluateDocument';
import { evaluateExpression } from '../src/runtime/evaluateExpression';
import { loadEntryModule } from '../src/runtime/moduleLoader';
import { checkDocument } from '../src/typechecker/checkDocument';

function fixtureSource(id: string, body: string, file?: string): string {
  return `---\nfixture: ${id}${file ? `\nfile: ${file}` : ''}\n---\n\`\`\`amx\n${body}\n\`\`\`\n`;
}

function statements(document: OpenAmxDocument) {
  return document.nodes.flatMap(node => node.type === 'executableCodeBlock' ? node.statements : []);
}

function variable(document: OpenAmxDocument, name: string): VariableDeclarationNode {
  const declaration = statements(document).find(statement =>
    statement.type === 'variableDeclaration' && statement.name === name);
  if (!declaration || declaration.type !== 'variableDeclaration') {
    throw new Error(`Expected variable declaration '${name}'`);
  }
  return declaration;
}

function captureAmxError(action: () => unknown): AmxError {
  try {
    action();
  } catch (error) {
    if (error instanceof AmxError) return error;
    throw error;
  }
  throw new Error('Expected an AMX diagnostic');
}

function expectDiagnostic(
  source: string,
  code: string,
  message: string,
  line: number,
  column: number,
  token?: string
): void {
  const error = captureAmxError(() => {
    const document = parseDocumentText(source);
    checkDocument(document, 'is-type-checking.amx');
  });
  expect(error).toMatchObject({ code, message, line, column });
  if (token && typeof error.line === 'number' && typeof error.column === 'number') {
    const range = sourceTokenRange(source, { line: error.line, column: error.column }, token);
    expect(range).toBeDefined();
    if (!range) throw new Error(`Expected source range for '${token}'`);
    expect(source.slice(range.from, range.to)).toBe(token);
    expect(range.to - range.from).toBe(token.length);
  }
}

describe('Sprint 085 runtime is type checking', () => {
  it('implements every approved IS-VALID-01 result and runtime type family', () => {
    const source = fixtureSource('IS-VALID-01', `type Point {
  x: Number
}
type DetailedPoint {
  x: Number
  y: Number
}
type Note {
  text?: String?
}
type TextChild {
  label: String
}
type NumericChild {
  label: Number
}
type TextTree {
  child: TextChild
}
type NumericTree {
  child: NumericChild
}
enum State = {
  READY = 1,
  CLOSED = 2
}
enum OtherState = {
  STARTED = 1
}
dimension Length
dimension Time
dimension Dimensionless = Length / Length
unit meter: Length
unit centimeter = 0.01 * meter
unit second: Time
unit ratio = meter / meter
let primitiveMatch = 42 is Number
let primitiveMismatch = 42 is String
let detailed: DetailedPoint = DetailedPoint { x = 1, y = 2 }
let recordMatch = detailed is Point
let minimal: Point = Point { x = 1 }
let missingRequiredField = minimal is DetailedPoint
let absentNote: Note = Note {}
let absentFieldMatch = absentNote is Note
let presentNull: Note = Note { text = null }
let presentNullMatches = presentNull is Note
let nullableNull = null is String?
let nonNullableNull = null is String
let values: Number[] = [1, 2]
let allNumbers = values is Number[]
let nestedStrings: String[][] = [["x"]]
let nestedListMismatch = nestedStrings is Number[][]
let empty: Number[] = []
let emptyAnyList = empty is String[]
let enumMember = 1 is State
let enumNonMember = 9 is State
let enumOverlap = 1 is State and 1 is OtherState
let nestedTextTree: TextTree = TextTree { child = TextChild { label = "x" } }
let nestedRecordMismatch = nestedTextTree is NumericTree
let longDistance: Length = 1 meter
let shortDistance: Length = 100 centimeter
let measurementMatch = shortDistance is Length
let measurementMismatch = shortDistance is Time
let dimensionlessMeasurement = 2 ratio
let dimensionlessMatches = dimensionlessMeasurement is Dimensionless
let numberDoesNotMatchDimensionless = 2 is Dimensionless`);
    const document = parseDocumentText(source);
    const checked = checkDocument(document, 'is-type-checking.amx');
    expect(checked.bindingTypes.get('primitiveMatch')).toEqual({ kind: 'named', name: 'Boolean' });

    const values = evaluateDocument(document, 'is-type-checking.amx');
    expect(values).toMatchObject({
      primitiveMatch: true,
      primitiveMismatch: false,
      recordMatch: true,
      missingRequiredField: false,
      nullableNull: true,
      nonNullableNull: false,
      absentFieldMatch: true,
      presentNullMatches: true,
      allNumbers: true,
      emptyAnyList: true,
      nestedListMismatch: false,
      enumMember: true,
      enumNonMember: false,
      enumOverlap: true,
      nestedRecordMismatch: false,
      measurementMatch: true,
      measurementMismatch: false,
      dimensionlessMatches: true,
      numberDoesNotMatchDimensionless: false
    });

    const supplemental = evaluateDocument(parseDocumentText(fixtureSource('IS-PRIMITIVE-EDGE-01', `enum Label = {
  ACTIVE = "active",
  CLOSED = "closed"
}
let booleanMatch = true is Boolean
let booleanMismatch = 1 is Boolean
let dateTimeMatch = "2020-01-02T03:04:05Z" is DateTime
let dateTimeMismatch = "not a date" is DateTime
let stringEnumMatch = "active" is Label
let stringEnumMismatch = "other" is Label
let nullableElements: Number?[] = [null, 2]
let nullableElementList = nullableElements is Number?[]
let nullableList: Number[]? = null
let nullableListMatch = nullableList is Number[]?`)));
    expect(supplemental).toMatchObject({
      booleanMatch: true,
      booleanMismatch: false,
      dateTimeMatch: true,
      dateTimeMismatch: false,
      stringEnumMatch: true,
      stringEnumMismatch: false,
      nullableElementList: true,
      nullableListMatch: true
    });

    const functionEnumValues = evaluateDocument(parseDocumentText(fixtureSource('IS-FUNCTION-ENUM-01', `enum State = {
  READY = 1,
  CLOSED = 2
}
fn isReady(value: Number): Boolean = value is State
let member = isReady(1)
let nonMember = isReady(3)`)));
    expect(functionEnumValues).toMatchObject({ member: true, nonMember: false });

    const absentFieldDocument = parseDocumentText(fixtureSource('IS-OPTIONAL-ABSENT-RUNTIME-01', `type OptionalNote {
  text?: String?
}`));
    const note = statements(absentFieldDocument).find(statement => statement.type === 'typeDeclaration');
    if (!note || note.type !== 'typeDeclaration') throw new Error('Expected OptionalNote declaration');
    checkDocument(absentFieldDocument, 'is-type-checking.amx');
    const environment = new Environment(new Map([['OptionalNote', note]]));
    const predicate = parseExpression('candidate is OptionalNote');
    environment.set('candidate', {});
    expect(evaluateExpression(predicate, environment)).toBe(true);
    environment.set('candidate', { text: null });
    expect(evaluateExpression(predicate, environment)).toBe(true);
    environment.set('candidate', { text: 'present', additional: 1 });
    expect(evaluateExpression(predicate, environment)).toBe(true);
    environment.set('candidate', { text: 1 });
    expect(evaluateExpression(predicate, environment)).toBe(false);
  });

  it('parses and evaluates all IS-PREC-01 precedence cases', () => {
    const document = parseDocumentText(fixtureSource('IS-PREC-01', `dimension Length
unit meter: Length
let arithmetic = 1 + 2 * 3 is Number
let conversion = 1 meter in meter is Length
let comparison = 1 + 2 * 3 > 6 is Boolean
let logical = 1 + 2 * 3 is Number and true
let conditional = if 1 + 2 * 3 is Number then true else false`));
    expect(variable(document, 'arithmetic').expression).toMatchObject({
      type: 'typeTestExpression',
      value: {
        type: 'binaryExpression',
        operator: '+',
        right: { type: 'binaryExpression', operator: '*' }
      },
      target: { type: 'namedType', name: 'Number' }
    });
    expect(variable(document, 'conversion').expression).toMatchObject({
      type: 'typeTestExpression',
      value: { type: 'measurementConversion', unit: 'meter' },
      target: { type: 'namedType', name: 'Length' }
    });
    expect(variable(document, 'comparison').expression).toMatchObject({
      type: 'typeTestExpression',
      value: { type: 'binaryExpression', operator: '>' },
      target: { type: 'namedType', name: 'Boolean' }
    });
    expect(variable(document, 'logical').expression).toMatchObject({
      type: 'binaryExpression',
      operator: 'and',
      left: { type: 'typeTestExpression' }
    });
    expect(variable(document, 'conditional').expression).toMatchObject({
      type: 'conditionalExpression',
      test: { type: 'typeTestExpression' }
    });
    expect(evaluateDocument(document, 'is-type-checking.amx')).toMatchObject({
      arithmetic: true,
      conversion: true,
      comparison: true,
      logical: true,
      conditional: true
    });
    expect(parseExpression('is')).toMatchObject({ type: 'identifier', name: 'is' });
  });

  it('parses IS-CHAIN-01 left-associatively and checks it ordinarily', () => {
    const document = parseDocumentText(fixtureSource('IS-CHAIN-01', 'let result = 1 is Number == true'));
    expect(variable(document, 'result').expression).toMatchObject({
      type: 'binaryExpression',
      operator: '==',
      left: { type: 'typeTestExpression', target: { type: 'namedType', name: 'Number' } },
      right: { type: 'booleanLiteral', value: true }
    });
    expect(evaluateDocument(document, 'is-type-checking.amx').result).toBe(true);
  });

  it('reports IS-SYNTAX-01 at the missing target position', () => {
    expectDiagnostic(
      fixtureSource('IS-SYNTAX-01', 'let result = 1 is'),
      'AMX3006',
      "Expected target type after 'is'",
      5,
      18
    );
  });

  it('reports IS-SYNTAX-SUFFIX-01 at the invalid suffix', () => {
    expectDiagnostic(
      fixtureSource('IS-SYNTAX-SUFFIX-01', 'let result = 42 is Number??'),
      'AMX3006',
      "Invalid type suffix in 'is' target",
      5,
      27,
      '?'
    );
  });

  it('reports IS-TARGET-UNKNOWN-01 at the unknown target type', () => {
    expectDiagnostic(
      fixtureSource('IS-TARGET-UNKNOWN-01', 'let result = 1 is Missing'),
      'AMX3001',
      "Unknown type 'Missing'",
      5,
      19,
      'Missing'
    );
  });

  it('reports IS-TARGET-NONTYPE-01 when a value name is used as a type', () => {
    expectDiagnostic(
      fixtureSource('IS-TARGET-NONTYPE-01', `let candidate = 1
let result = 1 is candidate`),
      'AMX3001',
      "Unknown type 'candidate'",
      6,
      19,
      'candidate'
    );
  });

  it('reports IS-TARGET-FORWARD-01 for a forward target type', () => {
    expectDiagnostic(
      fixtureSource('IS-TARGET-FORWARD-01', `let result = 1 is Later
type Later {
  value: Number
}`),
      'AMX3001',
      "Unknown type 'Later'",
      5,
      19,
      'Later'
    );
  });

  it('resolves and evaluates the visible imported target in IS-TARGET-IMPORT-01', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-is-import-'));
    try {
      const libraryPath = join(directory, 'library.amx');
      const entryPath = join(directory, 'entry.amx');
      await Bun.write(libraryPath, `---\nfile: library.amx\n---\n\`\`\`amx\nexport type Point {\n  x: Number\n}\n\`\`\`\n`);
      await Bun.write(entryPath, fixtureSource('IS-TARGET-IMPORT-01', `import { Point } from "./library.amx"
let value = Point { x = 1 }
let result = value is Point`, 'entry.amx'));
      const loaded = await loadEntryModule(entryPath);
      expect(loaded.env.get('result')).toBe(true);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('preserves IS-TARGET-UNICODE-UTF16-01 and CRLF source positions', () => {
    const unicode = fixtureSource('IS-TARGET-UNICODE-UTF16-01', 'let result = "🙂" is Missing');
    const crlf = fixtureSource('IS-TARGET-UNKNOWN-01', 'let result = 1 is Missing').replace(/\n/g, '\r\n');
    for (const source of [unicode, crlf]) {
      const error = captureAmxError(() => checkDocument(parseDocumentText(source), 'is-type-checking.amx'));
      expect(error).toMatchObject({
        code: 'AMX3001',
        message: "Unknown type 'Missing'",
        line: 5,
        column: source === unicode ? 22 : 19
      });
      if (typeof error.line === 'number' && typeof error.column === 'number') {
        const range = sourceTokenRange(source, { line: error.line, column: error.column }, 'Missing');
        expect(range).toBeDefined();
        if (!range) throw new Error('Expected source range for Missing');
        expect(source.slice(range.from, range.to)).toBe('Missing');
        expect(range.to - range.from).toBe(7);
      }
    }
  });

  it('does not narrow the tested nullable value in IS-NARROW-01', () => {
    expectDiagnostic(
      fixtureSource('IS-NARROW-01', `let maybe: String? = null
if maybe is String {
  let value: String = maybe
}`),
      'AMX3002',
      'Expected String, got String?',
      7,
      23,
      'maybe'
    );
  });
});
