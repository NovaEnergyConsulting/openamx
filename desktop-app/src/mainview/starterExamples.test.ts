import { describe, expect, it } from "bun:test";
import { parseDocumentText } from "../../../src/parser/parseDocument";
import { evaluateDocument } from "../../../src/runtime/evaluateDocument";
import { guidedJourney, starterExamples } from "./starterExamples";

describe("bundled desktop starter reports", () => {
	it("parse and evaluate each starter without external inputs", () => {
		expect(starterExamples).toHaveLength(2);
		expect(starterExamples.map(starter => starter.id)).toEqual(["hello", "operations-note"]);
		expect(guidedJourney.id).toBe("guide");
		expect(guidedJourney.description).toContain("numbered 00-15 guide");
		for (const starter of starterExamples) {
			const document = parseDocumentText(starter.source);
			expect(evaluateDocument(document)).toEqual(starter.id === "hello"
				? { assetName: "Transformer TX-001", riskScore: 15 }
				: { openActions: 4, reviewedActions: 3, remainingActions: 1 });
		}
	});
});