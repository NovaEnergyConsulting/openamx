import { afterEach, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import * as path from 'path';
import { InputDeclarationNode, TypeDeclarationNode } from '../src/ast/types';
import { AmxError } from '../src/diagnostics/errors';
import { parseStatements } from '../src/parser/parseStatements';
import { loadInputValues } from '../src/runtime/inputData';

let directory = '';

async function createInput(source: string, filename: string, contents: string | Uint8Array, mode: 'aggregate' | 'fail-fast' = 'aggregate') {
  directory = await mkdtemp(path.join(tmpdir(), 'openamx-input-'));
  const filePath = path.join(directory, filename);
  await Bun.write(filePath, contents);
  const statements = parseStatements(source);
  const declarations = statements.filter((statement): statement is InputDeclarationNode => statement.type === 'inputDeclaration');
  const types = new Map(statements.filter((statement): statement is TypeDeclarationNode => statement.type === 'typeDeclaration').map(type => [type.name, type]));
  return loadInputValues(declarations, types, [`${declarations[0]?.name}=${filePath}`], mode, 'entry.amx');
}

afterEach(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
  directory = '';
});

async function captureError(promise: Promise<unknown>): Promise<AmxError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(AmxError);
    return error as AmxError;
  }
  throw new Error('Expected input validation to fail');
}

describe('Sprint 016 JSON input conversion', () => {
  it('materializes nested records, nullable omissions, declaration order, and fresh defaults', async () => {
    const values = await createInput(
      'type Detail {\n  count: Number\n}\ntype Asset {\n  id: String\n  detail: Detail\n  note?: String?\n  tags: String[] = []\n}\ninput assets: Asset[]',
      'assets.json',
      '[{"detail":{"count":2},"id":"A"},{"id":"B","detail":{"count":3}}]'
    );
    const assets = values.get('assets') as Array<Record<string, any>>;
    expect(assets).toEqual([
      { id: 'A', detail: { count: 2 }, note: null, tags: [] },
      { id: 'B', detail: { count: 3 }, note: null, tags: [] }
    ]);
    expect(Object.keys(assets[0])).toEqual(['id', 'detail', 'note', 'tags']);
    expect(assets[0].tags).not.toBe(assets[1].tags);
  });

  it('rejects duplicate keys with pointer and data coordinates', async () => {
    const error = await captureError(createInput(
      'type Item {\n  id: Number\n}\ninput items: Item[]',
      'items.json',
      '[{\n"id": 1, "id": 2\n}]'
    ));
    expect(error.code).toBe('AMX4003');
    expect(error.diagnostics?.[0]).toMatchObject({ dataPath: '/0/id', dataLine: 2, inputName: 'items', dataFile: expect.any(String) });
  });

  it('preserves field declaration order for aggregates and shares traversal with fail-fast', async () => {
    const source = 'type Item {\n  first: Number\n  second: Boolean\n}\ninput items: Item[]';
    const json = '[{"second":"bad","first":"bad"},{"second":2,"first":false}]';
    const aggregate = await captureError(createInput(source, 'aggregate.json', json));
    expect(aggregate.diagnostics?.map(item => item.dataPath)).toEqual(['/0/first', '/0/second', '/1/first', '/1/second']);
    expect(aggregate.diagnostics?.[0]).toMatchObject({ declarationSource: { line: 5 }, fieldSource: { line: 2 } });
    const first = await captureError(createInput(source, 'fail-fast.json', json, 'fail-fast'));
    expect(first.diagnostics).toHaveLength(1);
    expect(first.diagnostics?.[0].dataPath).toBe('/0/first');
  });

  it('rejects malformed JSON and invalid DateTime values with distinct diagnostic families', async () => {
    const malformed = await captureError(createInput('input value: Number', 'invalid.json', '{'));
    expect(malformed.code).toBe('AMX4002');
    const date = await captureError(createInput('input value: DateTime', 'date.json', '"2023-02-29T12:00:00Z"'));
    expect(date.code).toBe('AMX4003');
    const nullable = await createInput('input value: Number?', 'null.json', 'null');
    expect(nullable.get('value')).toBeNull();
    const scalar = await createInput('input value: Number', 'scalar.json', '12.5');
    expect(scalar.get('value')).toBe(12.5);
    const invalidUtf8 = await captureError(createInput('input value: Number', 'invalid-utf8.json', new Uint8Array([0xff])));
    expect(invalidUtf8.code).toBe('AMX4002');
    const invalidDefault = await captureError(createInput(
      'type Item {\n  amount: Number = 1 / 0\n}\ninput item: Item',
      'default.json',
      '{}'
    ));
    expect(invalidDefault.diagnostics?.[0]).toMatchObject({ code: 'AMX4003', dataPath: '/amount' });
  });
});

describe('Sprint 016 CSV input conversion', () => {
  it('handles BOM, CRLF, quoted commas/newlines, nullable blanks, quoted empty strings, and conversions', async () => {
    const values = await createInput(
      'type Row {\n  name: String\n  amount: Number\n  optional: Number?\n  label: String\n}\ninput rows: Row[]',
      'rows.csv',
      '\ufefflabel,optional,name,amount\r\n"",,"North,\nStation",2.5\r\n'
    );
    expect(values.get('rows')).toEqual([{ name: 'North,\nStation', amount: 2.5, optional: null, label: '' }]);
  });

  it('aggregates scalar conversion and row-width failures, and rejects nested CSV shapes', async () => {
    const error = await captureError(createInput(
      'type Row {\n  amount: Number\n  active: Boolean\n}\ninput rows: Row[]',
      'bad.csv',
      'active,amount\nTRUE,nope,extra\n'
    ));
    expect(error.diagnostics?.map(item => item.code)).toEqual(['AMX4003', 'AMX4003', 'AMX4003']);
    expect(error.diagnostics?.map(item => item.dataPath)).toEqual(['record[1]', 'record[1].amount', 'record[1].active']);

    const nested = await captureError(createInput(
      'type Inner {\n  name: String\n}\ntype Outer {\n  inner: Inner\n}\ninput rows: Outer[]',
      'nested.csv',
      'inner\n{}\n'
    ));
    expect(nested.code).toBe('AMX4003');
  });

  it('validates header names, omitted defaults, RFC separators, and quoted empty scalar cells', async () => {
    const defaulted = await createInput(
      'type Row {\n  id: String\n  count: Number = 4\n  maybe?: Number?\n}\ninput rows: Row[]',
      'defaults.csv',
      'id\nA\n'
    );
    expect(defaulted.get('rows')).toEqual([{ id: 'A', count: 4, maybe: null }]);

    const headerError = await captureError(createInput(
      'type Row {\n  id: String\n  count: Number\n}\ninput rows: Row[]',
      'headers.csv',
      'id,id,unknown\nA,A,x\n'
    ));
    expect(headerError.diagnostics?.some(item => item.message.includes('Duplicate CSV header'))).toBe(true);
    expect(headerError.diagnostics?.some(item => item.message.includes('Unknown CSV header'))).toBe(true);
    expect(headerError.diagnostics?.some(item => item.message.includes('missing required field'))).toBe(true);

    const quotedNumber = await captureError(createInput(
      'type Row {\n  count: Number\n}\ninput rows: Row[]',
      'quoted.csv',
      'count\n""\n'
    ));
    expect(quotedNumber.diagnostics?.[0].message).toContain('Quoted empty');

    const bareCarriageReturn = await captureError(createInput(
      'type Row {\n  id: String\n}\ninput rows: Row[]',
      'bare-cr.csv',
      'id\rA\n'
    ));
    expect(bareCarriageReturn.code).toBe('AMX4002');
  });
});