import * as fs from 'fs';
import * as vscode from 'vscode';
import { OpenAmxDocument, StatementNode, V02ExpressionNode } from '../../../src/ast/types';
import { parseDocumentText } from '../../../src/parser/parseDocument';
import { analyzeEditorDocument, EditorAnalysis } from './moduleAnalysis';
import { CheckedType } from '../../../src/typechecker/checkDocument';
import { declarationRange, tokenRange } from './symbolRanges';
import { editorSymbolFacts } from '../../../src/editor/symbols';
import { isSafeRenameIdentifier } from '../../../src/editor/refactoring';

interface Occurrence {
  range: vscode.Range;
  target: vscode.Location;
  declaration: boolean;
  kind: string;
  detail: string;
  origin?: string;
}

function statements(document: OpenAmxDocument): StatementNode[] {
  return document.nodes.flatMap(node => node.type === 'executableCodeBlock' ? node.statements : []);
}

function typeText(type: CheckedType): string {
  if (type.kind === 'named') return type.name;
  if (type.kind === 'null') return 'null';
  return `${typeText(type.element)}${type.kind === 'list' ? '[]' : '?'}`;
}

function declaration(document: vscode.TextDocument, statement: StatementNode): Occurrence | undefined {
  if (!('name' in statement)) return undefined;
  const range = declarationRange(document, statement);
  if (!range) return undefined;
  const kind = statement.type === 'variableDeclaration' ? 'binding' : statement.type.replace('Declaration', '');
  const detail = statement.type === 'functionDeclaration'
    ? `fn ${statement.name}(${statement.parameters.map(param => `${param.name}: ${param.annotation.name ?? param.annotation.type}`).join(', ')}): ${statement.returnType.name ?? statement.returnType.type}`
    : statement.type === 'variableDeclaration' || statement.type === 'inputDeclaration'
      ? `${kind} ${statement.name}${statement.annotation ? `: ${statement.annotation.name ?? statement.annotation.type}` : ''}`
      : `${kind} ${statement.name}`;
  return { range, target: new vscode.Location(document.uri, range), declaration: true, kind, detail };
}

function openDocument(file: string): vscode.TextDocument | undefined {
  let canonical: string;
  try { canonical = fs.realpathSync(file); } catch { return undefined; }
  return vscode.workspace.textDocuments.find(document => {
    if (document.uri.scheme !== 'file') return false;
    try { return fs.realpathSync(document.uri.fsPath) === canonical; } catch { return false; }
  });
}

async function graphDocuments(document: vscode.TextDocument, analysis?: EditorAnalysis): Promise<Map<string, vscode.TextDocument>> {
  const documents = new Map<string, vscode.TextDocument>();
  if (!analysis?.modules) return documents;
  for (const file of analysis.modules.keys()) {
    documents.set(file, openDocument(file) ?? await vscode.workspace.openTextDocument(vscode.Uri.file(file)));
  }
  return documents;
}

async function occurrences(document: vscode.TextDocument): Promise<Map<string, { document: vscode.TextDocument; items: Occurrence[] }>> {
  let parsed: OpenAmxDocument;
  try { parsed = parseDocumentText(document.getText()); } catch { return new Map(); }
  let analysis: EditorAnalysis | undefined;
  try { analysis = analyzeEditorDocument(document.getText(), document.uri.scheme === 'file' ? document.uri.fsPath : undefined); } catch { /* Local parsed facts remain usable. */ }
  const files = await graphDocuments(document, analysis);
  const entry = document.uri.scheme === 'file' ? fs.realpathSync(document.uri.fsPath) : document.uri.toString();
  files.set(entry, document);
  const result = new Map<string, { document: vscode.TextDocument; items: Occurrence[] }>();
  const moduleSources = new Map([...files].map(([file, current]) => [file, current.getText()]));
  const facts = editorSymbolFacts(document.getText(), entry, parsed, analysis, moduleSources);
  for (const [file, current] of files) result.set(file, { document: current, items: [] });
  for (const fact of facts) {
    const sourceDocument = files.get(fact.file);
    const targetDocument = files.get(fact.target.file);
    if (!sourceDocument || !targetDocument) continue;
    const range = new vscode.Range(sourceDocument.positionAt(fact.from), sourceDocument.positionAt(fact.to));
    const targetRange = new vscode.Range(targetDocument.positionAt(fact.target.from), targetDocument.positionAt(fact.target.to));
    result.get(fact.file)!.items.push({ range, target: new vscode.Location(targetDocument.uri, targetRange), declaration: fact.declaration,
      kind: fact.kind, detail: fact.detail, origin: fact.origin });
  }
  return result;
}

function at(items: Occurrence[], position: vscode.Position): Occurrence | undefined {
  return items.find(item => item.range.contains(position) && !item.range.end.isEqual(position));
}

function symbolKind(statement: StatementNode): vscode.SymbolKind {
  switch (statement.type) {
    case 'typeDeclaration': return vscode.SymbolKind.Struct;
    case 'functionDeclaration': return vscode.SymbolKind.Function;
    case 'inputDeclaration': return vscode.SymbolKind.Variable;
    case 'tableDeclaration': case 'chartDeclaration': return vscode.SymbolKind.Object;
    default: return vscode.SymbolKind.Variable;
  }
}

export function registerNavigationProviders(): vscode.Disposable[] {
  const selector = 'amx';
  return [
    vscode.languages.registerHoverProvider(selector, {
      async provideHover(document, position) {
        const found = at((await occurrences(document)).get(document.uri.scheme === 'file' ? fs.realpathSync(document.uri.fsPath) : document.uri.toString())?.items ?? [], position);
        if (!found) return undefined;
        const text = `${found.detail}${found.origin ? `\nImported from ${found.origin}` : ''}`;
        return new vscode.Hover(new vscode.MarkdownString().appendText(text), found.range);
      }
    }),
    vscode.languages.registerDefinitionProvider(selector, {
      async provideDefinition(document, position) {
        const found = at((await occurrences(document)).get(document.uri.scheme === 'file' ? fs.realpathSync(document.uri.fsPath) : document.uri.toString())?.items ?? [], position);
        return found?.target;
      }
    }),
    vscode.languages.registerDocumentSymbolProvider(selector, {
      provideDocumentSymbols(document) {
        let parsed: OpenAmxDocument;
        try { parsed = parseDocumentText(document.getText()); } catch { return []; }
        const symbols: vscode.DocumentSymbol[] = [];
        for (const statement of statements(parsed)) {
          if (!('name' in statement) || statement.type === 'showStatement' || statement.type === 'assignmentStatement' || statement.type === 'compoundAssignmentStatement') continue;
          const range = declarationRange(document, statement);
          if (!range) continue;
          const symbol = new vscode.DocumentSymbol(statement.name, '', symbolKind(statement), range, range);
          if (statement.type === 'typeDeclaration') {
            for (const field of statement.fields) {
              const fieldRange = tokenRange(document, field.source, field.name);
              if (fieldRange) symbol.children.push(new vscode.DocumentSymbol(field.name, '', vscode.SymbolKind.Field, fieldRange, fieldRange));
            }
            if (symbol.children.length) symbol.range = new vscode.Range(range.start, symbol.children[symbol.children.length - 1].range.end);
          }
          symbols.push(symbol);
        }
        return symbols;
      }
    }),
    vscode.languages.registerReferenceProvider(selector, {
      async provideReferences(document, position, context) {
        const graph = await occurrences(document);
        const current = graph.get(document.uri.scheme === 'file' ? fs.realpathSync(document.uri.fsPath) : document.uri.toString());
        const found = at(current?.items ?? [], position);
        if (!found) return [];
        const matches: vscode.Location[] = [];
        for (const { document: source, items } of graph.values()) {
          for (const item of items) {
            if (item.target.uri.toString() === found.target.uri.toString() && item.target.range.isEqual(found.target.range)
              && (context.includeDeclaration || !item.declaration)) matches.push(new vscode.Location(source.uri, item.range));
          }
        }
        return matches;
      }
    }),
    vscode.languages.registerRenameProvider(selector, {
      async prepareRename(document, position) {
        const graph = await occurrences(document);
        const current = graph.get(document.uri.scheme === 'file' ? fs.realpathSync(document.uri.fsPath) : document.uri.toString());
        const found = at(current?.items ?? [], position);
        return found ? { range: found.range, placeholder: document.getText(found.range) } : undefined;
      },
      async provideRenameEdits(document, position, newName, token) {
        if (!isSafeRenameIdentifier(newName)) return undefined;
        const graph = await occurrences(document);
        if (token.isCancellationRequested) return undefined;
        const entry = document.uri.scheme === 'file' ? fs.realpathSync(document.uri.fsPath) : document.uri.toString();
        const found = at(graph.get(entry)?.items ?? [], position);
        if (!found) return undefined;
        const oldName = document.getText(found.range);
        if (oldName === newName) return new vscode.WorkspaceEdit();

        for (const { document: source } of graph.values()) {
          let parsed: OpenAmxDocument;
          try { parsed = parseDocumentText(source.getText()); } catch { return undefined; }
          for (const statement of statements(parsed)) {
            if ('name' in statement && statement.name === newName) return undefined;
            if (statement.type === 'importDeclaration' && statement.names.some(item => item.name === newName)) return undefined;
          }
        }

        const edit = new vscode.WorkspaceEdit();
        let count = 0;
        for (const { document: source, items } of graph.values()) {
          for (const item of items) {
            if (item.target.uri.toString() !== found.target.uri.toString() || !item.target.range.isEqual(found.target.range)) continue;
            if (source.getText(item.range) !== oldName) return undefined;
            edit.replace(source.uri, item.range, newName);
            count++;
          }
        }
        return count ? edit : undefined;
      }
    })
  ];
}