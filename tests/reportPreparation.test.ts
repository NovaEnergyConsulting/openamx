import { afterEach, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseDocumentText } from '../src/parser/parseDocument';
import { Environment } from '../src/runtime/environment';
import { prepareReport } from '../src/renderer/reportPreparation';

const directories: string[] = [];
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');

async function fixtureRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'openamx-report-preparation-'));
  directories.push(root);
  await mkdir(join(root, '.openamx'), { recursive: true });
  return root;
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map(directory => rm(directory, { recursive: true, force: true })));
});

describe('shared report preparation', () => {
  it('resolves identity once, sanitizes a contained logo, and preserves source/view order', async () => {
    const root = await fixtureRoot();
    await writeFile(join(root, 'logo.png'), png);
    await writeFile(join(root, '.openamx', 'project.json'), JSON.stringify({
      version: 1,
      inputs: {},
      report: { organization: 'Project identity', logo: 'logo.png', logoAlt: 'Project logo', sourceVisible: true, accent: '#FFFFFF' }
    }));
    const doc = parseDocumentText(`---
title: Prepared report
report:
  organization: "Frontmatter identity"
  author: "A. Analyst"
  sourceVisible: false
---

Narrative {{ value }}

\`\`\`amx
let value = 7
\`\`\``);
    const environment = new Environment();
    environment.set('value', 7);
    const prepared = await prepareReport(doc, environment, { file: join(root, 'report.amx'), projectRoot: root });
    expect(prepared.title).toBe('Prepared report');
    expect(prepared.identity.organization).toBe('Frontmatter identity');
    expect(prepared.identity.sourceVisible).toBe(false);
    expect(prepared.identity.accent).toBe('#146C94');
    expect(prepared.identity.logo?.dataUri).toStartWith('data:image/png;base64,');
    expect(prepared.items).toHaveLength(1);
    expect(prepared.items[0]).toMatchObject({ type: 'narrative' });
    expect(prepared.items[0]?.type === 'narrative' && prepared.items[0].text.trim()).toBe('Narrative 7');
    expect(Object.isFrozen(prepared.items)).toBe(true);
  });

  it('rejects raw, traversal, and symlink logo paths before serialization', async () => {
    const root = await fixtureRoot();
    await writeFile(join(root, 'logo.png'), png);
    await symlink(join(root, 'logo.png'), join(root, 'linked.png'));
    for (const logo of ['data:image/png;base64,AAAA', '../logo.png', 'linked.png']) {
      await writeFile(join(root, '.openamx', 'project.json'), JSON.stringify({ version: 1, inputs: {}, report: { logo, logoAlt: 'Logo' } }));
      await expect(prepareReport(parseDocumentText('# Report'), new Environment(), { projectRoot: root })).rejects.toMatchObject({ code: 'AMX6001' });
    }
  });

  it('rejects logo bytes whose decoded format does not match the declared extension', async () => {
    const root = await fixtureRoot();
    await writeFile(join(root, 'logo.jpg'), png);
    await writeFile(join(root, '.openamx', 'project.json'), JSON.stringify({
      version: 1,
      inputs: {},
      report: { logo: 'logo.jpg', logoAlt: 'Logo' }
    }));
    await expect(prepareReport(parseDocumentText('# Report'), new Environment(), { projectRoot: root }))
      .rejects.toMatchObject({ code: 'AMX6001' });
  });

  it('rejects missing, malformed, and oversized logo assets', async () => {
    const root = await fixtureRoot();
    await writeFile(join(root, 'malformed.png'), Buffer.from('not an image'));
    await writeFile(join(root, 'oversized.png'), Buffer.alloc(256 * 1024 + 1));
    for (const logo of ['missing.png', 'malformed.png', 'oversized.png']) {
      await writeFile(join(root, '.openamx', 'project.json'), JSON.stringify({
        version: 1,
        inputs: {},
        report: { logo, logoAlt: 'Logo' }
      }));
      await expect(prepareReport(parseDocumentText('# Report'), new Environment(), { projectRoot: root }))
        .rejects.toMatchObject({ code: 'AMX6001' });
    }
  });

  it('rejects invalid report fields and does not let frontmatter mask project errors', async () => {
    const root = await fixtureRoot();
    const invalidFrontmatter = [
      '---\nreport:\n  sourceVisible: "false"\n---\n# Report',
      '---\nreport:\n  unknownField: "value"\n---\n# Report'
    ];
    for (const text of invalidFrontmatter) {
      await expect(prepareReport(parseDocumentText(text), new Environment(), { projectRoot: root }))
        .rejects.toMatchObject({ code: 'AMX6001' });
    }
    await writeFile(join(root, '.openamx', 'project.json'), JSON.stringify({
      version: 1,
      inputs: {},
      report: { invalidProjectField: 'must fail' }
    }));
    const masked = parseDocumentText('---\nreport:\n  organization: "Override"\n---\n# Report');
    await expect(prepareReport(masked, new Environment(), { projectRoot: root }))
      .rejects.toMatchObject({ code: 'AMX6001' });
  });
});