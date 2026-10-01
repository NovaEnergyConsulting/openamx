import { afterEach, describe, expect, it } from 'bun:test';
import { mkdir, rm } from 'fs/promises';
import { resolve } from 'node:path';
import { loadEntryModule } from '../src/runtime/moduleLoader';

const directories: string[] = [];

async function createDirectory(): Promise<string> {
  const directory = `./openamx-output-cli-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await mkdir(directory, { recursive: true });
  directories.push(directory);
  return directory;
}

async function write(directory: string, name: string, contents: string): Promise<string> {
  const filePath = `${directory}/${name}`;
  await Bun.write(filePath, contents);
  return filePath;
}

async function runCli(...arguments_: string[]) {
  const command = Bun.spawnSync(['bun', 'run', 'src/cli.ts', ...arguments_]);
  return {
    exitCode: command.exitCode,
    stdout: new TextDecoder().decode(command.stdout),
    stderr: new TextDecoder().decode(command.stderr)
  };
}

afterEach(async () => {
  for (const directory of directories) await rm(directory, { recursive: true, force: true });
  directories.length = 0;
});

describe('Sprint 017 CLI outputs', () => {
  it('writes repeated explicit entry exports and rejects private, imported, and non-value names', async () => {
    const directory = await createDirectory();
    await write(directory, 'library.amx', '```amx\nexport let shared: Number = 9\n```\n');
    const entry = await write(directory, 'entry.amx', '```amx\nimport { shared } from "./library.amx"\nlet hidden: Number = 2\nexport let total: Number = hidden + shared\nexport let label: String = "sum"\n```\n');
    const jsonPath = `${directory}/total=serialized.json`;
    const csvPath = `${directory}/label.json`;
    const success = await runCli('run', entry, '--output', `total=${jsonPath}`, '--output', `label=${csvPath}`);
    expect(success.exitCode).toBe(0);
    expect(JSON.parse(await Bun.file(jsonPath).text())).toBe(11);
    expect(JSON.parse(await Bun.file(csvPath).text())).toBe('sum');
    expect(success.stdout).toContain('"total": 11');

    const privateOutput = await runCli('run', entry, '--output', `hidden=${directory}/hidden.json`);
    expect(privateOutput.exitCode).not.toBe(0);
    expect(privateOutput.stderr).toContain('AMX6001');
    const importedOutput = await runCli('run', entry, '--output', `shared=${directory}/shared.json`);
    expect(importedOutput.exitCode).not.toBe(0);
    expect(importedOutput.stderr).toContain('AMX6001');
    const typeOutput = await runCli('run', entry, '--output', `Point=${directory}/point.json`);
    expect(typeOutput.exitCode).not.toBe(0);
    expect(typeOutput.stderr).toContain('AMX6001');
  });

  it('validates repeated mapping syntax, duplicate names, and canonical destination conflicts', async () => {
    const directory = await createDirectory();
    const entry = await write(directory, 'entry.amx', '```amx\nexport let value: Number = 4\nexport let other: Number = 5\n```\n');
    for (const mappings of [
      ['value'],
      ['=value.json'],
      ['value='],
      ['value=value.json', 'value=other.json'],
      ['value=out.json', 'other=./out.json'],
      ['value=out.JSON']
    ]) {
      const args = mappings.flatMap(mapping => ['--output', mapping]);
      const result = await runCli('run', entry, ...args);
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('AMX6001');
    }
  });

  it('does not expose absolute output destinations in CLI diagnostics', async () => {
    const directory = await createDirectory();
    const entry = await write(directory, 'entry.amx', '```amx\nexport let value: Number = 4\nexport let other: Number = 5\n```\n');
    const output = `${directory}/out.json`;
    const result = await runCli('run', entry, '--output', `value=${output}`, '--output', `other=${output}`);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('AMX6001');
    expect(result.stderr).not.toContain(resolve(output));
  });

  it('round-trips supported JSON and CSV records through declared Sprint 016 inputs', async () => {
    const directory = await createDirectory();
    const source = await write(directory, 'source.amx', [
      '```amx',
      'export type Row {',
      '  title: String',
      '  created: DateTime',
      '  note: String?',
      '}',
      'let rows: Row[] = [Row { title: "North, station", created: "2026-09-29T12:00:00Z", note: null }, Row { title: "", created: "2026-09-30T12:00:00Z", note: "" }]',
      'export let rowsJson: Row[] = rows',
      'export let rowsCsv: Row[] = rows',
      '```',
      ''
    ].join('\n'));
    const jsonPath = `${directory}/rows.json`;
    const csvPath = `${directory}/rows.csv`;
    const exported = await runCli('run', source, '--output', `rowsJson=${jsonPath}`, '--output', `rowsCsv=${csvPath}`);
    expect(exported.exitCode).toBe(0);
    const input = await write(directory, 'input.amx', [
      '```amx',
      'import { Row } from "./source.amx"',
      'input fromJson: Row[]',
      'input fromCsv: Row[]',
      '```',
      ''
    ].join('\n'));
    const loaded = await loadEntryModule(input, {
      inputMappings: [`fromJson=${jsonPath}`, `fromCsv=${csvPath}`]
    });
    const values = loaded.env.toObject() as { fromJson: unknown[]; fromCsv: unknown[] };
    expect(values.fromJson).toEqual(values.fromCsv);
    expect(values.fromCsv).toEqual([
      { title: 'North, station', created: '2026-09-29T12:00:00Z', note: null },
      { title: '', created: '2026-09-30T12:00:00Z', note: '' }
    ]);
  });

  it('performs evaluation and render path-conflict checks before creating destinations', async () => {
    const directory = await createDirectory();
    const failing = await write(directory, 'failing.amx', '```amx\nlet values: Number[] = []\nlet result: Number = min(values)\nexport let selected: Number = 1\n```\n');
    const untouched = `${directory}/untouched.json`;
    const failedRun = await runCli('run', failing, '--output', `selected=${untouched}`);
    expect(failedRun.exitCode).not.toBe(0);
    expect(await Bun.file(untouched).exists()).toBe(false);
    const invalidSelection = await runCli('run', failing, '--output', `missing=${untouched}`);
    expect(invalidSelection.exitCode).not.toBe(0);
    expect(invalidSelection.stderr).toContain('AMX6001');
    expect(await Bun.file(untouched).exists()).toBe(false);

    const renderInput = await write(directory, 'render.amx', 'Hello\n\n```amx\nexport let selected: Number = 1\n```\n');
    const conflict = `${directory}/same.json`;
    const conflictRun = await runCli('render', renderInput, '--out', conflict, '--output', `selected=${conflict}`);
    expect(conflictRun.exitCode).not.toBe(0);
    expect(conflictRun.stderr).toContain('AMX6001');
    expect(await Bun.file(conflict).exists()).toBe(false);
  });

  it('writes neither HTML nor named outputs when show-time chart validation fails', async () => {
    const directory = await createDirectory();
    const entry = await write(directory, 'chart.amx', [
      '```amx',
      'let values: Number[] = [1, 2]',
      'let labels: String[] = ["one"]',
      'export let selected: Number = 1',
      'chart amounts = bar(values) {',
      '  title: "Amounts"',
      '  description: "By label"',
      '  series "Value"',
      '  labels: labels',
      '}',
      'show amounts',
      '```',
      ''
    ].join('\n'));
    const htmlPath = `${directory}/chart.html`;
    const jsonPath = `${directory}/selected.json`;
    const result = await runCli('render', entry, '--out', htmlPath, '--output', `selected=${jsonPath}`);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('AMX4003');
    expect(result.stderr).toContain('Chart \'amounts\' has 2 values but 1 labels');
    expect(await Bun.file(htmlPath).exists()).toBe(false);
    expect(await Bun.file(jsonPath).exists()).toBe(false);
  });

  it('checks invalid views before reading mapped inputs or writing named outputs', async () => {
    const directory = await createDirectory();
    const entry = await write(directory, 'invalid-view.amx', [
      '```amx',
      'input values: Number',
      'export let selected: Number = 1',
      'chart amounts = bar(values) {',
      '  title: "Amounts"',
      '  description: "Invalid source shape"',
      '  series "Value"',
      '}',
      'show amounts',
      '```',
      ''
    ].join('\n'));
    const jsonPath = `${directory}/selected.json`;
    const result = await runCli('run', entry, '--input', `values=${directory}/missing.json`, '--output', `selected=${jsonPath}`);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('AMX3002');
    expect(result.stderr).not.toContain('AMX4001');
    expect(await Bun.file(jsonPath).exists()).toBe(false);
  });

  it('writes render HTML before exports and reports a later filesystem failure as AMX6002', async () => {
    const directory = await createDirectory();
    const input = await write(directory, 'render.amx', 'Rendered\n\n```amx\nexport let first: Number = 1\nexport let second: Number = 2\n```\n');
    const htmlPath = `${directory}/rendered.html`;
    const firstPath = `${directory}/first.json`;
    const directoryPath = `${directory}/second.json`;
    await mkdir(directoryPath);
    const result = await runCli(
      'render', input, '--out', htmlPath,
      '--output', `first=${firstPath}`, '--output', `second=${directoryPath}`
    );
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('AMX6002');
    expect(await Bun.file(htmlPath).text()).toContain('Rendered');
    expect(await Bun.file(firstPath).text()).toBe('1\n');
    expect(await Bun.file(directoryPath).exists()).toBe(false);
  });
});
