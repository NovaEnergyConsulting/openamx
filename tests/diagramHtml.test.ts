import { describe, expect, it } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseDocumentText } from '../src/parser/parseDocument';
import { evaluateDocumentEnvironment } from '../src/runtime/evaluateDocument';
import { loadEntryModule } from '../src/runtime/moduleLoader';
import { prepareReport } from '../src/renderer/reportPreparation';
import { renderHtml, renderPreparedHtml } from '../src/renderer/renderHtml';
import { assertDiagramHtmlSize, MAX_INTERACTIVE_DIAGRAM_HTML_BYTES } from '../src/renderer/diagramHtml';

const source = `---
title: Interactive diagram fixture
---
# Before diagram

\`\`\`amx
diagram hostile {
  title: "Hostile </script><img src=x>"
  description: "A safe diagram description"
  width: 100
  height: 60
  time t from 0 to 1 duration 1
  line moving {
    x1: 0
    y1: 10
    x2: 20 + 40 * t
    y2: 10
    stroke: "#263238"
    lineWidth: 2
    arrow: "end"
  }
  text label {
    x: 4
    y: 20
    value: "</script><img src=x onerror=alert(1)>"
    fill: "#263238"
  }
}
\`\`\`

# After diagram
`;

describe('interactive diagram HTML', () => {
  it('enforces the one-MiB UTF-8 limit only for diagram-enabled HTML', () => {
    const withinLimit = 'é'.repeat(MAX_INTERACTIVE_DIAGRAM_HTML_BYTES / 2);
    expect(() => assertDiagramHtmlSize(withinLimit, true)).not.toThrow();
    expect(() => assertDiagramHtmlSize(`${withinLimit}x`, true))
      .toThrow(`Interactive diagram HTML exceeds the ${MAX_INTERACTIVE_DIAGRAM_HTML_BYTES}-byte limit`);
    expect(() => assertDiagramHtmlSize('x'.repeat(MAX_INTERACTIVE_DIAGRAM_HTML_BYTES + 1), false)).not.toThrow();
  });

  it('renders an ordered, offline, accessible figure with runtime separate from inert model data', async () => {
    const document = parseDocumentText(source);
    const environment = evaluateDocumentEnvironment(document, 'hostile.amx');
    const prepared = await prepareReport(document, environment, { file: 'hostile.amx' });
    const standalone = renderPreparedHtml(prepared, { mode: 'standalone' }) as string;
    const preview = renderPreparedHtml(prepared, { mode: 'preview' });

    expect(standalone.indexOf('<h1 id="before-diagram">Before diagram</h1>'))
      .toBeLessThan(standalone.indexOf('data-openamx-diagram="openamx-diagram-0"'));
    expect(standalone.indexOf('data-openamx-diagram="openamx-diagram-0"'))
      .toBeLessThan(standalone.indexOf('<h1 id="after-diagram">After diagram</h1>'));
    expect(standalone).toContain('role="img"');
    expect(standalone).toContain('aria-label="Play Hostile &lt;/script&gt;&lt;img src=x&gt;"');
    expect(standalone).toContain('type="range" data-diagram-scrubber min="0" max="1" step="any" value="0"');
    expect(standalone).toContain('aria-label="Loop Hostile &lt;/script&gt;&lt;img src=x&gt;"');
    expect(standalone).toContain('data-diagram-model data-encoding="gzip-base64">');
    expect(standalone).toContain("connect-src 'none'");
    expect(standalone).toContain("frame-src 'none'");
    expect(standalone).not.toContain('</script><img src=x onerror=alert(1)>');
    expect(standalone).not.toContain('src="https:');
    expect(Buffer.byteLength(standalone, 'utf8')).toBeLessThan(1024 * 1024);
    expect(preview.html).toContain('data-openamx-diagram="openamx-diagram-0"');
    expect(preview.html).toContain('openamx-diagram-frame');
    expect(preview.previewToken).toMatch(/^[a-f0-9]{64}$/);
    expect(renderHtml(document, 'hostile.amx', environment)).toContain('data-openamx-diagram="openamx-diagram-0"');
  });

  it('renders imported diagram emissions in deterministic dependency-before-entry order', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-diagram-html-import-'));
    try {
      const dependencyPath = join(directory, 'dependency.amx');
      const entryPath = join(directory, 'entry.amx');
      await writeFile(dependencyPath, `\`\`\`amx
export let seed: Number = 2
diagram imported {
  title: "Imported diagram"
  description: "Emitted by a dependency"
  width: 100
  height: 60
  time t from 0 to 1 duration 1
  circle importedPoint {
    cx: seed
    cy: 20
    r: 4
    stroke: "#263238"
    lineWidth: 1
  }
}
\`\`\`
`);
      await writeFile(entryPath, `# Entry report

\`\`\`amx
import { seed } from "./dependency.amx"
diagram entry {
  title: "Entry diagram"
  description: "Emitted by the report"
  width: 100
  height: 60
  time t from 0 to 1 duration 1
  circle entryPoint {
    cx: seed + t
    cy: 20
    r: 4
    stroke: "#263238"
    lineWidth: 1
  }
}
\`\`\`
`);
      const loaded = await loadEntryModule(entryPath);
      const prepared = await prepareReport(loaded.doc, loaded.env, { file: entryPath });
      const html = renderPreparedHtml(prepared, { mode: 'standalone' }) as string;
      expect(prepared.diagrams).toHaveLength(2);
      expect(html.indexOf('id="openamx-diagram-0-title">Imported diagram')).toBeLessThan(
        html.indexOf('id="openamx-diagram-1-title">Entry diagram')
      );
      expect(html.match(/data-openamx-diagram=/g)).toHaveLength(2);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('embeds ordered generated instances in the offline v2 playback payload', async () => {
    const source = `# Generated diagram

  \`\`\`amx
diagram generated {
  title: "Generated diagram"
  description: "Ordered generated playback"
  width: 100
  height: 60
  time t from 0 to 1 duration 1
  circle direct {
    cx: 5
    cy: 30
    r: 2
    stroke: "#263238"
    lineWidth: 1
  }
  for item in [1, 2] {
    circle point {
      cx: item * 10 + t
      cy: 30
      r: 3
      stroke: "#146C94"
      lineWidth: 1
    }
  }
}
\`\`\`\n`;
    const document = parseDocumentText(source);
    const environment = evaluateDocumentEnvironment(document, 'generated-html.amx');
    const prepared = await prepareReport(document, environment, { file: 'generated-html.amx' });
    const html = renderPreparedHtml(prepared, { mode: 'standalone' }) as string;
    const encoded = html.match(/data-diagram-model data-encoding="gzip-base64">([^<]+)</)?.[1];
    if (!encoded) throw new Error('Generated HTML has no serialized diagram model payload.');
    const payload = JSON.parse(gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8')) as {
      version: number;
      instances: Array<{ identity: number; bindings: Array<{ name: string }> }>;
    };

    expect(payload.version).toBe(2);
    expect(payload.instances.map(instance => instance.identity)).toEqual([0, 1, 2]);
    expect(payload.instances.map(instance => instance.bindings.map(binding => binding.name))).toEqual([
      [], ['item'], ['item']
    ]);
    expect(html).toContain('connect-src \'none\'');
    expect(html).toContain('aria-describedby="openamx-diagram-0-description"');
    expect(Buffer.byteLength(html, 'utf8')).toBeLessThan(MAX_INTERACTIVE_DIAGRAM_HTML_BYTES);
  });
});
