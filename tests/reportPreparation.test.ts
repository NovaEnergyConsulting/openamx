import { afterEach, describe, expect, it } from 'bun:test';
import { randomFillSync } from 'node:crypto';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import sharp from 'sharp';
import { parseDocumentText } from '../src/parser/parseDocument';
import { Environment } from '../src/runtime/environment';
import { prepareReport } from '../src/renderer/reportPreparation';
import { fitNarrativeImage, type NarrativeBlock, type NarrativeInline } from '../src/renderer/narrativeModel';

const directories: string[] = [];
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');

async function fixtureRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'openamx-report-preparation-'));
  directories.push(root);
  await mkdir(join(root, '.openamx'), { recursive: true });
  return root;
}

function narrativeBlocks(items: readonly { readonly type: string; readonly markdown?: readonly NarrativeBlock[] }[]): readonly NarrativeBlock[] {
  const item = items.find(candidate => candidate.type === 'narrative');
  if (!item?.markdown) throw new Error('Expected a prepared narrative item');
  return item.markdown;
}

function collectInlines(blocks: readonly NarrativeBlock[]): NarrativeInline[] {
  const inlines: NarrativeInline[] = [];
  for (const block of blocks) {
    if (block.type === 'heading' || block.type === 'paragraph') inlines.push(...collectNestedInlines(block.children));
    else if (block.type === 'blockquote') inlines.push(...collectInlines(block.blocks));
    else if (block.type === 'list') {
      for (const item of block.items) inlines.push(...collectInlines(item.blocks));
    } else if (block.type === 'table') {
      for (const cell of block.header) inlines.push(...collectNestedInlines(cell));
      for (const row of block.rows) for (const cell of row) inlines.push(...collectNestedInlines(cell));
    }
  }
  return inlines;
}

function collectNestedInlines(inlines: readonly NarrativeInline[]): NarrativeInline[] {
  return inlines.flatMap(inline => {
    if (inline.type === 'link' || inline.type === 'strong' || inline.type === 'emphasis' || inline.type === 'delete') {
      return [inline, ...collectNestedInlines(inline.children)];
    }
    return [inline];
  });
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

  it('normalizes Markdown, headings, links, line breaks, code, HTML, and interpolation once', async () => {
    const root = await fixtureRoot();
    await mkdir(join(root, 'docs'));
    await mkdir(join(root, 'assets'));
    await writeFile(join(root, 'assets', 'notes one.pdf'), 'PDF fixture');
    const source = `# Section {{ heading }}

# Section {{ heading }}

# Section Alpha 2

## Level 2
### Level 3
#### Level 4
##### Level 5
###### Level 6

[second](#section-alpha-2) [missing](#missing) [external](https://example.test/path) [local](../assets/notes%20one.pdf)

Soft
break with two spaces\x20\x20
hard\\
break

**bold *nested* text**

\`  inline\t code  \`

\`\`\`text
\t  {{ markup }}\x20\x20
second\t line
<!-- page-break -->
\`\`\`

| Head | Value |
| --- | --- |
| **A** | B |

> Quoted

- Parent
  1. Nested

---

<!-- page-break -->

<!-- raw {{ markup }} -->

<script>{{ markup }}</script>

<div>
Raw HTML line one
Raw HTML line two
</div>
`;
    const environment = new Environment();
    environment.set('heading', 'Alpha');
    environment.set('markup', '**Injected <script>run()</script>**');
    const file = join(root, 'docs', 'report.amx');
    const lf = await prepareReport(parseDocumentText(source), environment, { file, projectRoot: root });
    const crlf = await prepareReport(parseDocumentText(source.replace(/\n/g, '\r\n')), environment, { file, projectRoot: root });
    const blocks = narrativeBlocks(lf.items);

    expect(narrativeBlocks(crlf.items)).toEqual(blocks);
    expect(blocks.filter(block => block.type === 'heading').map(block => block.type === 'heading' ? [block.depth, block.id] : []))
      .toEqual([
        [1, 'section-alpha'], [1, 'section-alpha-2'], [1, 'section-alpha-2-2'],
        [2, 'level-2'], [3, 'level-3'], [4, 'level-4'], [5, 'level-5'], [6, 'level-6']
      ]);
    expect(blocks.map(block => block.type)).toEqual([
      'heading', 'heading', 'heading', 'heading', 'heading', 'heading', 'heading', 'heading',
      'paragraph', 'paragraph', 'paragraph', 'paragraph', 'code', 'table', 'blockquote',
      'list', 'horizontalRule', 'pageBreak', 'paragraph', 'paragraph', 'paragraph'
    ]);
    expect(blocks.filter(block => block.type === 'code').map(block => block.type === 'code' ? block.text : ''))
      .toEqual(['\t  {{ markup }}  \nsecond\t line\n<!-- page-break -->\n']);
    expect(blocks.filter(block => block.type === 'pageBreak')).toHaveLength(1);
    const nestedList = blocks.find(block => block.type === 'list');
    expect(nestedList?.type === 'list' && nestedList.items[0]?.blocks[0]?.type).toBe('paragraph');
    expect(nestedList?.type === 'list' && nestedList.items[0]?.blocks[1]?.type).toBe('list');

    const inlines = collectInlines(blocks);
    expect(inlines.filter(inline => inline.type === 'lineBreak')).toHaveLength(6);
    expect(inlines.some(inline => inline.type === 'strong')).toBe(true);
    expect(inlines.some(inline => inline.type === 'emphasis')).toBe(true);
    expect(inlines.some(inline => inline.type === 'inlineCode' && inline.text === '  inline\t code  ')).toBe(true);
    expect(inlines.some(inline => inline.type === 'text' && inline.text.includes('<script>**Injected'))).toBe(true);
    expect(inlines.some(inline => inline.type === 'strong' && inline.children.some(child => child.type === 'text' && child.text.includes('Injected')))).toBe(false);

    const links = inlines.filter((inline): inline is Extract<NarrativeInline, { type: 'link' }> => inline.type === 'link');
    expect(links.map(link => link.link.type)).toEqual(['internal', 'external', 'local']);
    expect(links[0]?.link).toEqual({ type: 'internal', targetId: 'section-alpha-2' });
    expect(links[1]?.link).toMatchObject({ type: 'external', href: 'https://example.test/path' });
    expect(links[2]?.link).toMatchObject({ type: 'local', path: '../assets/notes one.pdf', sourceBase: 'document-directory' });
    expect(inlines.some(inline => inline.type === 'text' && inline.text === 'missing')).toBe(true);
    expect(JSON.stringify(lf)).not.toContain(root);
    expect(lf.items.find(item => item.type === 'narrative')?.text).toContain('**Injected <script>run()</script>**');
    expect(Object.isFrozen(blocks)).toBe(true);
    expect(Object.isFrozen(blocks[0])).toBe(true);
  });

  it('sanitizes contained PNG/JPEG narrative assets and fits them without upscaling', async () => {
    const root = await fixtureRoot();
    await mkdir(join(root, 'docs'));
    await mkdir(join(root, 'assets'));
    const jpeg = await sharp({ create: { width: 80, height: 40, channels: 3, background: '#336699' } })
      .withMetadata({ orientation: 6 })
      .jpeg().toBuffer();
    await writeFile(join(root, 'assets', 'figure.png'), png);
    await writeFile(join(root, 'assets', 'photo.jpeg'), jpeg);
    const doc = parseDocumentText('![A small diagram](../assets/figure.png) ![A wide photo](../assets/photo.jpeg)');
    const report = await prepareReport(doc, new Environment(), { file: join(root, 'docs', 'report.amx'), projectRoot: root });
    const images = collectInlines(narrativeBlocks(report.items)).filter(
      (inline): inline is Extract<NarrativeInline, { type: 'image' }> => inline.type === 'image'
    );

    expect(images).toHaveLength(2);
    expect(images[0]?.image).toMatchObject({ format: 'png', width: 1, height: 1, alt: 'A small diagram' });
    expect(images[0]?.image.dataUri).toStartWith('data:image/png;base64,');
    expect(images[0]?.image.outputBytes).toBeLessThanOrEqual(4 * 1024 * 1024);
    expect(images[1]?.image).toMatchObject({ format: 'jpeg', width: 40, height: 80, alt: 'A wide photo' });
    expect(images[1]?.image.dataUri).toStartWith('data:image/jpeg;base64,');
    expect(images[1]?.image.outputBytes).toBeLessThanOrEqual(4 * 1024 * 1024);
    const jpegMetadata = await sharp(Buffer.from(images[1]?.image.dataUri.split(',')[1] ?? '', 'base64')).metadata();
    expect(jpegMetadata.orientation).toBeUndefined();
    expect(jpegMetadata.exif).toBeUndefined();
    expect(fitNarrativeImage({ width: 80, height: 40 }, { maxWidth: 800, maxHeight: 400 })).toEqual({ width: 80, height: 40 });
    expect(fitNarrativeImage({ width: 2400, height: 1200 }, { maxWidth: 600, maxHeight: 600 })).toEqual({ width: 600, height: 300 });
    expect(fitNarrativeImage({ width: 1200, height: 2400 }, { maxWidth: 600, maxHeight: 600 })).toEqual({ width: 300, height: 600 });
  });

  it('rejects unsafe, missing, deceptive, unsupported, and over-limit narrative images', async () => {
    const root = await fixtureRoot();
    await mkdir(join(root, 'docs'));
    await mkdir(join(root, 'assets'));
    const jpeg = await sharp({ create: { width: 1, height: 1, channels: 3, background: '#336699' } }).jpeg().toBuffer();
    await writeFile(join(root, 'assets', 'deceptive.png'), jpeg);
    await writeFile(join(root, 'assets', 'invalid.png'), 'not an image');
    await writeFile(join(root, 'assets', 'oversized.png'), Buffer.alloc(4 * 1024 * 1024 + 1));
    const noisyPixels = randomFillSync(Buffer.alloc(2000 * 2000 * 3));
    const outputOversizedPng = await sharp(noisyPixels, { raw: { width: 2000, height: 2000, channels: 3 } })
      .png({ palette: true, colours: 256, compressionLevel: 9 })
      .toBuffer();
    expect(outputOversizedPng.byteLength).toBeLessThanOrEqual(4 * 1024 * 1024);
    await writeFile(join(root, 'assets', 'output-oversized.png'), outputOversizedPng);
    await writeFile(join(root, 'assets', 'too-many-pixels.png'), await sharp({
      create: { width: 2001, height: 2000, channels: 3, background: '#fff' }
    }).png().toBuffer());
    await symlink(join(root, 'assets', 'deceptive.png'), join(root, 'docs', 'linked.png'), 'file');

    const sourceFile = join(root, 'docs', 'report.amx');
    const invalidImages = [
      '![](../assets/deceptive.png)',
      '![Deceptive](../assets/deceptive.png)',
      '![Invalid](../assets/invalid.png)',
      '![Missing](../assets/missing.png)',
      '![Linked](linked.png)',
      '![Too large](../assets/oversized.png)',
      '![Too many pixels](../assets/too-many-pixels.png)',
      '![Traversal](%2e%2e%2f%2e%2e%2foutside.png)',
      '![Remote](https://example.test/remote.png)',
      '![SVG](../assets/vector.svg)',
      '![Data](data:image/png;base64,AAAA)'
    ];
    for (const source of invalidImages) {
      await expect(prepareReport(parseDocumentText(source), new Environment(), { file: sourceFile, projectRoot: root }))
        .rejects.toMatchObject({ code: 'AMX6001' });
    }
    await expect(prepareReport(
      parseDocumentText('![Sanitized output too large](../assets/output-oversized.png)'),
      new Environment(),
      { file: sourceFile, projectRoot: root }
    )).rejects.toMatchObject({ code: 'AMX6002' });
  });

  it('enforces the selected local-link target allowlist and safe source-relative resolution', async () => {
    const root = await fixtureRoot();
    await mkdir(join(root, 'docs'));
    await mkdir(join(root, 'assets'));
    await writeFile(join(root, 'assets', 'guide.json'), '{}');
    await writeFile(join(root, 'assets', 'run.exe'), 'not executable');
    const file = join(root, 'docs', 'report.amx');
    const report = await prepareReport(parseDocumentText('[data](../assets/guide.json)'), new Environment(), { file, projectRoot: root });
    const links = collectInlines(narrativeBlocks(report.items)).filter(
      (inline): inline is Extract<NarrativeInline, { type: 'link' }> => inline.type === 'link'
    );
    expect(links[0]?.link).toMatchObject({ type: 'local', path: '../assets/guide.json', sourceBase: 'document-directory' });
    expect(JSON.stringify(report)).not.toContain(root);

    const rejected = await prepareReport(parseDocumentText([
      '[executable](../assets/run.exe)',
      '[script](../assets/run.html)',
      '[traversal](%2e%2e%2f%2e%2e%2foutside.pdf)',
      '[missing](../assets/missing.pdf)',
      '[unsupported](mailto:user@example.test)'
    ].join('\n')), new Environment(), { file, projectRoot: root });
    const rejectedItem = rejected.items.find(item => item.type === 'narrative');
    expect(rejectedItem?.type === 'narrative' ? rejectedItem.diagnostics : []).toEqual([
      { type: 'rejectedLink', reason: 'invalid-local-target' },
      { type: 'rejectedLink', reason: 'invalid-local-target' },
      { type: 'rejectedLink', reason: 'invalid-local-target' },
      { type: 'rejectedLink', reason: 'invalid-local-target' },
      { type: 'rejectedLink', reason: 'unsupported-scheme' }
    ]);
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