import { describe, expect, it } from "bun:test";
import { cp, mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import * as path from "path";
import { parseDocument, parseDocumentText } from "../src/parser/parseDocument";
import { evaluateDocument } from "../src/runtime/evaluateDocument";
import { analyzeEditorModules } from "../src/editor/moduleAnalysis";
import { renderHtml } from "../src/renderer/renderHtml";
import { formatAmxDocument } from "../src/formatter/formatAmx";

async function runCli(...arguments_: string[]) {
  const command = Bun.spawnSync([process.execPath, "run", "src/cli.ts", ...arguments_]);
  return {
    exitCode: command.exitCode,
    stdout: new TextDecoder().decode(command.stdout),
    stderr: new TextDecoder().decode(command.stderr)
  };
}

async function renderToTemporaryHtml(inputPath: string, ...arguments_: string[]): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), "openamx-example-render-"));
  try {
    const outputPath = path.join(directory, "rendered.html");
    const result = await runCli("render", inputPath, "--out", outputPath, ...arguments_);
    if (result.exitCode !== 0) {
      throw new Error(`Render failed (${result.exitCode}):\n${result.stderr}\n${result.stdout}`);
    }
    return await Bun.file(outputPath).text();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
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

describe("V0.12 language documentation and examples", () => {
  it("links the additive specification and runs both feature examples", async () => {
    const readme = await Bun.file("README.md").text();
    const specification = await Bun.file("docs/language-spec-v0.12.md").text();
    expect(readme).toContain("[V0.12 language specification](docs/language-spec-v0.12.md)");
    expect(readme).toContain("[records and enums](examples/04_Typed_Records_Enums_and_Modules.amx)");
    expect(readme).toContain("[expressions and decisions](examples/02_Expressions_and_Decisions.amx)");
    expect(readme).toContain("[V0.9 language specification](docs/language-spec-v0.9.md)");
    expect(specification).toContain("AMX3011");
    expect(specification).toContain("AMX3021");

    const recordsPath = "tests/fixtures/examples/v0.12-records-and-enums.amx";
    const records = evaluateDocument(await parseDocument(recordsPath), recordsPath);
    expect(records.currentStatus).toBe(2);
    expect(records.asset).toMatchObject({ id: "A-1", name: "Pump", status: 2 });

    const ifPath = "tests/fixtures/examples/v0.12-braced-if.amx";
    const conditional = evaluateDocument(await parseDocument(ifPath), ifPath);
    expect(conditional.description).toBe("high");
    expect(conditional.adjustedPriority).toBe(8);
  });
});

describe("V0.13 diagram documentation and examples", () => {
  it("links the approved specification and indexes the desktop and VS Code help", async () => {
    const readme = await Bun.file("README.md").text();
    const extensionHelp = await Bun.file("vscode-extension/README.md").text();
    const specification = await Bun.file("docs/language-spec-v0.13.md").text();
    const normalizedSpecification = specification.replace(/\s+/g, " ");
    const help = JSON.parse(await Bun.file("desktop-app/src/mainview/components/help-content.json").text()) as {
      topics: Array<{ id: string; terms: string; steps: string[] }>;
    };
    const topic = help.topics.find(item => item.id === "language-v0.13");

    expect(readme).toContain("[V0.13 diagram specification](docs/language-spec-v0.13.md)");
    expect(readme).toContain("[formula-driven diagrams](examples/08_Formula_Driven_Diagrams.amx)");
    expect(readme).toContain("[battery-resistor reference](examples/14_Battery_Resistor_Circuit.amx)");
    expect(extensionHelp).toContain("../docs/language-spec-v0.13.md");
    expect(extensionHelp).toContain("../examples/08_Formula_Driven_Diagrams.amx");
    expect(extensionHelp).toContain("../examples/14_Battery_Resistor_Circuit.amx");
    expect(specification).toContain("AMXD015");
    expect(specification).toContain("16.7 ms p95 frame-work limit");
    expect(normalizedSpecification).toContain("no tagged structure tree or `/Alt`");
    expect(normalizedSpecification).toContain("do **not** establish tagged PDF, PDF/UA, or");
    expect(topic?.terms).toContain("battery resistor");
    expect(topic?.steps.join(" ")).toContain("screen-reader support are not established");
    expect(new Set(help.topics.map(item => item.id)).size).toBe(help.topics.length);
  });

  it("analyzes and renders both runnable examples with their approved meanings", async () => {
    const examples = [
      { path: "tests/fixtures/examples/v0.13-crank-slider.amx", title: "Crank-slider mechanism" },
      { path: "tests/fixtures/examples/v0.13-battery-resistor.amx", title: "Battery-resistor DC circuit" }
    ];
    for (const example of examples) {
      const source = await Bun.file(example.path).text();
      const analysis = analyzeEditorModules(source, example.path);
      const values = evaluateDocument(analysis.document, example.path);
      const html = renderHtml(analysis.document, example.path);
      const cliRun = await runCli("run", example.path);

      expect(cliRun.exitCode).toBe(0);
      expect(cliRun.stderr).toBe("");
      expect(html).toContain(`id="openamx-diagram-0-title">${example.title}`);
      expect(html).toContain('data-openamx-diagram="openamx-diagram-0"');
      expect(html).toContain('type="range" data-diagram-scrubber');
      expect(html).toContain("data-diagram-model data-encoding=\"gzip-base64\"");
      expect(Buffer.byteLength(html, "utf8")).toBeLessThan(1024 * 1024);
      if (example.path.endsWith("crank-slider.amx")) {
        expect(values.crankRadius).toBe(34);
        expect(values.rodLength).toBe(105);
        expect(source).not.toMatch(/\b(?:sin|cos)\s*\(/);
      } else {
        expect(values.current).toBe(0.6);
        expect(source).toContain("arrow: \"end\"");
        expect(source).toContain("x1: indicatorX(t)");
      }
    }
  });
});

describe("V0.14 language documentation and examples", () => {
  it("links the additive specification and indexes searchable desktop Help", async () => {
    const readme = await Bun.file("README.md").text();
    const extensionHelp = await Bun.file("vscode-extension/README.md").text();
    const specification = await Bun.file("docs/language-spec-v0.14.md").text();
    const normalizedSpecification = specification.replace(/\s+/g, " ");
    const help = JSON.parse(await Bun.file("desktop-app/src/mainview/components/help-content.json").text()) as {
      topics: Array<{ id: string; terms: string; steps: string[] }>;
    };
    const topic = help.topics.find(item => item.id === "language-v0.14");

    expect(readme).toContain("[V0.14 language specification](docs/language-spec-v0.14.md)");
    expect(readme).toContain("[runtime type checks](examples/09_Runtime_Type_Checks.amx)");
    expect(readme).toContain("[math and Measurements](examples/10_Mathematics_and_Measurement_Operations.amx)");
    expect(readme).toContain("[text and formatting](examples/11_Text_and_Numeric_Formatting.amx)");
    expect(extensionHelp).toContain("../docs/language-spec-v0.14.md");
    expect(extensionHelp).toContain("../examples/09_Runtime_Type_Checks.amx");
    expect(extensionHelp).toContain("../examples/10_Mathematics_and_Measurement_Operations.amx");
    expect(extensionHelp).toContain("../examples/11_Text_and_Numeric_Formatting.amx");
    expect(normalizedSpecification).toContain("does not claim integrated milestone acceptance, release, publication, or platform certification");
    expect(normalizedSpecification).toContain("U+0009–U+000D, U+0020, U+0085, U+00A0, U+1680, U+2000–U+200A, U+2028–U+2029, U+202F, U+205F, and U+3000. U+FEFF and U+180E are excluded.");
    expect(specification).toContain('DecimalPart ::= "." "0"{1,6}');
    expect(specification).toContain("The only supported locales are");
    expect(specification).toContain("Decimal ties round half away from zero");
    expect(specification).toContain("negative zero formats as positive zero");
    expect(specification).toContain("appends one ASCII space");
    expect(specification).toContain("AMXSL004");
    expect(specification).toContain("AMXSL005");
    for (const functionName of [
      "sin", "cos", "tan", "asin", "acos", "atan", "sinh", "cosh", "tanh", "asinh", "acosh", "atanh", "ln", "log",
      "exp", "len", "trim", "left", "right", "format"
    ]) expect(specification).toContain(functionName);
    expect(specification).toContain("Unicode 15.1");
    expect(specification).toContain("U+202F narrow no-break space");
    expect(specification).toContain("AMXSL006");
    expect(topic?.terms).toContain("Unicode code points");
    expect(topic?.steps.join(" ")).toContain("A valid mismatch returns false");
    expect(topic?.steps.join(" ")).toContain("Integrated acceptance, release, and publication remain separate");
    expect(new Set(help.topics.map(item => item.id)).size).toBe(help.topics.length);
  });

  it("analyzes and executes the three standalone examples with stable results and idempotent formatting", async () => {
    const examples = [
      {
        path: "tests/fixtures/examples/v0.14-runtime-type-checks.amx",
        expected: {
          structuralMatch: true,
          primitiveMatch: true,
          primitiveMismatch: false,
          absentOptionalField: true,
          nullableNull: true,
          nonNullableNull: false,
          allNumbers: true,
          emptyMatchesOtherElementType: true,
          enumMember: true,
          sharedMemberMatchesBoth: true,
          lengthMatch: true,
          dimensionMismatch: false,
          dimensionlessMatch: true,
          numberIsNotMeasurement: false
        }
      },
      {
        path: "tests/fixtures/examples/v0.14-math-and-measurements.amx",
        expected: {
          sine: 1,
          cosine: 1,
          tangent: 0,
          arcSine: Math.PI / 2,
          arcCosine: 0,
          arcTangent: Math.PI / 4,
          naturalLog: 1,
          commonLog: 2,
          exponential: Math.E,
          dimensionlessSine: Math.sin(2),
          totalDistance: { value: 2, unit: { text: "meter" } },
          shortestDistance: { value: 1, unit: { text: "meter" } },
          absoluteDistance: { value: 2, unit: { text: "meter" } },
          roundedDistance: { value: 1.24, unit: { text: "meter" } },
          squareRootDistance: { value: 3, unit: { text: "meter" } },
          squaredDistance: { value: 4, unit: { text: "meter ^ 2" } }
        }
      },
      {
        path: "tests/fixtures/examples/v0.14-text-and-formatting.amx",
        expected: {
          codePointLength: 3,
          listLength: 3,
          combiningSequenceLength: 2,
          trimmed: "AMX",
          firstTwo: "A🙂",
          lastTwo: "🙂B",
          defaultLeft: "A",
          emptyRight: "",
          groupedUS: "1,234.50",
          groupedGerman: "1.234,50",
          groupedFrench: "1 234,50",
          percentage: "12.5%",
          currency: "-$1,234.50",
          displayedDistance: "1.25 meter",
          displayedCentimeters: "125.00 centimeter"
        }
      }
    ];

    for (const example of examples) {
      const source = await Bun.file(example.path).text();
      const analysis = analyzeEditorModules(source, example.path);
      const values = evaluateDocument(analysis.document, example.path);
      const cliRun = await runCli("run", example.path);
      const formatted = formatAmxDocument(source);

      expect(cliRun.exitCode).toBe(0);
      expect(cliRun.stderr).toBe("");
      expect(values).toMatchObject(example.expected);
      expect(JSON.parse(cliRun.stdout)).toMatchObject(example.expected);
      expect(formatAmxDocument(formatted)).toBe(formatted);
    }
  });

  it("keeps malformed formatter diagnostics at the accepted original source range", () => {
    const source = [
      "---",
      "fixture: FORMAT-MALFORMED-01",
      "---",
      "```amx",
      'let result = format(1, "0..00")',
      "```",
      ""
    ].join("\n");
    try {
      evaluateDocument(parseDocumentText(source), "tests/fixtures/examples/v0.14-format-diagnostic.amx");
      throw new Error("Expected an invalid numeric pattern diagnostic");
    } catch (error) {
      expect(error).toMatchObject({
        code: "AMXSL004",
        message: "Incorrect formatting pattern",
        line: 5,
        column: 24
      });
      const diagnostic = error as { line: number; column: number };
      expect(source.split("\n")[diagnostic.line - 1]?.slice(diagnostic.column - 1, diagnostic.column + 6)).toBe('"0..00"');
    }
  });
});

describe("V0.2 canonical examples", () => {
  it("renders the basic example without executing its ordinary fence", async () => {
    const path = "tests/fixtures/examples/hello-world.amx";
    const document = await parseDocument(path);
    expect(evaluateDocument(document, path)).toEqual({
      assetName: "Transformer TX-001",
      riskScore: 15
    });
    const html = await renderToTemporaryHtml(path);
    expect(html).toContain("<title>Hello OpenAMX</title>");
    expect(html).toContain("The calculated risk score is 15.");
    expect(html).toContain('class="language-amx"');
    expect(html).toContain("let ignored = 999");
  });

  it("evaluates transformer failure modes and renders the final adjusted score", async () => {
    const path = "tests/fixtures/examples/transformer-strategy.amx";
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
    const html = await renderToTemporaryHtml(path);
    expect(html).toContain("<title>Power Transformer Failure Mode Analysis</title>");
    expect(html).toContain('<h2 id="screening-result">Screening result</h2>');
    expect(html).toContain("<li><p>Cooling: severity 8</p></li>");
    expect(html).toContain("TX-001 &lt;north&gt;");
    expect(html).toContain("the mode scores are 24, 18, 27 and the adjusted<br>aggregate is 60");
    expect(html).toContain("The remaining score is 60");
    expect(html).toContain('class="language-amx"');
    expect(html).toContain("let assetName = &quot;TX-001 &lt;north&gt;&quot;");
    expect(html).toContain("  case 69 =&gt; ");
    expect(html).not.toContain('<north>');
  });

  it("evaluates fleet risk and leaves ordinary code and bare declarations inert", async () => {
    const path = "tests/fixtures/examples/asset-fleet-risk-analysis.amx";
    const document = await parseDocument(path);
    expect(evaluateDocument(document, path)).toEqual({
      fleetName: "North & South fleet",
      exposures: [1, 2, 3],
      riskPoints: [5, 10, 15],
      fleetScore: 35,
      decision: "Schedule review"
    });
    const html = await renderToTemporaryHtml(path);
    expect(html).toContain("<title>Asset Fleet Risk Analysis</title>");
    expect(html).toContain('<h2 id="portfolio-decision">Portfolio decision</h2>');
    expect(html).toContain("<strong>Schedule review</strong>");
    expect(html).toContain("The final fleet score is 35 across 1, 2, 3 exposure levels.");
    expect(html).toContain("<pre><code class=\"language-amx\">fleetScore += 5");
    expect(html).toContain("  default =&gt; ");
    expect(html).toContain("let ignored = 1000");
    expect(html).toContain("let narrativeOnly = 999");
    expect(html).not.toContain("1000 exposure levels");
  });

  it("accepts the typed asset analysis through production CLI paths", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "openamx-sprint019-example-"));
    try {
      const assetPath = path.join(directory, "asset.json");
      const screeningsPath = path.join(directory, "screenings.csv");
      const reviewedAtPath = path.join(directory, "reviewed-at.json");
      await Bun.write(assetPath, await Bun.file("tests/fixtures/examples/data/asset.json").text());
      await Bun.write(screeningsPath, await Bun.file("tests/fixtures/examples/data/screenings.csv").text());
      await Bun.write(reviewedAtPath, await Bun.file("tests/fixtures/examples/data/reviewed-at.json").text());

      const summaryPath = path.join(directory, "summary.json");
      const rowsPath = path.join(directory, "rows.csv");
      const run = await runCli(
        "run", "tests/fixtures/examples/typed-asset-analysis.amx",
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
        "render", "tests/fixtures/examples/typed-asset-analysis.amx", "--out", htmlPath,
        "--input", `asset=${assetPath}`,
        "--input", `screenings=${screeningsPath}`,
        "--input", `reviewedAt=${reviewedAtPath}`
      );
      expect(render.exitCode).toBe(0);
      const html = await Bun.file(htmlPath).text();
      expect(html).toContain('<h1 id="typed-asset-screening-analysis">Typed Asset Screening Analysis</h1>');
      expect(html).toContain("Asset <strong>North Pump 01</strong>");
      expect(html).toContain("The illustrative screening total is 38.");
      expect(html).toContain("&quot;./libraries/asset-management.amx&quot;");

      const invalidCsv = "tests/fixtures/examples/fixtures/invalid/screenings.csv";
      const aggregatePath = path.join(directory, "aggregate.json");
      const aggregate = await runCli(
        "run", "tests/fixtures/examples/typed-asset-analysis.amx",
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
        "run", "tests/fixtures/examples/typed-asset-analysis.amx",
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
        "run", "tests/fixtures/examples/typed-asset-analysis.amx",
        "--input", `asset=tests/fixtures/examples/fixtures/invalid/asset.json`,
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
        "run", "tests/fixtures/examples/kitchen-sink.amx",
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
      const render = await runCli("render", "tests/fixtures/examples/kitchen-sink.amx", "--out", htmlPath);
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
      const exported = await runCli("export", "docx", "tests/fixtures/examples/kitchen-sink.amx", "--out", docxPath);
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
        "run", "tests/fixtures/examples/v09-measurement-report.amx",
        "--input", "trips=tests/fixtures/examples/data/measurement-trips.json",
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
        "render", "tests/fixtures/examples/v09-measurement-report.amx", "--out", htmlPath,
        "--input", "trips=tests/fixtures/examples/data/measurement-trips.json"
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
      await mkdir(path.join(directory, "libraries"));
      await mkdir(path.join(directory, "data"));
      await cp("tests/fixtures/examples/libraries/asset-management.amx", path.join(directory, "libraries", "asset-management.amx"));
      await cp("tests/fixtures/examples/libraries/screening.amx", path.join(directory, "libraries", "screening.amx"));
      await cp("tests/fixtures/examples/data/asset.json", path.join(directory, "data", "asset.json"));
      await cp("tests/fixtures/examples/data/screenings.csv", path.join(directory, "data", "screenings.csv"));
      await Bun.write(path.join(directory, "v05-asset-screening.amx"), await Bun.file("tests/fixtures/examples/v05-asset-screening.amx").text());
      await writeFile(path.join(directory, ".openamx", "project.json"), await Bun.file("tests/fixtures/examples/v05-project.json").text());

      const entry = path.join(directory, "v05-asset-screening.amx");
      const asset = path.join(directory, "data", "asset.json");
      const screenings = path.join(directory, "data", "screenings.csv");
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