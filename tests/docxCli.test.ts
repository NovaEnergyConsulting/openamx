import { afterEach, describe, expect, it } from 'bun:test';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const directories: string[] = [];

async function fixtureDirectory(): Promise<string> {
  const directory = `/tmp/openamx-docx-cli-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await mkdir(directory, { recursive: true });
  directories.push(directory);
  return directory;
}

async function runCli(...arguments_: string[]) {
  const command = Bun.spawnSync(['bun', 'run', 'src/cli.ts', ...arguments_], { cwd: '/home/cgamez/Programming/experiments/openamx' });
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

describe('export docx CLI', () => {
  it('writes an editable DOCX to an existing parent directory', async () => {
    const directory = await fixtureDirectory();
    const input = join(directory, 'report.amx');
    const output = join(directory, 'report.docx');
    await Bun.write(input, '# Report\n\nNarrative\n');
    const result = await runCli('export', 'docx', input, '--out', output);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Exported DOCX');
    expect((await Bun.file(output).arrayBuffer()).byteLength).toBeGreaterThan(1000);
  });

  it('rejects invalid destinations before writing', async () => {
    const directory = await fixtureDirectory();
    const input = join(directory, 'report.amx');
    await Bun.write(input, 'This input is not read for an invalid destination.\n');
    for (const destination of [join(directory, 'report.DOCX'), join(directory, 'missing', 'report.docx'), input]) {
      const result = await runCli('export', 'docx', input, '--out', destination);
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('AMX6001');
    }
  });

  it('preserves an existing destination when analysis fails', async () => {
    const directory = await fixtureDirectory();
    const input = join(directory, 'failing.amx');
    const output = join(directory, 'report.docx');
    await Bun.write(input, '```amx\nlet values: Number[] = []\nlet result: Number = min(values)\n```\n');
    await Bun.write(output, 'keep this DOCX placeholder');
    const result = await runCli('export', 'docx', input, '--out', output);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('AMX2004');
    expect(await Bun.file(output).text()).toBe('keep this DOCX placeholder');
  });
});