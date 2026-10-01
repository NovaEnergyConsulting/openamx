import { afterEach, describe, expect, it } from 'bun:test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const directories: string[] = [];

function runCli(...arguments_: string[]) {
  const result = Bun.spawnSync(['bun', 'run', 'src/cli.ts', ...arguments_], { cwd: '/home/cgamez/Programming/experiments/openamx' });
  return { exitCode: result.exitCode, stderr: new TextDecoder().decode(result.stderr) };
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map(directory => rm(directory, { recursive: true, force: true })));
});

describe('report identity CLI safety', () => {
  it('applies project defaults and frontmatter overrides through the production HTML path', async () => {
    const root = `/tmp/openamx-report-identity-cli-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    directories.push(root);
    await mkdir(join(root, '.openamx'), { recursive: true });
    await writeFile(join(root, 'logo.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));
    await writeFile(join(root, '.openamx', 'project.json'), JSON.stringify({
      version: 1,
      inputs: {},
      report: { organization: 'Project organization', logo: 'logo.png', logoAlt: 'Project logo', footer: 'Project footer', sourceVisible: true }
    }));
    const input = join(root, 'report.amx');
    await writeFile(input, [
      '---',
      'title: CLI identity acceptance',
      'report:',
      '  organization: "Report organization"',
      '  author: "A. Analyst"',
      '  sourceVisible: false',
      '---',
      '',
      '# Assessment',
      '',
      'The final score is {{ score }}.',
      '',
      '```amx',
      'let score = 38',
      '```',
      ''
    ].join('\n'));
    const output = join(root, 'report.html');

    const result = runCli('render', input, '--out', output, '--project-root', root);
    expect(result.exitCode).toBe(0);
    const html = await Bun.file(output).text();
    expect(html).toContain('<title>CLI identity acceptance</title>');
    expect(html).toContain('Report organization');
    expect(html).not.toContain('Project organization');
    expect(html).toContain('A. Analyst');
    expect(html).toContain('Project footer');
    expect(html).toContain('The final score is 38.');
    expect(html).not.toContain('let score = 38');
    expect(html).toContain('data:image/png;base64,');
    expect(html).not.toContain('logo.png');
  });

  it('preserves existing PDF and DOCX outputs when project identity is invalid', async () => {
    const root = `/tmp/openamx-report-identity-cli-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    directories.push(root);
    await mkdir(join(root, '.openamx'), { recursive: true });
    await writeFile(join(root, '.openamx', 'project.json'), JSON.stringify({ version: 1, inputs: {}, report: { logo: 'data:image/png;base64,AAAA', logoAlt: 'Invalid logo' } }));
    const input = join(root, 'report.amx');
    await writeFile(input, '# Report\n\nNarrative\n');
    for (const [format, extension] of [['html', 'html'], ['pdf', 'pdf'], ['docx', 'docx']] as const) {
      const output = join(root, `report.${extension}`);
      await writeFile(output, `preserve-${format}`);
      const result = format === 'html'
        ? runCli('render', input, '--out', output, '--project-root', root)
        : runCli('export', format, input, '--out', output, '--project-root', root);
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('AMX6001');
      expect(result.stderr).not.toContain(root);
      expect(await Bun.file(output).text()).toBe(`preserve-${format}`);
    }
  });

  it('redacts external data paths from input diagnostics', async () => {
    const root = `/tmp/openamx-report-identity-cli-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    directories.push(root);
    const input = join(root, 'report.amx');
    const privateData = join(root, 'private', 'invalid.json');
    await mkdir(join(root, 'private'), { recursive: true });
    await writeFile(input, '```amx\ninput amount: Number\nlet result = amount\n```\n');
    await writeFile(privateData, Buffer.from([0xff]));

    const result = runCli('run', input, '--input', `amount=${privateData}`);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('AMX4002');
    expect(result.stderr).toContain('Input: amount');
    expect(result.stderr).not.toContain(root);
  });
});