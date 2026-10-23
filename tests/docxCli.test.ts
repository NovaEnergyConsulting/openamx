import { afterEach, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, readdir, rm } from 'node:fs/promises';
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
    await Bun.write(input, `# Report

Narrative before

\`\`\`amx
diagram cliFigure {
  title: "CLI diagram"
  description: "Static offline figure"
  width: 100
  height: 50
  time t from 0 to 1 duration 1
  circle marker {
    cx: 20 + 40 * t
    cy: 25
    r: 8
    stroke: "#263238"
    fill: "#146C94"
    lineWidth: 1
  }
}
\`\`\`

Narrative after
`);
    const result = await runCli('export', 'docx', input, '--out', output);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Exported DOCX');
    expect((await Bun.file(output).arrayBuffer()).byteLength).toBeGreaterThan(1000);
    const archive = await JSZip.loadAsync(await Bun.file(output).arrayBuffer());
    const documentXml = await archive.file('word/document.xml')?.async('string') ?? '';
    const imageNames = Object.keys(archive.files).filter(name => name.startsWith('word/media/') && name.endsWith('.png'));
    expect(documentXml.indexOf('Narrative before')).toBeLessThan(documentXml.indexOf('CLI diagram'));
    expect(documentXml.indexOf('CLI diagram')).toBeLessThan(documentXml.indexOf('Static offline figure'));
    expect(documentXml.indexOf('Static offline figure')).toBeLessThan(documentXml.indexOf('Narrative after'));
    expect(documentXml).toContain('title="CLI diagram"');
    expect(documentXml).toContain('descr="Static offline figure"');
    expect(imageNames).toHaveLength(1);
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
    const documentXml = await archive.file('word/document.xml')?.async('string');
    const relationships = await archive.file('word/_rels/document.xml.rels')?.async('string');
    expect(documentXml).toContain('w:anchor="page"');
    expect(relationships).toContain('Target="../source/companions/asset%20one.txt?download=1"');
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

  it('preserves an existing destination and removes temporaries when lower-bound diagram geometry fails', async () => {
    const directory = await fixtureDirectory();
    const input = join(directory, 'invalid-diagram.amx');
    const output = join(directory, 'report.docx');
    await Bun.write(input, `\`\`\`amx
diagram invalidFrame {
  title: "Invalid frame"
  description: "Must fail explicitly"
  width: 100
  height: 50
  time t from 0 to 1 duration 1
  circle marker {
    cx: 1 / 0
    cy: 25
    r: 8
    stroke: "#263238"
    lineWidth: 1
  }
}
\`\`\`
`);
    await Bun.write(output, 'preserve existing DOCX bytes');
    const result = await runCli('export', 'docx', input, '--out', output);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('AMXD008');
    expect(await Bun.file(output).text()).toBe('preserve existing DOCX bytes');
    expect((await readdir(directory)).sort()).toEqual(['invalid-diagram.amx', 'report.docx']);
  });
});