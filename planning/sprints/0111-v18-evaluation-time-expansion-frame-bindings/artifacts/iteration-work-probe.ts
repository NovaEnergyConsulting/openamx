import { cpus, hostname, platform, release, totalmem } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { writeFile, mkdir } from 'node:fs/promises';
import { parseDocumentText } from '../../../../src/parser/parseDocument';
import { evaluateDocumentEnvironment } from '../../../../src/runtime/evaluateDocument';

const iterationCounts = [10_000, 100_000, 1_000_000];
const repetitions = 5;
const workloads = ['empty-body', 'false-branch'] as const;
const rawDirectory = join(
  process.cwd(),
  'planning/sprints/0111-v18-evaluation-time-expansion-frame-bindings/artifacts/raw'
);
const outputPath = join(rawDirectory, 'iteration-work.json');

function makeDocument(iterations: number, workload: typeof workloads[number]) {
  const body = workload === 'empty-body' ? '' : '  if false {\n  }\n';
  const source = `\`\`\`amx\nfor probeItem in [1 to ${iterations}] {\n${body}}\n\`\`\``;
  return parseDocumentText(source);
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)]!;
}

const results = [];
for (const iterations of iterationCounts) {
  for (const workload of workloads) {
    const document = makeDocument(iterations, workload);
    evaluateDocumentEnvironment(document, 'iteration-work-probe.amx');

    const samples = [];
    for (let repetition = 0; repetition < repetitions; repetition++) {
      const before = process.memoryUsage();
      const started = performance.now();
      evaluateDocumentEnvironment(document, 'iteration-work-probe.amx');
      const elapsedMs = performance.now() - started;
      const after = process.memoryUsage();
      samples.push({
        elapsedMs,
        heapUsedBeforeBytes: before.heapUsed,
        heapUsedAfterBytes: after.heapUsed,
        rssBeforeBytes: before.rss,
        rssAfterBytes: after.rss
      });
    }

    results.push({
      iterations,
      workload,
      medianMs: median(samples.map(sample => sample.elapsedMs)),
      maximumMs: Math.max(...samples.map(sample => sample.elapsedMs)),
      samples
    });
  }
}

const report = {
  scope: 'Existing general-purpose loop evaluation only; production diagram expansion is not implemented.',
  limitation: 'Memory values are before/after samples, not peak allocation or a boundedness claim.',
  command: 'bun run planning/sprints/0111-v18-evaluation-time-expansion-frame-bindings/artifacts/iteration-work-probe.ts',
  host: {
    hostname: hostname(),
    platform: platform(),
    release: release(),
    architecture: process.arch,
    logicalCpuCount: cpus().length,
    totalMemoryBytes: totalmem(),
    bunVersion: Bun.version,
    nodeVersion: process.version
  },
  iterationCounts,
  repetitions,
  workloads,
  results
};

await mkdir(rawDirectory, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
console.log(`Wrote ${outputPath}`);