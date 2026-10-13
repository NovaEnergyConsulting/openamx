import { afterEach, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const directories: string[] = [];

async function fixtureDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'openamx-pdf-'));
  directories.push(directory);
  return directory;
}

async function textByPage(bytes: Uint8Array): Promise<string[]> {
  const pdf = await getDocument({ data: bytes, useSystemFonts: true, disableFontFace: true }).promise;
  const pages: string[] = [];
  for (let index = 1; index <= pdf.numPages; index++) {
    const page = await pdf.getPage(index);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => 'str' in item ? item.str : '').join(' '));
  }
  return pages;
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
    const result = await runCli('export', 'pdf', input, '--out', output);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Exported PDF');
    expect((await Bun.file(output).arrayBuffer()).byteLength).toBeGreaterThan(1000);
    const pages = await textByPage(new Uint8Array(await Bun.file(output).arrayBuffer()));
    const text = pages.join(' ');
    expect(text.indexOf('Narrative before')).toBeLessThan(text.indexOf('CLI diagram'));
    expect(text.indexOf('CLI diagram')).toBeLessThan(text.indexOf('Static offline figure'));
    expect(text.indexOf('Static offline figure')).toBeLessThan(text.indexOf('Narrative after'));
  });

  it('materializes local PDF links relative to the validated final output directory', async () => {
    const directory = await fixtureDirectory();
    const sourceDirectory = join(directory, 'source');
    const outputDirectory = join(directory, 'output');
    const companionDirectory = join(sourceDirectory, 'companions');
    await Promise.all([
      mkdir(sourceDirectory, { recursive: true }),
      mkdir(outputDirectory, { recursive: true }),
      mkdir(companionDirectory, { recursive: true })
    ]);
    await Promise.all([
      writeFile(join(sourceDirectory, 'report.amx'), '# Report\n\n[Companion](./companions/asset%20one.txt)\n'),
      writeFile(join(companionDirectory, 'asset one.txt'), 'portable companion')
    ]);
    const input = join(sourceDirectory, 'report.amx');
    const output = join(outputDirectory, 'report.pdf');
    const result = await runCli('export', 'pdf', input, '--out', output);
    expect(result.exitCode).toBe(0);
    const pdf = await getDocument({
      data: new Uint8Array(await Bun.file(output).arrayBuffer()),
      useSystemFonts: true,
      disableFontFace: true
    }).promise;
    const annotations: { url?: string; unsafeUrl?: string }[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      annotations.push(...await (await pdf.getPage(pageNumber)).getAnnotations());
    }
    const urls = annotations
      .flatMap(annotation => [annotation.url, annotation.unsafeUrl])
      .filter((url): url is string => typeof url === 'string');
    expect(urls).toContain('../source/companions/asset%20one.txt');
    expect(urls.every(url => !url.includes(directory) && !url.startsWith('file:') && !url.includes('.tmp'))).toBe(true);
    expect(await Bun.file(join(outputDirectory, 'companions', 'asset one.txt')).exists()).toBe(false);
    expect(await Bun.file(join(companionDirectory, 'asset one.txt')).exists()).toBe(true);
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

  it('preserves an existing destination and removes temporaries when lower-bound diagram geometry fails', async () => {
    const directory = await fixtureDirectory();
    const input = join(directory, 'invalid-diagram.amx');
    const output = join(directory, 'report.pdf');
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
    await Bun.write(output, 'preserve existing PDF bytes');
    const result = await runCli('export', 'pdf', input, '--out', output);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('AMXD008');
    expect(await Bun.file(output).text()).toBe('preserve existing PDF bytes');
    expect((await readdir(directory)).sort()).toEqual(['invalid-diagram.amx', 'report.pdf']);
  });
});