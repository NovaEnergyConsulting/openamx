import { afterEach, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const directories: string[] = [];

async function fixtureDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'openamx-pdf-'));
  directories.push(directory);
  return directory;
}

async function runCli(...arguments_: string[]) {
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

describe('export pdf CLI', () => {
  it('writes a valid PDF to an existing parent directory', async () => {
    const directory = await fixtureDirectory();
    const input = join(directory, 'report.amx');
    const output = join(directory, 'report.pdf');
    await Bun.write(input, '# Report\n\nNarrative\n');
    const result = await runCli('export', 'pdf', input, '--out', output);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Exported PDF');
    expect((await Bun.file(output).arrayBuffer()).byteLength).toBeGreaterThan(1000);
  });

  it('rejects unsupported destinations before analysis and writing', async () => {
    const directory = await fixtureDirectory();
    const input = join(directory, 'report.amx');
    await Bun.write(input, 'This input is not read for an invalid destination.\n');
    for (const destination of [join(directory, 'report.PDF'), join(directory, 'missing', 'report.pdf'), input]) {
      const result = await runCli('export', 'pdf', input, '--out', destination);
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('AMX6001');
    }
    expect(await Bun.file(join(directory, 'report.PDF')).exists()).toBe(false);
  });

  it('preserves an existing destination when evaluation fails', async () => {
    const directory = await fixtureDirectory();
    const input = join(directory, 'failing.amx');
    const output = join(directory, 'report.pdf');
    await Bun.write(input, '```amx\nlet values: Number[] = []\nlet result: Number = min(values)\n```\n');
    await Bun.write(output, 'keep this PDF placeholder');
    const result = await runCli('export', 'pdf', input, '--out', output);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('AMX2004');
    expect(await Bun.file(output).text()).toBe('keep this PDF placeholder');
  });
});