import { afterEach, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import JSZip from 'jszip';

const directories: string[] = [];

async function fixtureDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'openamx-docx-cli-'));
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

  it('serializes local links relative to the validated final DOCX directory', async () => {
    const directory = await fixtureDirectory();
    const sourceDirectory = join(directory, 'source');
    const outputDirectory = join(directory, 'output');
    await Promise.all([
      mkdir(join(sourceDirectory, 'companions'), { recursive: true }),
      mkdir(outputDirectory)
    ]);
    const input = join(sourceDirectory, 'report.amx');
    const output = join(outputDirectory, 'report.docx');
    await Bun.write(join(sourceDirectory, 'companions', 'asset one.txt'), 'portable companion');
    await Bun.write(input, '[Companion](./companions/asset%20one.txt?download=1#page)\n');

    const result = await runCli('export', 'docx', input, '--out', output);
    expect(result.exitCode).toBe(0);
    const archive = await JSZip.loadAsync(await Bun.file(output).arrayBuffer());
    const relationships = await archive.file('word/_rels/document.xml.rels')?.async('string');
    expect(relationships).toContain('Target="../source/companions/asset%20one.txt?download=1#page"');
    expect(relationships).not.toContain(directory);
    expect(relationships).not.toContain('.tmp');
    expect(await Bun.file(join(outputDirectory, 'companions', 'asset one.txt')).exists()).toBe(false);
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