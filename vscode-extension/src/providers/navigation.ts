import * as fs from 'fs';
import * as vscode from 'vscode';
import { OpenAmxDocument, StatementNode, V02ExpressionNode } from '../../../src/ast/types';
import { parseDocumentText } from '../../../src/parser/parseDocument';
import { analyzeEditorDocument, EditorAnalysis } from './moduleAnalysis';
import { CheckedType } from '../../../src/typechecker/checkDocument';
import { declarationRange, tokenRange } from './symbolRanges';

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
  for (const [file, current] of files) {
    const parsedModule = file === entry ? parsed : analysis!.modules!.get(file)!.document;
    const module = analysis?.modules?.get(file);
    const items: Occurrence[] = [];
    const visible = new Map<string, Occurrence>();
    const declarations = statements(parsedModule).filter(candidate => 'name' in candidate && declarationRange(current, candidate));
    const duplicates = new Set(declarations.filter((candidate, index) =>
      declarations.some((other, otherIndex) => otherIndex !== index && 'name' in other && 'name' in candidate && other.name === candidate.name)
    ).map(candidate => 'name' in candidate ? candidate.name : ''));
    const add = (source: { line: number; column: number } | undefined, name: string, target?: Occurrence) => {
      if (!target) return;
      const range = tokenRange(current, source, name);
      if (range) items.push({ ...target, range, declaration: false });
    };
    const expression = (node: V02ExpressionNode): void => {
      if (!analysis && statements(parsedModule).some(item => item.type === 'importDeclaration')) return;
      switch (node.type) {
        case 'identifier': add(node.source, node.name, visible.get(node.name)); break;
        case 'functionCall': add(node.source, node.callee, visible.get(node.callee)); node.arguments.forEach(expression); break;
        case 'recordConstructor': add(node.source, node.name, visible.get(node.name)); node.fields.forEach(field => expression(field.expression)); break;
        case 'binaryExpression': expression(node.left); expression(node.right); break;
        case 'unaryExpression': expression(node.argument); break;
        case 'conditionalExpression': expression(node.test); expression(node.consequent); expression(node.alternate); break;
        case 'listLiteral': node.elements.forEach(expression); break;
        case 'rangeExpression': expression(node.start); expression(node.end); break;
        case 'matchExpression': expression(node.expression); node.cases.forEach(arm => expression(arm.expression)); expression(node.defaultExpression); break;
        case 'fieldAccess': expression(node.receiver); break;
        // The parser does not locate iterator tokens independently; do not attribute shadowed loop uses.
        case 'forExpression': expression(node.iterable); break;
      }
    };
    for (const statement of statements(parsedModule)) {
      if (statement.type === 'importDeclaration') {
        for (const imported of statement.names) {
          const targetFile = module?.importTargets.get(imported.name);
          const targetDocument = targetFile && files.get(targetFile);
          const targetStatement = targetFile && analysis?.modules?.get(targetFile)?.document &&
            statements(analysis.modules.get(targetFile)!.document).find(candidate =>
              'name' in candidate && candidate.name === imported.name && 'exported' in candidate && candidate.exported);
          const target = targetDocument && targetStatement && declaration(targetDocument, targetStatement);
          if (target && targetFile) {
            const importedOccurrence = { ...target, origin: targetFile };
            visible.set(imported.name, importedOccurrence);
            add(imported.source, imported.name, importedOccurrence);
          }
        }
      } else {
        if (statement.type === 'variableDeclaration') expression(statement.expression);
        if (statement.type === 'variableDeclaration' || statement.type === 'inputDeclaration') {
          const annotation = statement.annotation;
          if (annotation?.type === 'namedType' && annotation.name) add(annotation.source, annotation.name, visible.get(annotation.name));
        }
        if (statement.type === 'showStatement') add(statement.nameSource, statement.name, visible.get(statement.name));
        if (statement.type === 'tableDeclaration' || statement.type === 'chartDeclaration') add(statement.bindingSource, statement.binding, visible.get(statement.binding));
        if (statement.type === 'assignmentStatement' || statement.type === 'compoundAssignmentStatement') {
          add(statement.source, statement.name, visible.get(statement.name));
          expression(statement.expression);
        }
        if (statement.type === 'forStatement') expression(statement.iterable);
        const declared = declaration(current, statement);
        if (declared && 'name' in statement && !duplicates.has(statement.name)) {
          if (statement.type === 'variableDeclaration') {
            const inferred = module?.checkResult.bindingTypes.get(statement.name) ?? (file === entry && !module ? analysis?.bindingTypes?.get(statement.name) : undefined);
            if (inferred) declared.detail = `binding ${statement.name}: ${typeText(inferred)}`;
          }
          visible.set(statement.name, declared);
          items.push(declared);
          if (statement.type === 'typeDeclaration') {
            for (const field of statement.fields) {
              const range = tokenRange(current, field.source, field.name);
              if (range) items.push({ range, target: new vscode.Location(current.uri, range), declaration: true,
                kind: 'field', detail: `field ${field.name}: ${field.annotation.name ?? field.annotation.type}` });
            }
          }
        }
      }
    }
    result.set(file, { document: current, items });
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
    })
  ];
}