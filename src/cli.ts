#!/usr/bin/env node
/**
 * OpenAMX CLI entry point (Sprint 006).
 *
 * Implements `render <input> [--out <path>]` and `run <input>` using the
 * existing parseDocument / evaluateDocument / renderHtml pipeline.
 * Errors (including AMX1004 with location) are printed to stderr and cause
 * non-zero exit. No changes to parser, runtime, renderer, AST, or diagnostics.
 */

import { cac } from "cac";
import { renderPreparedHtml } from "./renderer/renderHtml";
import { AmxDiagnostic, AmxError } from "./diagnostics/errors";
import { loadEntryModule } from "./runtime/moduleLoader";
import { serializeOutputs, writeOutputs } from "./runtime/outputData";
import { preparePdfReport, serializePdfReport } from "./renderer/reportPdf";
import { preparePdfDestination, writePdfAtomically } from "./runtime/pdfDestination";
import { prepareDocxReport, serializeDocxReport } from "./renderer/reportDocx";
import { prepareDocxDestination, writeDocxAtomically } from "./runtime/docxDestination";
import { prepareReport } from "./renderer/reportPreparation";

const cli = cac("openamx");

function suppliedMappings(options: { input?: string[]; output?: string[] }, name: "input" | "output"): string[] | undefined {
  const option = `--${name}`;
  const supplied = process.argv.some(argument => argument === option || argument.startsWith(`${option}=`));
  return supplied ? options[name] : undefined;
}

function reportAmxError(error: AmxError): void {
  const diagnostics: AmxDiagnostic[] = error.diagnostics ?? [{
    code: error.code, message: error.message, file: error.file, line: error.line, column: error.column
  }];
  for (const diagnostic of diagnostics) {
    console.error(`${diagnostic.code}: ${diagnostic.message}`);
    if (diagnostic.file) console.error(`File: ${diagnostic.file}`);
    if (diagnostic.line !== undefined) console.error(`Line: ${diagnostic.line}`);
    if (diagnostic.column !== undefined) console.error(`Column: ${diagnostic.column}`);
    if (diagnostic.inputName) console.error(`Input: ${diagnostic.inputName}`);
    if (diagnostic.dataFile) console.error(`Data file: ${diagnostic.dataFile}`);
    if (diagnostic.dataPath !== undefined) console.error(`Data: ${diagnostic.dataPath || '/'}`);
    if (diagnostic.dataLine !== undefined) console.error(`Data line: ${diagnostic.dataLine}`);
    if (diagnostic.dataColumn !== undefined) console.error(`Data column: ${diagnostic.dataColumn}`);
    if (diagnostic.recordNumber !== undefined) console.error(`Record: ${diagnostic.recordNumber}`);
    if (diagnostic.expected) console.error(`Expected: ${diagnostic.expected}`);
    if (diagnostic.actual) console.error(`Actual: ${diagnostic.actual}`);
    if (diagnostic.declarationSource) {
      console.error(`Input declaration: ${diagnostic.declarationSource.line}:${diagnostic.declarationSource.column}`);
    }
    if (diagnostic.fieldSource) {
      console.error(`Field declaration: ${diagnostic.fieldSource.line}:${diagnostic.fieldSource.column}`);
    }
  }
}

cli
  .command("export <format> <input>", "Export an .amx file to an offline report")
  .option("--out <path>", "Output PDF or DOCX file path")
  .option("--input <mapping>", "Map a logical input to a data file", { type: [String] })
  .option("--validation <mode>", "Validation mode: aggregate or fail-fast")
  .option("--project-root <path>", "Project root for report metadata and logo assets")
  .action(async (format: string, input: string, options: { out?: string; input?: string[]; validation?: string; projectRoot?: string }) => {
    try {
      const inputMappings = suppliedMappings(options, "input");
      if (format === "docx") {
        const destination = await prepareDocxDestination(options.out, input, inputMappings);
        const { doc, env } = await loadEntryModule(input, {
          inputMappings,
          validation: options.validation as "aggregate" | "fail-fast" | undefined
        });
        const report = await prepareReport(doc, env, { file: input, projectRoot: options.projectRoot });
        const bytes = await serializeDocxReport(prepareDocxReport(report));
        await writeDocxAtomically(destination, bytes);
        console.log(`Exported DOCX to ${destination.path}`);
        return;
      }
      if (format !== "pdf") throw new AmxError({ code: "AMX6001", message: `Unsupported export format '${format}'; use 'pdf' or 'docx'` });
      const destination = await preparePdfDestination(options.out, input, inputMappings);
      const { doc, env } = await loadEntryModule(input, {
        inputMappings,
        validation: options.validation as "aggregate" | "fail-fast" | undefined
      });
      const report = await prepareReport(doc, env, { file: input, projectRoot: options.projectRoot });
      const bytes = await serializePdfReport(preparePdfReport(report));
      await writePdfAtomically(destination, bytes);
      console.log(`Exported PDF to ${destination.path}`);
    } catch (err: any) {
      if (err instanceof AmxError) {
        reportAmxError(err);
      } else {
        reportAmxError(new AmxError({ code: "AMX6002", message: `PDF export failed: ${err instanceof Error ? err.message : String(err)}` }));
      }
      process.exit(1);
    }
  });

cli
  .command("render <input>", "Render an .amx file to standalone HTML")
  .option("--out <path>", "Output HTML file path (default: input with .html extension)")
  .option("--input <mapping>", "Map a logical input to a data file", { type: [String] })
  .option("--output <mapping>", "Write an exported value to a JSON or CSV file", { type: [String] })
  .option("--validation <mode>", "Validation mode: aggregate or fail-fast")
  .option("--project-root <path>", "Project root for report metadata and logo assets")
  .action(async (input: string, options: { out?: string; input?: string[]; output?: string[]; validation?: string; projectRoot?: string }) => {
    try {
      const outPath = options.out || input.replace(/\.amx$/, ".html");
      const inputMappings = suppliedMappings(options, "input");
      const outputMappings = suppliedMappings(options, "output");
      const { doc, env, outputs } = await loadEntryModule(input, {
        inputMappings,
        validation: options.validation as "aggregate" | "fail-fast" | undefined,
        outputMappings,
        reservedOutputPath: outputMappings?.length ? outPath : undefined
      });
      const report = await prepareReport(doc, env, { file: input, projectRoot: options.projectRoot });
      const html = renderPreparedHtml(report);
      const serialized = serializeOutputs(outputs, env);
      await writeOutputs([{ path: outPath, contents: html }, ...serialized]);
      console.log(`Rendered to ${outPath}`);
    } catch (err: any) {
      if (err instanceof AmxError) {
        reportAmxError(err);
      } else {
        console.error("Error:", err.message);
      }
      process.exit(1);
    }
  });

cli
  .command("run <input>", "Run an .amx file and print evaluated context as JSON")
  .option("--input <mapping>", "Map a logical input to a data file", { type: [String] })
  .option("--output <mapping>", "Write an exported value to a JSON or CSV file", { type: [String] })
  .option("--validation <mode>", "Validation mode: aggregate or fail-fast")
  .action(async (input: string, options: { input?: string[]; output?: string[]; validation?: string }) => {
    try {
      const inputMappings = suppliedMappings(options, "input");
      const outputMappings = suppliedMappings(options, "output");
      const { env, outputs } = await loadEntryModule(input, {
        inputMappings,
        validation: options.validation as "aggregate" | "fail-fast" | undefined,
        outputMappings
      });
      const serialized = serializeOutputs(outputs, env);
      await writeOutputs(serialized);
      console.log(JSON.stringify(env.toObject(), null, 2));
    } catch (err: any) {
      if (err instanceof AmxError) {
        reportAmxError(err);
      } else {
        console.error("Error:", err.message);
      }
      process.exit(1);
    }
  });

cli.help();
cli.version("0.3.0");

cli.parse();
