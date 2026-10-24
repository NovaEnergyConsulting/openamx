import { describe, expect, it } from "bun:test";
import { mkdtemp, realpath, rm } from "fs/promises";
import { tmpdir } from "os";
import * as path from "path";

const indexPath = "examples/00_Table_of_Contents.amx";
const guidedPaths = [
  "examples/01_First_Computable_Document.amx",
  "examples/02_Expressions_and_Decisions.amx",
  "examples/03_Collections_and_Functions.amx",
  "examples/04_Typed_Records_Enums_and_Modules.amx",
  "examples/05_Measurements_and_Units.amx",
  "examples/06_Mapped_Data_and_Validation.amx",
  "examples/07_Tables_Charts_and_Named_Outputs.amx",
  "examples/08_Formula_Driven_Diagrams.amx",
  "examples/09_Runtime_Type_Checks.amx",
  "examples/10_Mathematics_and_Measurement_Operations.amx",
  "examples/11_Text_and_Numeric_Formatting.amx",
  "examples/12_Complete_Asset_Screening_Report.amx"
];
const referencePaths = [
  "examples/13_Route_Measurement_Report.amx",
  "examples/14_Battery_Resistor_Circuit.amx",
  "examples/15_Function_Bodies.amx"
];
const lessonPaths = [...guidedPaths, ...referencePaths];
const validInputs = [
  "--input", "asset=examples/data/asset.json",
  "--input", "screenings=examples/data/screenings.csv",
  "--input", "reviewedAt=examples/data/reviewed-at.json"
];
const routeInputs = ["--input", "trips=examples/data/measurement-trips.json"];

async function runCli(...arguments_: string[]) {
  const command = Bun.spawnSync([process.execPath, "run", "dist/cli.js", ...arguments_]);
  return {
    exitCode: command.exitCode,
    stdout: new TextDecoder().decode(command.stdout),
    stderr: new TextDecoder().decode(command.stderr)
  };
}

async function runSourceCli(...arguments_: string[]) {
  const command = Bun.spawnSync([process.execPath, "run", "src/cli.ts", ...arguments_]);
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

describe("V0.16 numbered guide", () => {
  it("keeps the index, navigation, link containment, and support closure aligned", async () => {
    const guideRoot = await realpath("examples");
    const index = await Bun.file(indexPath).text();
    expect(parseLinks(index)).toEqual(lessonPaths.map(lesson => `./${path.basename(lesson)}`));
    const guidedSection = index.split("## Guided lessons and destination report")[1]?.split("## Standalone references")[0] ?? "";
    const referenceSection = index.split("## Standalone references")[1]?.split("## Desktop workflow")[0] ?? "";
    expect(parseLinks(guidedSection)).toEqual(guidedPaths.map(lesson => `./${path.basename(lesson)}`));
    expect(parseLinks(referenceSection)).toEqual(referencePaths.map(reference => `./${path.basename(reference)}`));
    expect(index).toContain("## Guided lessons and destination report");
    expect(index).toContain("## Standalone references");
    expect(index).toContain("not a prerequisite");

    const expectedNavigation = [
      ["./00_Table_of_Contents.amx", "./02_Expressions_and_Decisions.amx"],
      ["./00_Table_of_Contents.amx", "./01_First_Computable_Document.amx", "./03_Collections_and_Functions.amx"],
      ["./00_Table_of_Contents.amx", "./02_Expressions_and_Decisions.amx", "./04_Typed_Records_Enums_and_Modules.amx", "./15_Function_Bodies.amx"],
      ["./00_Table_of_Contents.amx", "./03_Collections_and_Functions.amx", "./05_Measurements_and_Units.amx"],
      ["./00_Table_of_Contents.amx", "./04_Typed_Records_Enums_and_Modules.amx", "./06_Mapped_Data_and_Validation.amx"],
      ["./00_Table_of_Contents.amx", "./05_Measurements_and_Units.amx", "./07_Tables_Charts_and_Named_Outputs.amx"],
      ["./00_Table_of_Contents.amx", "./06_Mapped_Data_and_Validation.amx", "./08_Formula_Driven_Diagrams.amx"],
      [
        "./00_Table_of_Contents.amx",
        "./07_Tables_Charts_and_Named_Outputs.amx",
        "./09_Runtime_Type_Checks.amx",
        "./14_Battery_Resistor_Circuit.amx"
      ],
      [
        "./00_Table_of_Contents.amx",
        "./08_Formula_Driven_Diagrams.amx",
        "./10_Mathematics_and_Measurement_Operations.amx"
      ],
      [
        "./00_Table_of_Contents.amx",
        "./09_Runtime_Type_Checks.amx",
        "./05_Measurements_and_Units.amx",
        "./11_Text_and_Numeric_Formatting.amx"
      ],
      ["./00_Table_of_Contents.amx", "./10_Mathematics_and_Measurement_Operations.amx", "./12_Complete_Asset_Screening_Report.amx"],
      [
        "./00_Table_of_Contents.amx",
        "./11_Text_and_Numeric_Formatting.amx",
        "./02_Expressions_and_Decisions.amx",
        "./04_Typed_Records_Enums_and_Modules.amx",
        "./05_Measurements_and_Units.amx",
        "./06_Mapped_Data_and_Validation.amx",
        "./07_Tables_Charts_and_Named_Outputs.amx",
        "./10_Mathematics_and_Measurement_Operations.amx",
        "./11_Text_and_Numeric_Formatting.amx"
      ],
      [
        "./00_Table_of_Contents.amx",
        "./05_Measurements_and_Units.amx",
        "./06_Mapped_Data_and_Validation.amx",
        "./07_Tables_Charts_and_Named_Outputs.amx"
      ],
      ["./00_Table_of_Contents.amx", "./08_Formula_Driven_Diagrams.amx"],
      ["./00_Table_of_Contents.amx", "./03_Collections_and_Functions.amx"]
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
      "examples/libraries/travel-measurements.amx",
      "examples/data/asset.json",
      "examples/data/screenings.csv",
      "examples/data/reviewed-at.json",
      "examples/data/measurement-trips.json",
      "examples/fixtures/invalid/asset.json",
      "examples/fixtures/invalid/screenings.csv",
      "examples/fixtures/invalid/missing-function-return.amx"
    ]) {
      expect(await Bun.file(supportPath).exists()).toBe(true);
    }
    expect(await Bun.file(lessonPaths[3]!).text()).toContain("export type");
    expect(executableSource(await Bun.file(lessonPaths[6]!).text())).toContain("export let summary");
    expect(parseLinks(await Bun.file(lessonPaths[11]!).text())).toContain("./02_Expressions_and_Decisions.amx");
    expect(parseLinks(await Bun.file(lessonPaths[12]!).text())).not.toContain("./12_Complete_Asset_Screening_Report.amx");
    expect(parseLinks(await Bun.file(lessonPaths[13]!).text())).toContain("./08_Formula_Driven_Diagrams.amx");
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

      const diagrams = expectCliSuccess(await runCli("run", lessonPaths[7])) as Record<string, unknown>;
      expect(diagrams).toMatchObject({ crankRadius: 34, rodLength: 105 });

      const typeChecks = expectCliSuccess(await runCli("run", lessonPaths[8])) as Record<string, unknown>;
      expect(typeChecks).toMatchObject({
        structuralMatch: true,
        primitiveMatch: true,
        primitiveMismatch: false,
        booleanMatch: true,
        recursiveStructuralMatch: true,
        recursiveListMatch: true,
        recursiveMismatch: false,
        recursiveListMismatch: false,
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
      });

      const math = expectCliSuccess(await runCli("run", lessonPaths[9])) as Record<string, unknown>;
      expect(math).toMatchObject({
        piValue: Math.PI,
        eValue: Math.E,
        sine: 1,
        cosine: 1,
        tangent: 0,
        arcSine: Math.PI / 2,
        arcCosine: 0,
        arcTangent: Math.PI / 4,
        hyperbolicSine: 0,
        hyperbolicCosine: 1,
        hyperbolicTangent: 0,
        inverseHyperbolicSine: 0,
        inverseHyperbolicCosine: 0,
        inverseHyperbolicTangent: 0,
        naturalLog: 1,
        commonLog: 2,
        exponential: Math.E,
        dimensionlessSine: Math.sin(2),
        totalDistance: { value: 2, unit: { text: "meter" } },
        averageDistance: { value: 1, unit: { text: "meter" } },
        shortestDistance: { value: 1, unit: { text: "meter" } },
        longestDistance: { value: 150, unit: { text: "centimeter" } },
        absoluteDistance: { value: 2, unit: { text: "meter" } },
        roundedDistance: { value: 1.24, unit: { text: "meter" } },
        squareRootDistance: { value: 3, unit: { text: "meter" } },
        squaredDistance: { value: 4, unit: { text: "meter ^ 2" } },
        emptyTotal: { value: 0, unit: { text: "meter" } }
      });

      const formatting = expectCliSuccess(await runCli("run", lessonPaths[10])) as Record<string, unknown>;
      expect(formatting).toMatchObject({
        codePointLength: 3,
        listLength: 3,
        combiningSequenceLength: 2,
        trimmed: "AMX",
        firstTwo: "A🙂",
        lastTwo: "🙂B",
        defaultLeft: "A",
        emptyRight: "",
        longLeft: "AMX",
        groupedUS: "1,234.50",
        groupedGerman: "1.234,50",
        groupedFrench: "1 234,50",
        percentage: "12.5%",
        currency: "-$1,234.50",
        positiveTie: "1.13",
        negativeTie: "-1.13",
        negativeZero: "0.00",
        displayedDistance: "1.25 meter",
        displayedCentimeters: "125.00 centimeter"
      });

      const reportSummaryPath = path.join(directory, "complete-summary.json");
      const reportRowsPath = path.join(directory, "complete-rows.csv");
      const completeReport = expectCliSuccess(await runCli(
        "run",
        lessonPaths[11],
        ...validInputs,
        "--output", `summary=${reportSummaryPath}`,
        "--output", `resultRows=${reportRowsPath}`
      )) as Record<string, unknown>;
      expect(completeReport).toMatchObject({
        summary: {
          assetName: "North Pump 01",
          reviewedAt: "2026-09-29T12:00:00Z",
          totalScore: 38
        },
        resultRows: [
          { assetId: "A-001", score: 16, note: "Bearing inspection" },
          { assetId: "A-001", score: 18, note: "Seal inspection" },
          { assetId: "A-001", score: 4, note: null }
        ],
        meanScreeningScore: 38 / 3,
        illustrativeReviewWindow: { value: 2, unit: { text: "hour" } },
        formattedTotal: "38"
      });
      expect(completeReport.summary).toEqual({
        assetName: "North Pump 01",
        reviewedAt: "2026-09-29T12:00:00Z",
        totalScore: 38
      });
      expect(JSON.parse(await Bun.file(reportSummaryPath).text())).toEqual({
        assetName: "North Pump 01",
        reviewedAt: "2026-09-29T12:00:00Z",
        totalScore: 38
      });
      expect(await Bun.file(reportRowsPath).text()).toBe([
        "assetId,score,note",
        "A-001,16,Bearing inspection",
        "A-001,18,Seal inspection",
        "A-001,4,",
        ""
      ].join("\n"));

      const completeReportHtmlPath = path.join(directory, "complete-report.html");
      const completeReportRender = await runCli(
        "render",
        lessonPaths[11],
        "--out", completeReportHtmlPath,
        ...validInputs
      );
      expect(completeReportRender.exitCode).toBe(0);
      const completeReportHtml = await Bun.file(completeReportHtmlPath).text();
      expect(completeReportHtml).toContain("Screening register");
      expect(completeReportHtml).toContain("Score by screening");
      expect(completeReportHtml).toContain("not calibrated");

      const invalidCompleteOutput = path.join(directory, "invalid-complete-summary.json");
      const invalidCompleteReport = await runCli(
        "run",
        lessonPaths[11],
        "--input", "asset=examples/data/asset.json",
        "--input", "screenings=examples/fixtures/invalid/screenings.csv",
        "--input", "reviewedAt=examples/data/reviewed-at.json",
        "--output", `summary=${invalidCompleteOutput}`
      );
      expect(invalidCompleteReport.exitCode).not.toBe(0);
      expect(invalidCompleteReport.stderr).toContain("AMX4003");
      expect(invalidCompleteReport.stderr).toContain("record[1].severity");
      expect(invalidCompleteReport.stderr).toContain("Expected: Number");
      expect(await Bun.file(invalidCompleteOutput).exists()).toBe(false);

      const invalidCompleteAssetOutput = path.join(directory, "invalid-complete-asset-summary.json");
      const invalidCompleteAsset = await runCli(
        "run",
        lessonPaths[11],
        "--input", "asset=examples/fixtures/invalid/asset.json",
        "--input", "screenings=examples/data/screenings.csv",
        "--input", "reviewedAt=examples/data/reviewed-at.json",
        "--output", `summary=${invalidCompleteAssetOutput}`
      );
      expect(invalidCompleteAsset.exitCode).not.toBe(0);
      expect(invalidCompleteAsset.stderr).toContain("AMX4003");
      expect(invalidCompleteAsset.stderr).toContain("/id");
      expect(await Bun.file(invalidCompleteAssetOutput).exists()).toBe(false);

      const routeOutputPath = path.join(directory, "route-summaries.json");
      const routeReport = expectCliSuccess(await runCli(
        "run",
        lessonPaths[12],
        ...routeInputs,
        "--output", `exportedSummaries=${routeOutputPath}`
      )) as Record<string, unknown>;
      expect(routeReport).toMatchObject({
        exportedSummaries: [
          {
            route: "North loop",
            distance: { value: 1.5, unit: { text: "kilometer" } },
            averageSpeed: { value: 3, unit: { text: "kilometer_per_hour" } }
          },
          {
            route: "South loop",
            distance: { value: 0.5, unit: { text: "kilometer" } },
            averageSpeed: { value: 1.5, unit: { text: "kilometer_per_hour" } }
          }
        ]
      });
      expect(JSON.parse(await Bun.file(routeOutputPath).text())).toEqual([
        {
          route: "North loop",
          distance: { value: 1.5, unit: "kilometer" },
          averageSpeed: { value: 3, unit: "kilometer_per_hour" }
        },
        {
          route: "South loop",
          distance: { value: 0.5, unit: "kilometer" },
          averageSpeed: { value: 1.5, unit: "kilometer_per_hour" }
        }
      ]);

      const routeHtmlPath = path.join(directory, "route-report.html");
      const routeRender = await runCli("render", lessonPaths[12], "--out", routeHtmlPath, ...routeInputs);
      expect(routeRender.exitCode).toBe(0);
      const routeHtml = await Bun.file(routeHtmlPath).text();
      expect(routeHtml).toContain("Route measurements");
      expect(routeHtml).toContain("Distance by route");
      expect(routeHtml).toContain("North loop");

      for (const [lessonPath, filename, title] of [
        [lessonPaths[8]!, "types09.html", "Runtime Type Checks"],
        [lessonPaths[9]!, "math10.html", "Mathematics and Measurement Operations"],
        [lessonPaths[10]!, "formatting11.html", "Text and Numeric Formatting"]
      ]) {
        const narrativeHtmlPath = path.join(directory, filename);
        const renderedNarrative = await runCli("render", lessonPath, "--out", narrativeHtmlPath);
        expect(renderedNarrative.exitCode).toBe(0);
        expect(await Bun.file(narrativeHtmlPath).text()).toContain(title);
      }

      const circuit = expectCliSuccess(await runCli("run", lessonPaths[13])) as Record<string, unknown>;
      expect(circuit).toMatchObject({ supplyVoltage: 9, resistance: 15, current: 0.6 });

      const functionBodies = expectCliSuccess(await runSourceCli("run", lessonPaths[14]!)) as Record<string, unknown>;
      expect(functionBodies).toMatchObject({
        expressionResult: 12,
        statementResult: 14,
        highResult: "high",
        positiveResult: "positive",
        otherResult: "other",
        scopedResult: 5,
        emptyFallback: 0,
        firstValue: 7,
        originalValue: 4,
        localValue: 5,
        restoredParameter: 2,
        returnedList: [6, 9],
        nestedInput: [[1], [2]],
        nestedResult: [[1, 9], [2, 9]],
        repeatedInput: [3],
        repeatedResult: [3]
      });

      for (const [lessonPath, filename, title] of [
        [lessonPaths[7]!, "diagram08.html", "Crank-slider mechanism"],
        [lessonPaths[13]!, "circuit14.html", "Battery-resistor DC circuit"]
      ]) {
        const diagramHtmlPath = path.join(directory, filename);
        const renderedDiagram = await runCli("render", lessonPath, "--out", diagramHtmlPath);
        expect(renderedDiagram.exitCode).toBe(0);
        const diagramHtml = await Bun.file(diagramHtmlPath).text();
        expect(diagramHtml).toContain(title);
        expect(diagramHtml).toContain('data-openamx-diagram="openamx-diagram-0"');
        expect(diagramHtml).toContain('type="range" data-diagram-scrubber');
      }

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
  }, 60000);
});
