import { afterEach, describe, expect, it } from 'bun:test';
import { writeFileSync } from 'node:fs';
import { mkdir, mkdtemp, rm, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { resolveTranspileGraph } from '../src/transpiler/filesystemGraph';
import { inspectTranspiledGraphWrite, TranspileOutputError, writeTranspiledGraph } from '../src/transpiler/outputWriter';
import { transpileDocument } from '../src/transpiler';
import type { TranspileResult } from '../src/transpiler/types';

const directories: string[] = [];

async function createProject(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'openamx-s124-graph-'));
  directories.push(directory);
  return directory;
}

async function writeSource(directory: string, relativePath: string, source: string): Promise<string> {
  const target = join(directory, relativePath);
  await mkdir(join(target, '..'), { recursive: true });
  await Bun.write(target, source);
  return target;
}

function withOutputPaths(
  result: Extract<TranspileResult, { ok: true }>,
  outputPaths: readonly string[]
): Extract<TranspileResult, { ok: true }> {
  return {
    ...result,
    modules: result.modules.map((module, index) => ({ ...module, outputPath: outputPaths[index] }))
  };
}

afterEach(async () => {
  for (const directory of directories) await rm(directory, { recursive: true, force: true });
  directories.length = 0;
});

describe('S124 filesystem graph resolution', () => {
  it('builds the exact source-preserving S123 graph in dependency-first order', async () => {
    const root = await createProject();
    const entrySource = '---\r\ntitle: Entry\r\n---\r\n```amx\r\nimport { first } from "./lib/../shared.amx"\r\nimport { second } from "./shared.amx"\r\nexport let total: Number = first + second\r\n```\r\n';
    await writeSource(root, 'main.amx', entrySource);
    await writeSource(root, 'shared.amx', '```amx\nexport let first: Number = 2\nexport let second: Number = 3\n```\n');

    const graph = resolveTranspileGraph(join(root, 'main.amx'));
    expect(graph.entryModuleId).toBe('main.ts');
    expect(graph.modules.map(module => module.outputPath)).toEqual(['shared.ts', 'main.ts']);
    expect(graph.modules[1]).toMatchObject({
      moduleId: 'main.ts',
      outputPath: 'main.ts',
      sourceText: entrySource,
      resolvedImports: [
        { importPath: './lib/../shared.amx', moduleId: 'shared.ts' },
        { importPath: './shared.amx', moduleId: 'shared.ts' }
      ]
    });

    const transpiled = transpileDocument(graph);
    expect(transpiled).toMatchObject({ ok: true });
    if (transpiled.ok) expect(transpiled.modules.map(module => module.outputPath)).toEqual(['shared.ts', 'main.ts']);
  });

  it('uses captured entry and dependency overlays without writing source files', async () => {
    const root = await createProject();
    const diskEntry = '```amx\nimport { value } from "./lib.amx"\nexport let result: Number = value\n```\n';
    const diskDependency = '```amx\nexport let value: Number = 1\n```\n';
    const entry = await writeSource(root, 'main.amx', diskEntry);
    const dependency = await writeSource(root, 'lib.amx', diskDependency);
    const entryOverlay = diskEntry.replace('value\n```', 'value + 1\n```');
    const dependencyOverlay = '```amx\nexport let value: Number = 41\n```\n';

    const graph = resolveTranspileGraph(entry, {
      entryText: entryOverlay,
      sourceOverlay: new Map([[dependency, dependencyOverlay]])
    });
    const transpiled = transpileDocument(graph);

    expect(graph.modules.find(module => module.outputPath === 'main.ts')?.sourceText).toBe(entryOverlay);
    expect(graph.modules.find(module => module.outputPath === 'lib.ts')?.sourceText).toBe(dependencyOverlay);
    expect(transpiled).toMatchObject({ ok: true });
    if (transpiled.ok) expect(transpiled.modules.find(module => module.outputPath === 'lib.ts')?.code).toContain('41');
    expect(await Bun.file(entry).text()).toBe(diskEntry);
    expect(await Bun.file(dependency).text()).toBe(diskDependency);
  });

  it('maps a nested single-module entry under the default import root', async () => {
    const root = await createProject();
    const entry = await writeSource(root, 'reports/nested/main.amx', '```amx\nexport let value: Number = 1\n```\n');
    const graph = resolveTranspileGraph(entry);

    expect(graph.modules).toHaveLength(1);
    expect(graph.entryModuleId).toBe('main.ts');
    expect(graph.modules[0].outputPath).toBe('main.ts');
  });

  it('resolves a nested shared dependency once in deterministic depth-first order', async () => {
    const root = await createProject();
    await writeSource(root, 'shared.amx', '```amx\nexport let common: Number = 2\nexport let other: Number = 3\n```\n');
    await writeSource(root, 'left.amx', '```amx\nimport { common } from "./shared.amx"\nexport let left: Number = common\n```\n');
    await writeSource(root, 'right.amx', '```amx\nimport { other } from "./nested/../shared.amx"\nexport let right: Number = other\n```\n');
    const entry = await writeSource(root, 'main.amx', '```amx\nimport { left } from "./left.amx"\nimport { right } from "./right.amx"\nexport let total: Number = left + right\n```\n');

    const graph = resolveTranspileGraph(entry);
    expect(graph.modules.map(module => module.outputPath)).toEqual(['shared.ts', 'left.ts', 'right.ts', 'main.ts']);
    expect(graph.modules.filter(module => module.sourcePath.endsWith('shared.amx'))).toHaveLength(1);
    expect(graph.modules.find(module => module.outputPath === 'right.ts')?.resolvedImports)
      .toEqual([{ importPath: './nested/../shared.amx', moduleId: 'shared.ts' }]);
  });

  it('uses a canonical explicit root and rejects a dependency that escapes it', async () => {
    const parent = await createProject();
    const root = join(parent, 'project');
    const outside = join(parent, 'outside.amx');
    await mkdir(root, { recursive: true });
    await writeSource(root, 'src/main.amx', '```amx\nimport { value } from "../../outside.amx"\n```\n');
    await writeSource(parent, 'outside.amx', '```amx\nexport let value: Number = 1\n```\n');

    expect(() => resolveTranspileGraph(join(root, 'src/main.amx'), { importRoot: root }))
      .toThrow(expect.objectContaining({ code: 'AMX5001', file: expect.stringContaining('main.amx') }));
    expect(outside).toContain('outside.amx');
  });

  it('mirrors nested source paths relative to an explicit root that contains the entry', async () => {
    const project = await createProject();
    const root = join(project, 'imports');
    const entry = await writeSource(root, 'reports/main.amx', '```amx\nimport { value } from "../lib/value.amx"\nexport let result: Number = value\n```\n');
    await writeSource(root, 'lib/value.amx', '```amx\nexport let value: Number = 4\n```\n');

    const graph = resolveTranspileGraph(entry, { importRoot: root });
    expect(graph.modules.map(module => module.outputPath)).toEqual(['lib/value.ts', 'reports/main.ts']);
    expect(graph.entryModuleId).toBe('reports/main.ts');
    expect(graph.modules[1].resolvedImports).toEqual([{ importPath: '../lib/value.amx', moduleId: 'lib/value.ts' }]);
  });

  it('deduplicates in-root symlink aliases and rejects symlinks that escape the import root', async () => {
    const project = await createProject();
    const root = join(project, 'source');
    await mkdir(root, { recursive: true });
    const library = await writeSource(root, 'library.amx', '```amx\nexport let first: Number = 1\nexport let second: Number = 2\n```\n');
    await symlink(library, join(root, 'alias.amx'), 'file');
    const entry = await writeSource(root, 'main.amx', '```amx\nimport { first } from "./library.amx"\nimport { second } from "./alias.amx"\n```\n');

    const graph = resolveTranspileGraph(entry);
    expect(graph.modules.map(module => module.outputPath)).toEqual(['library.ts', 'main.ts']);
    expect(graph.modules[0].sourcePath).toBe(library);
    expect(graph.modules[1].resolvedImports.map(mapping => mapping.moduleId)).toEqual(['library.ts', 'library.ts']);

    const outside = await writeSource(project, 'outside.amx', '```amx\nexport let hidden: Number = 1\n```\n');
    await symlink(outside, join(root, 'escape.amx'), 'file');
    await writeSource(root, 'escape-entry.amx', '```amx\nimport { hidden } from "./escape.amx"\n```\n');
    expect(() => resolveTranspileGraph(join(root, 'escape-entry.amx')))
      .toThrow(expect.objectContaining({ code: 'AMX5001', message: expect.stringContaining('outside') }));
  });

  it('reports cycles at the importing source and parses without evaluating statements', async () => {
    const root = await createProject();
    const entry = await writeSource(root, 'main.amx', '```amx\nimport { value } from "./dep.amx"\nlet result: Number = min([])\n```\n');
    await writeSource(root, 'dep.amx', '```amx\nimport { result } from "./main.amx"\nexport let value: Number = result\n```\n');

    expect(() => resolveTranspileGraph(entry))
      .toThrow(expect.objectContaining({ code: 'AMX5003', file: join(root, 'dep.amx'), line: 2 }));

    await writeSource(root, 'main.amx', '```amx\nlet result: Number = min([])\n```\n');
    const graph = resolveTranspileGraph(entry);
    expect(graph.modules).toHaveLength(1);
    expect(graph.modules[0].sourceText).toContain('min([])');
  });

  it('rejects invalid import syntax and imports after executable code', async () => {
    const root = await createProject();
    const entry = await writeSource(root, 'main.amx', '```amx\nlet value: Number = 1\nimport { other } from "package.amx"\n```\n');
    expect(() => resolveTranspileGraph(entry))
      .toThrow(expect.objectContaining({ code: 'AMX5001', message: expect.stringContaining('must precede') }));

    await writeSource(root, 'main.amx', '```amx\nimport { other } from "package.amx"\n```\n');
    expect(() => resolveTranspileGraph(entry))
      .toThrow(expect.objectContaining({ code: 'AMX5001', message: expect.stringContaining('relative') }));
  });

  it('rejects missing targets and unsupported import path forms', async () => {
    const root = await createProject();
    const entry = await writeSource(root, 'main.amx', '```amx\nimport { missing } from "./missing.amx"\n```\n');
    expect(() => resolveTranspileGraph(entry))
      .toThrow(expect.objectContaining({ code: 'AMX5001', message: expect.stringContaining('could not be found') }));

    for (const importPath of ['package.amx', 'https://example.test/lib.amx', 'C:/absolute.amx', './wrong.AMX', '.\\backslash.amx']) {
      await writeSource(root, 'main.amx', `\`\`\`amx\nimport { value } from ${JSON.stringify(importPath)}\n\`\`\`\n`);
      expect(() => resolveTranspileGraph(entry)).toThrow(expect.objectContaining({ code: 'AMX5001' }));
    }
  });

  it('preserves imported visibility, duplicate-name, and dimension/unit diagnostics', async () => {
    const root = await createProject();
    const entry = await writeSource(root, 'main.amx', '```amx\nimport { value } from "./private.amx"\n```\n');
    await writeSource(root, 'private.amx', '```amx\nlet value: Number = 1\n```\n');
    expect(() => resolveTranspileGraph(entry))
      .toThrow(expect.objectContaining({ code: 'AMX5002', message: expect.stringContaining('does not export') }));

    await writeSource(root, 'one.amx', '```amx\nexport let value: Number = 1\n```\n');
    await writeSource(root, 'two.amx', '```amx\nexport let value: Number = 2\n```\n');
    await writeSource(root, 'main.amx', '```amx\nimport { value } from "./one.amx"\nimport { value } from "./two.amx"\n```\n');
    expect(() => resolveTranspileGraph(entry))
      .toThrow(expect.objectContaining({ code: 'AMX5002', message: expect.stringContaining('Duplicate import') }));

    await writeSource(root, 'one.amx', '```amx\nexport dimension Length\n```\n');
    await writeSource(root, 'two.amx', '```amx\nexport dimension Length\n```\n');
    await writeSource(root, 'main.amx', '```amx\nimport { Length } from "./one.amx"\nimport { Length } from "./two.amx"\n```\n');
    expect(() => resolveTranspileGraph(entry))
      .toThrow(expect.objectContaining({ code: 'AMX3008', message: expect.stringContaining('Duplicate import of dimension/unit') }));

    await writeSource(root, 'one.amx', '```amx\nexport let value: Number = 1\n```\n');
    await writeSource(root, 'main.amx', '```amx\nimport { value } from "./one.amx"\nlet value: Number = 2\n```\n');
    expect(() => resolveTranspileGraph(entry))
      .toThrow(expect.objectContaining({ code: 'AMX5002', message: expect.stringContaining('collides with a local declaration') }));

    await writeSource(root, 'one.amx', '```amx\nexport dimension Length\n```\n');
    await writeSource(root, 'main.amx', '```amx\nimport { Length } from "./one.amx"\ndimension Length\n```\n');
    expect(() => resolveTranspileGraph(entry))
      .toThrow(expect.objectContaining({ code: 'AMX3008', message: expect.stringContaining('collides with a local declaration') }));
  });

  it('preserves visibility for exported types, enums, functions, bindings, dimensions, and units', async () => {
    const root = await createProject();
    await writeSource(root, 'library.amx', [
      '```amx',
      'export type Point {',
      '  x: Number',
      '}',
      'export enum State = {',
      '  READY = 1',
      '}',
      'export fn double(value: Number): Number = value * 2',
      'export dimension Length',
      'export unit meter: Length',
      'export let origin: Point = Point { x = 1 }',
      '```',
      ''
    ].join('\n'));
    const entry = await writeSource(root, 'main.amx', [
      '```amx',
      'import { Length, Point, State, double, meter, origin } from "./library.amx"',
      'let point: Point = Point { x = 2 }',
      'let ready: Boolean = State.READY is State',
      'let distance: Length = 1 meter',
      'export let result: Number = double(origin.x + point.x) + distance / 1 meter',
      '```',
      ''
    ].join('\n'));
    const result = transpileDocument(resolveTranspileGraph(entry));
    expect(result).toMatchObject({ ok: true });
  });

  it('reports malformed and type-invalid dependencies without publishing a graph', async () => {
    const root = await createProject();
    const entry = await writeSource(root, 'main.amx', '```amx\nimport { value } from "./dep.amx"\nexport let result: Number = value\n```\n');
    const dependency = await writeSource(root, 'dep.amx', '```amx\nexport let value: String = "unterminated\n```\n');
    expect(() => resolveTranspileGraph(entry))
      .toThrow(expect.objectContaining({ code: 'AMX3006', file: dependency }));

    await writeSource(root, 'dep.amx', '```amx\nexport let value: Number = "wrong"\n```\n');
    const result = transpileDocument(resolveTranspileGraph(entry));
    expect(result).toMatchObject({ ok: false, diagnostics: [{ code: 'AMX3002', file: dependency }] });
  });

  it('passes only reachable modules and preserves entry-only input rules', async () => {
    const root = await createProject();
    const entry = await writeSource(root, 'main.amx', '```amx\nimport { value } from "./dep.amx"\ninput supplied: Number\nexport let result: Number = value + supplied\n```\n');
    await writeSource(root, 'dep.amx', '```amx\nexport let value: Number = 2\n```\n');
    await writeSource(root, 'unused.amx', '```amx\nexport let other: Number = 3\n```\n');
    const graph = resolveTranspileGraph(entry);
    expect(graph.modules.map(module => module.outputPath)).toEqual(['dep.ts', 'main.ts']);

    await writeSource(root, 'dep.amx', '```amx\ninput notAllowed: Number\nexport let value: Number = notAllowed\n```\n');
    expect(() => resolveTranspileGraph(entry))
      .toThrow(expect.objectContaining({ code: 'AMX3005', file: join(root, 'dep.amx') }));
  });

  it('refuses all existing graph targets before writing and preserves unrelated files', async () => {
    const project = await createProject();
    const entry = await writeSource(project, 'main.amx', '```amx\nimport { value } from "./lib.amx"\nexport let result: Number = value\n```\n');
    await writeSource(project, 'lib.amx', '```amx\nexport let value: Number = 7\n```\n');
    const output = join(await createProject(), 'generated');
    await mkdir(output, { recursive: true });
    await Bun.write(join(output, 'main.ts'), 'original entry');
    await Bun.write(join(output, 'lib.ts'), 'original lib');
    await Bun.write(join(output, 'unrelated.txt'), 'leave this alone');
    const result = transpileDocument(resolveTranspileGraph(entry));
    if (!result.ok) throw new Error('Expected the graph to transpile');

    expect(() => writeTranspiledGraph(result, output)).toThrow(TranspileOutputError);
    expect(await Bun.file(join(output, 'main.ts')).text()).toBe('original entry');
    expect(await Bun.file(join(output, 'lib.ts')).text()).toBe('original lib');
    expect(await Bun.file(join(output, 'unrelated.txt')).text()).toBe('leave this alone');
  });

  it('overwrites only graph-owned targets after explicit authorization', async () => {
    const project = await createProject();
    const entry = await writeSource(project, 'main.amx', '```amx\nimport { value } from "./lib.amx"\nexport let result: Number = value\n```\n');
    await writeSource(project, 'lib.amx', '```amx\nexport let value: Number = 7\n```\n');
    const output = join(await createProject(), 'generated');
    await mkdir(output, { recursive: true });
    await Bun.write(join(output, 'main.ts'), 'old entry');
    await Bun.write(join(output, 'lib.ts'), 'old lib');
    await Bun.write(join(output, 'unrelated.txt'), 'untouched');
    const result = transpileDocument(resolveTranspileGraph(entry));
    if (!result.ok) throw new Error('Expected the graph to transpile');

    const written = writeTranspiledGraph(result, output, { overwrite: true });
    expect(written.outputPaths).toEqual(['lib.ts', 'main.ts']);
    expect(await Bun.file(written.entryPath).text()).toContain('openamx/transpiler-runtime');
    expect(await Bun.file(join(output, 'unrelated.txt')).text()).toBe('untouched');
  });

  it('inspects exact graph conflicts and rejects target changes after approval', async () => {
    const project = await createProject();
    const entry = await writeSource(project, 'main.amx', '```amx\nimport { value } from "./lib.amx"\nexport let result: Number = value\n```\n');
    await writeSource(project, 'lib.amx', '```amx\nexport let value: Number = 7\n```\n');
    const output = join(await createProject(), 'generated');
    await mkdir(output, { recursive: true });
    await Bun.write(join(output, 'main.ts'), 'original entry');
    await Bun.write(join(output, 'lib.ts'), 'original library');
    await Bun.write(join(output, 'unrelated.txt'), 'untouched');
    const result = transpileDocument(resolveTranspileGraph(entry));
    if (!result.ok) throw new Error('Expected the graph to transpile');

    const plan = inspectTranspiledGraphWrite(result, output);
    expect(plan.targets.filter(target => target.exists).map(target => target.outputPath)).toEqual(['lib.ts', 'main.ts']);
    writeFileSync(join(output, 'main.ts'), 'changed after approval');

    expect(() => writeTranspiledGraph(result, output, { overwrite: true, expectedPlan: plan }))
      .toThrow(expect.objectContaining({ code: 'AMX6001', message: expect.stringContaining('changed after overwrite approval') }));
    expect(await Bun.file(join(output, 'main.ts')).text()).toBe('changed after approval');
    expect(await Bun.file(join(output, 'lib.ts')).text()).toBe('original library');
    expect(await Bun.file(join(output, 'unrelated.txt')).text()).toBe('untouched');
  });

  it('revalidates approved targets after staging and before publication', async () => {
    const project = await createProject();
    const entry = await writeSource(project, 'main.amx', '```amx\nimport { value } from "./lib.amx"\nexport let result: Number = value\n```\n');
    await writeSource(project, 'lib.amx', '```amx\nexport let value: Number = 7\n```\n');
    const output = join(await createProject(), 'generated');
    await mkdir(output, { recursive: true });
    await Bun.write(join(output, 'main.ts'), 'original entry');
    await Bun.write(join(output, 'lib.ts'), 'original library');
    await Bun.write(join(output, 'unrelated.txt'), 'untouched');
    const result = transpileDocument(resolveTranspileGraph(entry));
    if (!result.ok) throw new Error('Expected the graph to transpile');
    const plan = inspectTranspiledGraphWrite(result, output);

    expect(() => writeTranspiledGraph(result, output, {
      overwrite: true,
      expectedPlan: plan,
      failureInjector: (phase, outputPath) => {
        if (phase === 'stage' && outputPath === 'lib.ts') writeFileSync(join(output, 'main.ts'), 'changed during staging');
      }
    })).toThrow(expect.objectContaining({ code: 'AMX6001', message: expect.stringContaining('changed after overwrite approval') }));
    expect(await Bun.file(join(output, 'main.ts')).text()).toBe('changed during staging');
    expect(await Bun.file(join(output, 'lib.ts')).text()).toBe('original library');
    expect(await Bun.file(join(output, 'unrelated.txt')).text()).toBe('untouched');
    expect((await Array.fromAsync(new Bun.Glob('*').scan(output))).sort()).toEqual(['lib.ts', 'main.ts', 'unrelated.txt']);
  });

  it('rolls back earlier published files when a later publish fails', async () => {
    const project = await createProject();
    const entry = await writeSource(project, 'main.amx', '```amx\nimport { value } from "./lib.amx"\nexport let result: Number = value\n```\n');
    await writeSource(project, 'lib.amx', '```amx\nexport let value: Number = 7\n```\n');
    const output = join(await createProject(), 'generated');
    const result = transpileDocument(resolveTranspileGraph(entry));
    if (!result.ok) throw new Error('Expected the graph to transpile');

    try {
      writeTranspiledGraph(result, output, {
        failureInjector: (phase, outputPath) => {
          if (phase === 'publish' && outputPath === 'main.ts') throw new Error('injected publish failure');
        }
      });
      throw new Error('Expected injected publish failure');
    } catch (error) {
      expect(error).toBeInstanceOf(TranspileOutputError);
      expect((error as TranspileOutputError).code).toBe('AMX6002');
      expect((error as TranspileOutputError).pathStates.map(({ outputPath, state }) => ({ outputPath, state })))
        .toEqual([{ outputPath: 'lib.ts', state: 'restored' }, { outputPath: 'main.ts', state: 'staged' }]);
    }
    expect(await Bun.file(join(output, 'lib.ts')).exists()).toBe(false);
    expect(await Bun.file(join(output, 'main.ts')).exists()).toBe(false);
  });

  it('retains a rollback backup and reports unrecovered paths when rollback fails', async () => {
    const project = await createProject();
    const entry = await writeSource(project, 'main.amx', '```amx\nimport { value } from "./lib.amx"\nexport let result: Number = value\n```\n');
    await writeSource(project, 'lib.amx', '```amx\nexport let value: Number = 7\n```\n');
    const output = join(await createProject(), 'generated');
    await mkdir(output, { recursive: true });
    await Bun.write(join(output, 'lib.ts'), 'original library');
    const result = transpileDocument(resolveTranspileGraph(entry));
    if (!result.ok) throw new Error('Expected the graph to transpile');

    try {
      writeTranspiledGraph(result, output, {
        overwrite: true,
        failureInjector: (phase, outputPath) => {
          if (phase === 'publish' && outputPath === 'main.ts') throw new Error('injected publish failure');
          if (phase === 'rollback' && outputPath === 'lib.ts') throw new Error('injected rollback failure');
        }
      });
      throw new Error('Expected injected rollback failure');
    } catch (error) {
      expect(error).toBeInstanceOf(TranspileOutputError);
      expect((error as TranspileOutputError).code).toBe('AMX6002');
      expect((error as TranspileOutputError).pathStates.map(({ outputPath, state }) => ({ outputPath, state })))
        .toEqual([{ outputPath: 'lib.ts', state: 'unrecovered' }, { outputPath: 'main.ts', state: 'staged' }]);
      const retained = (error as TranspileOutputError).retainedStagePath;
      expect(retained).toBeDefined();
      expect(await Bun.file(join(retained!, 'staged', 'main.ts')).exists()).toBe(true);
      expect(await Bun.file(join(retained!, 'backups', 'lib.ts')).text()).toBe('original library');
    }
    expect(await Bun.file(join(output, 'lib.ts')).exists()).toBe(true);
  });

  it('cleans a staged graph after injected staging and first-publish failures', async () => {
    const project = await createProject();
    const entry = await writeSource(project, 'main.amx', '```amx\nimport { value } from "./lib.amx"\nexport let result: Number = value\n```\n');
    await writeSource(project, 'lib.amx', '```amx\nexport let value: Number = 7\n```\n');
    const output = join(await createProject(), 'generated');
    const result = transpileDocument(resolveTranspileGraph(entry));
    if (!result.ok) throw new Error('Expected the graph to transpile');

    for (const phase of ['stage', 'publish'] as const) {
      try {
        writeTranspiledGraph(result, output, {
          failureInjector: (currentPhase, outputPath) => {
            if (currentPhase === phase && outputPath === (phase === 'stage' ? 'main.ts' : 'lib.ts')) {
              throw new Error(`injected ${phase} failure`);
            }
          }
        });
        throw new Error(`Expected injected ${phase} failure`);
      } catch (error) {
        expect(error).toBeInstanceOf(TranspileOutputError);
        expect((error as TranspileOutputError).code).toBe('AMX6002');
      }
      expect(await Bun.file(join(output, 'lib.ts')).exists()).toBe(false);
      expect(await Bun.file(join(output, 'main.ts')).exists()).toBe(false);
    }
  });

  it('restores original bytes after an overwrite publish failure', async () => {
    const project = await createProject();
    const entry = await writeSource(project, 'main.amx', '```amx\nimport { value } from "./lib.amx"\nexport let result: Number = value\n```\n');
    await writeSource(project, 'lib.amx', '```amx\nexport let value: Number = 7\n```\n');
    const output = join(await createProject(), 'generated');
    await mkdir(output, { recursive: true });
    await Bun.write(join(output, 'lib.ts'), 'old library');
    await Bun.write(join(output, 'main.ts'), 'old entry');
    const result = transpileDocument(resolveTranspileGraph(entry));
    if (!result.ok) throw new Error('Expected the graph to transpile');

    expect(() => writeTranspiledGraph(result, output, {
      overwrite: true,
      failureInjector: (phase, outputPath) => {
        if (phase === 'publish' && outputPath === 'main.ts') throw new Error('injected publish failure');
      }
    })).toThrow(TranspileOutputError);
    expect(await Bun.file(join(output, 'lib.ts')).text()).toBe('old library');
    expect(await Bun.file(join(output, 'main.ts')).text()).toBe('old entry');
  });

  it('rejects invalid, case-fold colliding, file-directory, and source-tree destinations before writes', async () => {
    const source = await createProject();
    const entry = await writeSource(source, 'main.amx', '```amx\nimport { other } from "./dep.amx"\nexport let value: Number = other\n```\n');
    const dependency = await writeSource(source, 'dep.amx', '```amx\nexport let other: Number = 2\n```\n');
    const valid = transpileDocument(resolveTranspileGraph(entry));
    if (!valid.ok) throw new Error('Expected the graph to transpile');
    const external = join(await createProject(), 'out');

    for (const invalidPath of ['../escape.ts', '/absolute.ts', 'bad\\path.ts', 'nested/../escape.ts', 'nested//empty.ts']) {
      const invalid = withOutputPaths(valid, valid.modules.map((_, index) => index === 0 ? invalidPath : 'main.ts'));
      expect(() => writeTranspiledGraph(invalid, external)).toThrow(expect.objectContaining({ code: 'AMX6001' }));
    }

    const caseCollision = withOutputPaths(valid, ['Main.ts', 'main.ts']);
    expect(() => writeTranspiledGraph(caseCollision, external)).toThrow(expect.objectContaining({ code: 'AMX6001' }));
    const normalizationCollision = withOutputPaths(valid, ['caf\u00e9.ts', 'cafe\u0301.ts']);
    expect(() => writeTranspiledGraph(normalizationCollision, external)).toThrow(expect.objectContaining({ code: 'AMX6001' }));
    const fileDirectoryConflict = withOutputPaths(valid, ['main.ts/data.ts', 'main.ts']);
    expect(() => writeTranspiledGraph(fileDirectoryConflict, external)).toThrow(expect.objectContaining({ code: 'AMX6001' }));
    expect(() => writeTranspiledGraph(valid, source)).toThrow(expect.objectContaining({ code: 'AMX6001' }));
    expect(await Bun.file(external).exists()).toBe(false);
    expect(await Bun.file(entry).text()).toContain('export let value');
    expect(await Bun.file(dependency).text()).toContain('export let other');
  });

  it('rejects output symlinks that escape the selected output directory', async () => {
    const source = await createProject();
    const entry = await writeSource(source, 'main.amx', '```amx\nexport let value: Number = 1\n```\n');
    const result = transpileDocument(resolveTranspileGraph(entry));
    if (!result.ok) throw new Error('Expected the graph to transpile');
    const output = join(await createProject(), 'generated');
    await mkdir(output, { recursive: true });
    await symlink(entry, join(output, 'main.ts'), 'file');

    expect(() => writeTranspiledGraph(result, output, { overwrite: true }))
      .toThrow(expect.objectContaining({ code: 'AMX6001' }));
    expect(await Bun.file(entry).text()).toContain('export let value');
  });
});