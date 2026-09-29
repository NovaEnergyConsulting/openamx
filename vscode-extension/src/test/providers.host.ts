import * as assert from 'assert';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

suite('OpenAMX providers', () => {
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
      'let asset: Asset = Asset { name: "pump" }',
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
      'let asset: Asset = Asset { name: "pump" }',
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

    for (const expected of ['let', 'to', 'sum', 'earlier', 'item']) assert.ok(labels.has(expected), expected);
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

  test('completes V0.3 types, inputs, functions, imported exports, and known record fields', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'openamx-v03-import-'));
    const dependencyPath = path.join(directory, 'model.amx');
    const entryPath = path.join(directory, 'entry.amx');
    const entryText = [
      '```amx',
      'import { Asset, score, factor } from "./model.amx"',
      'input assets: Asset[]',
      'let asset: Asset = Asset { name: "pump" }',
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
      'let asset: Asset = Asset { name: "pump" }',
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