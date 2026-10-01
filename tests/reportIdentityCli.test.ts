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
  it('preserves existing PDF and DOCX outputs when project identity is invalid', async () => {
    const root = `/tmp/openamx-report-identity-cli-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    directories.push(root);
    await mkdir(join(root, '.openamx'), { recursive: true });
    await writeFile(join(root, '.openamx', 'project.json'), JSON.stringify({ version: 1, inputs: {}, report: { logo: 'data:image/png;base64,AAAA', logoAlt: 'Invalid logo' } }));
    const input = join(root, 'report.amx');
    await writeFile(input, '# Report\n\nNarrative\n');
    for (const [format, extension] of [['pdf', 'pdf'], ['docx', 'docx']] as const) {
      const output = join(root, `report.${extension}`);
      await writeFile(output, `preserve-${format}`);
      const result = runCli('export', format, input, '--out', output, '--project-root', root);
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('AMX6001');
      expect(await Bun.file(output).text()).toBe(`preserve-${format}`);
    }
  });
});