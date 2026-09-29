import { afterEach, describe, expect, it } from 'bun:test';
import { rm } from 'fs/promises';
import { TypeDeclarationNode } from '../src/ast/types';
import { AmxError } from '../src/diagnostics/errors';
import { parseStatements } from '../src/parser/parseStatements';
import { Environment } from '../src/runtime/environment';
import { prepareOutputs, serializeOutputs } from '../src/runtime/outputData';
import type { CheckedType } from '../src/typechecker/checkDocument';

const directories: string[] = [];

async function outputDirectory(): Promise<string> {
  const directory = `./openamx-output-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await Bun.write(`${directory}/.keep`, '');
  directories.push(directory);
  return directory;
}

afterEach(async () => {
  for (const directory of directories) await rm(directory, { recursive: true, force: true });
  directories.length = 0;
});

function types(source: string): Map<string, TypeDeclarationNode> {
  return new Map(parseStatements(source)
    .filter((statement): statement is TypeDeclarationNode => statement.type === 'typeDeclaration')
    .map(declaration => [declaration.name, declaration]));
}

function captureError(action: () => unknown, code: string): AmxError {
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(AmxError);
    expect((error as AmxError).code).toBe(code);
    return error as AmxError;
  }
  throw new Error(`Expected ${code} but no error was thrown`);
}

describe('Sprint 017 output serialization', () => {
  it('writes deterministic JSON with declaration-order fields, DateTime, null, and final LF', () => {
    const recordTypes = types('type Item {\n  label: String\n  created: DateTime\n  note: String?\n  values: Number[]\n}');
    const environment = new Environment(recordTypes);
    environment.set('items', [{ label: 'A', created: '2026-09-29T12:00:00Z', note: null, values: [1, 2] }]);
    const itemType: CheckedType = { kind: 'list', element: { kind: 'named', name: 'Item' } };
    const outputs = prepareOutputs(['items=items.json'], new Map([['items', itemType]]), recordTypes);
    const [serialized] = serializeOutputs(outputs, environment);
    expect(serialized.contents).toBe('[\n  {\n    "label": "A",\n    "created": "2026-09-29T12:00:00Z",\n    "note": null,\n    "values": [\n      1,\n      2\n    ]\n  }\n]\n');
  });

  it('writes declaration-order CSV headers and preserves null versus quoted empty strings', () => {
    const recordTypes = types('type Row {\n  title: String\n  note: String?\n  amount: Number\n}');
    const environment = new Environment(recordTypes);
    environment.set('rows', [
      { title: 'North, station', note: null, amount: 2 },
      { title: '', note: '', amount: 3 },
      { title: ' leading ', note: 'say "hi"\nnext', amount: 4 }
    ]);
    const rowType: CheckedType = { kind: 'list', element: { kind: 'named', name: 'Row' } };
    const outputs = prepareOutputs(['rows=rows.csv'], new Map([['rows', rowType]]), recordTypes);
    expect(serializeOutputs(outputs, environment)[0].contents).toBe('title,note,amount\n"North, station",,2\n"","",3\n" leading ","say ""hi""\nnext",4\n');
  });

  it('emits declared CSV headers for empty record lists and rejects unsupported shapes', () => {
    const recordTypes = types('type Row {\n  title: String\n}');
    const rowType: CheckedType = { kind: 'list', element: { kind: 'named', name: 'Row' } };
    const environment = new Environment(recordTypes);
    environment.set('rows', []);
    const empty = prepareOutputs(['rows=rows.csv'], new Map([['rows', rowType]]), recordTypes);
    expect(serializeOutputs(empty, environment)[0].contents).toBe('title\n');
    captureError(() => prepareOutputs(['rows=rows.csv'], new Map([['rows', { kind: 'named', name: 'Row' }]]), recordTypes), 'AMX6001');
    captureError(() => prepareOutputs(['rows=rows.json'], new Map([['rows', rowType]]), new Map()), 'AMX6001');
    const nestedTypes = types('type Inner {\n  value: String\n}\ntype Outer {\n  inner: Inner\n}');
    const nestedList: CheckedType = { kind: 'list', element: { kind: 'named', name: 'Outer' } };
    captureError(() => prepareOutputs(['rows=rows.csv'], new Map([['rows', nestedList]]), nestedTypes), 'AMX6001');
  });

  it('rejects non-finite JSON values and verifies mappings and render path conflicts', async () => {
    const recordTypes = new Map<string, TypeDeclarationNode>();
    const number: CheckedType = { kind: 'named', name: 'Number' };
    const environment = new Environment(recordTypes);
    environment.set('value', Infinity);
    const outputs = prepareOutputs(['value=value.json'], new Map([['value', number]]), recordTypes);
    captureError(() => serializeOutputs(outputs, environment), 'AMX6002');
    await outputDirectory();
    captureError(() => prepareOutputs(['value=a.json', 'other=./a.json'], new Map([['value', number], ['other', number]]), recordTypes), 'AMX6001');
    captureError(() => prepareOutputs(['value=a.json'], new Map([['value', number]]), recordTypes, 'a.json'), 'AMX6001');
    captureError(() => prepareOutputs(['value=a.JSON'], new Map([['value', number]]), recordTypes), 'AMX6001');
  });
});