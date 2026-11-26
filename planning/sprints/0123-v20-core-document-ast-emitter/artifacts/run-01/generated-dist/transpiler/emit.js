import { parseFrontMatter } from '../parser/parseFrontMatter';
import { safeNarrativeComments } from './source';
export class LoweringFailure extends Error {
    line;
    column;
    constructor(message, line, column) {
        super(message);
        this.line = line;
        this.column = column;
        this.name = 'LoweringFailure';
    }
}
const builtinNames = new Set([
    'sum', 'min', 'max', 'mean', 'round', 'abs', 'sqrt', 'pow', 'len', 'trim',
    'left', 'right', 'format', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh', 'ln', 'log', 'exp'
]);
const reservedWords = new Set([
    'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
    'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false',
    'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let',
    'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try',
    'typeof', 'var', 'void', 'while', 'with', 'yield'
]);
function quote(value) {
    return JSON.stringify(value).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
function hash(value) {
    return Array.from(value, character => character.codePointAt(0).toString(16)).join('_') || 'empty';
}
function isComparison(operator) {
    return ['==', '!=', '>', '>=', '<', '<=', 'and', 'or'].includes(operator);
}
class ModuleEmitter {
    module;
    isEntry;
    prefix;
    declaredScopes = [new Set()];
    mutationTargets = new Set();
    localTypes = new Map();
    recordTypes = new Map();
    enumTypes = new Map();
    functions = new Map();
    viewDefinitions = new Map();
    importedBindings = new Set();
    inputs;
    sourceFile;
    expressionLoopReturns = [];
    constructor(module, isEntry) {
        this.module = module;
        this.isEntry = isEntry;
        this.inputs = moduleStatements(module).filter((statement) => statement.type === 'inputDeclaration');
        this.prefix = `__amx_${hash(module.input.outputPath)}_`;
        this.sourceFile = module.input.sourcePath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(module.input.sourcePath)
            ? module.input.outputPath.replace(/\.ts$/, '.amx')
            : module.input.sourcePath;
        for (const [name, type] of module.check.bindingTypes)
            this.localTypes.set(name, type);
        for (const statement of module.statements) {
            if (statement.type === 'typeDeclaration')
                this.recordTypes.set(statement.name, statement);
            else if (statement.type === 'enumDeclaration')
                this.enumTypes.set(statement.name, statement);
            else if (statement.type === 'functionDeclaration')
                this.functions.set(statement.name, statement);
            else if (statement.type === 'tableDeclaration' || statement.type === 'chartDeclaration')
                this.viewDefinitions.set(statement.name, statement);
        }
        for (const statement of module.statements) {
            if (statement.type !== 'importDeclaration')
                continue;
            const dependency = module.imports.get(statement.path);
            if (!dependency)
                continue;
            for (const imported of statement.names) {
                const name = imported.name;
                if (dependency.check.exportedTypes.has(name))
                    this.recordTypes.set(name, dependency.check.exportedTypes.get(name));
                else if (dependency.check.exportedEnums.has(name))
                    this.enumTypes.set(name, dependency.check.exportedEnums.get(name));
                else if (dependency.check.exportedFunctions.has(name))
                    this.functions.set(name, dependency.check.exportedFunctions.get(name));
                else if (dependency.check.exportedBindings.has(name))
                    this.importedBindings.add(name);
            }
        }
        for (const statement of module.statements)
            this.collectMutationTargets(statement);
    }
    name(value) {
        return `${this.prefix}${value}`;
    }
    sourceContext(source) {
        return `{ file: ${quote(this.sourceFile)}${source ? `, line: ${source.line}, column: ${source.column}` : ''} }`;
    }
    checkedTypeForReference(reference, owner) {
        if (reference.type === 'listType')
            return { kind: 'list', element: this.checkedTypeForReference(reference.element, owner) };
        if (reference.type === 'nullableType')
            return { kind: 'nullable', element: this.checkedTypeForReference(reference.element, owner) };
        const dimension = this.module.check.dimensions.get(reference.name);
        return dimension
            ? { kind: 'measurement', vector: dimension.vector }
            : { kind: 'named', name: reference.name };
    }
    typeScriptType(type, external = false) {
        switch (type.kind) {
            case 'null': return 'null';
            case 'measurement': return external ? '__AMXMeasurementInput' : '__AMXMeasurement';
            case 'list': return `(${this.typeScriptType(type.element, external)})[]`;
            case 'nullable': return `${this.typeScriptType(type.element, external)} | null`;
            case 'named':
                if (type.name === 'Number')
                    return 'number';
                if (type.name === 'String' || type.name === 'DateTime')
                    return 'string';
                if (type.name === 'Boolean')
                    return 'boolean';
                if (external && this.recordTypes.has(type.name))
                    return `__AMXExternal_${this.name(type.name)}`;
                return this.name(type.name);
        }
    }
    typeScriptReference(reference, external = false, owner) {
        return this.typeScriptType(this.checkedTypeForReference(reference, owner), external);
    }
    collectMutationTargets(statement) {
        if (statement.type === 'assignmentStatement' || statement.type === 'compoundAssignmentStatement') {
            this.mutationTargets.add(statement.name);
        }
        else if (statement.type === 'forStatement') {
            statement.body.forEach(child => this.collectMutationTargets(child));
        }
        else if (statement.type === 'bracedIfStatement') {
            statement.consequent.forEach(child => this.collectMutationTargets(child));
            statement.alternate?.forEach(child => this.collectMutationTargets(child));
        }
    }
    expressionType(expression, expected) {
        if (expected)
            return expected;
        switch (expression.type) {
            case 'numberLiteral': return { kind: 'named', name: 'Number' };
            case 'stringLiteral':
            case 'stringInterpolation': return { kind: 'named', name: 'String' };
            case 'booleanLiteral':
            case 'typeTestExpression': return { kind: 'named', name: 'Boolean' };
            case 'nullLiteral': return { kind: 'null' };
            case 'identifier': return this.localTypes.get(expression.name) ?? { kind: 'named', name: 'Number' };
            case 'binaryExpression':
                if (isComparison(expression.operator))
                    return { kind: 'named', name: 'Boolean' };
                return this.expressionType(expression.left);
            case 'unaryExpression': return expression.operator === 'not'
                ? { kind: 'named', name: 'Boolean' }
                : this.expressionType(expression.argument);
            case 'measurementAttachment': {
                const unit = this.module.check.units.get(expression.unit);
                return { kind: 'measurement', vector: unit?.vector ?? new Map() };
            }
            case 'measurementConversion': return this.expressionType(expression.value);
            case 'conditionalExpression': return this.expressionType(expression.consequent);
            case 'listLiteral': return {
                kind: 'list',
                element: expression.elements.length ? this.expressionType(expression.elements[0]) : { kind: 'named', name: 'Number' }
            };
            case 'rangeExpression': return { kind: 'list', element: { kind: 'named', name: 'Number' } };
            case 'listAccess': {
                const receiver = this.expressionType(expression.receiver);
                return receiver.kind === 'list' ? receiver.element : { kind: 'named', name: 'Number' };
            }
            case 'recordConstructor': return { kind: 'named', name: expression.name };
            case 'fieldAccess': {
                if (expression.receiver.type === 'identifier') {
                    const enumeration = this.enumTypes.get(expression.receiver.name);
                    if (enumeration) {
                        const index = enumeration.members.findIndex(member => member.name === expression.field);
                        const value = enumeration.resolvedValues?.[index];
                        return { kind: 'named', name: typeof value === 'string' ? 'String' : 'Number' };
                    }
                    const record = this.recordTypes.get(expression.receiver.name);
                    const field = record?.fields.find(candidate => candidate.name === expression.field);
                    if (field)
                        return this.checkedTypeForReference(field.annotation, field);
                }
                const receiver = this.expressionType(expression.receiver);
                if (receiver.kind === 'named') {
                    const field = this.recordTypes.get(receiver.name)?.fields.find(candidate => candidate.name === expression.field);
                    if (field)
                        return this.checkedTypeForReference(field.annotation, field);
                }
                return { kind: 'named', name: 'Number' };
            }
            case 'functionCall': {
                const fn = this.functions.get(expression.callee);
                if (fn)
                    return this.checkedTypeForReference(fn.returnType);
                if (['trim', 'left', 'right', 'format'].includes(expression.callee))
                    return { kind: 'named', name: 'String' };
                if (expression.callee === 'len')
                    return { kind: 'named', name: 'Number' };
                if (['sum', 'min', 'max', 'mean', 'abs', 'round'].includes(expression.callee) && expression.arguments[0]) {
                    const first = this.expressionType(expression.arguments[0]);
                    return first.kind === 'list' ? first.element : first;
                }
                return { kind: 'named', name: 'Number' };
            }
            case 'matchExpression': return this.expressionType(expression.defaultExpression);
            case 'forExpression': {
                const returned = expression.body.find(statement => statement.type === 'returnStatement');
                return { kind: 'list', element: returned?.type === 'returnStatement'
                        ? this.expressionType(returned.expression)
                        : { kind: 'named', name: 'Number' } };
            }
            case 'bracedIfExpression': {
                const returned = [...expression.consequent, ...expression.alternate]
                    .find(statement => statement.type === 'returnStatement');
                return returned?.type === 'returnStatement' ? this.expressionType(returned.expression) : { kind: 'named', name: 'Number' };
            }
        }
    }
    castExpression(code, type) {
        return `(${code} as unknown as ${this.typeScriptType(type)})`;
    }
    expression(expression, expected) {
        const resultType = this.expressionType(expression, expected);
        const context = this.sourceContext(expression.source);
        switch (expression.type) {
            case 'numberLiteral': return String(expression.value);
            case 'stringLiteral': return quote(expression.value);
            case 'booleanLiteral': return String(expression.value);
            case 'nullLiteral': return 'null';
            case 'identifier':
                if (expression.name === 'PI')
                    return 'Math.PI';
                if (expression.name === 'E')
                    return 'Math.E';
                return this.name(expression.name);
            case 'binaryExpression':
                return this.castExpression(`__amxBinary(${quote(expression.operator)}, ${this.expression(expression.left)} as __AMXValue, ${this.expression(expression.right)} as __AMXValue, ${this.sourceContext(expression.operatorSource ?? expression.source)})`, resultType);
            case 'unaryExpression':
                return this.castExpression(`__amxUnary(${quote(expression.operator)}, ${this.expression(expression.argument)} as __AMXValue, ${context})`, resultType);
            case 'typeTestExpression':
                return `__amxIsType(${this.expression(expression.value)} as __AMXValue, ${this.inputDescriptor(expression.target)})`;
            case 'measurementAttachment': {
                const unit = this.module.check.units.get(expression.unit);
                if (!unit)
                    throw new LoweringFailure(`Missing checked unit '${expression.unit}'`, expression.unitSource?.line, expression.unitSource?.column);
                return this.castExpression(`__amxAttach(${this.expression(expression.value)} as number, ${this.unitDescriptor(expression.unit)})`, resultType);
            }
            case 'measurementConversion':
                return this.castExpression(`__amxConvert(${this.expression(expression.value)} as __AMXMeasurement, ${this.unitDescriptor(expression.unit)})`, resultType);
            case 'stringInterpolation':
                return `[${expression.parts.map(part => typeof part === 'string'
                    ? quote(part)
                    : `__amxFormatValue(${this.expression(part)} as __AMXValue, ${this.sourceContext(part.source)})`).join(', ')}].join('')`;
            case 'conditionalExpression':
                return `(${this.expression(expression.test, { kind: 'named', name: 'Boolean' })} ? ${this.expression(expression.consequent, resultType)} : ${this.expression(expression.alternate, resultType)})`;
            case 'bracedIfExpression': {
                const branches = this.expressionLoopBranch(expression.consequent, expression.alternate, resultType);
                return `((): ${this.typeScriptType(resultType)} => { if (${this.expression(expression.test, { kind: 'named', name: 'Boolean' })}) {\n${branches[0]}\n  } else {\n${branches[1]}\n  } throw new Error('Unreachable checked expression branch'); })()`;
            }
            case 'listLiteral':
                return `[${expression.elements.map(element => this.expression(element, resultType.kind === 'list' ? resultType.element : undefined)).join(', ')}]`;
            case 'rangeExpression':
                return `__amxRange(${this.expression(expression.start, { kind: 'named', name: 'Number' })}, ${this.expression(expression.end, { kind: 'named', name: 'Number' })}, ${context})`;
            case 'listAccess':
                return this.castExpression(`__amxGet1Based(${this.expression(expression.receiver)} as __AMXValue[], ${this.expression(expression.index, { kind: 'named', name: 'Number' })}, ${context})`, resultType);
            case 'fieldAccess':
                return `${this.expression(expression.receiver)}[${quote(expression.field)}]`;
            case 'functionCall': {
                const args = expression.arguments.map(argument => this.expression(argument));
                if (builtinNames.has(expression.callee)) {
                    return this.castExpression(`__amxBuiltin(${quote(expression.callee)} as __AMXBuiltinName, [${args.map(argument => `${argument} as __AMXValue`).join(', ')}], __amxRuntime)`, resultType);
                }
                const fn = this.functions.get(expression.callee);
                if (!fn)
                    throw new LoweringFailure(`Missing checked function '${expression.callee}'`, expression.source?.line, expression.source?.column);
                return `${this.name(expression.callee)}(${args.map((argument, index) => fn.parameters[index]?.annotation.type === 'listType'
                    ? `__amxCopyListArgument(${argument})`
                    : argument).join(', ')})`;
            }
            case 'recordConstructor': return this.recordConstructor(expression, resultType);
            case 'matchExpression': return this.matchExpression(expression, resultType);
            case 'forExpression': return this.forExpression(expression, resultType);
        }
    }
    expressionLoopBranch(statements, alternate, resultType) {
        const first = this.emitScopedStatements(statements, 2).join('\n');
        const second = this.emitScopedStatements(alternate, 2).join('\n');
        if (!first.includes('return ') || !second.includes('return ')) {
            throw new LoweringFailure('Checked braced-if expression is missing a return branch');
        }
        void resultType;
        return [first, second];
    }
    recordConstructor(expression, resultType) {
        const declaration = this.recordTypes.get(expression.name);
        if (!declaration)
            throw new LoweringFailure(`Missing checked record '${expression.name}'`, expression.source?.line, expression.source?.column);
        const entries = expression.fields.map(field => `[${quote(field.name)}, ${this.expression(field.expression)} as unknown]`).join(', ');
        const fields = declaration.fields.map(field => {
            const defaultExpression = field.defaultExpression
                ? this.expression(field.defaultExpression, this.checkedTypeForReference(field.annotation, field))
                : 'null';
            return `${quoteIdentifier(field.name)}: __amxSupplied.has(${quote(field.name)}) ? __amxSupplied.get(${quote(field.name)}) : ${defaultExpression}`;
        }).join(', ');
        return `(() => { const __amxSupplied = new Map<string, unknown>([${entries}]); return { ${fields} } as ${this.typeScriptType(resultType)}; })()`;
    }
    matchExpression(expression, resultType) {
        const matched = `${this.prefix}match_${expression.source?.line ?? 0}_${expression.source?.column ?? 0}`;
        const cases = expression.cases.map(item => `if (${matched} === ${this.expression(item.value)}) return ${this.expression(item.expression, resultType)};`);
        return `((): ${this.typeScriptType(resultType)} => { const ${matched} = ${this.expression(expression.expression)}; ${cases.join(' ')} return ${this.expression(expression.defaultExpression, resultType)}; })()`;
    }
    forExpression(expression, resultType) {
        const results = `${this.prefix}loop_results_${expression.source?.line ?? 0}_${expression.source?.column ?? 0}`;
        const iterableType = this.expressionType(expression.iterable);
        const elementType = iterableType.kind === 'list' ? iterableType.element : { kind: 'named', name: 'Number' };
        const previousType = this.localTypes.get(expression.variable);
        this.localTypes.set(expression.variable, elementType);
        this.expressionLoopReturns.push(results);
        this.declaredScopes.push(new Set());
        const body = this.emitScopedStatements(expression.body, 3).join('\n');
        this.declaredScopes.pop();
        this.expressionLoopReturns.pop();
        if (previousType)
            this.localTypes.set(expression.variable, previousType);
        else
            this.localTypes.delete(expression.variable);
        return `(() => { const ${results}: ${this.typeScriptType(resultType)} = []; for (const ${this.name(expression.variable)} of __amxIterate<${this.typeScriptType(elementType)}>(${this.expression(expression.iterable)} as __AMXValue, ${this.sourceContext(expression.source)})) {\n${body}\n  } return ${results}; })()`;
    }
    emitScopedStatements(statements, depth) {
        const previousTypes = new Map(this.localTypes);
        this.declaredScopes.push(new Set());
        const code = statements.flatMap(statement => this.emitStatement(statement, depth));
        this.declaredScopes.pop();
        this.localTypes.clear();
        for (const [name, type] of previousTypes)
            this.localTypes.set(name, type);
        return code;
    }
    emitFunction(statement) {
        const previousTypes = new Map(this.localTypes);
        const parameterNames = new Set();
        const argumentsList = statement.parameters.map((parameter, index) => {
            const parameterName = `${this.prefix}arg_${index}_${parameter.name}`;
            this.localTypes.set(parameter.name, this.checkedTypeForReference(parameter.annotation));
            parameterNames.add(parameter.name);
            return `${parameterName}: ${this.typeScriptReference(parameter.annotation)}`;
        });
        this.declaredScopes.push(parameterNames);
        const body = statement.body.kind === 'expression'
            ? [`  return ${this.expression(statement.body.expression, this.checkedTypeForReference(statement.returnType))};`]
            : statement.body.statements.flatMap(child => this.emitStatement(child, 1));
        this.declaredScopes.pop();
        this.localTypes.clear();
        for (const [name, type] of previousTypes)
            this.localTypes.set(name, type);
        const initialBindings = statement.parameters.map((parameter, index) => {
            const parameterName = `${this.prefix}arg_${index}_${parameter.name}`;
            const value = parameter.annotation.type === 'listType'
                ? `__amxCopyListArgument(${parameterName})`
                : parameterName;
            return `  const ${this.name(parameter.name)} = ${value};`;
        });
        return `${statement.exported ? 'export ' : ''}function ${this.name(statement.name)}(${argumentsList.join(', ')}): ${this.typeScriptReference(statement.returnType)} {\n${initialBindings.join('\n')}${initialBindings.length ? '\n' : ''}${body.join('\n')}\n}`;
    }
    emitShow(name, source) {
        const declaration = this.viewDefinitions.get(name);
        if (!declaration)
            throw new LoweringFailure(`Missing checked visualization '${name}'`, source?.line, source?.column);
        const binding = this.name(declaration.binding);
        const title = declaration.options.find(option => option.type === 'viewTitleOption')?.value ?? name;
        if (declaration.type === 'tableDeclaration') {
            const columns = declaration.options.filter((option) => option.type === 'tableColumnOption');
            const columnData = columns.map(column => `{ field: ${quote(column.field)}, label: ${quote(column.label)} }`).join(', ');
            const rows = `${binding}.map(__row => [${columns.map(column => `__amxSnapshotViewValue(__row[${quote(column.field)}])`).join(', ')}])`;
            return `__context.views.push(__amxTableView(${quote(name)}, [${columnData}], ${rows}, ${quote(title)}, ''));`;
        }
        const scatter = declaration.kind === 'scatter';
        const selectedColumns = scatter
            ? declaration.options.filter((option) => option.type === 'chartFieldOption' && (option.role === 'x' || option.role === 'y'))
                .map(option => ({ role: option.role, field: option.field, label: option.role, source: option.source }))
            : declaration.options.filter((option) => option.type === 'chartSeriesOption')
                .map(option => ({ role: 'series', field: option.field, label: option.label, source: option.source }));
        const columns = selectedColumns.map(column => `{ role: ${quote(column.role)}, ${column.field === undefined ? '' : `field: ${quote(column.field)}, `}label: ${quote(column.label)}, source: ${JSON.stringify(column.source ?? {})} }`).join(', ');
        const labelsOption = declaration.options.find(option => option.type === 'chartFieldOption' && option.role === 'labels');
        const labels = labelsOption?.type === 'chartFieldOption' ? this.name(labelsOption.field) : undefined;
        const showTableOption = declaration.options.find(option => option.type === 'chartShowTableOption');
        const showTable = showTableOption?.type === 'chartShowTableOption'
            ? this.expression(showTableOption.expression, { kind: 'named', name: 'Boolean' })
            : 'false';
        const description = declaration.options.find(option => option.type === 'viewDescriptionOption')?.value ?? '';
        const labelData = labels
            ? `(() => { const __labels = ${labels}; if (__labels.length !== ${binding}.length) throw new __AMXInputError(${quote(`visualization ${name}.labels`)}, ${quote(`${binding}.length labels`)}, String(__labels.length) + ' labels', ${this.sourceContext(labelsOption?.source)}); return __labels; })()`
            : 'undefined';
        return `(() => { const __snapshot = __amxChartSnapshot(${binding}, [${columns}], ${quote(name)}, ${String(scatter)}, __amxRuntime); __context.views.push(__amxChartView({ name: ${quote(name)}, chartKind: ${quote(declaration.kind)}, title: ${quote(title)}, description: ${quote(description)}, data: __snapshot.data, headings: __snapshot.headings, measurementDescriptors: __snapshot.measurementDescriptors, labels: ${labelData}, showTable: ${showTable} })); })();`;
    }
    diagramProperty(element, name) {
        const property = element.properties.find(item => item.name === name);
        if (!property)
            throw new LoweringFailure(`Missing checked diagram property '${name}'`, element.source?.line, element.source?.column);
        return property;
    }
    diagramElementBuilder(element, controlled) {
        const indent = '    ';
        const number = (name, positive = false) => {
            const property = this.diagramProperty(element, name);
            return `__amxDiagramNumber(${this.expression(property.expression, { kind: 'named', name: 'Number' })}, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', ${this.sourceContext(property.valueSource ?? property.source)}${positive ? ', true' : ''})`;
        };
        const string = (name) => {
            const property = this.diagramProperty(element, name);
            if (property.expression.type !== 'stringLiteral') {
                throw new LoweringFailure(`Checked diagram style '${name}' is not a literal`, property.valueSource?.line, property.valueSource?.column);
            }
            return quote(property.expression.value);
        };
        const lineWidth = () => {
            const property = this.diagramProperty(element, 'lineWidth');
            if (property.expression.type !== 'numberLiteral') {
                throw new LoweringFailure('Checked diagram lineWidth is not a literal', property.valueSource?.line, property.valueSource?.column);
            }
            return String(property.expression.value);
        };
        const guarded = (body) => [
            ...(controlled ? [`${indent}if (++__amxGeneratedDiagramElements > 64) throw new __AMXRuntimeError({ code: 'AMXD6004', message: 'Number of elements in this diagram exceed the maximum (64)', file: ${quote(this.sourceFile)}, line: ${element.source?.line ?? 1}, column: ${element.source?.column ?? 1} });`] : []),
            ...body
        ];
        switch (element.primitive) {
            case 'line': {
                const arrowProperty = element.properties.find(item => item.name === 'arrow');
                const arrow = arrowProperty?.expression.type === 'stringLiteral' ? quote(arrowProperty.expression.value) : quote('none');
                return guarded([`${indent}__amxDiagramBuilders.push(() => ({ primitive: 'line', name: ${quote(element.name)}, x1: ${number('x1')}, y1: ${number('y1')}, x2: ${number('x2')}, y2: ${number('y2')}, stroke: ${string('stroke')}, lineWidth: ${lineWidth()}, arrow: ${arrow} }));`]);
            }
            case 'rectangle': {
                const fill = element.properties.some(item => item.name === 'fill') ? `, fill: ${string('fill')}` : '';
                return guarded([
                    `${indent}__amxDiagramBuilders.push(() => {`,
                    `${indent}  const __width = ${number('width', true)};`,
                    `${indent}  const __height = ${number('height', true)};`,
                    `${indent}  const __fill = ${element.properties.some(item => item.name === 'fill') ? string('fill') : 'undefined'};`,
                    `${indent}  const __x = ${number('x')};`,
                    `${indent}  const __y = ${number('y')};`,
                    `${indent}  return { primitive: 'rectangle', name: ${quote(element.name)}, x: __x, y: __y, width: __width, height: __height, stroke: ${string('stroke')}${fill}, lineWidth: ${lineWidth()} };`,
                    `${indent}});`
                ]);
            }
            case 'circle': {
                const hasFill = element.properties.some(item => item.name === 'fill');
                const fill = hasFill ? `, fill: ${string('fill')}` : '';
                return guarded([
                    `${indent}__amxDiagramBuilders.push(() => {`,
                    `${indent}  const __radius = ${number('r', true)};`,
                    `${indent}  const __fill = ${hasFill ? string('fill') : 'undefined'};`,
                    `${indent}  const __cx = ${number('cx')};`,
                    `${indent}  const __cy = ${number('cy')};`,
                    `${indent}  return { primitive: 'circle', name: ${quote(element.name)}, cx: __cx, cy: __cy, r: __radius, stroke: ${string('stroke')}${fill}, lineWidth: ${lineWidth()} };`,
                    `${indent}});`
                ]);
            }
            case 'text':
                return guarded([`${indent}__amxDiagramBuilders.push(() => ({ primitive: 'text', name: ${quote(element.name)}, value: ${this.expression(this.diagramProperty(element, 'value').expression, { kind: 'named', name: 'String' })}, x: ${number('x')}, y: ${number('y')}, fill: ${string('fill')} }));`]);
            default:
                throw new LoweringFailure(`Unsupported diagram primitive '${element.primitive}'`, element.source?.line, element.source?.column);
        }
    }
    diagramContent(content, depth, controlled) {
        const indent = '  '.repeat(depth);
        const result = [];
        for (const node of content) {
            if (node.type === 'diagramElement') {
                result.push(...this.diagramElementBuilder(node, controlled));
            }
            else if (node.type === 'diagramForBlock') {
                const iterableType = this.expressionType(node.iterable);
                const elementType = iterableType.kind === 'list' ? iterableType.element : { kind: 'named', name: 'Number' };
                const previousType = this.localTypes.get(node.variable);
                this.localTypes.set(node.variable, elementType);
                const body = this.diagramContent(node.content, depth + 1, true);
                if (previousType)
                    this.localTypes.set(node.variable, previousType);
                else
                    this.localTypes.delete(node.variable);
                result.push(`${indent}for (const ${this.name(node.variable)} of __amxIterate<${this.typeScriptType(elementType)}>(${this.expression(node.iterable)} as __AMXValue, ${this.sourceContext(node.iterableSource ?? node.source)})) {`, ...body, `${indent}}`);
            }
            else {
                const consequent = this.diagramContent(node.consequent, depth + 1, true);
                const alternate = node.alternate ? this.diagramContent(node.alternate, depth + 1, true) : [];
                result.push(`${indent}if (${this.expression(node.test, { kind: 'named', name: 'Boolean' })}) {`, ...consequent, ...(node.alternate ? [`${indent}} else {`, ...alternate] : []), `${indent}}`);
            }
        }
        return result;
    }
    emitDiagram(diagram, depth) {
        const property = (name) => {
            const found = diagram.properties.find(item => item.name === name);
            if (!found)
                throw new LoweringFailure(`Missing checked diagram property '${name}'`, diagram.source?.line, diagram.source?.column);
            return found;
        };
        const title = property('title').expression;
        const description = property('description').expression;
        const time = diagram.times[0];
        if (!time || title.type !== 'stringLiteral' || description.type !== 'stringLiteral') {
            throw new LoweringFailure('Checked diagram is missing a literal title, description, or time declaration', diagram.source?.line, diagram.source?.column);
        }
        const previousTimeType = this.localTypes.get(time.name);
        this.localTypes.set(time.name, { kind: 'named', name: 'Number' });
        const content = this.diagramContent(diagram.content, depth + 1, false);
        if (previousTimeType)
            this.localTypes.set(time.name, previousTimeType);
        else
            this.localTypes.delete(time.name);
        const indent = '  '.repeat(depth);
        const width = property('width');
        const height = property('height');
        const from = this.expression(time.from, { kind: 'named', name: 'Number' });
        const to = this.expression(time.to, { kind: 'named', name: 'Number' });
        const duration = this.expression(time.duration, { kind: 'named', name: 'Number' });
        return [
            `${indent}(() => {`,
            `${indent}  const __amxWidth = __amxDiagramNumber(${this.expression(width.expression, { kind: 'named', name: 'Number' })}, __amxRuntime, 'AMXD003', 'Canvas width is invalid', ${this.sourceContext(width.valueSource ?? width.source)}, true);`,
            `${indent}  const __amxHeight = __amxDiagramNumber(${this.expression(height.expression, { kind: 'named', name: 'Number' })}, __amxRuntime, 'AMXD014', 'Canvas height is invalid', ${this.sourceContext(height.valueSource ?? height.source)}, true);`,
            `${indent}  const __amxFrom = __amxDiagramNumber(${from}, __amxRuntime, 'AMXD004', 'Invalid time bounds', ${this.sourceContext(time.fromSource ?? time.source)});`,
            `${indent}  const __amxTo = __amxDiagramNumber(${to}, __amxRuntime, 'AMXD004', 'Invalid time bounds', ${this.sourceContext(time.toSource ?? time.source)});`,
            `${indent}  if (__amxFrom >= __amxTo) throw new __AMXRuntimeError({ code: 'AMXD004', message: 'Invalid time bounds', file: ${quote(this.sourceFile)}, line: ${time.source?.line ?? 1}, column: ${time.source?.column ?? 1} });`,
            `${indent}  const __amxDuration = __amxDiagramNumber(${duration}, __amxRuntime, 'AMXD005', 'Invalid playback duration value', ${this.sourceContext(time.durationSource ?? time.source)}, true);`,
            `${indent}  const ${this.name(time.name)} = __amxFrom;`,
            `${indent}  const __amxDiagramBuilders: Array<() => __AMXDiagramPrimitiveElement> = [];`,
            `${indent}  let __amxGeneratedDiagramElements = 0;`,
            ...content,
            `${indent}  const __amxElements = __amxDiagramBuilders.map(__build => __build());`,
            `${indent}  __context.views.push(__amxDiagramView({ schema: 'structured-v2', name: ${quote(diagram.name)}, title: ${quote(title.value)}, description: ${quote(description.value)}, canvas: { width: __amxWidth, height: __amxHeight, coordinates: 'bottom-left-y-up' }, timeline: { variable: ${quote(time.name)}, from: __amxFrom, to: __amxTo, duration: __amxDuration }, initialFrame: { time: __amxFrom, elements: __amxElements } }));`,
            `${indent}})();`
        ];
    }
    inputDescriptor(reference, seen = new Set()) {
        if (reference.type === 'listType')
            return `{ kind: 'list', element: ${this.inputDescriptor(reference.element, seen)} }`;
        if (reference.type === 'nullableType')
            return `{ kind: 'nullable', value: ${this.inputDescriptor(reference.element, seen)} }`;
        const name = reference.name;
        if (name === 'Number')
            return `{ kind: 'number' }`;
        if (name === 'String')
            return `{ kind: 'string' }`;
        if (name === 'Boolean')
            return `{ kind: 'boolean' }`;
        if (name === 'DateTime')
            return `{ kind: 'dateTime' }`;
        const dimension = this.module.check.dimensions.get(name);
        if (dimension) {
            const units = [...this.module.check.units.values()].filter(unit => sameVector(unit.vector, dimension.vector));
            const unitMap = units.map(unit => `${quote(unit.name)}: ${this.unitDescriptor(unit.name)}`).join(', ');
            return `{ kind: 'measurement', dimensionName: ${quote(name)}, dimensionVector: ${JSON.stringify(Object.fromEntries(dimension.vector))}, units: { ${unitMap} } }`;
        }
        const enumeration = this.enumTypes.get(name);
        if (enumeration) {
            return `{ kind: 'enum', enumName: ${quote(name)}, members: ${JSON.stringify(enumeration.resolvedValues ?? [])} }`;
        }
        const declaration = this.recordTypes.get(name);
        if (declaration) {
            if (seen.has(name))
                throw new LoweringFailure(`Recursive input descriptor for '${name}' is unsupported`, declaration.source?.line, declaration.source?.column);
            const nested = new Set(seen).add(name);
            const fields = declaration.fields.map(field => {
                const defaultValue = field.defaultExpression
                    ? `, defaultValue: () => ${this.expression(field.defaultExpression, this.checkedTypeForReference(field.annotation, field))}`
                    : '';
                return `{ name: ${quote(field.name)}, descriptor: ${this.inputDescriptor(field.annotation, nested)}${field.optional ? ', optional: true' : ''}${defaultValue} }`;
            });
            return `{ kind: 'record', recordName: ${quote(name)}, fields: [${fields.join(', ')}] }`;
        }
        throw new LoweringFailure(`Missing checked type descriptor '${name}'`, reference.source?.line, reference.source?.column);
    }
    unitDescriptor(name) {
        const unit = this.module.check.units.get(name);
        if (!unit)
            throw new LoweringFailure(`Missing checked unit '${name}'`);
        return `{ identity: ${quote(unit.identity)}, name: ${quote(unit.name)}, scale: ${unit.scale}, offset: ${unit.offset}, vector: ${JSON.stringify(Object.fromEntries(unit.vector))} }`;
    }
    emitTypeDeclaration(statement) {
        const exported = statement.exported ? 'export ' : '';
        const externalExported = statement.exported ? 'export ' : '';
        const parents = (statement.parents ?? []).map(parent => this.name(parent.name));
        const extendsClause = parents.length ? ` extends ${parents.join(', ')}` : '';
        const fields = statement.fields.map(field => `  ${quoteIdentifier(field.name)}${field.optional ? '?' : ''}: ${this.typeScriptReference(field.annotation, false, field)};`).join('\n');
        const externalFields = statement.fields.map(field => `  ${quoteIdentifier(field.name)}${field.optional ? '?' : ''}: ${this.typeScriptReference(field.annotation, true, field)};`).join('\n');
        return `${exported}interface ${this.name(statement.name)}${extendsClause} {\n${fields}\n}\n${externalExported}interface __AMXExternal_${this.name(statement.name)} {\n${externalFields}\n}`;
    }
    emitEnumDeclaration(statement) {
        const values = statement.resolvedValues ?? [];
        const members = statement.members.map((member, index) => {
            const value = values[index];
            return `  ${quoteIdentifier(member.name)}: ${typeof value === 'string' ? quote(value) : String(value)}`;
        }).join(',\n');
        const exported = statement.exported ? 'export ' : '';
        return `${exported}const ${this.name(statement.name)} = Object.freeze({\n${members}\n} as const);\n${exported}type ${this.name(statement.name)} = typeof ${this.name(statement.name)}[keyof typeof ${this.name(statement.name)}];`;
    }
    emitStatement(statement, depth) {
        const indent = '  '.repeat(depth);
        switch (statement.type) {
            case 'variableDeclaration': {
                const name = this.name(statement.name);
                const expected = this.localTypes.get(statement.name) ?? (statement.annotation ? this.checkedTypeForReference(statement.annotation) : undefined);
                const value = this.expression(statement.expression, expected);
                const declared = this.declaredScopes[this.declaredScopes.length - 1];
                if (declared.has(statement.name))
                    return [`${indent}${name} = ${value};`];
                declared.add(statement.name);
                const keyword = this.mutationTargets.has(statement.name) ? 'let' : 'const';
                return [`${indent}${keyword} ${name}: ${expected ? this.typeScriptType(expected) : 'unknown'} = ${value};`];
            }
            case 'assignmentStatement':
            case 'compoundAssignmentStatement': {
                const target = this.name(statement.name);
                const type = this.localTypes.get(statement.name);
                if (!type)
                    throw new LoweringFailure(`Missing checked binding '${statement.name}'`, statement.source?.line, statement.source?.column);
                const value = this.expression(statement.expression, type);
                return statement.type === 'assignmentStatement'
                    ? [`${indent}${target} = ${value};`]
                    : [`${indent}${target} = ${this.castExpression(`__amxBinary('+', ${target} as __AMXValue, ${value} as __AMXValue, ${this.sourceContext(statement.source)})`, type)};`];
            }
            case 'addStatement':
                return [`${indent}__amxAdd1Based(${this.name(statement.name)} as __AMXValue[], ${this.expression(statement.value)} as __AMXValue, ${statement.index ? this.expression(statement.index) : 'undefined'}, { ...${this.sourceContext(statement.source)}, targetName: ${quote(statement.name)} });`];
            case 'removeStatement':
                return [`${indent}__amxRemove1Based(${this.name(statement.name)} as __AMXValue[], ${this.expression(statement.count)}, ${statement.index ? this.expression(statement.index) : 'undefined'}, { ...${this.sourceContext(statement.source)}, targetName: ${quote(statement.name)} });`];
            case 'forStatement': {
                const iterableType = this.expressionType(statement.iterable);
                const elementType = iterableType.kind === 'list' ? iterableType.element : { kind: 'named', name: 'Number' };
                const previousType = this.localTypes.get(statement.variable);
                this.localTypes.set(statement.variable, elementType);
                const body = this.emitScopedStatements(statement.body, depth + 1);
                if (previousType)
                    this.localTypes.set(statement.variable, previousType);
                else
                    this.localTypes.delete(statement.variable);
                return [`${indent}for (const ${this.name(statement.variable)} of __amxIterate<${this.typeScriptType(elementType)}>(${this.expression(statement.iterable)} as __AMXValue, ${this.sourceContext(statement.source)})) {`, ...body, `${indent}}`];
            }
            case 'bracedIfStatement': {
                const consequent = this.emitScopedStatements(statement.consequent, depth + 1);
                const alternate = statement.alternate ? this.emitScopedStatements(statement.alternate, depth + 1) : [];
                return [
                    `${indent}if (${this.expression(statement.test, { kind: 'named', name: 'Boolean' })}) {`,
                    ...consequent,
                    ...(statement.alternate ? [`${indent}} else {`, ...alternate] : []),
                    `${indent}}`
                ];
            }
            case 'returnStatement': {
                const target = this.expressionLoopReturns[this.expressionLoopReturns.length - 1];
                return target
                    ? [`${indent}${target}.push(${this.expression(statement.expression)});`]
                    : [`${indent}return ${this.expression(statement.expression)};`];
            }
            case 'tableDeclaration':
            case 'chartDeclaration':
                return [];
            case 'showStatement':
                return [`${indent}${this.emitShow(statement.name, statement.source)}`];
            case 'diagramDeclaration':
                return this.emitDiagram(statement, depth);
            case 'typeDeclaration':
            case 'enumDeclaration':
            case 'functionDeclaration':
            case 'dimensionDeclaration':
            case 'unitDeclaration':
            case 'inputDeclaration':
            case 'importDeclaration':
            case 'exportNamesDeclaration':
                return [];
            default:
                {
                    const unmapped = statement;
                    throw new LoweringFailure(`AST node '${unmapped.type}' has no lowering rule`, unmapped.source?.line, unmapped.source?.column);
                }
        }
    }
    emit() {
        const statements = moduleStatements(this.module);
        const code = [];
        const frontMatter = parseFrontMatter(this.module.input.sourceText);
        const frontMatterText = this.module.input.sourceText.slice(0, this.module.input.sourceText.length - frontMatter.body.length);
        if (frontMatterText)
            code.push(...safeNarrativeComments(frontMatterText));
        const runtimeStatements = [];
        for (const node of this.module.document.nodes) {
            if (node.type === 'narrative')
                runtimeStatements.push(...safeNarrativeComments(node.content).map(line => `  ${line}`));
            else if (node.type === 'variableDeclaration')
                runtimeStatements.push(...this.emitStatement(node, 1));
            else if (node.type === 'executableCodeBlock') {
                for (const statement of node.statements)
                    runtimeStatements.push(...this.emitStatement(statement, 1));
            }
        }
        const localDeclarations = statements.filter((statement) => statement.type === 'typeDeclaration' || statement.type === 'enumDeclaration');
        const declarationCode = localDeclarations.map(statement => statement.type === 'typeDeclaration'
            ? this.emitTypeDeclaration(statement)
            : this.emitEnumDeclaration(statement));
        const functionCode = statements.filter((statement) => statement.type === 'functionDeclaration')
            .map(statement => this.emitFunction(statement));
        const dependencyImports = new Map();
        for (const statement of statements) {
            if (statement.type !== 'importDeclaration')
                continue;
            const dependency = this.module.imports.get(statement.path);
            const specifier = this.module.importSpecifiers.get(statement.path);
            if (!dependency || !specifier)
                throw new LoweringFailure(`Missing resolved import context for '${statement.path}'`, statement.pathSource?.line, statement.pathSource?.column);
            const key = dependency.input.outputPath;
            const entry = dependencyImports.get(key) ?? { dependency, specifier, symbols: new Map() };
            for (const imported of statement.names) {
                if (dependency.check.exportedTypes.has(imported.name))
                    entry.symbols.set(imported.name, 'type');
                else if (dependency.check.exportedEnums.has(imported.name) || dependency.check.exportedFunctions.has(imported.name)) {
                    entry.symbols.set(imported.name, 'value');
                }
            }
            dependencyImports.set(key, entry);
        }
        const staticImports = [...dependencyImports.values()].map(({ dependency, specifier, symbols }) => {
            const clauses = [`__amxInitialize as __amxInit_${hash(dependency.input.outputPath)}`];
            for (const [name, kind] of symbols) {
                const importedName = emittedName(dependency.input.outputPath, name);
                const localName = this.name(name);
                clauses.push(`${kind === 'type' ? 'type ' : ''}${importedName} as ${localName}`);
                if (kind === 'type' && dependency.check.exportedTypes.has(name)) {
                    clauses.push(`type __AMXExternal_${importedName} as __AMXExternal_${localName}`);
                }
            }
            return `import { ${clauses.join(', ')} } from ${quote(specifier)};`;
        });
        const dependencyInitialization = [];
        for (const [outputPath, { dependency }] of dependencyImports) {
            const alias = `__amxInit_${hash(outputPath)}`;
            const result = `__amxDependency_${hash(outputPath)}`;
            dependencyInitialization.push(`  const ${result} = ${alias}(__context);`);
            for (const statement of statements) {
                if (statement.type !== 'importDeclaration' || this.module.imports.get(statement.path)?.input.outputPath !== outputPath)
                    continue;
                for (const imported of statement.names) {
                    if (!dependency.check.exportedBindings.has(imported.name))
                        continue;
                    const type = this.localTypes.get(imported.name);
                    if (!type)
                        throw new LoweringFailure(`Missing checked imported binding '${imported.name}'`, imported.source?.line, imported.source?.column);
                    dependencyInitialization.push(`  const ${this.name(imported.name)} = ${result}[${quote(imported.name)}] as ${this.typeScriptType(type)};`);
                }
            }
        }
        const inputTypeFields = this.inputs.map(input => `  ${quoteIdentifier(input.name)}: ${this.typeScriptReference(input.annotation, true)};`).join('\n');
        const validatedInputFields = this.inputs.map(input => `  ${quoteIdentifier(input.name)}: ${this.typeScriptReference(input.annotation, false)};`).join('\n');
        const exportFields = [...this.module.check.exportedBindings].map(([name, type]) => `  ${quoteIdentifier(name)}: ${this.typeScriptType(type)};`).join('\n');
        const exportValues = [...this.module.check.exportedBindings.keys()].map(name => `${quote(name)}: ${this.name(name)}`).join(', ');
        const inputDescriptor = `{ kind: 'record', recordName: 'AMXRunInputs', fields: [${this.inputs.map(input => `{ name: ${quote(input.name)}, descriptor: ${this.inputDescriptor(input.annotation)} }`).join(', ')}] }`;
        const unitDescriptors = [...this.module.check.units.keys()].map(name => this.unitDescriptor(name));
        const generated = [
            ...code,
            ...staticImports,
            `import { amxAdd1Based as __amxAdd1Based, amxAttach as __amxAttach, amxBinary as __amxBinary, amxBuiltin as __amxBuiltin, amxChartView as __amxChartView, amxConvert as __amxConvert, amxCopyListArgument as __amxCopyListArgument, amxDiagramView as __amxDiagramView, amxFormatValue as __amxFormatValue, amxGet1Based as __amxGet1Based, amxIsType as __amxIsType, amxIterate as __amxIterate, amxPhysicalValue as __amxPhysicalValue, amxRange as __amxRange, amxRemove1Based as __amxRemove1Based, amxTableView as __amxTableView, amxUnary as __amxUnary, validateAMXValue as __amxValidateValue, AMXInputError as __AMXInputError, AMXRuntimeError as __AMXRuntimeError, type AMXBuiltinName as __AMXBuiltinName, type AMXDiagramPrimitiveElement as __AMXDiagramPrimitiveElement, type AMXInputDescriptor as __AMXInputDescriptor, type AMXMeasurement as __AMXMeasurement, type AMXMeasurementInput as __AMXMeasurementInput, type AMXRunResult as __AMXRunResult, type AMXRuntimeContext as __AMXRuntimeContext, type AMXShownView as __AMXShownView, type AMXUnitDescriptor as __AMXUnitDescriptor, type AMXValue as __AMXValue, type AMXViewData as __AMXViewData } from 'openamx/transpiler-runtime';`,
            ...declarationCode,
            ...functionCode,
            `const __amxUnits: readonly __AMXUnitDescriptor[] = [${unitDescriptors.join(', ')}];`,
            `const __amxRuntime: __AMXRuntimeContext = { file: ${quote(this.sourceFile)}, unitDescriptors: __amxUnits };`,
            ...viewHelperSource(),
            `interface __AMXRunContext { readonly modules: Map<string, unknown>; readonly views: __AMXShownView[] }`,
            `export function __amxInitialize(__context: __AMXRunContext, __inputs: __AMXValidatedInputs = {} as __AMXValidatedInputs): Readonly<Record<string, unknown>> {`,
            `  if (__context.modules.has(${quote(this.module.input.outputPath)})) return __context.modules.get(${quote(this.module.input.outputPath)}) as Readonly<Record<string, unknown>>;`,
            ...dependencyInitialization,
            ...this.inputs.map(input => `  const ${this.name(input.name)} = __inputs[${quote(input.name)}];`),
            ...runtimeStatements,
            `  const __result: Readonly<Record<string, unknown>> = Object.freeze({ ${exportValues} });`,
            `  __context.modules.set(${quote(this.module.input.outputPath)}, __result);`,
            `  return __result;`,
            `}`,
            ...(this.isEntry ? [
                `export type AMXRunInputs = Readonly<{\n${inputTypeFields}\n}>;`,
                `type __AMXValidatedInputs = Readonly<{\n${validatedInputFields}\n}>;`,
                `export type AMXRunExports = Readonly<{\n${exportFields}\n}>;`,
                `export function run(inputs: AMXRunInputs): __AMXRunResult<AMXRunExports> {`,
                `  const __validated = __amxValidateValue<__AMXValidatedInputs>(inputs, ${inputDescriptor}, { file: ${quote(this.sourceFile)} });`,
                `  const __context: __AMXRunContext = { modules: new Map(), views: [] };`,
                `  const __exports = __amxInitialize(__context, __validated) as AMXRunExports;`,
                `  return { exports: __exports, views: Object.freeze(__context.views) };`,
                `}`
            ] : [`type __AMXValidatedInputs = Readonly<Record<string, never>>;`])
        ];
        return generated.join('\n') + '\n';
    }
}
function moduleStatements(module) {
    return module.document.nodes.flatMap(node => node.type === 'executableCodeBlock'
        ? node.statements
        : node.type === 'variableDeclaration' ? [node] : []);
}
function quoteIdentifier(name) {
    return reservedWords.has(name) ? `[${quote(name)}]` : name;
}
function sameVector(left, right) {
    return left.size === right.size && [...left].every(([key, exponent]) => right.get(key) === exponent);
}
function viewHelperSource() {
    return [
        `function __amxDiagramNumber(value: number, context: __AMXRuntimeContext, code: string, message: string, source: Readonly<{ file?: string; line?: number; column?: number }>, positive = false): number { if (!Number.isFinite(value) || positive && value <= 0) throw new __AMXRuntimeError({ code, message, file: source.file ?? context.file, line: source.line ?? context.line, column: source.column ?? context.column }); return value; }`,
        `function __amxIsMeasurement(value: unknown): value is __AMXMeasurement { return typeof value === 'object' && value !== null && !Array.isArray(value) && '__amxMeasurement' in value && (value as { __amxMeasurement?: unknown }).__amxMeasurement === true; }`,
        `function __amxSnapshotViewValue(value: unknown): __AMXViewData { if (value === null || typeof value === 'string' || typeof value === 'boolean') return value; if (typeof value === 'number') return value; if (Array.isArray(value)) return value.map(__amxSnapshotViewValue); if (__amxIsMeasurement(value)) return String(value.value) + ' ' + value.unit.text; if (typeof value === 'object') { const copy: Record<string, __AMXViewData> = {}; for (const [field, item] of Object.entries(value)) copy[field] = __amxSnapshotViewValue(item); return copy; } return null; }`,
        `interface __AMXChartColumn { readonly role: 'series' | 'x' | 'y'; readonly field?: string; readonly label: string; readonly source?: Readonly<{ line?: number; column?: number }> }`,
        `function __amxSameMeasurementDimension(left: __AMXMeasurement, right: __AMXMeasurement): boolean { const a = Object.entries(left.unit.vector); return a.length === Object.keys(right.unit.vector).length && a.every(([identity, exponent]) => right.unit.vector[identity] === exponent); }`,
        `function __amxChartFailure(name: string, message: string, context: __AMXRuntimeContext, source?: __AMXChartColumn['source']): never { throw new __AMXRuntimeError({ code: 'AMX3007', message, file: context.file, line: source?.line ?? context.line, column: source?.column ?? context.column }); }`,
        `function __amxChartValue(value: unknown, target: __AMXMeasurement | undefined, name: string, column: __AMXChartColumn | undefined, context: __AMXRuntimeContext): __AMXViewData { if (value === null || value === undefined) return null; if (!target) return __amxSnapshotViewValue(value); if (!__amxIsMeasurement(value) || !__amxSameMeasurementDimension(value, target)) return __amxChartFailure(name, 'Chart ' + name + ' contains an incompatible measurement value', context, column?.source); const converted = (__amxPhysicalValue(value) - target.unit.offset) / target.unit.scale; if (!Number.isFinite(converted)) return __amxChartFailure(name, 'Chart ' + name + ' measurement cannot be normalized to its first display unit', context, column?.source); return converted; }`,
        `function __amxChartSnapshot(data: readonly unknown[], columns: readonly __AMXChartColumn[], name: string, scatter: boolean, context: __AMXRuntimeContext): { readonly data: readonly __AMXViewData[]; readonly headings: readonly string[]; readonly measurementDescriptors: readonly Readonly<{ role: 'series' | 'x' | 'y'; field?: string; label: string; unit: Readonly<{ text: string; scale: number; vector: Readonly<Record<string, number>>; factors: readonly Readonly<{ identity: string; name: string; exponent: number }>[] }> }>[] } { const chosen = columns.map(column => { const values = data.map(item => item !== null && typeof item === 'object' && !Array.isArray(item) && !__amxIsMeasurement(item) ? (item as Record<string, unknown>)[column.field ?? ''] : column.field === undefined ? item : undefined); const first = values.find(value => value !== null && value !== undefined); const target = __amxIsMeasurement(first) ? first : undefined; for (const value of values) { if (value === null || value === undefined) continue; if (target ? !__amxIsMeasurement(value) || !__amxSameMeasurementDimension(value, target) : __amxIsMeasurement(value)) __amxChartFailure(name, 'Chart ' + name + ' contains incompatible measurement dimensions', context, column.source); } return target; }); const headings = scatter ? (['x', 'y'] as const).map((axis, index) => chosen[index] ? axis + ' (' + chosen[index]!.unit.text + ')' : axis).concat('group') : ['label', ...columns.filter(column => column.role === 'series').map((column, index) => { const target = chosen[index]; return target ? column.label + ' (' + target.unit.text + ')' : column.label; })]; const measurementDescriptors = columns.flatMap((column, index) => { const target = chosen[index]; if (!target) return []; return [{ role: column.role, ...(column.field === undefined ? {} : { field: column.field }), label: column.label, unit: { text: target.unit.text, scale: target.unit.scale, vector: target.unit.vector, factors: target.unit.factors } }]; }); const normalized = data.map((item): __AMXViewData => { if (item !== null && typeof item === 'object' && !Array.isArray(item) && !__amxIsMeasurement(item)) { const values: Record<string, __AMXViewData> = {}; for (const [field, value] of Object.entries(item)) { const index = columns.findIndex(column => column.field === field); values[field] = index < 0 ? __amxSnapshotViewValue(value) : __amxChartValue(value, chosen[index], name, columns[index], context); } return values; } return __amxChartValue(item, chosen[0], name, columns[0], context); }); return { data: normalized, headings, measurementDescriptors }; }`
    ];
}
function emittedName(outputPath, name) {
    return `__amx_${hash(outputPath)}_${name}`;
}
export function emitModule(module, isEntry) {
    return new ModuleEmitter(module, isEntry).emit();
}
//# sourceMappingURL=emit.js.map