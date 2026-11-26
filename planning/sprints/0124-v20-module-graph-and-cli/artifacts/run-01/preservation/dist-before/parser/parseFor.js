import { parseExpression } from './parseExpression';
import { parseStatements } from './parseStatements';
function parseLoop(text, source) {
    const lines = text.split(/\r?\n/);
    const header = lines[0].match(/^\s*for\s+([A-Za-z][A-Za-z0-9_]*)\s+in\s+(.+?)\s*\{\s*$/);
    if (!header) {
        throw new Error(`Invalid for loop at ${source?.line ?? 1}:${source?.column ?? 1}`);
    }
    if (lines.length < 2 || !/^\s*}\s*$/.test(lines[lines.length - 1])) {
        throw new Error(`Unclosed for loop at ${source?.line ?? 1}:${source?.column ?? 1}`);
    }
    if (lines.slice(1, -1).some(line => /^\s*for\b/.test(line))) {
        throw new Error(`Nested loops are unsupported at ${source?.line ?? 1}:${source?.column ?? 1}`);
    }
    return {
        variable: header[1],
        iterableText: header[2],
        bodyText: lines.slice(1, -1).join('\n'),
        bodySource: { line: (source?.line ?? 1) + 1, column: 1 }
    };
}
export function parseForStatement(text, source, context = {}) {
    const loop = parseLoop(text, source);
    const body = parseStatements(loop.bodyText, loop.bodySource, { ...context, allowFor: false });
    return {
        type: 'forStatement',
        variable: loop.variable,
        iterable: parseExpression(loop.iterableText, source),
        body,
        source
    };
}
export function parseForExpression(text, source) {
    const loop = parseLoop(text, source);
    const body = parseStatements(loop.bodyText, loop.bodySource, {
        allowReturn: true,
        allowFor: false
    });
    const returnCount = body.filter(statement => statement.type === 'returnStatement').length;
    if (returnCount !== 1) {
        throw new Error(`Expression-form for loops require exactly one return expression at ${source?.line ?? 1}:${source?.column ?? 1}`);
    }
    return {
        type: 'forExpression',
        variable: loop.variable,
        iterable: parseExpression(loop.iterableText, source),
        body,
        source
    };
}
//# sourceMappingURL=parseFor.js.map