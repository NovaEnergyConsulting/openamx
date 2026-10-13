import { describe, expect, it } from 'bun:test';
import { evaluateDocumentEnvironment } from '../src/runtime/evaluateDocument';
import { parseDocumentText } from '../src/parser/parseDocument';
import { prepareReport } from '../src/renderer/reportPreparation';
import { orderedReportSequence } from '../src/renderer/reportSequence';

const source = `# Before

\`\`\`amx
diagram alpha {
  title: "Alpha"
  description: "First static figure"
  width: 100
  height: 50
  time t from 0 to 1 duration 1
  circle alphaMarker {
    cx: 20 + 20 * t
    cy: 25
    r: 5
    stroke: "#263238"
    lineWidth: 1
  }
}
diagram beta {
  title: "Beta"
  description: "Second static figure"
  width: 100
  height: 50
  time t from 0 to 1 duration 1
  circle betaMarker {
    cx: 60 + 20 * t
    cy: 25
    r: 5
    stroke: "#263238"
    lineWidth: 1
  }
}
\`\`\`

# After
`;

describe('prepared report sequence', () => {
  async function preparedFixture() {
    const document = parseDocumentText(source);
    const environment = evaluateDocumentEnvironment(document, 'sequence.amx');
    return prepareReport(document, environment, { file: 'sequence.amx' });
  }

  it('inserts diagrams at their item positions in explicit stable order', async () => {
    const report = await preparedFixture();
    const diagrams = report.diagrams ?? [];
    expect(diagrams.map(diagram => [diagram.beforeItemIndex, diagram.order])).toEqual([[2, 0], [2, 1]]);

    const reversed = { ...report, diagrams: [...diagrams].reverse() };
    const sequence = orderedReportSequence(reversed);
    expect(sequence.map(entry => entry.type === 'item'
      ? entry.item.type === 'narrative' ? entry.item.text.trim() : entry.item.type
      : entry.diagram.model.title)).toEqual(['# Before', 'source', 'Alpha', 'Beta', '# After']);
  });

  it('rejects invalid insertion positions and ambiguous diagram order', async () => {
    const report = await preparedFixture();
    const diagrams = report.diagrams ?? [];
    const first = diagrams[0];
    const second = diagrams[1];
    if (!first || !second) throw new Error('Expected two prepared diagrams.');

    expect(() => orderedReportSequence({
      ...report,
      diagrams: [{ ...first, beforeItemIndex: report.items.length + 1 }]
    })).toThrow('invalid insertion position');
    expect(() => orderedReportSequence({
      ...report,
      diagrams: [first, { ...second, order: first.order }]
    })).toThrow('invalid or duplicate order');
  });
});
