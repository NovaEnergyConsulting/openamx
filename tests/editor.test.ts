import { expect, test } from "bun:test";
import { resolve } from "node:path";
import { parseDocumentText } from "../src/parser/parseDocument";
import { editorCompletionFacts, prepareEditorCompletion } from "../src/editor/completion";
import { editorHighlightFacts } from "../src/editor/highlighting";
import { analyzeEditorModules } from "../src/editor/moduleAnalysis";
import { editorSymbolFacts } from "../src/editor/symbols";
import { editorCodeActionFacts, editorRenameFact, isSafeRenameIdentifier } from "../src/editor/refactoring";
import { declarationNameRange, sourceTokenRange } from "../src/editor/sourceRanges";

test("shared V0.14 editor facts expose type tests, built-ins, and type-target navigation", () => {
	const text = [
		"😀 Narrative mentions PI and sin but is inert.",
		"```amx",
		"type Asset {",
		"  id: Number",
		"}",
		"let value: Number = 1",
		"let valid = value is Asset",
		"```",
		""
	].join("\r\n");
	const parsed = parseDocumentText(text);
	const analysis = analyzeEditorModules(text, "/project/v14-editor.amx");
	const highlights = editorHighlightFacts(text, parsed);
	const operator = highlights.find(fact => text.slice(fact.from, fact.to) === "is");
	const targetOffset = text.lastIndexOf("Asset");
	const target = highlights.find(fact => fact.kind === "type" && fact.from === targetOffset);
	const symbols = editorSymbolFacts(text, "/project/v14-editor.amx", parsed, analysis);
	const declaration = symbols.find(fact => fact.declaration && fact.name === "Asset");
	const reference = symbols.find(fact => !fact.declaration && fact.name === "Asset" && fact.from === targetOffset);

	expect(analysis.bindingTypes?.get("valid")).toEqual({ kind: "named", name: "Boolean" });
	expect(operator?.kind).toBe("keyword");
	expect(target).toMatchObject({ from: targetOffset, to: targetOffset + "Asset".length, kind: "type" });
	expect(reference?.target).toEqual(declaration?.target);
	expect(highlights.some(fact => fact.from < text.indexOf("\r\n") && fact.to <= text.indexOf("\r\n"))).toBe(false);
});

test("shared V0.14 completion offers type targets and built-ins in incomplete expressions", () => {
	const text = [
		"```amx",
		"type Asset {",
		"  id: Number",
		"}",
		"let value: Number = 1",
		"let checked = value is ",
		"```",
		""
	].join("\n");
	const cursor = text.indexOf("let checked = value is ") + "let checked = value is ".length;
	const prepared = prepareEditorCompletion(text, cursor);
	expect(prepared).toBeDefined();
	const labels = editorCompletionFacts(prepared!.text, cursor, prepared!.document, undefined, text).map(item => item.label);

	for (const label of [
		"is", "Asset", "PI", "E", "sin", "cos", "tan", "asin", "acos", "atan", "sinh", "cosh", "tanh", "asinh",
		"acosh", "atanh", "ln", "log", "exp", "len", "trim", "left", "right", "format"
	]) expect(labels).toContain(label);
});

test("shared V0.14 editor diagnostics retain original type-target ranges", () => {
	const text = [
		"😀 Narrative",
		"```amx",
		"let value: Number = 1",
		"let checked = value is Missing",
		"```",
		""
	].join("\r\n");
	try {
		analyzeEditorModules(text, "/project/v14-invalid-target.amx");
		throw new Error("Expected an unknown type-target diagnostic");
	} catch (error) {
		expect(error).toMatchObject({
			code: "AMX3001",
			file: "/project/v14-invalid-target.amx",
			line: 4,
			column: 24
		});
		const diagnostic = error as { line: number; column: number };
		const range = sourceTokenRange(text, { line: diagnostic.line, column: diagnostic.column }, "Missing");
		expect(range).toBeDefined();
		expect(text.slice(range!.from, range!.to)).toBe("Missing");
	}
});

test("shared editor ranges preserve UTF-16 offsets across CRLF and non-BMP text", () => {
	const text = "# \u{1F680} report\r\n\r\n```amx\r\nlet base: Number = 2\r\nlet total: Number = base + 1\r\n```\r\n";
	const document = parseDocumentText(text);
	const statements = document.nodes.flatMap(node => node.type === "executableCodeBlock" ? node.statements : []);
	const base = declarationNameRange(text, statements[0]);
	const total = declarationNameRange(text, statements[1]);
	const reference = sourceTokenRange(text, statements[1].type === "variableDeclaration" ? statements[1].expression.source : undefined, "base");

	expect(base).toBeDefined();
	expect(total).toBeDefined();
	expect(text.slice(base!.from, base!.to)).toBe("base");
	expect(text.slice(total!.from, total!.to)).toBe("total");
	expect(text.slice(reference!.from, reference!.to)).toBe("base");
	expect(text.indexOf("base")).toBe(base!.from);
	expect(text.indexOf("total")).toBe(total!.from);
});

test("shared editor ranges withhold unproven declaration tokens", () => {
	const text = "```amx\nlet amount: Number = 1\n```\n";
	const document = parseDocumentText(text);
	const statement = document.nodes.flatMap(node => node.type === "executableCodeBlock" ? node.statements : [])[0];

	expect(sourceTokenRange(text, { line: 2, column: 4 }, "other")).toBeUndefined();
	expect(declarationNameRange(text, { ...statement, source: { line: 100, column: 1 } })).toBeUndefined();
});

test("shared module analysis uses supplied unsaved imports without evaluation", () => {
	const entry = "```amx\nimport { rate } from \"./model.amx\"\nlet result: Number = rate\n```\n";
	let requestedPath = "";
	const analysis = analyzeEditorModules(entry, "/project/report.amx", (_from, targetPath) => {
		requestedPath = targetPath;
		return { file: targetPath, text: "```amx\nexport let rate: Number = 12\n```\n" };
	});
	const modulePath = resolve("/project/model.amx");

	expect(requestedPath).toBe(modulePath);
	expect(analysis.importedBindings.has("rate")).toBe(true);
	expect(analysis.modules.size).toBe(2);
	expect(analysis.modules.get(modulePath)?.checkResult.exportedBindings.has("rate")).toBe(true);
});

test("shared editor symbols preserve imported dimension and unit declaration identity", () => {
	const entryFile = resolve("/project/entry.amx");
	const moduleFile = resolve("/project/units.amx");
	const moduleText = "```amx\nexport dimension Length\nexport unit meter: Length\n```\n";
	const text = [
		"```amx",
		'import { Length, meter } from "./units.amx"',
		"dimension Distance = Length",
		"unit kilometer = 1000 * meter",
		"let distance: Length = 1 meter",
		"let converted = distance in kilometer",
		"```",
		""
	].join("\n");
	const analysis = analyzeEditorModules(text, entryFile, (_from, targetPath) => ({ file: targetPath, text: moduleText }));
	const facts = editorSymbolFacts(text, entryFile, analysis.document, analysis, new Map([[moduleFile, moduleText]]));
	const lengthDeclaration = facts.find(fact => fact.file === moduleFile && fact.declaration && fact.name === "Length");
	const meterDeclaration = facts.find(fact => fact.file === moduleFile && fact.declaration && fact.name === "meter");
	const lengthReferences = facts.filter(fact => fact.file === entryFile && !fact.declaration && fact.name === "Length");
	const meterReferences = facts.filter(fact => fact.file === entryFile && !fact.declaration && fact.name === "meter");

	expect(lengthDeclaration).toBeDefined();
	expect(meterDeclaration).toBeDefined();
	expect(lengthReferences.length).toBeGreaterThan(0);
	expect(meterReferences.length).toBeGreaterThan(0);
	expect(lengthReferences.map(fact => fact.target)).toEqual(lengthReferences.map(() => lengthDeclaration!.target));
	expect(meterReferences.map(fact => fact.target)).toEqual(meterReferences.map(() => meterDeclaration!.target));
});

test("shared editor analysis checks untyped documents and imported modules unconditionally", () => {
	const valid = analyzeEditorModules("```amx\nlet count = 3\n```\n", "/project/report.amx");
	expect(valid.bindingTypes?.get("count")).toEqual({ kind: "named", name: "Number" });
	expect(() => analyzeEditorModules("```amx\nlet count = \"three\" + 1\n```\n", "/project/invalid.amx"))
		.toThrow(expect.objectContaining({ code: "AMX3007" }));
	expect(() => analyzeEditorModules("```amx\ntype Item {\n  id: Number\n}\nlet item = Item { id: 1 }\n```\n", "/project/legacy.amx"))
		.toThrow(expect.objectContaining({ code: "AMX3006", file: "/project/legacy.amx", line: 5, column: 21 }));

	const entry = "```amx\nimport { invalid } from \"./library.amx\"\n```\n";
	expect(() => analyzeEditorModules(entry, "/project/report.amx", (_from, targetPath) => ({
		file: targetPath,
		text: "```amx\nexport let invalid = \"three\" + 1\n```\n"
	}))).toThrow(expect.objectContaining({ code: "AMX3007" }));
});

test("shared module analysis withholds graphs beyond its bounded traversal", () => {
	const entry = "```amx\nimport { value0 } from \"./module0.amx\"\nlet result: Number = value0\n```\n";
	const resolveModule = (_from: string, targetPath: string) => {
		const index = Number(targetPath.match(/module(\d+)\.amx$/)?.[1]);
		const text = index === 101
			? "```amx\nexport let value101: Number = 1\n```\n"
			: `\u0060\u0060\u0060amx\nimport { value${index + 1} } from \"./module${index + 1}.amx\"\nexport let value${index}: Number = value${index + 1}\n\u0060\u0060\u0060\n`;
		return { file: targetPath, text };
	};

	expect(() => analyzeEditorModules(entry, "/project/report.amx", resolveModule)).toThrow(/analysis limit/);
});

test("shared completion facts respect source order and imported exports", () => {
	const text = "```amx\nimport { rate } from \"./model.amx\"\nlet before = rate\nlet after = before + rate\n```\n";
	const analysis = analyzeEditorModules(text, "/project/report.amx", (_from, targetPath) => ({
		file: targetPath,
		text: "```amx\nexport let rate: Number = 12\n```\n"
	}));
	const cursor = text.indexOf("let after");
	const labels = editorCompletionFacts(text, cursor, analysis.document, analysis).map(item => item.label);

	expect(labels).toContain("before");
	expect(labels).toContain("rate");
	expect(labels).not.toContain("after");
});

test("shared completion facts use the live prefix when parsing only complete statements", () => {
	const source = "```amx\ntype Asset {\n";
	const cursor = source.indexOf("type") + "type".length;
	const completeSource = "```amx\n```\n";
	const parsed = parseDocumentText(completeSource);
	const labels = editorCompletionFacts(completeSource, cursor, parsed, undefined, source).map(item => item.label);

	expect(labels).toContain("type");
});

test("shared completion offers V0.9 dimension and unit declaration keywords", () => {
	const source = "```amx\ndimension Length\nunit meter: Length\n";
	const cursor = source.length;
	const prepared = prepareEditorCompletion(source, cursor);
	expect(prepared).toBeDefined();
	const labels = editorCompletionFacts(prepared!.text, cursor, prepared!.document, undefined, source).map(item => item.label);

	expect(labels).toContain("dimension");
	expect(labels).toContain("unit");
});

test("shared completion preparation accepts only the exact executable fence", () => {
	const incomplete = "```amx\nlet earlier: Number = 2\nlet unfinished: Number = \n```";
	const cursor = incomplete.indexOf("let unfinished") + "let unfinished: Number = ".length;
	const prepared = prepareEditorCompletion(incomplete, cursor);
	expect(prepared).toBeDefined();
	const labels = editorCompletionFacts(prepared!.text, cursor, prepared!.document, undefined, incomplete).map(item => item.label);
	expect(labels).toContain("earlier");
	expect(prepareEditorCompletion("```js\nlet inert = 1\n```", 10)).toBeUndefined();
	expect(prepareEditorCompletion("```AMX\nlet inert = 1\n```", 10)).toBeUndefined();
});

test("shared highlighting uses only exact executable-block AST ranges", () => {
	const text = "Narrative let inert = 0\n\n```js\nlet alsoInert = 1\n```\n```amx\nlet active = 2\n```\n";
	const parsed = parseDocumentText(text);
	const highlights = editorHighlightFacts(text, parsed);
	const slices = highlights.map(fact => text.slice(fact.from, fact.to));

	expect(slices).toContain("let");
	expect(slices).toContain("active");
	expect(slices).not.toContain("inert");
	expect(slices).not.toContain("alsoInert");
});

test("shared editor analysis highlights and resolves references inside interpolations only in AMX blocks", () => {
	const text = [
		"Narrative ${missing}",
		"```js",
		'let inert = "\\q"',
		"```",
		"```amx",
		'let name: String = "Pump"',
		'let label: String = "Hello ${name}"',
		"```",
		""
	].join("\r\n");
	const document = parseDocumentText(text);
	expect(() => analyzeEditorModules(text, "/project/report.amx")).not.toThrow();

	const symbols = editorSymbolFacts(text, "/project/report.amx", document);
	const embeddedReference = symbols.find(fact => !fact.declaration && text.slice(fact.from, fact.to) === "name");
	expect(embeddedReference).toBeDefined();
	const highlights = editorHighlightFacts(text, document);
	expect(highlights.some(fact => text.slice(fact.from, fact.to) === '"Hello ${name}"')).toBe(true);
	expect(highlights.some(fact => fact.kind === "reference" && text.slice(fact.from, fact.to) === "name")).toBe(true);
	expect(highlights.some(fact => text.slice(fact.from, fact.to) === "missing" || text.slice(fact.from, fact.to) === "\\q")).toBe(false);
});

test("shared editor analysis maps interpolation diagnostics to original LF and CRLF ranges", () => {
	for (const newline of ["\n", "\r\n"]) {
		const text = ["```amx", 'let value = "start ${1 + true}"', "```", ""].join(newline);
		try {
			analyzeEditorModules(text, "/project/invalid-string.amx");
			throw new Error("Expected invalid interpolation");
		} catch (error) {
			expect(error).toMatchObject({ code: "AMX3007", file: "/project/invalid-string.amx", line: 2 });
			const diagnosticColumn = (error as { column: number }).column;
			expect(text.split(/\r?\n/)[1]?.slice(diagnosticColumn - 1, diagnosticColumn + 3)).toBe("true");
		}
	}
});

test("shared editor analysis reports incomplete strings as AMX3006 in drafts", () => {
	const text = "```amx\r\nlet value = \"unfinished\r\n```\r\n";
	expect(() => analyzeEditorModules(text, "/project/draft.amx"))
		.toThrow(expect.objectContaining({ code: "AMX3006", file: "/project/draft.amx", line: 2 }));
});

test("shared symbol facts assign exact declaration identity and withhold duplicate targets", () => {
	const text = "```amx\nlet value: Number = 1\nlet result: Number = value\n```\n";
	const parsed = parseDocumentText(text);
	const facts = editorSymbolFacts(text, "/project/report.amx", parsed);
	const declaration = facts.find(fact => fact.declaration && text.slice(fact.from, fact.to) === "value");
	const reference = facts.find(fact => !fact.declaration && text.slice(fact.from, fact.to) === "value");

	expect(declaration).toBeDefined();
	expect(reference?.target).toEqual(declaration?.target);
	const ambiguousText = "```amx\nlet repeat = 1\nlet repeat = 2\nlet result = repeat\n```\n";
	const ambiguous = editorSymbolFacts(ambiguousText, "/project/ambiguous.amx", parseDocumentText(ambiguousText));
	expect(ambiguous.some(fact => !fact.declaration && ambiguousText.slice(fact.from, fact.to) === "repeat")).toBe(false);
});

test("shared refactoring facts require unique diagnostics and proven symbol identity", () => {
	const text = "```amx\nlet amount: Number = 1\nlet result: Number = amount\n```\n";
	const parsed = parseDocumentText(text);
	const symbols = editorSymbolFacts(text, "/project/report.amx", parsed);
	const reference = symbols.find(fact => !fact.declaration && text.slice(fact.from, fact.to) === "amount");
	const rename = editorRenameFact(symbols, "/project/report.amx", reference!.from);
	expect(rename?.edits).toHaveLength(2);
	expect(rename?.edits.every(edit => text.slice(edit.from, edit.to) === "amount")).toBe(true);

	const actionText = "```amx\nlet rows: Number[] = []\ntable report = table(rows) {\n  title: \"Report\"\n  column id as \"ID\"\n}\nshow reprot\n```\n";
	const actionDocument = parseDocumentText(actionText);
	const showFrom = actionText.indexOf("reprot");
	const diagnostic = { code: "AMX3001", message: "Unknown or not-yet-declared visualization 'reprot'", from: showFrom, to: showFrom + 6 };
	expect(editorCodeActionFacts(actionText, actionDocument, [diagnostic])).toEqual([
		{ from: showFrom, to: showFrom + 6, title: "Use visible view 'report'", expected: "reprot", replacement: "report", code: "AMX3001" }
	]);
	expect(editorCodeActionFacts(actionText, actionDocument, []).length).toBe(0);
	expect(isSafeRenameIdentifier("renamedValue")).toBe(true);
	expect(isSafeRenameIdentifier("if")).toBe(false);
	expect(isSafeRenameIdentifier("dimension")).toBe(false);
	expect(isSafeRenameIdentifier("unit")).toBe(false);
	expect(isSafeRenameIdentifier("Number")).toBe(false);
});

test("V0.12 editor facts cover inherited types, enums, and nested braced conditionals", () => {
	const text = [
		"```amx",
		"type Parent {",
		"  id: String",
		"}",
		"enum Status = {",
		"  DRAFT,",
		"  ACTIVE",
		"}",
		"type Asset extends Parent {",
		"  override id: String",
		"  status: Number",
		"}",
		'let asset: Asset = Asset { id = "A-1", status = Status.ACTIVE }',
		"let inheritedId: String = asset.id",
		"let status: Number = Status.ACTIVE",
		"let chosen: String = if status == 2 {",
		"  return asset.id",
		"} else {",
		'  return "none"',
		"}",
		"if status == 2 {",
		"  let branchLocal: Number = 1",
		"  branchLocal += 1",
		"}",
		"let afterBlock: Number = status",
		"```",
		""
	].join("\r\n");
	const analysis = analyzeEditorModules(text, "/project/v12.amx");
	const document = analysis.document;
	const highlights = editorHighlightFacts(text, document);
	const slice = (fact: { from: number; to: number }) => text.slice(fact.from, fact.to);
	const highlighted = (value: string, kind?: string) => highlights.some(fact =>
		slice(fact) === value && (!kind || fact.kind === kind)
	);

	expect(highlighted("enum", "keyword")).toBe(true);
	expect(highlighted("ACTIVE", "declaration")).toBe(true);
	expect(highlighted("extends", "keyword")).toBe(true);
	expect(highlighted("Parent", "type")).toBe(true);
	expect(highlighted("override", "keyword")).toBe(true);
	expect(highlighted("if", "keyword")).toBe(true);
	expect(highlighted("return", "keyword")).toBe(true);

	const symbols = editorSymbolFacts(text, "/project/v12.amx", document, analysis);
	const parentDeclaration = symbols.find(fact => fact.declaration && fact.name === "Parent");
	const parentReference = symbols.find(fact => !fact.declaration && fact.name === "Parent");
	const enumMember = symbols.find(fact => fact.declaration && fact.name === "ACTIVE");
	const enumMemberUses = symbols.filter(fact => !fact.declaration && fact.name === "ACTIVE");
	expect(parentReference?.target).toEqual(parentDeclaration?.target);
	expect(enumMember).toBeDefined();
	expect(enumMemberUses).toHaveLength(2);
	expect(enumMemberUses.every(fact => fact.target.from === enumMember!.from && fact.target.to === enumMember!.to)).toBe(true);
	expect(editorRenameFact(symbols, "/project/v12.amx", enumMemberUses[0].from)?.edits).toHaveLength(3);
	expect(isSafeRenameIdentifier("enum")).toBe(false);
	expect(isSafeRenameIdentifier("extends")).toBe(false);
	expect(isSafeRenameIdentifier("override")).toBe(false);

	const memberCursor = text.indexOf("Status.ACTIVE") + "Status.".length;
	const memberLabels = editorCompletionFacts(text, memberCursor, document, analysis).map(item => item.label);
	expect(memberLabels).toContain("ACTIVE");
	expect(memberLabels).toContain("override");
	const inheritedFieldCursor = text.indexOf("asset.id") + "asset.".length;
	expect(editorCompletionFacts(text, inheritedFieldCursor, document, analysis).map(item => item.label)).toContain("id");
	const insideBranch = text.indexOf("branchLocal +=");
	expect(editorCompletionFacts(text, insideBranch, document, analysis).map(item => item.label)).toContain("branchLocal");
	const outsideBranch = text.indexOf("afterBlock") + "afterBlock".length;
	expect(editorCompletionFacts(text, outsideBranch, document, analysis).map(item => item.label)).not.toContain("branchLocal");
});

test("shared module analysis resolves imported enum symbols and completion", () => {
	const entryFile = resolve("/project/entry.amx");
	const moduleFile = resolve("/project/model.amx");
	const moduleText = "```amx\nexport enum Status = {\n  ACTIVE,\n  CLOSED\n}\n```\n";
	const text = '```amx\nimport { Status } from "./model.amx"\nlet current: Number = Status.ACTIVE\n```\n';
	const analysis = analyzeEditorModules(text, entryFile, (_from, targetPath) => ({ file: targetPath, text: moduleText }));
	expect(analysis.importedEnums.has("Status")).toBe(true);

	const symbols = editorSymbolFacts(text, entryFile, analysis.document, analysis, new Map([[moduleFile, moduleText]]));
	const member = symbols.find(fact => fact.declaration && fact.name === "ACTIVE");
	const memberUse = symbols.find(fact => !fact.declaration && fact.name === "ACTIVE");
	expect(member).toBeDefined();
	expect(memberUse?.target).toEqual(member?.target);

	const cursor = text.indexOf("Status.ACTIVE") + "Status.".length;
	expect(editorCompletionFacts(text, cursor, analysis.document, analysis).map(item => item.label)).toContain("ACTIVE");
});

test("shared editor analysis preserves V0.12 diagnostic identities and original source positions", () => {
	const invalidCases = [
		["AMX3011", "type Left {\n  id: String\n}\ntype Right {\n  id: String\n}\ntype Asset extends Left, Right {\n}\n"],
		["AMX3012", "type Parent {\n  id: String\n}\ntype Child extends Parent {\n  id: String\n}\n"],
		["AMX3013", "type Parent {\n  id: String\n}\ntype Child extends Parent {\n  override tag: String\n}\n"],
		["AMX3014", "type First extends First {\n}\n"],
		["AMX3015", "enum Empty = {\n}\n"],
		["AMX3016", "enum State = {\n  ACTIVE,\n  ACTIVE\n}\n"],
		["AMX3017", 'enum State = {\n  FIRST = 2,\n  SECOND = 2\n}\n'],
		["AMX3018", 'enum State = {\n  FIRST = "one",\n  SECOND = 2\n}\n'],
		["AMX3019", 'enum State = {\n  FIRST = "one",\n  SECOND\n}\n'],
		["AMX3020", "enum State = {\n  FIRST = 1 + 1,\n  SECOND = 2\n}\n"],
		["AMX3021", "let selected: Number = if true {\n  return 1\n} else {\n  let missing: Number = 2\n}\n"]
	] as const;

	for (const [code, body] of invalidCases) {
		const coordinates = ["\n", "\r\n"].map(newline => {
			const text = `\`\`\`amx${newline}${body.replace(/\n/g, newline)}\`\`\`${newline}`;
			try {
				analyzeEditorModules(text, "/project/invalid-v12.amx");
				throw new Error(`Expected ${code}`);
			} catch (error) {
				expect(error).toMatchObject({ code });
				const located = error as { line?: number; column?: number };
				expect(located.line).toBeGreaterThan(0);
				expect(located.column).toBeGreaterThan(0);
				const sourceLine = text.split(/\r?\n/)[located.line! - 1] ?? "";
				expect(located.column).toBeLessThanOrEqual(sourceLine.length + 1);
				return [located.line, located.column];
			}
		});
		expect(coordinates[1]).toEqual(coordinates[0]);
	}
});

test("V0.13 shared editor facts recognize diagram syntax without leaking inert text", () => {
			const text = [
				"Narrative diagram fake { title: \"inert\" }",
				"```js",
				"diagram inert {",
				"```",
				"```amx",
				"let crankRadius: Number = 10",
				"diagram crankSlider {",
				'  title: "Crank slider"',
				'  description: "A pin moves on a crank."',
				"  width: 100",
				"  height: 80",
				"  time t from 0 to 2 duration 4",
				"  line rod {",
				"    x1: crankRadius",
				"    y1: 10",
				"    x2: crankRadius + t",
				"    y2: 20",
				'    stroke: "#263238"',
				"    lineWidth: 2",
				"  }",
				"  text timer {",
				"    x: 2",
				"    y: 2",
				'    value: "t = ${round(t, 2)}"',
				'    fill: "#263238"',
				"  }",
				"}",
				"```",
				""
			].join("\n");
			const analysis = analyzeEditorModules(text, "/project/diagram.amx");
			const highlights = editorHighlightFacts(text, analysis.document);
			const hasToken = (name: string, kind?: string) => highlights.some(fact =>
				text.slice(fact.from, fact.to) === name && (!kind || fact.kind === kind)
			);

			expect(hasToken("diagram", "keyword")).toBe(true);
			expect(hasToken("crankSlider", "declaration")).toBe(true);
			expect(hasToken("time", "keyword")).toBe(true);
			expect(hasToken("t", "declaration")).toBe(true);
			expect(hasToken("line", "keyword")).toBe(true);
			expect(hasToken("rod", "declaration")).toBe(true);
			expect(hasToken("x1", "field")).toBe(true);
			expect(hasToken("crankRadius", "reference")).toBe(true);
			expect(hasToken("2", "literal")).toBe(true);
			expect(highlights.some(fact => text.slice(fact.from, fact.to) === "inert")).toBe(false);
			expect(highlights.some(fact => text.slice(fact.from, fact.to) === "fake")).toBe(false);

			const symbols = editorSymbolFacts(text, "/project/diagram.amx", analysis.document, analysis);
			const diagram = symbols.find(fact => fact.declaration && fact.name === "crankSlider");
			const time = symbols.find(fact => fact.declaration && fact.name === "t");
			const rod = symbols.find(fact => fact.declaration && fact.name === "rod");
			const timer = symbols.find(fact => fact.declaration && fact.name === "timer");
			const timeReferences = symbols.filter(fact => !fact.declaration && fact.name === "t");
			expect(diagram).toBeDefined();
			expect(time?.parent).toEqual(diagram?.target);
			expect(rod?.parent).toEqual(diagram?.target);
			expect(timer?.parent).toEqual(diagram?.target);
			expect(timeReferences).toHaveLength(2);
			expect(timeReferences.every(fact => fact.target.from === time?.from && fact.target.to === time?.to)).toBe(true);
			expect(editorRenameFact(symbols, "/project/diagram.amx", time!.from)?.edits).toHaveLength(3);
			expect(isSafeRenameIdentifier("diagram")).toBe(false);
		});

		test("V0.13 diagram completion is contextual and keeps diagram time local", () => {
			const text = [
				"```amx",
				"let radius: Number = 10",
				"diagram motion {",
				'  title: "Motion"',
				'  description: "A moving rod."',
				"  width: 100",
				"  height: 80",
				"  time t from 0 to 2 duration 4",
				"  ",
				"  line rod {",
				"    x1: radius",
				"    y1: 10",
				"    x2: radius + t",
				"    y2: 20",
				'    stroke: "#263238"',
				"    lineWidth: 2",
				"    ",
				"  }",
				"  text timer {",
				"    x: 2",
				"    y: 2",
				'    value: "t = ${round(t, 2)}"',
				'    fill: "#263238"',
				"  }",
				"}",
				"let after = radius",
				"```",
				""
			].join("\n");
			const prepared = prepareEditorCompletion(text, text.indexOf("  \n  line rod"));
			expect(prepared).toBeDefined();
			const topCursor = text.indexOf("  \n  line rod") + 2;
			const topLabels = editorCompletionFacts(text, topCursor, prepared!.document, undefined, text).map(item => item.label);
			expect(topLabels).toContain("line");
			expect(topLabels).not.toContain("time");
			expect(topLabels).not.toContain("stroke");

			const expressionCursor = text.indexOf("x2: radius + ") + "x2: radius + ".length;
			const expressionPrepared = prepareEditorCompletion(text, expressionCursor);
			expect(expressionPrepared).toBeDefined();
			const expressionLabels = editorCompletionFacts(text, expressionCursor, expressionPrepared!.document, undefined, text).map(item => item.label);
			expect(expressionLabels).toContain("radius");
			expect(expressionLabels).toContain("t");

			const propertyCursor = text.indexOf("    \n  }", text.indexOf("line rod")) + 4;
			const propertyPrepared = prepareEditorCompletion(text, propertyCursor);
			expect(propertyPrepared).toBeDefined();
			const propertyLabels = editorCompletionFacts(text, propertyCursor, propertyPrepared!.document, undefined, text).map(item => item.label);
			expect(propertyLabels).toContain("arrow");
			expect(propertyLabels).not.toContain("fill");

			const arrowText = text.replace('    lineWidth: 2\n', '    lineWidth: 2\n    arrow: ""\n');
			const arrowCursor = arrowText.indexOf('arrow: "') + 'arrow: "'.length;
			const arrowPrepared = prepareEditorCompletion(arrowText, arrowCursor);
			expect(arrowPrepared).toBeDefined();
			const arrowLabels = editorCompletionFacts(arrowText, arrowCursor, arrowPrepared!.document, undefined, arrowText).map(item => item.label);
			expect(arrowLabels).toEqual(['"none"', '"start"', '"end"', '"both"']);

			const afterCursor = text.indexOf("let after = ") + "let after = ".length;
			const afterPrepared = prepareEditorCompletion(text, afterCursor);
			expect(afterPrepared).toBeDefined();
			expect(editorCompletionFacts(text, afterCursor, afterPrepared!.document, undefined, text).map(item => item.label)).not.toContain("t");
		});

		test("V0.13 diagnostics retain source coordinates across LF, CRLF, and UTF-16 text", () => {
			for (const newline of ["\n", "\r\n"]) {
				const text = [
					"😀 narrative",
					"```amx",
					"diagram draft {",
					'  title: "Draft"',
					'  description: "Incomplete line."',
					"  width: 100",
					"  height: 80",
					"  time t from 0 to 1 duration 1",
					"  line unfinished {",
					"    x1: 0",
					"  }",
					"}",
					"```",
					""
				].join(newline);
				try {
					analyzeEditorModules(text, "/project/incomplete-diagram.amx");
					throw new Error("Expected an incomplete-line diagnostic");
				} catch (error) {
					expect(error).toMatchObject({ code: "AMXD001", file: "/project/incomplete-diagram.amx" });
					const diagnostic = error as { line: number; column: number };
					expect(text.split(/\r?\n/)[diagnostic.line - 1]?.slice(diagnostic.column - 1, diagnostic.column)).toBe("l");
					expect(diagnostic.line).toBe(9);
					expect(diagnostic.column).toBe(3);
					const range = sourceTokenRange(text, { line: diagnostic.line, column: diagnostic.column }, "line");
					expect(range).toBeDefined();
					expect(text.slice(range!.from, range!.to)).toBe("line");
				}
			}
		});