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
import { renderHtml } from "./renderer/renderHtml";
import { AmxDiagnostic, AmxError } from "./diagnostics/errors";
import { loadEntryModule } from "./runtime/moduleLoader";

const cli = cac("openamx");

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
  .command("render <input>", "Render an .amx file to standalone HTML")
  .option("--out <path>", "Output HTML file path (default: input with .html extension)")
  .option("--input <mapping>", "Map a logical input to a data file", { type: [String] })
  .option("--validation <mode>", "Validation mode: aggregate or fail-fast")
  .action(async (input: string, options: { out?: string; input?: string[]; validation?: string }) => {
    try {
      const { doc, env } = await loadEntryModule(input, {
        inputMappings: options.input,
        validation: options.validation as "aggregate" | "fail-fast" | undefined
      });
      const html = renderHtml(doc, input, env);
      const outPath = options.out || input.replace(/\.amx$/, ".html");
      await Bun.write(outPath, html);
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
  .option("--validation <mode>", "Validation mode: aggregate or fail-fast")
  .action(async (input: string, options: { input?: string[]; validation?: string }) => {
    try {
      const { env } = await loadEntryModule(input, {
        inputMappings: options.input,
        validation: options.validation as "aggregate" | "fail-fast" | undefined
      });
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
cli.version("0.1.0");

cli.parse();
