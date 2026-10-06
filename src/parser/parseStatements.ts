import { ChartDeclarationNode, ChartFieldOptionNode, ChartSeriesOptionNode, FunctionDeclarationNode, FunctionParameterNode, ImportDeclarationNode, ImportedNameNode, InputDeclarationNode, SourceLocation, StatementNode, TableDeclarationNode, TypeReferenceNode, VariableDeclarationNode, VisualizationOptionNode } from '../ast/types';
import { parseExpression } from './parseExpression';
import { parseForStatement } from './parseFor';
import { AmxError, syntaxError } from '../diagnostics/errors';
import { findStringLiteralEnd, withoutStringLiterals } from './stringScanner';

interface ParseContext {
  allowReturn?: boolean;
  allowFor?: boolean;
}

/** Parse executable AMX statements while preserving original-document locations. */
export function parseStatements(
  body: string,
  start: SourceLocation = { line: 1, column: 1 },
  context: ParseContext = {}
): StatementNode[] {
  if (!body || body.trim().length === 0) {
    return [];
  }

  const lines = body.split(/\r?\n/);
  const statements: StatementNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    let rawLine = lines[i];
    const lineNumber = start.line + i;

    if (rawLine.trim().length === 0) {
      continue;
    }

    let exported = false;
    const exportMatch = rawLine.match(/^(\s*)export(\s+)(type|fn|let|table|chart)\b/);
    if (exportMatch) {
      if (context.allowFor === false && exportMatch[3] !== 'table' && exportMatch[3] !== 'chart') throw new Error(`Export declarations cannot occur in loops at ${lineNumber}:${exportMatch[1].length + 1}`);
      exported = true;
      const blankLength = exportMatch[0].length - exportMatch[3].length;
      rawLine = ' '.repeat(blankLength) + rawLine.slice(blankLength);
      lines[i] = rawLine;
    }

    const indentation = rawLine.length - rawLine.trimStart().length;
    const source: SourceLocation = {
      line: lineNumber,
      column: i === 0 ? start.column + indentation : indentation + 1
    };

    if (/^\s*import\b/.test(rawLine)) {
      if (context.allowFor === false) throw new Error(`Import declarations cannot occur in loops at ${source.line}:${source.column}`);
      statements.push(parseImportDeclaration(rawLine, source));
      continue;
    }

    if (/^\s*input\b/.test(rawLine)) {
      if (context.allowFor === false) throw new Error(`Input declarations cannot occur in loops at ${source.line}:${source.column}`);
      const match = rawLine.match(/^\s*input\s+([A-Za-z][A-Za-z0-9_]*)\s*:\s*([A-Za-z][A-Za-z0-9_]*(?:(?:\[\])|\?)*)\s*$/);
      if (!match) throw new Error(`Invalid input declaration at ${source.line}:${source.column}`);
      const input: InputDeclarationNode = {
        type: 'inputDeclaration',
        name: match[1],
        annotation: parseTypeReference(match[2], { line: source.line, column: rawLine.indexOf(match[2]) + 1 }),
        source
      };
      statements.push(input);
      continue;
    }

    if (/^\s*(table|chart)\b/.test(rawLine)) {
      const parsed = parseVisualization(lines, i, source, exported);
      statements.push(parsed.statement);
      i = parsed.endIndex;
      continue;
    }

    if (/^\s*show\b/.test(rawLine)) {
      const match = rawLine.match(/^\s*show\s+([A-Za-z][A-Za-z0-9_]*)\s*$/);
      if (!match) throw new Error(`Invalid show statement at ${source.line}:${source.column}`);
      statements.push({
        type: 'showStatement',
        name: match[1],
        nameSource: { line: source.line, column: rawLine.lastIndexOf(match[1]) + 1 },
        source
      });
      continue;
    }

    if (/^\s*fn\b/.test(rawLine)) {
      if (context.allowFor === false) throw new Error(`Function declarations cannot occur in loops at ${source.line}:${source.column}`);
      const endIndex = findFunctionEnd(lines, i, source);
      const fnText = lines.slice(i, endIndex + 1).join('\n');
      statements.push(parseFunctionDeclaration(fnText, source, exported));
      i = endIndex;
      continue;
    }

    if (/^\s*type\b/.test(rawLine)) {
      if (context.allowFor === false) throw new Error(`Type declarations cannot occur in loops at ${source.line}:${source.column}`);
      const header = rawLine.match(/^\s*type\s+([A-Za-z][A-Za-z0-9_]*)\s*\{\s*$/);
      if (!header) throw new Error(`Invalid type declaration at ${source.line}:${source.column}`);
      const fields = [];
      let closed = false;
      while (++i < lines.length) {
        const fieldLine = lines[i];
        if (/^\s*}\s*$/.test(fieldLine)) { closed = true; break; }
        if (!fieldLine.trim()) continue;
        const match = fieldLine.match(/^\s*([A-Za-z][A-Za-z0-9_]*)(\?)?\s*:\s*([A-Za-z][A-Za-z0-9_]*(?:(?:\[\])|\?)*)\s*(?:=\s*(.+))?\s*$/);
        const fieldSource = { line: start.line + i, column: fieldLine.length - fieldLine.trimStart().length + 1 };
        if (!match) throw new Error(`Invalid record field at ${fieldSource.line}:${fieldSource.column}`);
        fields.push({ name: match[1], optional: !!match[2], annotation: parseTypeReference(match[3], fieldSource),
          ...(match[4] ? { defaultExpression: parseExpression(match[4], { line: fieldSource.line, column: fieldLine.indexOf(match[4]) + 1 }) } : {}), source: fieldSource });
      }
      if (!closed) throw new Error(`Unclosed type declaration at ${source.line}:${source.column}`);
      statements.push({ type: 'typeDeclaration', name: header[1], fields, ...(exported ? { exported } : {}), source });
      continue;
    }

    if (context.allowFor === false && containsForExpression(rawLine)) {
      throw new Error(`Nested loops are unsupported at ${source.line}:${source.column}`);
    }

    if (/^\s*for\b/.test(rawLine)) {
      if (context.allowFor === false) {
        throw new Error(`Nested loops are unsupported at ${source.line}:${source.column}`);
      }
      const endIndex = findLoopEnd(lines, i, { line: lineNumber, column: source.column });
      statements.push(parseForStatement(lines.slice(i, endIndex + 1).join('\n'), source));
      i = endIndex;
      continue;
    }

    if (/^\s*(break|continue)\b/.test(rawLine)) {
      throw new Error(`Unsupported loop control statement at ${source.line}:${source.column}`);
    }

    const returnMatch = rawLine.match(/^\s*return\s+(.+)\s*$/);
    if (returnMatch) {
      if (context.allowReturn !== true) {
        throw new Error(`Return is only valid inside an expression-form for loop at ${source.line}:${source.column}`);
      }
      const expressionText = collectExpressionLoop(lines, i, returnMatch[1], start);
      statements.push({
        type: 'returnStatement',
        expression: parseExpression(expressionText.text, containsMatchExpression(expressionText.text)
          ? { line: source.line, column: rawLine.indexOf(returnMatch[1]) + 1 } : source),
        source
      });
      i += expressionText.lineCount - 1;
      continue;
    }

    const addMatch = rawLine.match(/^\s*add\s+(.+)$/);
    if (addMatch) {
      const collected = collectDelimitedExpression(lines, i, addMatch[1]);
      const remainder = collected.text;
      const remainderSource = locationAtOffset(remainder, 0, {
        line: source.line,
        column: rawLine.length - addMatch[1].length + 1
      });
      const split = findTopLevelKeyword(remainder, 'to');
      if (!split) syntaxError('Invalid add statement', source);
      const valueText = remainder.slice(0, split.start).trim();
      const targetTail = remainder.slice(split.end);
      const targetAndIndex = targetTail.trim();
      const at = findTopLevelKeyword(targetAndIndex, 'at');
      const name = (at ? targetAndIndex.slice(0, at.start) : targetAndIndex).trim();
      const indexText = at ? targetAndIndex.slice(at.end).trim() : undefined;
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name) || !valueText || (at && !indexText)) {
        syntaxError('Invalid add statement', source);
      }
      const valueOffset = remainder.indexOf(valueText);
      const targetOffset = split.end + targetTail.indexOf(targetAndIndex);
      const indexOffset = at ? targetOffset + at.end + targetAndIndex.slice(at.end).length - targetAndIndex.slice(at.end).trimStart().length : undefined;
      statements.push({
        type: 'addStatement',
        name,
        targetSource: locationAtOffset(remainder, targetOffset, remainderSource),
        value: parseExpression(valueText, locationAtOffset(remainder, valueOffset, remainderSource)),
        ...(indexText ? { index: parseExpression(indexText, locationAtOffset(remainder, indexOffset!, remainderSource)) } : {}),
        source
      });
      i += collected.lineCount - 1;
      continue;
    }

    const removeMatch = rawLine.match(/^\s*remove\s+(.+)$/);
    if (removeMatch) {
      const collected = collectDelimitedExpression(lines, i, removeMatch[1]);
      const remainder = collected.text;
      const remainderSource = locationAtOffset(remainder, 0, {
        line: source.line,
        column: rawLine.length - removeMatch[1].length + 1
      });
      const split = findTopLevelKeyword(remainder, 'from');
      if (!split) syntaxError('Invalid remove statement', source);
      const countText = remainder.slice(0, split.start).trim();
      const targetTail = remainder.slice(split.end);
      const targetAndIndex = targetTail.trim();
      const at = findTopLevelKeyword(targetAndIndex, 'at');
      const name = (at ? targetAndIndex.slice(0, at.start) : targetAndIndex).trim();
      const indexText = at ? targetAndIndex.slice(at.end).trim() : undefined;
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name) || !countText || (at && !indexText)) {
        syntaxError('Invalid remove statement', source);
      }
      const countOffset = remainder.indexOf(countText);
      const targetOffset = split.end + targetTail.indexOf(targetAndIndex);
      const indexOffset = at ? targetOffset + at.end + targetAndIndex.slice(at.end).length - targetAndIndex.slice(at.end).trimStart().length : undefined;
      statements.push({
        type: 'removeStatement',
        name,
        targetSource: locationAtOffset(remainder, targetOffset, remainderSource),
        count: parseExpression(countText, locationAtOffset(remainder, countOffset, remainderSource)),
        ...(indexText ? { index: parseExpression(indexText, locationAtOffset(remainder, indexOffset!, remainderSource)) } : {}),
        source
      });
      i += collected.lineCount - 1;
      continue;
    }

    const letMatch = rawLine.match(/^\s*let\s+([A-Za-z][A-Za-z0-9_]*)(?:\s*:\s*([A-Za-z][A-Za-z0-9_]*(?:(?:\[\])|\?)*))?\s*=\s*(.*)$/);

    if (letMatch) {
      const name = letMatch[1];
      const expressionText = collectExpressionLoop(lines, i, letMatch[3], start);
      let expression;
      try {
        expression = parseExpression(expressionText.text, containsForExpression(expressionText.text) && !containsMatchExpression(expressionText.text)
          ? source : { line: source.line, column: rawLine.lastIndexOf(letMatch[3]) + 1 });
      } catch (error) {
        if (error instanceof AmxError) throw error;
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid declaration at ${source.line}:${source.column}: ${message}`);
      }

      const decl: VariableDeclarationNode = {
        type: 'variableDeclaration',
        name,
        expression,
        ...(letMatch[2] ? { annotation: parseTypeReference(letMatch[2], { line: source.line, column: rawLine.indexOf(letMatch[2]) + 1 }) } : {}),
        ...(exported ? { exported } : {}),
        source
      };
      statements.push(decl);
      i += expressionText.lineCount - 1;
      continue;
    }

    const compoundMatch = rawLine.match(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*\+=\s*(.*)$/);
    const assignmentMatch = rawLine.match(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*=(?!=)\s*(.*)$/);
    const assignment = compoundMatch ?? assignmentMatch;
    if (assignment) {
      const expressionText = collectExpressionLoop(lines, i, assignment[2], start);
      try {
        statements.push({
          type: compoundMatch ? 'compoundAssignmentStatement' : 'assignmentStatement',
          name: assignment[1],
          ...(compoundMatch ? { operator: '+=' as const } : {}),
          expression: parseExpression(expressionText.text, { line: source.line, column: rawLine.lastIndexOf(assignment[2]) + 1 }),
          source
        } as StatementNode);
      } catch (error) {
        if (error instanceof AmxError) throw error;
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid assignment at ${source.line}:${source.column}: ${message}`);
      }
      i += expressionText.lineCount - 1;
      continue;
    }

    throw new Error(`Unsupported statement at ${source.line}:${source.column}`);
  }

  return statements;
}

function locationAtOffset(text: string, offset: number, source: SourceLocation): SourceLocation {
  const before = text.slice(0, offset).split(/\r?\n/);
  return {
    line: source.line + before.length - 1,
    column: (before.length === 1 ? source.column : 1) + before[before.length - 1].length
  };
}

function findTopLevelKeyword(text: string, keyword: string): { start: number; end: number } | undefined {
  let depth = 0;
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '"' || character === "'") {
      const end = findStringLiteralEnd(text, index);
      if (end !== undefined) index = end;
      continue;
    }
    if ('([{'.includes(character)) {
      depth++;
      continue;
    }
    if (')]}'.includes(character)) {
      depth--;
      continue;
    }
    if (depth === 0 && text.startsWith(keyword, index)
      && /\s/.test(text[index - 1] ?? '')
      && /\s/.test(text[index + keyword.length] ?? '')) {
      return { start: index, end: index + keyword.length };
    }
  }
  return undefined;
}

function parseVisualization(
  lines: string[],
  startIndex: number,
  source: SourceLocation,
  exported: boolean
): { statement: TableDeclarationNode | ChartDeclarationNode; endIndex: number } {
  const header = lines[startIndex].match(/^\s*(table|chart)\s+([A-Za-z][A-Za-z0-9_]*)\s*=\s*(table|bar|column|line|scatter)\s*\(\s*([A-Za-z][A-Za-z0-9_]*)\s*\)\s*\{\s*$/);
  const fail = (message: string, at: SourceLocation): never => {
    throw new Error(`${message} at ${at.line}:${at.column}`);
  };
  if (!header || (header[1] === 'table') !== (header[3] === 'table')) {
    return fail('Invalid visualization declaration', source);
  }

  const name = header[2];
  const binding = header[4];
  const bindingSource = { line: source.line, column: lines[startIndex].lastIndexOf(binding) + 1 };
  const options: VisualizationOptionNode[] = [];
  let endIndex = startIndex + 1;
  let closed = false;

  for (; endIndex < lines.length; endIndex++) {
    const line = lines[endIndex];
    if (/^\s*}\s*$/.test(line)) {
      closed = true;
      break;
    }
    if (!line.trim()) continue;
    const optionSource: SourceLocation = {
      line: source.line + endIndex - startIndex,
      column: line.length - line.trimStart().length + 1
    };
    const quoted = `("[^"\\r\\n]*"|'[^'\\r\\n]*')`;
    let match: RegExpMatchArray | null;

    if ((match = line.match(new RegExp(`^\\s*title\\s*:\\s*${quoted}\\s*$`)))) {
      options.push({ type: 'viewTitleOption', value: match[1].slice(1, -1), source: optionSource });
      continue;
    }

    if (header[1] === 'chart' && (match = line.match(new RegExp(`^\\s*description\\s*:\\s*${quoted}\\s*$`)))) {
      options.push({ type: 'viewDescriptionOption', value: match[1].slice(1, -1), source: optionSource });
      continue;
    }

    if (header[1] === 'table' && (match = line.match(new RegExp(`^\\s*column\\s+([A-Za-z][A-Za-z0-9_]*)\\s+as\\s+${quoted}\\s*$`)))) {
      const field = match[1];
      options.push({
        type: 'tableColumnOption', field, label: match[2].slice(1, -1),
        fieldSource: { line: optionSource.line, column: line.indexOf(field) + 1 }, source: optionSource
      });
      continue;
    }

    if (header[1] === 'chart') {
      match = line.match(/^\s*(category|x|y|group|labels)\s*:\s*([A-Za-z][A-Za-z0-9_]*)\s*$/);
      if (match) {
        const field = match[2];
        options.push({
          type: 'chartFieldOption', role: match[1] as ChartFieldOptionNode['role'], field,
          fieldSource: { line: optionSource.line, column: line.lastIndexOf(field) + 1 }, source: optionSource
        });
        continue;
      }

      match = line.match(new RegExp(`^\\s*series\\s+(?:([A-Za-z][A-Za-z0-9_]*)\\s+as\\s+)?${quoted}\\s*$`));
      if (match) {
        const field = match[1];
        options.push({
          type: 'chartSeriesOption', ...(field ? { field, fieldSource: { line: optionSource.line, column: line.indexOf(field) + 1 } } : {}),
          label: match[2].slice(1, -1), source: optionSource
        } satisfies ChartSeriesOptionNode);
        continue;
      }
    }

    return fail(`Invalid ${header[1]} option`, optionSource);
  }

  if (!closed) return fail('Unclosed visualization declaration', source);
  if (header[1] === 'table') {
    return { statement: { type: 'tableDeclaration', name, binding, bindingSource, options, ...(exported ? { exported } : {}), source }, endIndex };
  }
  return {
    statement: {
      type: 'chartDeclaration', name, kind: header[3] as ChartDeclarationNode['kind'], binding,
      bindingSource, options, ...(exported ? { exported } : {}), source
    },
    endIndex
  };
}

export function parseTypeReference(text: string, source?: SourceLocation): TypeReferenceNode {
  const name = text.match(/^[A-Za-z][A-Za-z0-9_]*/)?.[0];
  if (!name) throw new Error(`Invalid type reference '${text}'`);
  let result: TypeReferenceNode = { type: 'namedType', name, source };
  let suffix = text.slice(name.length);
  while (suffix) {
    if (suffix.startsWith('[]')) {
      result = { type: 'listType', element: result, source };
      suffix = suffix.slice(2);
    } else if (suffix.startsWith('?') && result.type !== 'nullableType') {
      result = { type: 'nullableType', element: result, source };
      suffix = suffix.slice(1);
    } else throw new Error(`Invalid type reference '${text}'`);
  }
  return result;
}

function parseImportDeclaration(rawLine: string, source: SourceLocation): ImportDeclarationNode {
  const match = rawLine.match(/^\s*import\s*\{\s*([^}]*)\}\s*from\s*"([^"]*)"\s*$/);
  if (!match) throw new Error(`Invalid import declaration at ${source.line}:${source.column}`);
  const namesText = match[1];
  const braceIndex = rawLine.indexOf('{');
  const names: ImportedNameNode[] = [];
  let cursor = braceIndex + 1;
  for (const rawName of namesText.split(',')) {
    const name = rawName.trim();
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) throw new Error(`Invalid imported name '${rawName.trim()}' at ${source.line}:${source.column}`);
    const nameStart = rawLine.indexOf(name, cursor);
    names.push({ name, source: { line: source.line, column: nameStart + 1 } });
    cursor = nameStart + name.length;
  }
  if (!names.length) throw new Error(`Import requires at least one name at ${source.line}:${source.column}`);
  const pathIndex = rawLine.lastIndexOf(`"${match[2]}"`);
  return {
    type: 'importDeclaration',
    names,
    path: match[2],
    pathSource: { line: source.line, column: pathIndex + 2 },
    source
  };
}

function findFunctionEnd(lines: string[], startIndex: number, source: SourceLocation): number {
  let depth = 0;
  let sawOpen = false;
  let quote: string | undefined;

  const scan = (line: string) => {
    for (const ch of line) {
      if (quote) {
        if (ch === quote) quote = undefined;
        continue;
      }
      if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '{') { depth++; sawOpen = true; }
      else if (ch === '}') depth--;
    }
  };

  scan(lines[startIndex]);
  if (!sawOpen) return startIndex; // single-line body with no braced constructs

  let index = startIndex;
  while (depth > 0) {
    index++;
    if (index >= lines.length) throw new Error(`Unclosed function body at ${source.line}:${source.column}`);
    scan(lines[index]);
  }
  return index;
}

function parseFunctionDeclaration(text: string, source: SourceLocation, exported: boolean): FunctionDeclarationNode {
  const match = text.match(/^\s*fn\s+([A-Za-z][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*:\s*([A-Za-z][A-Za-z0-9_]*(?:(?:\[\])|\?)*)\s*=\s*([\s\S]*)$/);
  if (!match) throw new Error(`Invalid function declaration at ${source.line}:${source.column}`);
  const [, name, paramsText, returnTypeText, bodyText] = match;
  const paramsRaw = paramsText.trim();
  const parameters: FunctionParameterNode[] = [];
  if (paramsRaw) {
    for (const part of paramsRaw.split(',')) {
      const paramMatch = part.trim().match(/^([A-Za-z][A-Za-z0-9_]*)\s*:\s*([A-Za-z][A-Za-z0-9_]*(?:(?:\[\])|\?)*)$/);
      if (!paramMatch) throw new Error(`Invalid function parameter at ${source.line}:${source.column}`);
      parameters.push({ name: paramMatch[1], annotation: parseTypeReference(paramMatch[2], source), source });
    }
  }
  const bodyTrimmed = bodyText.trim();
  if (!bodyTrimmed) throw new Error(`Missing function body at ${source.line}:${source.column}`);
  let body;
  try {
    body = parseExpression(bodyTrimmed, source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid function body at ${source.line}:${source.column}: ${message}`);
  }
  return {
    type: 'functionDeclaration',
    name,
    parameters,
    returnType: parseTypeReference(returnTypeText, source),
    body,
    ...(exported ? { exported } : {}),
    source
  };
}

function findLoopEnd(lines: string[], startIndex: number, source: SourceLocation): number {
  const text = lines.slice(startIndex).join('\n');
  let open = -1;
  let depth = 0;

  for (let offset = 0; offset < text.length; offset++) {
    const character = text[offset];
    if (character === '"' || character === "'") {
      const end = findStringLiteralEnd(text, offset);
      if (end === undefined) {
        const before = text.slice(0, offset).split('\n');
        syntaxError('Invalid or incomplete string in for loop', {
          line: source.line + before.length - 1,
          column: before[before.length - 1].length + 1
        });
      }
      offset = end;
      continue;
    }
    if (character === '{') {
      if (open === -1) open = offset;
      depth++;
    } else if (character === '}' && open !== -1) {
      depth--;
      if (depth === 0) {
        return startIndex + text.slice(0, offset).split('\n').length - 1;
      }
    }
  }
  throw new Error(`${open === -1 ? "Expected '{' to start" : 'Unclosed'} for loop at ${source.line}:${source.column}`);
}

function collectExpressionLoop(
  lines: string[],
  lineIndex: number,
  expression: string,
  start: SourceLocation
): { text: string; lineCount: number } {
  if (!containsForExpression(expression) && !containsMatchExpression(expression)) {
    return collectDelimitedExpression(lines, lineIndex, expression);
  }
  if (containsMatchExpression(expression) && !containsForExpression(expression)) {
    const end = findLoopEnd(lines, lineIndex, { line: start.line + lineIndex, column: start.column });
    const expressionOffset = lines[lineIndex].lastIndexOf(expression);
    return {
      text: [lines[lineIndex].slice(expressionOffset), ...lines.slice(lineIndex + 1, end + 1)].join('\n'),
      lineCount: end - lineIndex + 1
    };
  }
  const loopEnd = findLoopEnd(lines, lineIndex, {
    line: start.line + lineIndex,
    column: start.column
  });
  const expressionOffset = lines[lineIndex].lastIndexOf(expression);
  return {
    text: [lines[lineIndex].slice(expressionOffset), ...lines.slice(lineIndex + 1, loopEnd + 1)].join('\n'),
    lineCount: loopEnd - lineIndex + 1
  };
}

function collectDelimitedExpression(
  lines: string[],
  lineIndex: number,
  expression: string
): { text: string; lineCount: number } {
  const expressionOffset = lines[lineIndex].lastIndexOf(expression);
  const parts = [lines[lineIndex].slice(expressionOffset)];
  const delimiters: string[] = [];
  const scan = (text: string) => {
    for (let index = 0; index < text.length; index++) {
      const character = text[index];
      if (character === '"' || character === "'") {
        const end = findStringLiteralEnd(text, index);
        if (end === undefined) break;
        index = end;
        continue;
      }
      if (character === '(' || character === '[' || character === '{') delimiters.push(character);
      else if (character === ')' || character === ']' || character === '}') {
        const expected = character === ')' ? '(' : character === ']' ? '[' : '{';
        if (delimiters[delimiters.length - 1] === expected) delimiters.pop();
      }
    }
  };
  scan(parts[0]);
  let lineCount = 1;
  const statementIndent = lines[lineIndex].length - lines[lineIndex].trimStart().length;
  while (delimiters.length > 0 && lineIndex + lineCount < lines.length) {
    const nextLine = lines[lineIndex + lineCount];
    if (nextLine.trim()) {
      const indentation = nextLine.length - nextLine.trimStart().length;
      const previous = parts[parts.length - 1].trimEnd();
      const startsStatement = /^(?:export\s+)?(?:let|type|fn|import|input|table|chart|show|for|return|add|remove)\b/.test(nextLine.trimStart())
        || /^[A-Za-z][A-Za-z0-9_]*\s*(?:\+=|=(?!=))/.test(nextLine.trimStart());
      if (indentation <= statementIndent && startsStatement && !/[,([{+\-*/%^=]$/.test(previous)) break;
    }
    parts.push(nextLine);
    scan(nextLine);
    lineCount++;
  }
  return { text: parts.join('\n'), lineCount };
}

function containsForExpression(text: string): boolean {
  return /\bfor\s+[A-Za-z][A-Za-z0-9_]*\s+in\b/.test(withoutStringLiterals(text));
}

function containsMatchExpression(text: string): boolean {
  return /\bmatch\s+/.test(withoutStringLiterals(text));
}
