import { afterEach, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const directories: string[] = [];

async function createDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'openamx-s124-cli-'));
  directories.push(directory);
  return directory;
}

async function write(directory: string, relativePath: string, contents: string): Promise<string> {
  const filePath = join(directory, relativePath);
  await mkdir(join(filePath, '..'), { recursive: true });
  await Bun.write(filePath, contents);
  return filePath;
}

function runCli(...arguments_: string[]) {
  const command = Bun.spawnSync([process.execPath, 'run', 'src/cli.ts', ...arguments_]);
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

describe('openamx transpile CLI', () => {
  it('documents the explicit output directory, import root, and overwrite options', () => {
    const result = runCli('transpile', '--help');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('--out-dir');
    expect(result.stdout).toContain('--import-root');
    expect(result.stdout).toContain('--overwrite');
    expect(runCli('--help').stdout).toContain('transpile');
  });

  it('writes a nested graph under the selected output root without executing generated code', async () => {
    const directory = await createDirectory();
    const source = join(directory, 'source files');
    const output = join(directory, 'output files');
    await write(source, 'main.amx', '```amx\nimport { value } from "./lib/values.amx"\nlet empty: Number[] = []\nlet invalidAtRuntime: Number = min(empty)\nexport let result: Number = value\n```\n');
    await write(source, 'lib/values.amx', '```amx\nexport let value: Number = 7\n```\n');

    const result = runCli('transpile', join(source, 'main.amx'), '--out-dir', output);
    if (result.exitCode !== 0) throw new Error(result.stderr);
    expect(result.stdout).toContain('Modules (2)');
    expect(result.stdout).toContain('main.ts');
    const firstOutput = await Bun.file(join(output, 'main.ts')).text();
    expect(firstOutput).toContain('from "./lib/values.ts"');
    expect(await Bun.file(join(output, 'lib/values.ts')).exists()).toBe(true);

    const repeated = runCli('transpile', join(source, 'main.amx'), '--out-dir', output, '--overwrite');
    expect(repeated.exitCode).toBe(0);
    expect(await Bun.file(join(output, 'main.ts')).text()).toBe(firstOutput);
  });

  it('mirrors paths and rewrites imports under an explicit import root', async () => {
    const directory = await createDirectory();
    const root = join(directory, 'project');
    const entry = await write(root, 'reports/main.amx', '```amx\nimport { value } from "../lib/value.amx"\nexport let result: Number = value\n```\n');
    await write(root, 'lib/value.amx', '```amx\nexport let value: Number = 5\n```\n');
    const output = join(directory, 'generated');
    const result = runCli('transpile', entry, '--import-root', root, '--out-dir', output);

    expect(result.exitCode).toBe(0);
    expect(await Bun.file(join(output, 'reports/main.ts')).text()).toContain('from "../lib/value.ts"');
    expect(await Bun.file(join(output, 'lib/value.ts')).exists()).toBe(true);
  });

  it('requires an explicit output directory and does not create one for invalid AMX', async () => {
    const directory = await createDirectory();
    const entry = await write(directory, 'main.amx', '```amx\nlet value: Number = "wrong"\n```\n');
    const noDestination = runCli('transpile', entry);
    expect(noDestination.exitCode).not.toBe(0);
    expect(noDestination.stderr).toContain('AMX6001');

    const output = join(directory, 'must-not-exist');
    const invalid = runCli('transpile', entry, '--out-dir', output);
    expect(invalid.exitCode).not.toBe(0);
    expect(invalid.stderr).toContain('AMX3002');
    expect(invalid.stdout).toBe('');
    expect(await Bun.file(output).exists()).toBe(false);
  });

  it('refuses existing targets by default and overwrites only with the explicit flag', async () => {
    const directory = await createDirectory();
    const source = join(directory, 'source');
    const entry = await write(source, 'main.amx', '```amx\nexport let value: Number = 3\n```\n');
    const output = join(directory, 'generated');
    await mkdir(output);
    await Bun.write(join(output, 'main.ts'), 'original');
    await Bun.write(join(output, 'unrelated.txt'), 'preserve');

    const refused = runCli('transpile', entry, '--out-dir', output);
    expect(refused.exitCode).not.toBe(0);
    expect(refused.stderr).toContain('AMX6001');
    expect(refused.stdout).toBe('');
    expect(await Bun.file(join(output, 'main.ts')).text()).toBe('original');

    const overwritten = runCli('transpile', entry, '--out-dir', output, '--overwrite');
    if (overwritten.exitCode !== 0) throw new Error(overwritten.stderr);
    expect(await Bun.file(join(output, 'main.ts')).text()).toContain('"value"');
    expect(await Bun.file(join(output, 'unrelated.txt')).text()).toBe('preserve');
  });

  it('reports malformed imports with source location and leaves the destination unchanged', async () => {
    const directory = await createDirectory();
    const entry = await write(directory, 'main.amx', '```amx\nimport { value } from "./missing.amx"\n```\n');
    const output = join(directory, 'existing-output');
    await mkdir(output);
    await Bun.write(join(output, 'keep.txt'), 'same');
    const result = runCli('transpile', entry, '--out-dir', output);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('AMX5001');
    expect(result.stdout).toBe('');
    expect(await Bun.file(join(output, 'keep.txt')).text()).toBe('same');
    expect(await Bun.file(join(output, 'main.ts')).exists()).toBe(false);
  });
});