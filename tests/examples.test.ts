import { describe, expect, it } from "bun:test";
import { cp, mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import * as path from "path";
import { parseDocument } from "../src/parser/parseDocument";
import { evaluateDocument } from "../src/runtime/evaluateDocument";
import { renderHtml } from "../src/renderer/renderHtml";

async function runCli(...arguments_: string[]) {
  const command = Bun.spawnSync([process.execPath, "run", "src/cli.ts", ...arguments_]);
  return {
    exitCode: command.exitCode,
    stdout: new TextDecoder().decode(command.stdout),
    stderr: new TextDecoder().decode(command.stderr)
  };
}

function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

describe("V0.9 user documentation", () => {
  it("links the README and specification and keeps migration/help contracts searchable", async () => {
    const readme = await Bun.file("README.md").text();
    const specification = await Bun.file("docs/language-spec-v0.9.md").text();
    const migration = await Bun.file("docs/migrating-to-v0.9.md").text();
    const help = JSON.parse(await Bun.file("desktop-app/src/mainview/components/help-content.json").text()) as {
      topics: Array<{ id: string; terms: string; steps: string[] }>;
    };
    const v09Topic = help.topics.find(topic => topic.id === "language-v0.9");

    expect(readme).toContain("[V0.9 language specification](docs/language-spec-v0.9.md)");
    expect(readme).toContain("[V0.9 migration guide](docs/migrating-to-v0.9.md)");
    expect(specification).toContain("[project README](../README.md)");
    expect(specification).toContain("[V0.9 migration guide](migrating-to-v0.9.md)");
    expect([...migration.matchAll(/^## /gm)]).toHaveLength(3);
    expect(migration).toContain("Record constructors use `=`");
    expect(migration).toContain("String escapes are decoded");
    expect(migration).toContain("Invalid programs are checked");
    expect(migration).toContain("Colons remain required");
    expect(migration).toContain("does not automatically migrate projects");
    expect(new Set(help.topics.map(topic => topic.id)).size).toBe(help.topics.length);
    expect(v09Topic?.terms).toContain("measurement conversion");
    expect(v09Topic?.steps.join(" ")).toContain("List indexes are 1-based");
  });
});

describe("V0.2 canonical examples", () => {
  it("renders the basic example without executing its ordinary fence", async () => {
    const path = "examples/hello-world.amx";
    const document = await parseDocument(path);
    expect(evaluateDocument(document, path)).toEqual({
      assetName: "Transformer TX-001",
      riskScore: 15
    });
    const html = renderHtml(document, path);
    expect(html).toContain("<title>Hello OpenAMX</title>");
    expect(html).toContain("The calculated risk score is 15.");
    expect(html).toContain('class="language-amx"');
    expect(html).toContain("let ignored = 999");
    expect(normalizeLineEndings(await Bun.file("examples/hello-world.html").text())).toBe(html);
  });

  it("evaluates transformer failure modes and renders the final adjusted score", async () => {
    const path = "examples/transformer-strategy.amx";
    const document = await parseDocument(path);
    expect(evaluateDocument(document, path)).toEqual({
      assetName: "TX-001 <north>",
      severity: [8, 6, 9],
      occurrence: 3,
      modeScores: [24, 18, 27],
      totalScore: 60,
      action: "Inspect cooling system",
      remainingScore: 60
    });
    const html = renderHtml(document, path);
    expect(html).toContain("<title>Power Transformer Failure Mode Analysis</title>");
    expect(html).toContain("<h2>Screening result</h2>");
    expect(html).toContain("<li>Cooling: severity 8</li>");
    expect(html).toContain("TX-001 &lt;north&gt;");
    expect(html).toContain("the mode scores are 24, 18, 27 and the adjusted\naggregate is 60");
    expect(html).toContain("The remaining score is 60");
    expect(html).toContain('class="language-amx"');
    expect(html).toContain("let assetName = &quot;TX-001 &lt;north&gt;&quot;");
    expect(html).toContain("  case 69 =&gt; ");
    expect(html).not.toContain('<north>');
    expect(normalizeLineEndings(await Bun.file("examples/transformer-strategy.html").text())).toBe(html);
  });

  it("evaluates fleet risk and leaves ordinary code and bare declarations inert", async () => {
    const path = "examples/asset-fleet-risk-analysis.amx";
    const document = await parseDocument(path);
    expect(evaluateDocument(document, path)).toEqual({
      fleetName: "North & South fleet",
      exposures: [1, 2, 3],
      riskPoints: [5, 10, 15],
      fleetScore: 35,
      decision: "Schedule review"
    });
    const html = renderHtml(document, path);
    expect(html).toContain("<title>Asset Fleet Risk Analysis</title>");
    expect(html).toContain("<h2>Portfolio decision</h2>");
    expect(html).toContain("<strong>Schedule review</strong>");
    expect(html).toContain("The final fleet score is 35 across 1, 2, 3 exposure levels.");
    expect(html).toContain("<pre><code class=\"language-amx\">fleetScore += 5");
    expect(html).toContain("  default =&gt; ");
    expect(html).toContain("let ignored = 1000");
    expect(html).toContain("let narrativeOnly = 999");
    expect(html).not.toContain("1000 exposure levels");
    expect(normalizeLineEndings(await Bun.file("examples/asset-fleet-risk-analysis.html").text())).toBe(html);
  });

  it("accepts the typed asset analysis through production CLI paths", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "openamx-sprint019-example-"));
    try {
      const assetPath = path.join(directory, "asset.json");
      const screeningsPath = path.join(directory, "screenings.csv");
      const reviewedAtPath = path.join(directory, "reviewed-at.json");
      await Bun.write(assetPath, await Bun.file("examples/typed-asset.json").text());
      await Bun.write(screeningsPath, await Bun.file("examples/typed-screenings.csv").text());
      await Bun.write(reviewedAtPath, await Bun.file("examples/typed-reviewed-at.json").text());

      const summaryPath = path.join(directory, "summary.json");
      const rowsPath = path.join(directory, "rows.csv");
      const run = await runCli(
        "run", "examples/typed-asset-analysis.amx",
        "--input", `asset=${assetPath}`,
        "--input", `screenings=${screeningsPath}`,
        "--input", `reviewedAt=${reviewedAtPath}`,
        "--output", `summary=${summaryPath}`,
        "--output", `resultRows=${rowsPath}`
      );
      expect(run.exitCode).toBe(0);
      expect(JSON.parse(run.stdout)).toMatchObject({
        asset: { name: "North Pump 01", failureModes: [{ id: "FM-001" }, { id: "FM-002" }] },
        scores: [16, 18, 4],
        totalScore: 38,
        summary: { assetName: "North Pump 01", reviewedAt: "2026-09-29T12:00:00Z", totalScore: 38 }
      });
      expect(await Bun.file(summaryPath).text()).toBe([
        "{",
        "  \"assetName\": \"North Pump 01\",",
        "  \"reviewedAt\": \"2026-09-29T12:00:00Z\",",
        "  \"totalScore\": 38",
        "}",
        ""
      ].join("\n"));
      expect(await Bun.file(rowsPath).text()).toBe([
        "assetId,score,note",
        "A-001,16,Bearing inspection",
        "A-001,18,Seal inspection",
        "A-001,4,",
        ""
      ].join("\n"));

      const htmlPath = path.join(directory, "typed.html");
      const render = await runCli(
        "render", "examples/typed-asset-analysis.amx", "--out", htmlPath,
        "--input", `asset=${assetPath}`,
        "--input", `screenings=${screeningsPath}`,
        "--input", `reviewedAt=${reviewedAtPath}`
      );
      expect(render.exitCode).toBe(0);
      const html = await Bun.file(htmlPath).text();
      expect(html).toBe(normalizeLineEndings(await Bun.file("examples/typed-asset-analysis.html").text()));
      expect(html).toContain("Asset <strong>North Pump 01</strong>");
      expect(html).toContain("The illustrative screening total is 38.");
      expect(html).toContain("&quot;./libraries/asset-management.amx&quot;");

      const invalidCsv = "examples/typed-invalid-screenings.csv";
      const aggregatePath = path.join(directory, "aggregate.json");
      const aggregate = await runCli(
        "run", "examples/typed-asset-analysis.amx",
        "--input", `asset=${assetPath}`,
        "--input", `screenings=${invalidCsv}`,
        "--input", `reviewedAt=${reviewedAtPath}`,
        "--validation", "aggregate",
        "--output", `summary=${aggregatePath}`
      );
      expect(aggregate.exitCode).not.toBe(0);
      expect(aggregate.stderr).toContain("AMX4003");
      expect(aggregate.stderr.indexOf("record[1].severity")).toBeLessThan(aggregate.stderr.indexOf("record[2].occurrence"));
      expect(aggregate.stderr).toContain("Expected: Number");
      expect(await Bun.file(aggregatePath).exists()).toBe(false);

      const failFastPath = path.join(directory, "fail-fast.json");
      const failFast = await runCli(
        "run", "examples/typed-asset-analysis.amx",
        "--input", `asset=${assetPath}`,
        "--input", `screenings=${invalidCsv}`,
        "--input", `reviewedAt=${reviewedAtPath}`,
        "--validation", "fail-fast",
        "--output", `summary=${failFastPath}`
      );
      expect(failFast.exitCode).not.toBe(0);
      expect(failFast.stderr.match(/AMX4003/g)).toHaveLength(1);
      expect(failFast.stderr).toContain("record[1].severity");
      expect(failFast.stderr).not.toContain("record[2].occurrence");
      expect(await Bun.file(failFastPath).exists()).toBe(false);

      const invalidJsonPath = path.join(directory, "invalid-json-output.json");
      const invalidJson = await runCli(
        "run", "examples/typed-asset-analysis.amx",
        "--input", `asset=examples/typed-invalid-asset.json`,
        "--input", `screenings=${screeningsPath}`,
        "--input", `reviewedAt=${reviewedAtPath}`,
        "--output", `summary=${invalidJsonPath}`
      );
      expect(invalidJson.exitCode).not.toBe(0);
      expect(invalidJson.stderr).toContain("AMX4003");
      expect(invalidJson.stderr).toContain("/id");
      expect(await Bun.file(invalidJsonPath).exists()).toBe(false);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe("Kitchen-sink example", () => {
  it("runs without inputs and renders its syntax, snapshots, and every chart shape", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "openamx-kitchen-sink-"));
    try {
      const summaryPath = path.join(directory, "summary.json");
      const samplesPath = path.join(directory, "samples.csv");
      const run = await runCli(
        "run", "examples/kitchen-sink.amx",
        "--output", `summary=${summaryPath}`,
        "--output", `samples=${samplesPath}`
      );
      expect(run.stderr).toBe("");
      expect(run.exitCode).toBe(0);
      const context = JSON.parse(run.stdout);
      expect(context).toMatchObject({
        longFenceValue: 4,
        rightAssociativePower: 512,
        unaryBeforePower: 4,
        mutableTotal: 7,
        loopTotal: 6,
        item: 99,
        doubled: [4, 8, 12],
        returnCount: 3,
        emptyLoop: [],
        stringMatch: 10,
        safeRecordId: "A-01",
        equalWireTime: true,
        differentWireTime: true,
        exportedScalar: 25,
        summary: { assetId: "A-01", decision: "Review", total: 930 },
        snapshotRows: [{ label: "Updated", score: 20 }]
      });
      expect(context.samples).toHaveLength(30);
      for (const name of ["narrativeOnly", "ordinaryFenceOnly", "wrongCaseFenceOnly", "extraInfoFenceOnly", "tildeFenceOnly", "nestedFenceOnly", "badNumber"]) {
        expect(context).not.toHaveProperty(name);
      }
      expect(JSON.parse(await Bun.file(summaryPath).text())).toEqual(context.summary);
      const csv = await Bun.file(samplesPath).text();
      expect(csv.split("\n")).toHaveLength(32);
      expect(csv).toContain("label,step,measuredAt,score,benchmark,available,note,groupName\n");
      expect(csv).toContain('Odd,1,2026-10-03T07:30:00Z,2,1.5,false,"",First half');
      expect(csv).toContain('Odd,5,2026-10-03T07:30:00Z,10,,false,"",First half');

      const htmlPath = path.join(directory, "kitchen-sink.html");
      const render = await runCli("render", "examples/kitchen-sink.amx", "--out", htmlPath);
      expect(render.stderr).toBe("");
      expect(render.exitCode).toBe(0);
      const html = await Bun.file(htmlPath).text();
      expect(html).toContain("<title>AMX Kitchen Sink</title>");
      expect(html).toContain("OpenAMX Examples");
      expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
      expect(html).not.toContain("<script>alert(1)</script>");
      expect(html).toMatch(/final state,\s*<strong>Updated<\/strong>/);
      for (const title of [
        "Thirty synthetic observations", "One view, two snapshots",
        "Record bar chart", "Record column chart", "Numeric x line chart",
        "DateTime x line chart", "Grouped scatter chart", "Ungrouped scatter chart",
        "Scalar bar with labels", "Scalar column with positional labels", "Scalar line with labels",
        "Empty table", "Empty chart", "No rows", "No data"
      ]) {
        expect(html).toContain(title);
      }
      expect(html).toContain("<td>Original</td>");
      expect(html).toContain("<td>Updated</td>");
      const docxPath = path.join(directory, "kitchen-sink.docx");
      const exported = await runCli("export", "docx", "examples/kitchen-sink.amx", "--out", docxPath);
      expect(exported.stderr).toBe("");
      expect(exported.exitCode).toBe(0);
      expect((await Bun.file(docxPath).bytes()).byteLength).toBeGreaterThan(1000);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe("V0.9 measurement report example", () => {
  it("runs imported JSON measurements through exports and unit-aware HTML reports", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "openamx-v09-measurements-"));
    try {
      const jsonOutput = path.join(directory, "summaries.json");
      const run = await runCli(
        "run", "examples/v09-measurement-report.amx",
        "--input", "trips=examples/v09-trips.json",
        "--output", `exportedSummaries=${jsonOutput}`
      );
      expect(run.exitCode).toBe(0);
      expect(run.stderr).toBe("");
      expect(JSON.parse(await Bun.file(jsonOutput).text())).toEqual([
        { route: "North loop", distance: { value: 1.5, unit: "kilometer" }, averageSpeed: { value: 3, unit: "kilometer_per_hour" } },
        { route: "South loop", distance: { value: 0.5, unit: "kilometer" }, averageSpeed: { value: 1.5, unit: "kilometer_per_hour" } }
      ]);

      const htmlPath = path.join(directory, "measurements.html");
      const render = await runCli(
        "render", "examples/v09-measurement-report.amx", "--out", htmlPath,
        "--input", "trips=examples/v09-trips.json"
      );
      expect(render.exitCode).toBe(0);
      expect(render.stderr).toBe("");
      const html = await Bun.file(htmlPath).text();
      expect(html).toContain("First average speed: 3 kilometer_per_hour.");
      expect(html).toContain("<th scope=\"col\">Distance</th>");
      expect(html).toContain("<th scope=\"col\">Average speed</th>");
      expect(html).toContain("<td>1.5 kilometer</td><td>3 kilometer_per_hour</td>");
      expect(html).toContain("<td>0.5 kilometer</td><td>1.5 kilometer_per_hour</td>");
      expect(html).toContain("North loop");
      expect(html).toContain("South loop");
      expect(html).toContain("Distance by route");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe("V0.5 branded example", () => {
  it("runs typed inputs, contained imports, views, and all report formats", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "openamx-v05-example-"));
    try {
      await mkdir(path.join(directory, ".openamx"), { recursive: true });
      await cp("examples/libraries", path.join(directory, "libraries"), { recursive: true });
      await Bun.write(path.join(directory, "v05-asset-screening.amx"), await Bun.file("examples/v05-asset-screening.amx").text());
      await writeFile(path.join(directory, ".openamx", "project.json"), await Bun.file("examples/v05-project.json").text());

      const entry = path.join(directory, "v05-asset-screening.amx");
      const asset = path.resolve("examples/typed-asset.json");
      const screenings = path.resolve("examples/typed-screenings.csv");
      const mappings = ["--input", `asset=${asset}`, "--input", `screenings=${screenings}`];
      const run = await runCli("run", entry, ...mappings);
      expect(run.exitCode).toBe(0);
      expect(run.stdout).toContain('"scores": [\n    16,\n    18,\n    4\n  ]');
      expect(run.stdout).toContain('"totalScore": 38');

      const htmlPath = path.join(directory, "screening.html");
      const render = await runCli("render", entry, "--out", htmlPath, "--project-root", directory, ...mappings);
      expect(render.exitCode).toBe(0);
      const html = await Bun.file(htmlPath).text();
      expect(html).toContain("OpenAMX Example");
      expect(html).toContain("Illustrative sample");
      expect(html).toContain("illustrative screening total of 38");
      expect(html).toContain("Screening register");
      expect(html).toContain("Score by screening");
      expect(html.indexOf("The values below preserve")).toBeLessThan(html.indexOf("Screening register"));
      expect(html.indexOf("Screening register")).toBeLessThan(html.indexOf("Score by screening"));

      for (const format of ["pdf", "docx"] as const) {
        const output = path.join(directory, `screening.${format}`);
        const exported = await runCli("export", format, entry, "--out", output, "--project-root", directory, ...mappings);
        expect(exported.exitCode).toBe(0);
        expect((await Bun.file(output).bytes()).byteLength).toBeGreaterThan(1000);
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});