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
});

async function waitForDiagnostics(uri: vscode.Uri, hasErrors: boolean): Promise<vscode.Diagnostic[]> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const diagnostics = vscode.languages.getDiagnostics(uri);
    if ((diagnostics.length > 0) === hasErrors) return diagnostics;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  return vscode.languages.getDiagnostics(uri);
}