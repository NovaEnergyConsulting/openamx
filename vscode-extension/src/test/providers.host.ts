import * as assert from 'assert';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { INITIAL, Registry } from 'vscode-textmate';
import { loadWASM, OnigScanner, OnigString } from 'vscode-oniguruma';
import { parseDocumentText } from '../../../src/parser/parseDocument';
import { declarationRange, tokenRange } from '../providers/symbolRanges';

suite('OpenAMX providers', () => {
  test('rejects an in-root symlink import without a fabricated definition', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'openamx-navigation-link-'));
    const entryPath = path.join(directory, 'entry.amx');
    await fs.writeFile(path.join(directory, 'real.amx'), '```amx\nexport let value = 2\n```');
    await fs.symlink('real.amx', path.join(directory, 'alias.amx'));
    await fs.writeFile(entryPath, '```amx\nimport { value } from "./alias.amx"\nlet result = value\n```');
    try {
      const entry = await vscode.workspace.openTextDocument(vscode.Uri.file(entryPath));
      await vscode.window.showTextDocument(entry);
      assert.equal((await waitForDiagnostics(entry.uri, true))[0].code, 'AMX5001');
      const definition = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeDefinitionProvider', entry.uri, new vscode.Position(2, 14)
      );
      assert.equal(definition?.length ?? 0, 0);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });
  test('outlines original record fields and withholds duplicate symbol targets', async () => {
    const document = await vscode.workspace.openTextDocument({ language: 'amx', content: [
      '😀 narrative', '```amx', 'type Asset {', 'name: String', '}',
      'let first: Asset = Asset { name = "one" }', '```'
    ].join('\r\n') });
    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider', document.uri
    );
    assert.equal(symbols?.[0].name, 'Asset');
    assert.deepEqual(symbols[0].selectionRange, new vscode.Range(2, 5, 2, 10));
    assert.deepEqual(symbols[0].children[0].selectionRange, new vscode.Range(3, 0, 3, 4));
    const typeUse = await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeDefinitionProvider', document.uri, new vscode.Position(5, 11)
    );
    assert.deepEqual(typeUse?.[0].range, symbols[0].selectionRange);

    const ambiguous = await vscode.workspace.openTextDocument({ language: 'amx', content:
      '```amx\nlet repeat = 1\nlet repeat = 2\nlet result = repeat\n```' });
    const definition = await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeDefinitionProvider', ambiguous.uri, new vscode.Position(3, 16)
    );
    assert.equal(definition?.length ?? 0, 0);
  });
  test('withholds cyclic targets and shadowed loop uses', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'openamx-navigation-cycle-'));
    const entryPath = path.join(directory, 'entry.amx');
    const dependencyPath = path.join(directory, 'dependency.amx');
    await fs.writeFile(entryPath, '```amx\nimport { other } from "./dependency.amx"\nlet item = 1\nlet result = for item in [2] {\n  return item\n}\n```');
    await fs.writeFile(dependencyPath, '```amx\nimport { item } from "./entry.amx"\nexport let other = 2\n```');
    try {
      const entry = await vscode.workspace.openTextDocument(vscode.Uri.file(entryPath));
      await vscode.window.showTextDocument(entry);
      assert.equal((await waitForDiagnostics(vscode.Uri.file(dependencyPath), true))[0].code, 'AMX5003');
      const cycle = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeDefinitionProvider', entry.uri, new vscode.Position(1, 10)
      );
      assert.equal(cycle?.length ?? 0, 0);
      const loop = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeDefinitionProvider', entry.uri, new vscode.Position(4, 10)
      );
      assert.equal(loop?.length ?? 0, 0);
      const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider', entry.uri
      );
      assert.ok(symbols?.some(item => item.name === 'item'));
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });
  test('offers only a current diagnostic-grounded unique show edit', async () => {
    const document = await vscode.workspace.openTextDocument({ language: 'amx', content: [
      '```amx', 'type Item {', 'name: String', '}', 'let rows: Item[] = []',
      'table report = table(rows) {', 'title: "Report"', 'column name as "Name"', '}', 'show reprot', '```'
    ].join('\n') });
    await vscode.window.showTextDocument(document);
    const diagnostics = await waitForDiagnostics(document.uri, true);
    assert.equal(diagnostics[0].code, 'AMX3001');
    const position = new vscode.Range(9, 5, 9, 11);
    const actions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
      'vscode.executeCodeActionProvider', document.uri, position, vscode.CodeActionKind.QuickFix.value, 10
    );
    const action = actions?.find(item => item.title === "Use visible view 'report'");
    assert.ok(action?.edit);
    assert.equal(action.edit.get(document.uri)[0].newText, 'report');
    assert.equal(document.getText(position), 'reprot');
    const change = new vscode.WorkspaceEdit();
    change.replace(document.uri, position, 'report');
    assert.ok(await vscode.workspace.applyEdit(change));
    assert.equal((await waitForDiagnostics(document.uri, false)).length, 0);
    const stale = await vscode.commands.executeCommand<vscode.CodeAction[]>(
      'vscode.executeCodeActionProvider', document.uri, position, vscode.CodeActionKind.QuickFix.value
    );
    assert.ok(!stale?.some(item => item.title === action.title));
  });
  test('navigates only parsed tokens and explicitly exported unsaved imports', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'openamx-navigation-'));
    const dependencyPath = path.join(directory, 'model.amx');
    const entryPath = path.join(directory, 'entry.amx');
    await fs.writeFile(dependencyPath, '```amx\nexport let stale = 1\n```');
    await fs.writeFile(entryPath, '```amx\nimport { fresh } from "./model.amx"\nlet result = fresh\n```');
    try {
      const dependency = await vscode.workspace.openTextDocument(vscode.Uri.file(dependencyPath));
      const edit = new vscode.WorkspaceEdit();
      edit.replace(dependency.uri, new vscode.Range(0, 0, dependency.lineCount, 0), '😀\r\n```amx\r\nexport let fresh: Number = 2\r\n```');
      assert.ok(await vscode.workspace.applyEdit(edit));
      const entry = await vscode.workspace.openTextDocument(vscode.Uri.file(entryPath));
      const definition = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeDefinitionProvider', entry.uri, new vscode.Position(2, 14)
      );
      assert.equal(definition?.length, 1);
      assert.equal(definition[0].uri.fsPath, dependencyPath);
      assert.deepEqual(definition[0].range, new vscode.Range(2, 11, 2, 16));
      const hover = await vscode.commands.executeCommand<vscode.Hover[]>(
        'vscode.executeHoverProvider', entry.uri, new vscode.Position(2, 14)
      );
      assert.ok(hover?.length);
      const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider', dependency.uri
      );
      assert.equal(symbols?.[0].name, 'fresh');
      assert.deepEqual(symbols[0].selectionRange, definition[0].range);
      const refs = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeReferenceProvider', entry.uri, new vscode.Position(2, 14)
      );
      assert.equal(refs?.length, 3);
      const inert = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeDefinitionProvider', dependency.uri, new vscode.Position(0, 1)
      );
      assert.equal(inert?.length ?? 0, 0);
      const replacement = new vscode.WorkspaceEdit();
      replacement.replace(dependency.uri, new vscode.Range(2, 11, 2, 16), 'renamed');
      assert.ok(await vscode.workspace.applyEdit(replacement));
      const missing = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeDefinitionProvider', entry.uri, new vscode.Position(2, 14)
      );
      assert.equal(missing?.length ?? 0, 0);
      assert.equal((await waitForDiagnostics(entry.uri, true))[0].code, 'AMX5002');
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });
  test('resolves imported dimension and unit symbols to their declaring module', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'openamx-measurement-navigation-'));
    const unitsPath = path.join(directory, 'units.amx');
    const entryPath = path.join(directory, 'entry.amx');
    const unitsText = '```amx\nexport dimension Length\nexport unit meter: Length\n```';
    const entryText = [
      '```amx',
      'import { Length, meter } from "./units.amx"',
      'dimension Distance = Length',
      'let distance: Length = 1 meter',
      'let converted = distance in meter',
      '```'
    ].join('\n');
    await fs.writeFile(unitsPath, unitsText);
    await fs.writeFile(entryPath, entryText);
    try {
      const entry = await vscode.workspace.openTextDocument(vscode.Uri.file(entryPath));
      const lengthOffset = entryText.lastIndexOf('Length');
      const meterOffset = entryText.lastIndexOf('meter');
      const lengthDefinition = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeDefinitionProvider', entry.uri, entry.positionAt(lengthOffset)
      );
      const meterDefinition = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeDefinitionProvider', entry.uri, entry.positionAt(meterOffset)
      );

      assert.equal(lengthDefinition?.[0].uri.fsPath, unitsPath);
      assert.deepEqual(lengthDefinition?.[0].range, new vscode.Range(1, 17, 1, 23));
      assert.equal(meterDefinition?.[0].uri.fsPath, unitsPath);
      assert.deepEqual(meterDefinition?.[0].range, new vscode.Range(2, 12, 2, 17));
      assert.equal((await vscode.commands.executeCommand<vscode.Hover[]>(
        'vscode.executeHoverProvider', entry.uri, entry.positionAt(meterOffset)
      ))?.length, 1);
      assert.equal((await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeReferenceProvider', entry.uri, entry.positionAt(meterOffset)
      ))?.length, 4);
      const rename = await vscode.commands.executeCommand<vscode.WorkspaceEdit | undefined>(
        'vscode.executeDocumentRenameProvider', entry.uri, entry.positionAt(meterOffset), 'metre'
      );
      assert.ok(rename);
      assert.equal(rename.get(entry.uri).length, 3);
      assert.equal(rename.get(vscode.Uri.file(unitsPath)).length, 1);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });
  test('renames only a proven symbol identity and withholds collisions', async () => {
    const document = await vscode.workspace.openTextDocument({ language: 'amx', content: [
      '```amx', 'let amount: Number = 2', 'let result: Number = amount + amount', '```'
    ].join('\n') });
    await vscode.window.showTextDocument(document);
    const definition = await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeDefinitionProvider', document.uri, new vscode.Position(1, 5)
    );
    assert.equal(definition?.length, 1);
    const prepared = await vscode.commands.executeCommand<{ range: vscode.Range; placeholder: string }>(
      'vscode.prepareRename', document.uri, new vscode.Position(1, 5)
    );
    assert.equal(prepared?.placeholder, 'amount');
    const rename = await vscode.commands.executeCommand<vscode.WorkspaceEdit | undefined>(
      'vscode.executeDocumentRenameProvider', document.uri, new vscode.Position(1, 5), 'score'
    );
    assert.ok(rename);
    const edits = rename.get(document.uri);
    assert.equal(edits.length, 3);
    assert.ok(edits.every(edit => edit.newText === 'score'));

    const collision = await vscode.workspace.openTextDocument({ language: 'amx', content: [
      '```amx', 'let amount: Number = 2', 'let score: Number = 3', 'let result = amount', '```'
    ].join('\n') });
    await vscode.window.showTextDocument(collision);
    let collisionWithheld = false;
    try {
      await vscode.commands.executeCommand<vscode.WorkspaceEdit | undefined>(
        'vscode.executeDocumentRenameProvider', collision.uri, new vscode.Position(1, 5), 'score'
      );
    } catch (error) {
      collisionWithheld = error instanceof Error && error.message.includes('No result');
    }
    assert.equal(collisionWithheld, true);
  });
  test('locates original UTF-16 tokens in CRLF and unsaved dependency text', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'openamx-symbol-range-'));
    const dependencyPath = path.join(directory, 'dependency.amx');
    await fs.writeFile(dependencyPath, '```amx\nexport let stale = 1\n```');
    try {
      const dependency = await vscode.workspace.openTextDocument(vscode.Uri.file(dependencyPath));
      const text = '😀 intro\r\n```amx\r\nexport let fresh: Number = 2\r\n```';
      const edit = new vscode.WorkspaceEdit();
      edit.replace(dependency.uri, new vscode.Range(0, 0, dependency.lineCount, 0), text);
      assert.ok(await vscode.workspace.applyEdit(edit));
      const statement = parseDocumentText(dependency.getText()).nodes[1];
      assert.equal(statement.type, 'executableCodeBlock');
      if (statement.type !== 'executableCodeBlock') return;
      assert.deepEqual(declarationRange(dependency, statement.statements[0]), new vscode.Range(2, 11, 2, 16));
      assert.deepEqual(tokenRange(dependency, { line: 3, column: 12 }, 'fresh'), new vscode.Range(2, 11, 2, 16));
      assert.equal(tokenRange(dependency, { line: 3, column: 12 }, 'stale'), undefined);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });
  setup(async () => {
    const extension = vscode.extensions.getExtension('EngineersTools.openamx-vscode');
    assert.ok(extension, 'OpenAMX extension should be available in the test host');
    await extension.activate();
  });

  test('formats only executable block contents and is idempotent', async () => {
    const original = 'Before\r\n```amx\r\n  let total = 2   \r\n\r\n```\r\n```js\r\nlet untouched=1\r\n```\r\nAfter\r\n';
    const samplePath = path.join(os.tmpdir(), `openamx-provider-${process.pid}.amx`);
    await fs.writeFile(samplePath, original, 'utf8');
    try {
      const document = await vscode.workspace.openTextDocument(vscode.Uri.file(samplePath));
      assert.equal(document.languageId, 'amx');
      const edits = await vscode.commands.executeCommand<vscode.TextEdit[]>(
        'vscode.executeFormatDocumentProvider', document.uri, { tabSize: 2, insertSpaces: true }
      );
      assert.ok(edits && edits.length > 0);

      const workspaceEdit = new vscode.WorkspaceEdit();
      workspaceEdit.set(document.uri, edits);
      assert.ok(await vscode.workspace.applyEdit(workspaceEdit));
      assert.equal(document.getText(), 'Before\r\n```amx\r\nlet total = 2\r\n```\r\n```js\r\nlet untouched=1\r\n```\r\nAfter\r\n');

      const secondPass = await vscode.commands.executeCommand<vscode.TextEdit[]>(
        'vscode.executeFormatDocumentProvider', document.uri, { tabSize: 2, insertSpaces: true }
      );
      assert.equal(secondPass?.length ?? 0, 0);
    } finally {
      await fs.unlink(samplePath).catch(() => undefined);
    }
  });

  test('formats V0.3 type and constructor layout without changing surrounding Markdown or V0.2 fences', async () => {
    const original = [
      '---',
      'title: V0.3 formatter',
      '---',
      'Front matter stays as-is',
      '```amx',
      'type Asset {',
      'name: String',
      '}',
      'let asset: Asset = Asset { name = "pump" }',
      '```',
      '```amx',
      'let legacy = 2',
      '```',
      '```text',
      'let untouched=3',
      '```'
    ].join('\n');
    const document = await vscode.workspace.openTextDocument({ language: 'amx', content: original });
    const edits = await vscode.commands.executeCommand<vscode.TextEdit[]>(
      'vscode.executeFormatDocumentProvider', document.uri, { tabSize: 2, insertSpaces: true }
    );
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.set(document.uri, edits ?? []);
    assert.ok(await vscode.workspace.applyEdit(workspaceEdit));
    assert.equal(document.getText(), [
      '---',
      'title: V0.3 formatter',
      '---',
      'Front matter stays as-is',
      '```amx',
      'type Asset {',
      '  name: String',
      '}',
      'let asset: Asset = Asset { name = "pump" }',
      '```',
      '```amx',
      'let legacy = 2',
      '```',
      '```text',
      'let untouched=3',
      '```'
    ].join('\n'));

    const secondPass = await vscode.commands.executeCommand<vscode.TextEdit[]>(
      'vscode.executeFormatDocumentProvider', document.uri, { tabSize: 2, insertSpaces: true }
    );
    assert.equal(secondPass?.length ?? 0, 0);
  });

  test('completes keywords, functions, preceding variables, and the active loop iterator only in amx blocks', async () => {
    const content = [
      '```amx',
      'let earlier = 2',
      '```',
      'let narrativeOnly = 3',
      '```amx',
      'let result = for item in [1] {',
      '  return earlier + item',
      '}',
      '```',
      'let after = 4'
    ].join('\n');
    const document = await vscode.workspace.openTextDocument({ language: 'amx', content });
    const line = 6;
    const position = new vscode.Position(line, document.lineAt(line).text.length);
    const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider', document.uri, position
    );
    const labels = new Set(completions?.items.map(item => String(item.label)) ?? []);

    for (const expected of ['let', 'to', 'sum', 'earlier', 'item', 'dimension', 'unit']) assert.ok(labels.has(expected), expected);
    for (const absent of ['narrativeOnly', 'result', 'after']) assert.ok(!labels.has(absent), absent);
    for (const fn of ['min', 'max', 'mean', 'round', 'abs', 'sqrt', 'pow']) assert.ok(labels.has(fn), fn);

    const outside = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider', document.uri, new vscode.Position(3, 5)
    );
    const outsideLabels = new Set(outside?.items.map(item => String(item.label)) ?? []);
    for (const fn of ['sum', 'min', 'max', 'mean', 'round', 'abs', 'sqrt', 'pow']) {
      assert.ok(!outsideLabels.has(fn), fn);
    }
  });
  test('tokenizes V0.9 and V0.12 syntax with the actual TextMate grammar and preserves Markdown boundaries', async () => {
    const extension = vscode.extensions.getExtension('EngineersTools.openamx-vscode');
    assert.ok(extension);
    const wasm = await fs.readFile(require.resolve('vscode-oniguruma/release/onig.wasm'));
    await loadWASM(wasm);
    const grammar = JSON.parse(await fs.readFile(path.join(extension.extensionPath, 'amx.tmGrammar.json'), 'utf8'));
    const registry = new Registry({
      onigLib: Promise.resolve({
        createOnigScanner: (patterns) => new OnigScanner(patterns),
        createOnigString: (value) => new OnigString(value)
      }),
      loadGrammar: async (scopeName) => scopeName === 'source.amx' ? grammar : null
    });
    const tokenizer = await registry.loadGrammar('source.amx');
    assert.ok(tokenizer);

    const tokenize = (source: string) => {
      let ruleStack = INITIAL;
      return source.split(/\r?\n/).map((line) => {
        const result = tokenizer.tokenizeLine(line, ruleStack);
        ruleStack = result.ruleStack;
        return { line, tokens: result.tokens };
      });
    };
    const lines = tokenize([
      'Narrative dimension and unit remain prose.',
      '```amx',
      'dimension Length',
      'unit meter: Length',
      'let rows: Number[] = [1, 2, 3]',
      'let second = rows[2]',
      'let converted = 2 kilometer in meter',
      'add 4 to rows at 2',
      'remove 1 from rows',
      'type Sample { distance: Length }',
      'enum Status = {',
      '  DRAFT,',
      '  ACTIVE',
      '}',
      'type Child extends Sample {',
      '  override distance: Length',
      '}',
      'let status: Number = Status.ACTIVE',
      'let selected = if status == 2 {',
      '  return 1',
      '} else {',
      '  return 0',
      '}',
      'let record = Sample { distance = 2 meter }',
      'let label = "escaped \\${notCode}; value ${second}"',
      'let draft = (2 meter',
      'let malformedInterpolation = "${second + }"',
      '```',
      '```js',
      'let inert = 1 meter',
      '```',
      'Narrative {{2 meter}} and unit.'
    ].join('\n'));
    const scopesAt = (lineText: string, text: string, tokenizedLines = lines): readonly string[] => {
      const line = tokenizedLines.find((item) => item.line === lineText);
      assert.ok(line, `missing tokenized line: ${lineText}`);
      const start = lineText.indexOf(text);
      assert.notEqual(start, -1, `missing token text: ${text}`);
      const token = line.tokens.find((item) => item.startIndex <= start && item.endIndex > start);
      assert.ok(token, `missing token at ${text}`);
      return token.scopes;
    };
    const hasScope = (lineText: string, text: string, scope: string, tokenizedLines = lines) =>
      assert.ok(scopesAt(lineText, text, tokenizedLines).includes(scope), `${text} should have ${scope}`);
    const lacksScope = (lineText: string, text: string, scope: string, tokenizedLines = lines) =>
      assert.ok(!scopesAt(lineText, text, tokenizedLines).includes(scope), `${text} should not have ${scope}`);

    hasScope('dimension Length', 'dimension', 'keyword.control.amx');
    hasScope('unit meter: Length', 'unit', 'keyword.control.amx');
    hasScope('let rows: Number[] = [1, 2, 3]', '1', 'constant.numeric.amx');
    hasScope('let second = rows[2]', '2', 'constant.numeric.amx');
    hasScope('let converted = 2 kilometer in meter', 'in', 'keyword.control.amx');
    hasScope('add 4 to rows at 2', 'add', 'keyword.control.amx');
    hasScope('remove 1 from rows', 'remove', 'keyword.control.amx');
    hasScope('enum Status = {', 'enum', 'keyword.declaration.enum.amx');
    hasScope('enum Status = {', 'Status', 'entity.name.type.enum.amx');
    hasScope('  ACTIVE', 'ACTIVE', 'entity.name.enum-member.amx');
    hasScope('type Child extends Sample {', 'extends', 'keyword.control.amx');
    hasScope('  override distance: Length', 'override', 'keyword.control.amx');
    hasScope('let selected = if status == 2 {', 'if', 'keyword.control.amx');
    hasScope('  return 1', 'return', 'keyword.control.amx');
    hasScope('let record = Sample { distance = 2 meter }', '= 2', 'keyword.operator.amx');
    hasScope('let label = "escaped \\${notCode}; value ${second}"', '\\${', 'constant.character.escape.amx');
    lacksScope('let label = "escaped \\${notCode}; value ${second}"', '\\${', 'meta.interpolation.string.amx');
    hasScope('let label = "escaped \\${notCode}; value ${second}"', '${second}', 'meta.interpolation.string.amx');
    hasScope('let malformedInterpolation = "${second + }"', '+', 'keyword.operator.amx');
    lacksScope('Narrative dimension and unit remain prose.', 'dimension', 'keyword.control.amx');
    lacksScope('let inert = 1 meter', 'let', 'keyword.control.amx');
    hasScope('Narrative {{2 meter}} and unit.', '2', 'constant.numeric.amx');
    lacksScope('Narrative {{2 meter}} and unit.', 'and', 'meta.interpolation.amx');

    const unterminated = tokenize([
      '```amx',
      'let unfinished = "${1 +',
      '```',
      '```js',
      'let inertAfterInterpolation = 2',
      '```',
      '```amx',
      'let unfinishedDouble = "still open',
      '```',
      '```js',
      'let inertAfterDouble = 3',
      '```',
      '```amx',
      "let unfinishedSingle = 'still open",
      '```',
      '```js',
      'let inertAfterSingle = 4',
      '```',
      '```amx',
      'let unfinishedNested = "${call({ value: 1',
      '```',
      '```js',
      'let inertAfterNested = 5',
      '```',
      '````amx',
      'let unfinishedLong = "still open',
      '```',
      'let remainsExecutable = 6',
      '````',
      '```js',
      'let inertAfterLongFence = 7',
      '```',
      'Narrative after the fences.'
    ].join('\n'));
    for (const inertLineText of [
      'let inertAfterInterpolation = 2',
      'let inertAfterDouble = 3',
      'let inertAfterSingle = 4',
      'let inertAfterNested = 5',
      'let inertAfterLongFence = 7'
    ]) {
      lacksScope(inertLineText, 'let', 'keyword.control.amx', unterminated);
    }
    hasScope('let remainsExecutable = 6', 'let', 'keyword.control.amx', unterminated);
  });

  test('provides V0.12 completion, outline, navigation, formatting, and diagnostic ranges', async () => {
    const content = [
      '```amx',
      'type Parent {',
      ' id: String',
      '}',
      'enum Status = {',
      ' ACTIVE,',
      ' CLOSED',
      '}',
      'type Asset extends Parent {',
      ' override id: String',
      '}',
      'let asset: Asset = Asset { id = "A-1" }',
      'let inheritedId: String = asset.id',
      'let state: Number = Status.ACTIVE',
      'let selected: String = if state == 1 {',
      ' return asset.id',
      '} else {',
      ' return "none"',
      '}',
      'let legacy: String = if true then "old" else "new"',
      '```'
    ].join('\n');
    const document = await vscode.workspace.openTextDocument({ language: 'amx', content });
    await vscode.window.showTextDocument(document);
    assert.equal((await waitForDiagnostics(document.uri, false)).length, 0);

    const memberOffset = content.indexOf('Status.ACTIVE') + 'Status.'.length;
    const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider', document.uri, document.positionAt(memberOffset)
    );
    assert.ok(completions?.items.some(item => String(item.label) === 'ACTIVE'));
    const inheritedFieldOffset = content.indexOf('asset.id') + 'asset.'.length;
    const inheritedCompletions = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider', document.uri, document.positionAt(inheritedFieldOffset)
    );
    assert.ok(inheritedCompletions?.items.some(item => String(item.label) === 'id'));

    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider', document.uri
    );
    const status = symbols?.find(item => item.name === 'Status');
    assert.equal(status?.kind, vscode.SymbolKind.Enum);
    assert.ok(status?.children.some(item => item.name === 'ACTIVE' && item.kind === vscode.SymbolKind.EnumMember));

    const parentUse = content.indexOf('extends Parent') + 'extends '.length;
    const parentDefinition = await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeDefinitionProvider', document.uri, document.positionAt(parentUse)
    );
    assert.equal(parentDefinition?.length, 1);
    assert.equal(document.getText(parentDefinition[0].range), 'Parent');

    const memberUse = content.indexOf('Status.ACTIVE') + 'Status.'.length;
    const memberDefinition = await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeDefinitionProvider', document.uri, document.positionAt(memberUse)
    );
    assert.equal(memberDefinition?.length, 1);
    assert.equal(document.getText(memberDefinition[0].range), 'ACTIVE');

    const formatting = await vscode.commands.executeCommand<vscode.TextEdit[]>(
      'vscode.executeFormatDocumentProvider', document.uri, { tabSize: 2, insertSpaces: true }
    );
    assert.ok(formatting && formatting.length > 0);
    const workspaceEdit = new vscode.WorkspaceEdit();
    formatting.forEach(edit => workspaceEdit.replace(document.uri, edit.range, edit.newText));
    assert.ok(await vscode.workspace.applyEdit(workspaceEdit));
    const secondFormatting = await vscode.commands.executeCommand<vscode.TextEdit[]>(
      'vscode.executeFormatDocumentProvider', document.uri, { tabSize: 2, insertSpaces: true }
    );
    assert.equal(secondFormatting?.length ?? 0, 0);
    assert.equal((await waitForDiagnostics(document.uri, false)).length, 0);

    const invalidContent = [
      '```amx',
      'let selected: Number = if true {',
      '  return 1',
      '} else {',
      '  let missing: Number = 2',
      '}',
      '```'
    ].join('\n');
    const invalid = await vscode.workspace.openTextDocument({ language: 'amx', content: invalidContent });
    await vscode.window.showTextDocument(invalid);
    const diagnostics = await waitForDiagnostics(invalid.uri, true);
    const missingReturn = diagnostics.find(item => item.code === 'AMX3021');
    assert.ok(missingReturn);
    const closingBrace = invalid.positionAt(invalidContent.lastIndexOf('}'));
    assert.equal(missingReturn.range.start.line, closingBrace.line);
    assert.equal(missingReturn.range.start.character, closingBrace.character);
  });

  test('completes V0.3 types, inputs, functions, imported exports, and known record fields', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'openamx-v03-import-'));
    const dependencyPath = path.join(directory, 'model.amx');
    const entryPath = path.join(directory, 'entry.amx');
    const entryText = [
      '```amx',
      'import { Asset, score, factor } from "./model.amx"',
      'input assets: Asset[]',
      'let asset: Asset = Asset { name = "pump" }',
      'let result: Number = score(asset)',
      'let fieldValue: String = asset.name',
      '```'
    ].join('\n');
    await fs.writeFile(dependencyPath, [
      '```amx',
      'export type Asset {',
      'name: String',
      '}',
      'export fn score(asset: Asset): Number = 1',
      'export let factor: Number = 2',
      'let privateValue: Number = 99',
      '```'
    ].join('\n'), 'utf8');
    await fs.writeFile(entryPath, '```amx\nlet staleDiskValue = true\n```', 'utf8');

    try {
      const document = await vscode.workspace.openTextDocument(vscode.Uri.file(entryPath));
      const edit = new vscode.WorkspaceEdit();
      edit.replace(document.uri, new vscode.Range(new vscode.Position(0, 0), document.positionAt(document.getText().length)), entryText);
      assert.ok(await vscode.workspace.applyEdit(edit));
      await vscode.window.showTextDocument(document);
      const line = 5;
      const position = new vscode.Position(line, document.lineAt(line).text.length);
      const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
        'vscode.executeCompletionItemProvider', document.uri, position
      );
      const labels = new Set(completions?.items.map(item => String(item.label)) ?? []);
      for (const expected of ['Asset', 'score', 'factor', 'assets', 'asset', 'type', 'input', 'name']) {
        assert.ok(labels.has(expected), expected);
      }
      for (const absent of ['privateValue', 'staleDiskValue']) assert.ok(!labels.has(absent), absent);
      assert.equal((await waitForDiagnostics(document.uri, false)).length, 0);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });

  test('completes source-visible V0.4 views and clears visualization diagnostics on edit', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'amx',
      content: [
        '```amx',
        'type Asset {',
        'id: String',
        '}',
        'let assets: Asset[] = []',
        'table register = table(assets) {',
        'title: "Register"',
        'column missing as "Missing"',
        '}',
        'show register',
        '```'
      ].join('\n')
    });
    await vscode.window.showTextDocument(document);
    const diagnostics = await waitForDiagnostics(document.uri, true);
    assert.equal(diagnostics[0].code, 'AMX3001');

    const position = new vscode.Position(9, document.lineAt(9).text.length);
    const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider', document.uri, position
    );
    const labels = new Set(completions?.items.map(item => String(item.label)) ?? []);
    for (const expected of ['register', 'table', 'chart', 'show', 'column', 'series']) assert.ok(labels.has(expected), expected);

    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, new vscode.Range(new vscode.Position(7, 0), new vscode.Position(7, document.lineAt(7).text.length)), 'column id as "Asset"');
    assert.ok(await vscode.workspace.applyEdit(edit));
    assert.equal((await waitForDiagnostics(document.uri, false)).length, 0);
  });

  test('checks imports against open unsaved dependency buffers and refreshes dependents on edit', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'openamx-v03-unsaved-dependency-'));
    const dependencyPath = path.join(directory, 'model.amx');
    const entryPath = path.join(directory, 'entry.amx');
    await fs.writeFile(dependencyPath, [
      '```amx',
      'export type Asset {',
      'name: Number',
      '}',
      '```'
    ].join('\n'), 'utf8');
    await fs.writeFile(entryPath, [
      '```amx',
      'import { Asset } from "./model.amx"',
      'let asset: Asset = Asset { name = "pump" }',
      '```'
    ].join('\n'), 'utf8');

    try {
      const dependency = await vscode.workspace.openTextDocument(vscode.Uri.file(dependencyPath));
      await vscode.window.showTextDocument(dependency);
      const entry = await vscode.workspace.openTextDocument(vscode.Uri.file(entryPath));
      await vscode.window.showTextDocument(entry);
      const initial = await waitForDiagnostics(entry.uri, true);
      assert.equal(initial[0].code, 'AMX3002');

      const dependencyEdit = new vscode.WorkspaceEdit();
      dependencyEdit.replace(dependency.uri, new vscode.Range(new vscode.Position(2, 0), new vscode.Position(2, dependency.lineAt(2).text.length)), 'name: String');
      assert.ok(await vscode.workspace.applyEdit(dependencyEdit));
      assert.equal((await waitForDiagnostics(entry.uri, false)).length, 0);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });

  test('offers scoped completions from complete statements before an incomplete V0.3 statement', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'amx',
      content: '```amx\nlet earlier: Number = 2\nlet unfinished: Number = \n```'
    });
    const position = new vscode.Position(2, document.lineAt(2).text.length);
    const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider', document.uri, position
    );
    const labels = new Set(completions?.items.map(item => String(item.label)) ?? []);
    for (const expected of ['earlier', 'Number', 'fn']) assert.ok(labels.has(expected), expected);

    const firstV03 = await vscode.workspace.openTextDocument({
      language: 'amx',
      content: '```amx\ntype Asset {\n'
    });
    const firstV03Completions = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider', firstV03.uri, new vscode.Position(1, 4)
    );
    assert.ok(firstV03Completions?.items.some(item => String(item.label) === 'type'));
  });

  test('reports unavailable imports and withholds fabricated imported completions', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'openamx-v03-missing-export-'));
    const dependencyPath = path.join(directory, 'model.amx');
    const entryPath = path.join(directory, 'entry.amx');
    await fs.writeFile(dependencyPath, '```amx\nexport let available: Number = 2\n```', 'utf8');
    await fs.writeFile(entryPath, '```amx\nimport { Ghost } from "./model.amx"\nlet value: Number = 1\n```', 'utf8');
    try {
      const document = await vscode.workspace.openTextDocument(vscode.Uri.file(entryPath));
      await vscode.window.showTextDocument(document);
      const diagnostics = await waitForDiagnostics(document.uri, true);
      assert.equal(diagnostics.length, 1);
      assert.equal(diagnostics[0].code, 'AMX5002');
      assert.equal(diagnostics[0].range.start.line, 1);

      const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
        'vscode.executeCompletionItemProvider', document.uri, new vscode.Position(2, document.lineAt(2).text.length)
      );
      const labels = new Set(completions?.items.map(item => String(item.label)) ?? []);
      assert.ok(!labels.has('Ghost'));
      assert.ok(!labels.has('available'));
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });

  test('reports local import cycles at the closing edge without exposing cyclic symbols', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'openamx-v03-cycle-'));
    const entryPath = path.join(directory, 'entry.amx');
    const dependencyPath = path.join(directory, 'dependency.amx');
    await fs.writeFile(entryPath, [
      '```amx',
      'import { Dependency } from "./dependency.amx"',
      'export type EntryType {',
      'name: String',
      '}',
      '```'
    ].join('\n'), 'utf8');
    await fs.writeFile(dependencyPath, [
      '```amx',
      'import { EntryType } from "./entry.amx"',
      'export type Dependency {',
      'name: String',
      '}',
      '```'
    ].join('\n'), 'utf8');
    try {
      const document = await vscode.workspace.openTextDocument(vscode.Uri.file(entryPath));
      await vscode.window.showTextDocument(document);
      const dependencyUri = vscode.Uri.file(dependencyPath);
      const diagnostics = await waitForDiagnostics(dependencyUri, true);
      assert.equal(diagnostics.length, 1);
      assert.equal(diagnostics[0].code, 'AMX5003');
      assert.equal(diagnostics[0].range.start.line, 1);

      const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
        'vscode.executeCompletionItemProvider', document.uri, new vscode.Position(4, 0)
      );
      const labels = new Set(completions?.items.map(item => String(item.label)) ?? []);
      assert.ok(!labels.has('Dependency'));
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });

  test('publishes source-located V0.3 type errors and clears them after an unsaved edit', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'amx',
      content: '😀 narrative\n```amx\nlet count: Number = "bad"\n```'
    });
    await vscode.window.showTextDocument(document);
    const diagnostics = await waitForDiagnostics(document.uri, true);
    assert.equal(diagnostics.length, 1);
    assert.equal(diagnostics[0].code, 'AMX3002');
    assert.equal(diagnostics[0].range.start.line, 2);
    assert.equal(diagnostics[0].range.start.character, 20);

    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, new vscode.Range(new vscode.Position(2, 0), new vscode.Position(2, document.lineAt(2).text.length)), 'let count: Number = 2');
    assert.ok(await vscode.workspace.applyEdit(edit));
    assert.equal((await waitForDiagnostics(document.uri, false)).length, 0);
  });

  test('publishes parser diagnostics at original locations and clears them after correction', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'amx',
      content: 'Intro\n```amx\nlet value =\n```\n```js\nlet = 2\n```'
    });
    await vscode.window.showTextDocument(document);
    const diagnostics = await waitForDiagnostics(document.uri, true);
    assert.equal(diagnostics.length, 1);
    assert.equal(diagnostics[0].range.start.line, 2);
    assert.equal(diagnostics[0].range.start.character, 0);

    const replacement = 'Intro\n```amx\nlet value = 1\n```\n```js\nlet = 2\n```';
    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, new vscode.Range(new vscode.Position(0, 0), document.positionAt(document.getText().length)), replacement);
    assert.ok(await vscode.workspace.applyEdit(edit));
    assert.equal((await waitForDiagnostics(document.uri, false)).length, 0);

    const narrativeDocument = await vscode.workspace.openTextDocument({
      language: 'amx',
      content: '---\ntitle: [invalid\n---\nlet = 3\n```text\nlet value =\n```'
    });
    await vscode.window.showTextDocument(narrativeDocument);
    assert.equal((await waitForDiagnostics(narrativeDocument.uri, false)).length, 0);
  });

  test('checks one-based list bounds and formats add/remove statements in executable AMX', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'amx',
      content: [
        '```amx',
        'let values: Number[] = [1, 2]',
        '  let first = values[1]   ',
        '  add 3 to values at 3   ',
        '  remove 1 from values   ',
        'let invalid = values[0]',
        '```'
      ].join('\n')
    });
    await vscode.window.showTextDocument(document);
    const diagnostics = await waitForDiagnostics(document.uri, true);
    assert.equal(diagnostics.length, 1);
    assert.equal(diagnostics[0].code, 'AMX3009');
    assert.deepEqual(diagnostics[0].range.start, new vscode.Position(5, 21));

    const edits = await vscode.commands.executeCommand<vscode.TextEdit[]>(
      'vscode.executeFormatDocumentProvider', document.uri, { tabSize: 2, insertSpaces: true }
    );
    assert.ok(edits);
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.set(document.uri, edits);
    assert.ok(await vscode.workspace.applyEdit(workspaceEdit));
    assert.equal(document.getText().includes('add 3 to values at 3'), true);
    assert.equal(document.getText().includes('remove 1 from values'), true);
    assert.equal((await waitForDiagnostics(document.uri, true))[0].code, 'AMX3009');
  });

  test('clears source diagnostics when a document closes', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'amx',
      content: '```amx\nlet count: Number = "bad"\n```'
    });
    await vscode.window.showTextDocument(document);
    assert.equal((await waitForDiagnostics(document.uri, true))[0].code, 'AMX3002');
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    assert.equal((await waitForDiagnostics(document.uri, false)).length, 0);
  });
});

async function waitForDiagnostics(uri: vscode.Uri, hasErrors: boolean): Promise<vscode.Diagnostic[]> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const diagnostics = vscode.languages.getDiagnostics(uri);
    if ((diagnostics.length > 0) === hasErrors) return diagnostics;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  return vscode.languages.getDiagnostics(uri);
}