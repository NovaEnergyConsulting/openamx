import { describe, expect, it } from "bun:test";
import { parseDocumentText } from "../../../src/parser/parseDocument";
import { evaluateDocument } from "../../../src/runtime/evaluateDocument";
import { starterExamples } from "./starterExamples";

describe("bundled desktop starter reports", () => {
	it("parse and evaluate each starter without external inputs", () => {
		expect(starterExamples).toHaveLength(2);
		for (const starter of starterExamples) {
			const document = parseDocumentText(starter.source);
			expect(evaluateDocument(document)).toEqual(starter.id === "hello"
				? { assetName: "Transformer TX-001", riskScore: 15 }
				: { openActions: 4, reviewedActions: 3, remainingActions: 1 });
		}
	});
});