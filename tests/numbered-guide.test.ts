import { describe, expect, it } from "bun:test";
import { mkdtemp, realpath, rm } from "fs/promises";
import { tmpdir } from "os";
import * as path from "path";

const indexPath = "examples/00_Table_of_Contents.amx";
const lessonPaths = [
  "examples/01_First_Computable_Document.amx",
  "examples/02_Expressions_and_Decisions.amx",
  "examples/03_Collections_and_Functions.amx",
  "examples/04_Typed_Records_Enums_and_Modules.amx",
  "examples/05_Measurements_and_Units.amx",
  "examples/06_Mapped_Data_and_Validation.amx",
  "examples/07_Tables_Charts_and_Named_Outputs.amx"
];
const validInputs = [
  "--input", "asset=examples/data/asset.json",
  "--input", "screenings=examples/data/screenings.csv",
  "--input", "reviewedAt=examples/data/reviewed-at.json"
];

async function runCli(...arguments_: string[]) {
  const command = Bun.spawnSync([process.execPath, "run", "dist/cli.js", ...arguments_]);
  return {
    exitCode: command.exitCode,
    stdout: new TextDecoder().decode(command.stdout),
    stderr: new TextDecoder().decode(command.stderr)
  };
}

function parseLinks(document: string): string[] {
  return [...document.matchAll(/\[[^\]]+\]\(([^)]+\.amx)\)/g)].map(match => match[1]!);
}

function executableSource(document: string): string {
  return [...document.matchAll(/^```amx\r?\n([\s\S]*?)^```\s*$/gm)]
    .map(match => match[1]!)
    .join("\n");
}

function expectCliSuccess(result: Awaited<ReturnType<typeof runCli>>): unknown {
  if (result.exitCode !== 0) {
    throw new Error(`CLI failed (${result.exitCode}):\n${result.stderr}\n${result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

describe("V0.15 numbered guide", () => {
  it("keeps the index, navigation, link containment, and support closure aligned", async () => {
    const guideRoot = await realpath("examples");
    const index = await Bun.file(indexPath).text();
    expect(parseLinks(index)).toEqual(lessonPaths.map(lesson => `./${path.basename(lesson)}`));
    expect(index).toContain("later material");

    const expectedNavigation = [
      ["./00_Table_of_Contents.amx", "./02_Expressions_and_Decisions.amx"],
      ["./00_Table_of_Contents.amx", "./01_First_Computable_Document.amx", "./03_Collections_and_Functions.amx"],
      ["./00_Table_of_Contents.amx", "./02_Expressions_and_Decisions.amx", "./04_Typed_Records_Enums_and_Modules.amx"],
      ["./00_Table_of_Contents.amx", "./03_Collections_and_Functions.amx", "./05_Measurements_and_Units.amx"],
      ["./00_Table_of_Contents.amx", "./04_Typed_Records_Enums_and_Modules.amx", "./06_Mapped_Data_and_Validation.amx"],
      ["./00_Table_of_Contents.amx", "./05_Measurements_and_Units.amx", "./07_Tables_Charts_and_Named_Outputs.amx"],
      ["./00_Table_of_Contents.amx", "./06_Mapped_Data_and_Validation.amx"]
    ];

    for (let index = 0; index < lessonPaths.length; index += 1) {
      const lessonPath = lessonPaths[index]!;
      const document = await Bun.file(lessonPath).text();
      const navigation = parseLinks(document);
      expect(new Set(navigation)).toEqual(new Set(expectedNavigation[index]!));
      expect(document).toContain("## Objective");
      expect(document).toContain("## Prerequisites");
      expect(document).toContain("## Desktop workflow");
      expect(document).toContain("## Inputs and support files");
      expect(document).toContain("## Expected outcome");
      expect(document).toContain("## Navigation");
      expect(document).toContain("**Run**");
      expect(document).toContain("**Preview**");
      expect(await Bun.file(lessonPath).exists()).toBe(true);

      for (const target of navigation) {
        expect(path.isAbsolute(target)).toBe(false);
        const resolved = path.resolve(path.dirname(lessonPath), target);
        const relativePath = path.relative(guideRoot, await realpath(resolved));
        expect(relativePath).not.toBe("..");
        expect(relativePath.startsWith(`..${path.sep}`)).toBe(false);
      }
    }

    for (const lessonPath of lessonPaths.slice(0, 3)) {
      const source = executableSource(await Bun.file(lessonPath).text());
      expect(source).not.toMatch(/\b(?:import|input)\b/);
    }

    for (const supportPath of [
      "examples/libraries/asset-management.amx",
      "examples/libraries/screening.amx",
      "examples/data/asset.json",
      "examples/data/screenings.csv",
      "examples/data/reviewed-at.json",
      "examples/fixtures/invalid/asset.json",
      "examples/fixtures/invalid/screenings.csv"
    ]) {
      expect(await Bun.file(supportPath).exists()).toBe(true);
    }
    expect(await Bun.file(lessonPaths[3]!).text()).toContain("export type");
    expect(executableSource(await Bun.file(lessonPaths[6]!).text())).toContain("export let summary");
    expect(parseLinks(await Bun.file(lessonPaths[6]!).text())).not.toContain("./08_Formula_Driven_Diagrams.amx");
  });

  it("executes each lesson with documented inputs and checks results and deliberate failures", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "openamx-sprint091-guide-"));
    try {
      expectCliSuccess(await runCli("run", indexPath));

      const first = expectCliSuccess(await runCli("run", lessonPaths[0])) as Record<string, unknown>;
      expect(first).toMatchObject({ assetName: "Transformer TX-001", riskScore: 15 });

      const expressions = expectCliSuccess(await runCli("run", lessonPaths[1])) as Record<string, unknown>;
      expect(expressions).toMatchObject({
        product: 21,
        precedenceResult: 14,
        adjusted: 22,
        decision: "Review",
        priority: 8
      });

      const collections = expectCliSuccess(await runCli("run", lessonPaths[2])) as Record<string, unknown>;
      expect(collections).toMatchObject({
        levels: [1, 2, 3],
        doubledReadings: [4, 8, 12],
        loopTotal: 12,
        tripledTotal: 36,
        decision: "Target reached"
      });

      const records = expectCliSuccess(await runCli("run", lessonPaths[3])) as Record<string, unknown>;
      expect(records).toMatchObject({
        libraryAsset: { name: "North Pump 01", failureModes: [] },
        minimalReview: { status: 1, note: null, reviewedAt: null, labels: ["intake"] },
        reviewed: { status: 2, note: null, reviewedAt: "2026-09-29T12:00:00Z" }
      });

      const measurements = expectCliSuccess(await runCli("run", lessonPaths[4])) as Record<string, unknown>;
      expect(measurements).toMatchObject({
        distance: { value: 1250, unit: { text: "meter" } },
        distanceInKilometers: { value: 1.25, unit: { text: "kilometer" } },
        distanceInCentimeters: { value: 200, unit: { text: "centimeter" } },
        averageSpeed: { value: 36, unit: { text: "kilometer_per_hour" } },
        speedInMetersPerSecond: { value: 10, unit: { text: "meter_per_second" } },
        totalDistance: { value: 2, unit: { text: "meter" } }
      });

      const lesson06 = expectCliSuccess(await runCli("run", lessonPaths[5], ...validInputs)) as Record<string, unknown>;
      expect(lesson06).toMatchObject({
        asset: { name: "North Pump 01" },
        reviewedAt: "2026-09-29T12:00:00Z",
        scores: [16, 18, 4],
        totalScore: 38
      });

      const summaryPath = path.join(directory, "summary.json");
      const rowsPath = path.join(directory, "rows.csv");
      const lesson07 = expectCliSuccess(await runCli(
        "run",
        lessonPaths[6],
        ...validInputs,
        "--output", `summary=${summaryPath}`,
        "--output", `resultRows=${rowsPath}`
      )) as Record<string, unknown>;
      expect(lesson07).toMatchObject({
        summary: {
          assetName: "North Pump 01",
          reviewedAt: "2026-09-29T12:00:00Z",
          totalScore: 38
        },
        resultRows: [
          { assetId: "A-001", score: 16, note: "Bearing inspection" },
          { assetId: "A-001", score: 18, note: "Seal inspection" },
          { assetId: "A-001", score: 4, note: null }
        ]
      });
      expect(JSON.parse(await Bun.file(summaryPath).text())).toMatchObject({
        assetName: "North Pump 01",
        reviewedAt: "2026-09-29T12:00:00Z",
        totalScore: 38
      });
      expect(await Bun.file(rowsPath).text()).toBe([
        "assetId,score,note",
        "A-001,16,Bearing inspection",
        "A-001,18,Seal inspection",
        "A-001,4,",
        ""
      ].join("\n"));

      const htmlPath = path.join(directory, "lesson07.html");
      const rendered = await runCli(
        "render",
        lessonPaths[6],
        "--out", htmlPath,
        ...validInputs
      );
      expect(rendered.exitCode).toBe(0);
      const html = await Bun.file(htmlPath).text();
      expect(html).toContain("Screening register");
      expect(html).toContain("Score by screening");
      expect(html).toContain("North Pump 01");
      expect(html).toContain("38");

      const invalidCsvOutput = path.join(directory, "invalid-csv-summary.json");
      const invalidCsv = await runCli(
        "run",
        lessonPaths[6],
        "--input", "asset=examples/data/asset.json",
        "--input", "screenings=examples/fixtures/invalid/screenings.csv",
        "--input", "reviewedAt=examples/data/reviewed-at.json",
        "--output", `summary=${invalidCsvOutput}`
      );
      expect(invalidCsv.exitCode).not.toBe(0);
      expect(invalidCsv.stderr).toContain("AMX4003");
      expect(invalidCsv.stderr).toContain("record[1].severity");
      expect(await Bun.file(invalidCsvOutput).exists()).toBe(false);

      const invalidAssetOutput = path.join(directory, "invalid-asset-summary.json");
      const invalidAsset = await runCli(
        "run",
        lessonPaths[6],
        "--input", "asset=examples/fixtures/invalid/asset.json",
        "--input", "screenings=examples/data/screenings.csv",
        "--input", "reviewedAt=examples/data/reviewed-at.json",
        "--output", `summary=${invalidAssetOutput}`
      );
      expect(invalidAsset.exitCode).not.toBe(0);
      expect(invalidAsset.stderr).toContain("AMX4003");
      expect(invalidAsset.stderr).toContain("/id");
      expect(await Bun.file(invalidAssetOutput).exists()).toBe(false);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
