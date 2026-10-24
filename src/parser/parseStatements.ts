import { ChartDeclarationNode, ChartFieldOptionNode, ChartSeriesOptionNode, DiagramDeclarationNode, DiagramElementNode, DiagramPropertyNode, DiagramTimeNode, EnumDeclarationNode, FunctionDeclarationNode, FunctionParameterNode, ImportDeclarationNode, ImportedNameNode, InputDeclarationNode, SourceLocation, StatementNode, TableDeclarationNode, TypeReferenceNode, VariableDeclarationNode, VisualizationOptionNode } from '../ast/types';
import { parseExpression } from './parseExpression';
import { parseForStatement } from './parseFor';
import { parseBracedIfStatement } from './parseIf';
import { AmxError, staticError, syntaxError } from '../diagnostics/errors';
import { findStringLiteralEnd, withoutStringLiterals } from './stringScanner';

interface ParseContext {
  allowReturn?: boolean;
  allowFunctionReturn?: boolean;
  inFunctionBody?: boolean;
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

    if (context.inFunctionBody) {
      const prohibited = functionBodyProhibitedStatement(rawLine);
      if (prohibited) {
        syntaxError(`The '${prohibited.keyword}' statement is not allowed in a function body.`, {
          line: lineNumber,
          column: i === 0 ? start.column + prohibited.column - 1 : prohibited.column
        });
      }
    }

    const reExportMatch = rawLine.match(/^(\s*)export\s*\{\s*([^}]*)\s*\}\s*$/);
    if (reExportMatch) {
      const names: ImportedNameNode[] = [];
      let cursor = rawLine.indexOf('{') + 1;
      for (const rawName of reExportMatch[2].split(',')) {
        const name = rawName.trim();
        if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) syntaxError(`Invalid re-exported name '${name}'`, { line: lineNumber, column: Math.max(1, cursor + 1) });
        const nameStart = rawLine.indexOf(name, cursor);
        names.push({ name, source: { line: lineNumber, column: nameStart + 1 } });
        cursor = nameStart + name.length;
      }
      if (!names.length) syntaxError('Re-export requires at least one name', { line: lineNumber, column: reExportMatch[1].length + 1 });
      statements.push({ type: 'exportNamesDeclaration', names, source: { line: lineNumber, column: reExportMatch[1].length + 1 } });
      continue;
    }

    let exported = false;
    const exportMatch = rawLine.match(/^(\s*)export(\s+)(type|enum|fn|let|table|chart|dimension|unit)\b/);
    if (exportMatch) {
      if (context.allowFor === false && exportMatch[3] !== 'table' && exportMatch[3] !== 'chart'
        && exportMatch[3] !== 'dimension' && exportMatch[3] !== 'unit') throw new Error(`Export declarations cannot occur in loops at ${lineNumber}:${exportMatch[1].length + 1}`);
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

    const dimensionMatch = rawLine.match(/^\s*dimension\s+([A-Za-z][A-Za-z0-9_]*)(?:\s*=\s*(.+))?\s*$/);
    if (/^\s*dimension\b/.test(rawLine)) {
      if (!dimensionMatch) syntaxError('Invalid dimension declaration', source);
      const expressionText = dimensionMatch[2];
      statements.push({
        type: 'dimensionDeclaration',
        name: dimensionMatch[1],
        nameSource: { line: source.line, column: rawLine.indexOf(dimensionMatch[1]) + 1 },
        ...(expressionText ? { expression: parseDeclarationExpression(rawLine, expressionText, source) } : {}),
        ...(exported ? { exported: true } : {}),
        source
      });
      continue;
    }

    const unitMatch = rawLine.match(/^\s*unit\s+([A-Za-z][A-Za-z0-9_]*)(?:\s*:\s*([A-Za-z][A-Za-z0-9_]*)|\s*=\s*(.+))\s*$/);
    if (/^\s*unit\b/.test(rawLine)) {
      if (!unitMatch) syntaxError('Invalid unit declaration', source);
      const dimensionName = unitMatch[2];
      const expressionText = unitMatch[3];
      const dimensionSource = dimensionName
        ? { line: source.line, column: rawLine.lastIndexOf(dimensionName) + 1 }
        : undefined;
      statements.push({
        type: 'unitDeclaration',
        name: unitMatch[1],
        nameSource: { line: source.line, column: rawLine.indexOf(unitMatch[1]) + 1 },
        ...(dimensionName ? { dimension: dimensionName, dimensionSource } : {}),
        ...(expressionText ? { expression: parseDeclarationExpression(rawLine, expressionText, source) } : {}),
        ...(exported ? { exported: true } : {}),
        source
      });
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

    if (/^\s*enum\b/.test(rawLine)) {
      if (context.allowFor === false) throw new Error(`Enum declarations cannot occur in loops at ${source.line}:${source.column}`);
      const header = rawLine.match(/^\s*enum\s+([A-Za-z][A-Za-z0-9_]*)\s*=\s*\{\s*$/);
      if (!header) syntaxError('Invalid enum declaration', source);
      const members: EnumDeclarationNode['members'] = [];
      let closed = false;
      let closingSource: SourceLocation | undefined;
      while (++i < lines.length) {
        const memberLine = lines[i];
        if (/^\s*}\s*$/.test(memberLine)) {
          closed = true;
          closingSource = { line: start.line + i, column: memberLine.indexOf('}') + 1 };
          break;
        }
        if (!memberLine.trim()) continue;
        const match = memberLine.match(/^\s*([A-Za-z][A-Za-z0-9_]*)(?:\s*=\s*(.+?))?\s*,?\s*$/);
        const memberColumn = match
          ? memberLine.indexOf(match[1]) + 1
          : memberLine.length - memberLine.trimStart().length + 1;
        const memberSource = { line: start.line + i, column: memberColumn };
        if (!match) syntaxError('Invalid enum member', memberSource);
        let value: ReturnType<typeof parseExpression> | undefined;
        let valueSource: SourceLocation | undefined;
        if (match[2]) {
          const valueText = match[2].replace(/,\s*$/, '').trim();
          const valueColumn = memberLine.indexOf(valueText, memberColumn - 1) + 1;
          valueSource = { line: memberSource.line, column: valueColumn };
          value = parseExpression(valueText, valueSource);
        }
        members.push({ name: match[1], nameSource: memberSource, ...(value ? { value, valueSource } : {}) });
      }
      if (!closed) syntaxError('Unclosed enum declaration', source);
      statements.push({
        type: 'enumDeclaration',
        name: header[1],
        nameSource: { line: source.line, column: rawLine.indexOf(header[1]) + 1 },
        members,
        closingSource,
        ...(exported ? { exported: true } : {}),
        source
      });
      continue;
    }

    function parseDeclarationExpression(rawLine: string, expressionText: string, source: SourceLocation): ReturnType<typeof parseExpression> {
      const offset = rawLine.indexOf(expressionText);
      try {
        return parseExpression(expressionText, { line: source.line, column: offset + 1 });
      } catch (error) {
        if (error instanceof AmxError && error.code === 'AMX3006') throw error;
        syntaxError(`Invalid dimension/unit expression: ${error instanceof Error ? error.message : String(error)}`, {
          line: source.line,
          column: offset + 1
        });
      }
    }

    if (/^\s*diagram\b/.test(rawLine)) {
      const parsed = parseDiagramDeclaration(lines, i, source);
      statements.push(parsed.statement);
      i = parsed.endIndex;
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
      const header = rawLine.match(/^\s*type\s+([A-Za-z][A-Za-z0-9_]*)(?:\s+extends\s+([A-Za-z][A-Za-z0-9_]*(?:\s*,\s*[A-Za-z][A-Za-z0-9_]*)*))?\s*\{\s*$/);
      if (!header) throw new Error(`Invalid type declaration at ${source.line}:${source.column}`);
      let parentSearchFrom = rawLine.indexOf('extends') + 'extends'.length;
      const parents = header[2] ? header[2].split(',').map(rawName => {
        const name = rawName.trim();
        const parentIndex = rawLine.indexOf(name, parentSearchFrom);
        parentSearchFrom = parentIndex + name.length;
        return { name, source: { line: source.line, column: parentIndex + 1 } };
      }) : undefined;
      const fields = [];
      let closed = false;
      while (++i < lines.length) {
        const fieldLine = lines[i];
        if (/^\s*}\s*$/.test(fieldLine)) { closed = true; break; }
        if (!fieldLine.trim()) continue;
        const match = fieldLine.match(/^\s*(?:(override)\s+)?([A-Za-z][A-Za-z0-9_]*)(\?)?\s*:\s*([A-Za-z][A-Za-z0-9_]*(?:(?:\[\])|\?)*)\s*(?:=\s*(.+))?\s*$/);
        const fieldColumn = match
          ? fieldLine.indexOf(match[2], match[1] ? fieldLine.indexOf(match[1]) + match[1].length : 0) + 1
          : fieldLine.length - fieldLine.trimStart().length + 1;
        const fieldSource = { line: start.line + i, column: fieldColumn };
        if (!match) throw new Error(`Invalid record field at ${fieldSource.line}:${fieldSource.column}`);
        const overrideSource = match[1]
          ? { line: fieldSource.line, column: fieldLine.indexOf(match[1]) + 1 }
          : undefined;
        fields.push({ name: match[2], optional: !!match[3], annotation: parseTypeReference(match[4], fieldSource),
          ...(match[1] ? { override: true, overrideSource } : {}),
          ...(match[5] ? { defaultExpression: parseExpression(match[5], { line: fieldSource.line, column: fieldLine.indexOf(match[5]) + 1 }) } : {}), source: fieldSource });
      }
      if (!closed) throw new Error(`Unclosed type declaration at ${source.line}:${source.column}`);
      statements.push({
        type: 'typeDeclaration',
        name: header[1],
        nameSource: { line: source.line, column: rawLine.indexOf(header[1]) + 1 },
        fields,
        ...(parents ? { parents } : {}),
        ...(exported ? { exported } : {}),
        source
      });
      continue;
    }

    if (context.allowFor === false && containsForExpression(rawLine)) {
      throw new Error(`Nested loops are unsupported at ${source.line}:${source.column}`);
    }

    if (/^\s*if\b/.test(rawLine)) {
      const collected = collectDelimitedExpression(lines, i, rawLine.trimStart());
      const parsed = parseBracedIfStatement(collected.text, source, context);
      statements.push(parsed.statement);
      i += parsed.lineCount - 1;
      continue;
    }

    if (/^\s*for\b/.test(rawLine)) {
      if (context.allowFor === false) {
        throw new Error(`Nested loops are unsupported at ${source.line}:${source.column}`);
      }
      const endIndex = findLoopEnd(lines, i, { line: lineNumber, column: source.column });
      statements.push(parseForStatement(lines.slice(i, endIndex + 1).join('\n'), source, {
        allowFunctionReturn: context.allowFunctionReturn,
        inFunctionBody: context.inFunctionBody
      }));
      i = endIndex;
      continue;
    }

    if (/^\s*(break|continue)\b/.test(rawLine)) {
      throw new Error(`Unsupported loop control statement at ${source.line}:${source.column}`);
    }

    const returnKeyword = /^\s*return\b/.exec(rawLine);
    if (returnKeyword) {
      const returnMatch = rawLine.match(/^\s*return\s+(.+?)\s*$/);
      if (context.allowReturn !== true && context.allowFunctionReturn !== true) {
        syntaxError('Return is only valid inside a function or expression-form loop', source);
      }
      if (!returnMatch) {
        syntaxError(context.inFunctionBody ? 'Invalid syntax in function body' : 'Invalid return statement', source);
      }
      const expressionText = collectExpressionLoop(lines, i, returnMatch[1], start);
      const expressionSource = context.allowFunctionReturn === true
        ? statementExpressionLocation(rawLine, rawLine.indexOf(returnMatch[1]), source)
        : containsMatchExpression(expressionText.text)
          ? { line: source.line, column: rawLine.indexOf(returnMatch[1]) + 1 }
          : start;
      statements.push({
        type: 'returnStatement',
        expression: parseExpression(expressionText.text, expressionSource),
        source
      });
      i += expressionText.lineCount - 1;
      continue;
    }

    const addMatch = rawLine.match(/^\s*add\s+(.+)$/);
    if (addMatch) {
      const collected = collectDelimitedExpression(lines, i, addMatch[1]);
      const remainder = collected.text;
      const remainderSource = statementExpressionLocation(rawLine, rawLine.lastIndexOf(addMatch[1]), source);
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
      const remainderSource = statementExpressionLocation(rawLine, rawLine.lastIndexOf(removeMatch[1]), source);
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
        const expressionOffset = rawLine.lastIndexOf(letMatch[3]);
        const expressionSource = context.inFunctionBody
          ? statementExpressionLocation(rawLine, expressionOffset, source)
          : { line: source.line, column: expressionOffset + 1 };
        expression = parseExpression(expressionText.text, containsForExpression(expressionText.text) && !containsMatchExpression(expressionText.text)
          ? source : expressionSource);
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

    if (context.inFunctionBody && /^\s*let\b/.test(rawLine)) {
      const invalidToken = rawLine.indexOf('=') >= 0 ? rawLine.indexOf('=') : rawLine.search(/\S/);
      syntaxError('Invalid syntax in function body', {
        line: lineNumber,
        column: i === 0 ? start.column + invalidToken : invalidToken + 1
      });
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
          expression: parseExpression(expressionText.text, context.inFunctionBody
            ? statementExpressionLocation(rawLine, rawLine.lastIndexOf(assignment[2]), source)
            : { line: source.line, column: rawLine.lastIndexOf(assignment[2]) + 1 }),
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

    if (context.inFunctionBody) syntaxError('Invalid syntax in function body', source);
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

function statementExpressionLocation(rawLine: string, offset: number, statementSource: SourceLocation): SourceLocation {
  const indentation = rawLine.length - rawLine.trimStart().length;
  return locationAtOffset(rawLine, offset, {
    line: statementSource.line,
    column: statementSource.column - indentation
  });
}

function functionBodyProhibitedStatement(rawLine: string): { keyword: string; column: number } | undefined {
  const prefix = rawLine.match(/^\s*(export)\b/);
  if (prefix) return { keyword: prefix[1], column: rawLine.indexOf(prefix[1]) + 1 };
  const statement = rawLine.match(/^\s*(import|type|enum|dimension|unit|input|table|chart|diagram|show|fn)\b/);
  if (!statement) return undefined;
  return { keyword: statement[1], column: rawLine.indexOf(statement[1]) + 1 };
}

function findUnquotedSemicolon(text: string): number | undefined {
  for (let offset = 0; offset < text.length; offset++) {
    if (text[offset] === '"' || text[offset] === "'") {
      const end = findStringLiteralEnd(text, offset);
      if (end === undefined) return undefined;
      offset = end;
    } else if (text[offset] === ';') {
      return offset;
    }
  }
  return undefined;
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

function parseDiagramDeclaration(
  lines: string[],
  startIndex: number,
  source: SourceLocation
): { statement: DiagramDeclarationNode; endIndex: number } {
  const headerLine = lines[startIndex];
  const header = headerLine.match(/^\s*diagram\s+([A-Za-z][A-Za-z0-9_]*)\s*\{\s*$/);
  if (!header) syntaxError('Invalid diagram declaration', source);

  const name = header[1];
  const statement: DiagramDeclarationNode = {
    type: 'diagramDeclaration',
    name,
    nameSource: { line: source.line, column: headerLine.indexOf(name) + 1 },
    properties: [],
    times: [],
    elements: [],
    source
  };

  let index = startIndex + 1;
  while (index < lines.length) {
    const line = lines[index];
    if (/^\s*}\s*$/.test(line)) return { statement, endIndex: index };
    if (!line.trim()) { index++; continue; }
    const lineSource = {
      line: source.line + index - startIndex,
      column: line.length - line.trimStart().length + 1
    };

    const timeHeader = line.match(/^\s*time\s+([A-Za-z][A-Za-z0-9_]*)\s+from\s+(.+)$/);
    if (timeHeader) {
      const tail = timeHeader[2];
      const tailOffset = line.indexOf(tail);
      const durationKeyword = findTopLevelKeyword(tail, 'duration');
      if (!durationKeyword) syntaxError('Invalid diagram time declaration', lineSource);
      const bounds = tail.slice(0, durationKeyword.start).trim();
      const toKeyword = findTopLevelKeyword(bounds, 'to');
      if (!toKeyword) syntaxError('Invalid diagram time declaration', lineSource);
      const fromText = bounds.slice(0, toKeyword.start).trim();
      const toText = bounds.slice(toKeyword.end).trim();
      const durationText = tail.slice(durationKeyword.end).trim();
      if (!fromText || !toText || !durationText) syntaxError('Invalid diagram time declaration', lineSource);
      const expressionSource = (offset: number) =>
        locationAtOffset(tail, offset, {
          line: lineSource.line,
          column: tailOffset + 1
        });
      const fromSource = expressionSource(tail.indexOf(fromText));
      const toSource = expressionSource(tail.indexOf(toText, toKeyword.end));
      const durationSource = expressionSource(tail.indexOf(durationText, durationKeyword.end));
      const time: DiagramTimeNode = {
        name: timeHeader[1],
        nameSource: { line: lineSource.line, column: line.indexOf(timeHeader[1]) + 1 },
        from: parseExpression(fromText, fromSource),
        fromText,
        fromSource,
        to: parseExpression(toText, toSource),
        toText,
        toSource,
        duration: parseExpression(durationText, durationSource),
        durationText,
        durationSource,
        source: lineSource
      };
      statement.times.push(time);
      index++;
      continue;
    }

    const elementHeader = line.match(/^\s*([A-Za-z][A-Za-z0-9_]*)\s+([A-Za-z][A-Za-z0-9_]*)\s*\{\s*$/);
    if (elementHeader) {
      const primitive = elementHeader[1];
      const elementName = elementHeader[2];
      const element: DiagramElementNode = {
        type: 'diagramElement',
        primitive,
        name: elementName,
        nameSource: { line: lineSource.line, column: line.indexOf(elementName) + 1 },
        properties: [],
        source: { line: lineSource.line, column: lineSource.column }
      };
      index++;
      let elementClosed = false;
      while (index < lines.length) {
        const propertyLine = lines[index];
        if (/^\s*}\s*$/.test(propertyLine)) {
          elementClosed = true;
          index++;
          break;
        }
        if (!propertyLine.trim()) { index++; continue; }
        const property = parseDiagramProperty(lines, index, source.line + index - startIndex);
        element.properties.push(property.node);
        index += property.lineCount;
      }
      if (!elementClosed) syntaxError('Unclosed diagram element', element.source);
      statement.elements.push(element);
      continue;
    }

    const property = parseDiagramProperty(lines, index, source.line + index - startIndex);
    statement.properties.push(property.node);
    index += property.lineCount;
  }

  syntaxError('Unclosed diagram declaration', source);
}

function parseDiagramProperty(
  lines: string[],
  index: number,
  lineNumber: number
): { node: DiagramPropertyNode; lineCount: number } {
  const line = lines[index];
  const match = line.match(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/);
  const source = {
    line: lineNumber,
    column: line.length - line.trimStart().length + 1
  };
  if (!match) syntaxError('Invalid diagram property', source);
  const name = match[1];
  const initialValue = match[2];
  if (!initialValue.trim()) syntaxError('Invalid diagram property value', source);
  const collected = collectDelimitedExpression(lines, index, initialValue);
  const rawValue = collected.text.trim();
  const valueOffset = line.indexOf(initialValue) + initialValue.indexOf(initialValue.trim());
  const valueSource = locationAtOffset(rawValue, 0, {
    line: source.line,
    column: valueOffset + 1
  });
  return {
    node: {
      name,
      expression: parseExpression(rawValue, valueSource),
      rawValue,
      nameSource: { line: source.line, column: line.indexOf(name) + 1 },
      valueSource,
      source
    },
    lineCount: collected.lineCount
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
  const firstLine = lines[startIndex] ?? '';
  const expressionBody = firstLine.match(/^\s*fn\s+[A-Za-z][A-Za-z0-9_]*\s*\([^)]*\)\s*:\s*[A-Za-z][A-Za-z0-9_]*(?:(?:\[\])|\?)*\s*=\s*(.*)$/);
  if (expressionBody?.[1]) {
    try {
      parseExpression(expressionBody[1], source);
      return startIndex;
    } catch {
    }
  }

  const text = lines.slice(startIndex).join('\n');
  let depth = 0;
  let openingOffset: number | undefined;

  for (let offset = 0; offset < text.length; offset++) {
    if (text[offset] === '"' || text[offset] === "'") {
      const end = findStringLiteralEnd(text, offset);
      if (end === undefined) {
        if (openingOffset !== undefined) syntaxError('Invalid syntax in function body', functionTextLocation(text, offset, source));
        return startIndex;
      }
      offset = end;
      continue;
    }
    if (text[offset] === '{') {
      if (openingOffset === undefined) openingOffset = offset;
      depth++;
    } else if (text[offset] === '}' && openingOffset !== undefined) {
      depth--;
      if (depth === 0) return startIndex + text.slice(0, offset).split('\n').length - 1;
    }
  }

  if (openingOffset === undefined) return startIndex;
  syntaxError('Unclosed function body', functionTextLocation(text, openingOffset, source));
}

function parseFunctionDeclaration(text: string, source: SourceLocation, exported: boolean): FunctionDeclarationNode {
  const match = text.match(/^\s*fn\s+([A-Za-z][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*:\s*([A-Za-z][A-Za-z0-9_]*(?:(?:\[\])|\?)*)\s*([\s\S]*)$/);
  if (!match) throw new Error(`Invalid function declaration at ${source.line}:${source.column}`);
  const [, name, paramsText, returnTypeText, bodySuffix] = match;
  const paramsRaw = paramsText.trim();
  const parameters: FunctionParameterNode[] = [];
  if (paramsRaw) {
    for (const part of paramsRaw.split(',')) {
      const paramMatch = part.trim().match(/^([A-Za-z][A-Za-z0-9_]*)\s*:\s*([A-Za-z][A-Za-z0-9_]*(?:(?:\[\])|\?)*)$/);
      if (!paramMatch) throw new Error(`Invalid function parameter at ${source.line}:${source.column}`);
      parameters.push({ name: paramMatch[1], annotation: parseTypeReference(paramMatch[2], source), source });
    }
  }
  const bodyOffset = text.length - bodySuffix.length;
  const bodyTrimmed = bodySuffix.trim();
  if (!bodyTrimmed) throw new Error(`Missing function body at ${source.line}:${source.column}`);

  let body: FunctionDeclarationNode['body'];
  if (bodyTrimmed.startsWith('=')) {
    const expressionText = bodyTrimmed.slice(1).trim();
    const nestedDeclaration = /^(?:\s*)(?:(?:export\s+)?(?:dimension|unit)\s+[A-Za-z][A-Za-z0-9_]*|export\s*\{)/m.exec(expressionText);
    if (nestedDeclaration) {
      const declarationOffset = bodyOffset + bodySuffix.indexOf(expressionText) + nestedDeclaration.index + nestedDeclaration[0].search(/\S/);
      staticError('AMX3008', 'Dimension/unit declarations and re-exports may only occur at module scope',
        functionTextLocation(text, declarationOffset, source));
    }
    if (!expressionText) throw new Error(`Missing function body at ${source.line}:${source.column}`);
    let expression;
    try {
      expression = parseExpression(expressionText, source);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid function body at ${source.line}:${source.column}: ${message}`);
    }
    body = { kind: 'expression', expression };
  } else if (bodyTrimmed.startsWith('{')) {
    const openingOffset = bodyOffset + bodySuffix.indexOf('{');
    const openingSource = functionTextLocation(text, openingOffset, source);
    const closingOffset = matchingFunctionBrace(text, openingOffset, source);
    if (closingOffset === undefined) syntaxError('Unclosed function body', openingSource);
    const trailingText = text.slice(closingOffset + 1);
    if (trailingText.trim()) {
      const trailingOffset = closingOffset + 1 + trailingText.search(/\S/);
      syntaxError('Invalid syntax in function body', functionTextLocation(text, trailingOffset, source));
    }

    const statementText = text.slice(openingOffset + 1, closingOffset);
    const statementsSource = functionTextLocation(text, openingOffset + 1, source);
    const semicolonOffset = findUnquotedSemicolon(statementText);
    if (semicolonOffset !== undefined) {
      syntaxError('Invalid syntax in function body', functionTextLocation(text, openingOffset + 1 + semicolonOffset, source));
    }
    let statements: StatementNode[];
    try {
      statements = parseStatements(statementText, statementsSource, {
        allowFunctionReturn: true,
        inFunctionBody: true
      });
    } catch (error) {
      if (error instanceof AmxError && (
        error.message === 'Invalid syntax in function body'
        || error.message === 'Return is only valid inside a function or expression-form loop'
        || /^The '.+' statement is not allowed in a function body\.$/.test(error.message)
      )) throw error;
      if (error instanceof Error && /^(Nested loops are unsupported|Unsupported loop control statement)/.test(error.message)) {
        throw error;
      }
      const location = error instanceof AmxError && error.line && error.column
        ? { line: error.line, column: error.column }
        : error instanceof Error
          ? errorLocationFromMessage(error.message) ?? openingSource
          : openingSource;
      syntaxError('Invalid syntax in function body', location);
    }
    body = {
      kind: 'statements',
      statements,
      source: openingSource,
      openingSource,
      closingSource: functionTextLocation(text, closingOffset, source)
    };
  } else {
    syntaxError('Invalid syntax in function body', functionTextLocation(text, bodyOffset, source));
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

function matchingFunctionBrace(text: string, openingOffset: number, source: SourceLocation): number | undefined {
  let depth = 0;
  for (let offset = openingOffset; offset < text.length; offset++) {
    if (text[offset] === '"' || text[offset] === "'") {
      const end = findStringLiteralEnd(text, offset);
      if (end === undefined) syntaxError('Invalid syntax in function body', functionTextLocation(text, offset, source));
      offset = end;
      continue;
    }
    if (text[offset] === '{') depth++;
    else if (text[offset] === '}' && --depth === 0) return offset;
  }
  return undefined;
}

function functionTextLocation(text: string, offset: number, source: SourceLocation): SourceLocation {
  const functionOffset = text.indexOf('fn');
  return locationAtOffset(text.slice(functionOffset), offset - functionOffset, source);
}

function errorLocationFromMessage(message: string): SourceLocation | undefined {
  const match = message.match(/(?:at\s+)?(\d+):(\d+)\b/);
  return match ? { line: Number(match[1]), column: Number(match[2]) } : undefined;
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
