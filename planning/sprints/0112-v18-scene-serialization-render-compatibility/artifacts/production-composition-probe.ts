import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { writeFileSync } from 'node:fs';
import { cpus, totalmem } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { parseDocumentText } from '../../../../src/parser/parseDocument';
import { evaluateDocumentEnvironment } from '../../../../src/runtime/evaluateDocument';
import { evaluateDiagramFrame, serializeDiagramSceneModel } from '../../../../src/runtime/diagramModel';
import { prepareDocxReport, serializeDocxReport } from '../../../../src/renderer/reportDocx';
import { preparePdfReport, serializePdfReport } from '../../../../src/renderer/reportPdf';
import { prepareReport } from '../../../../src/renderer/reportPreparation';
import { renderPreparedHtml } from '../../../../src/renderer/renderHtml';

const sprintDirectory = dirname(fileURLToPath(import.meta.url));
const outputDirectory = join(sprintDirectory, 'outputs');
const rawDirectory = join(sprintDirectory, 'raw');
const diagramCount = 16;
const directElementsPerDiagram = 31;
const generatedElementsPerDiagram = 64;
const expectedTimes = [0, 0.5, 1];

function median(values: readonly number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

function compositionSource(): string {
  const diagrams = Array.from({ length: diagramCount }, (_value, diagramIndex) => {
    const diagramName = `composition${String(diagramIndex + 1).padStart(2, '0')}`;
    const direct = Array.from({ length: directElementsPerDiagram }, (_element, elementIndex) => `  circle fixed${diagramIndex + 1}_${elementIndex + 1} {
    cx: ${elementIndex + 1}
    cy: 20
    r: 1
    stroke: "#263238"
    fill: "#9B2C2C"
    lineWidth: 1
  }`).join('\n');
    return `diagram ${diagramName} {
  title: "Generated composition ${String(diagramIndex + 1).padStart(2, '0')}"
  description: "Production model with fixed and loop-generated membership"
  width: 120
  height: 90
  time t from 0 to 1 duration 1
${direct}
  for item in [1 to 64] {
    circle generatedPoint${diagramIndex + 1} {
      cx: item + 31 + 10 * t
      cy: 60
      r: 2
      stroke: "#146C94"
      fill: "#146C94"
      lineWidth: 1
    }
  }
}`;
  });
  return `# Before composition

\`\`\`amx
${diagrams.join('\n')}
\`\`\`

# After composition
`;
}

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

const source = compositionSource();
const document = parseDocumentText(source);
const environment = evaluateDocumentEnvironment(document, 's112-production-composition.amx');
const models = environment.diagramEmissions.map(emission => emission.model);
if (models.length !== diagramCount) throw new Error(`Expected ${diagramCount} diagrams, received ${models.length}.`);

const expectedFrames = models.map(model => expectedTimes.map(time => evaluateDiagramFrame(model, time).elements.map(element => {
  if (element.primitive !== 'circle') throw new Error('The composition fixture should contain circles only.');
  return {
    name: element.name,
    primitive: element.primitive,
    cx: element.cx,
    cy: element.cy,
    r: element.r,
    stroke: element.stroke,
    fill: element.fill ?? 'none',
    lineWidth: element.lineWidth
  };
})));
const totalFrameElements = expectedFrames[0]![0]!.length * diagramCount;
if (totalFrameElements !== 1520) throw new Error(`Expected 1,520 frame elements, received ${totalFrameElements}.`);

const serializedModels = models.map(model => serializeDiagramSceneModel(model));
const serializedModelBytes = serializedModels.reduce((total, serialized) => total + Buffer.byteLength(serialized, 'utf8'), 0);
const compressedPayloadBytes = serializedModels.reduce(
  (total, serialized) => total + gzipSync(Buffer.from(serialized, 'utf8'), { level: 9 }).byteLength,
  0
);
const report = await prepareReport(document, environment, { file: 's112-production-composition.amx' });
const html = renderPreparedHtml(report, { mode: 'standalone' }) as string;
const htmlBytes = Buffer.byteLength(html, 'utf8');
const embeddedPayloads = [...html.matchAll(/data-diagram-model data-encoding="gzip-base64">([^<]+)</g)];
if (embeddedPayloads.length !== diagramCount) throw new Error(`Expected ${diagramCount} embedded payloads, received ${embeddedPayloads.length}.`);
const embeddedCompressedBytes = embeddedPayloads.reduce((total, match) => total + Buffer.from(match[1]!, 'base64').byteLength, 0);
const embeddedBase64Bytes = embeddedPayloads.reduce((total, match) => total + match[1]!.length, 0);

const pdfDurationsMs: number[] = [];
let pdfBytes = new Uint8Array();
for (let repetition = 0; repetition < 5; repetition++) {
  const startedAt = performance.now();
  pdfBytes = await serializePdfReport(preparePdfReport(report));
  pdfDurationsMs.push(performance.now() - startedAt);
}

const docxDurationsMs: number[] = [];
let docxBytes = new Uint8Array();
for (let repetition = 0; repetition < 5; repetition++) {
  const startedAt = performance.now();
  docxBytes = await serializeDocxReport(await prepareDocxReport(report));
  docxDurationsMs.push(performance.now() - startedAt);
}

const frameSamplesMs: number[] = [];
for (let repetition = 0; repetition < 5; repetition++) {
  const startedAt = performance.now();
  for (const time of expectedTimes) {
    for (const model of models) evaluateDiagramFrame(model, time);
  }
  frameSamplesMs.push(performance.now() - startedAt);
}

const htmlPath = join(outputDirectory, '64-cap-composition-v2.html');
const pdfPath = join(outputDirectory, '64-cap-composition-v2.pdf');
const docxPath = join(outputDirectory, '64-cap-composition-v2.docx');
writeFileSync(htmlPath, html, 'utf8');
writeFileSync(pdfPath, pdfBytes);
writeFileSync(docxPath, docxBytes);

const evidence = {
  host: {
    platform: process.platform,
    architecture: process.arch,
    nodeVersion: process.version,
    bunVersion: Bun.version,
    logicalCpus: cpus().length,
    totalMemoryBytes: totalmem()
  },
  workload: {
    diagrams: diagramCount,
    authoredPrimitiveDeclarations: 512,
    directPrimitiveDeclarationsPerDiagram: directElementsPerDiagram,
    controlOriginatingEmissionsPerDiagram: generatedElementsPerDiagram,
    frameElementsPerDiagram: directElementsPerDiagram + generatedElementsPerDiagram,
    totalFrameElements,
    requestedTimes: expectedTimes
  },
  serialization: {
    serializedModelBytes,
    gzipPayloadBytes: compressedPayloadBytes,
    embeddedGzipPayloadBytes: embeddedCompressedBytes,
    embeddedBase64PayloadBytes: embeddedBase64Bytes,
    htmlBytes
  },
  staticExports: {
    pdf: {
      bytes: pdfBytes.byteLength,
      durationsMs: pdfDurationsMs,
      medianDurationMs: median(pdfDurationsMs),
      sha256: sha256(pdfBytes)
    },
    docx: {
      bytes: docxBytes.byteLength,
      durationsMs: docxDurationsMs,
      medianDurationMs: median(docxDurationsMs),
      sha256: sha256(docxBytes)
    }
  },
  inProcessFrameEvaluation: {
    durationsMs: frameSamplesMs,
    medianDurationMs: median(frameSamplesMs)
  },
  s109Comparison: {
    htmlBytes: 247256,
    wholePageDomNodes: 1864,
    serializedJsonBytes: 7714079,
    gzipPayloadBytes: 131896,
    pdfBytes: 122505,
    pdfMedianDurationMs: 72.58,
    docxBytes: 11766,
    docxMedianDurationMs: 239.46,
    note: 'Synthetic S109 comparison points, not universal thresholds.'
  },
  expectedFrames
};

writeFileSync(join(rawDirectory, 'production-composition-v2.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ ...evidence, expectedFrames: '[omitted from console; preserved in production-composition-v2.json]' }, null, 2));