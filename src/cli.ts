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
import { parseDocument } from "./parser/parseDocument";
import { evaluateDocument } from "./runtime/evaluateDocument";
import { renderHtml } from "./renderer/renderHtml";
import { AmxError } from "./diagnostics/errors";

const cli = cac("openamx");

cli
  .command("render <input>", "Render an .amx file to standalone HTML")
  .option("--out <path>", "Output HTML file path (default: input with .html extension)")
  .action(async (input: string, options: { out?: string }) => {
    try {
      const doc = await parseDocument(input);
      const html = renderHtml(doc, input);
      const outPath = options.out || input.replace(/\.amx$/, ".html");
      await Bun.write(outPath, html);
      console.log(`Rendered to ${outPath}`);
    } catch (err: any) {
      if (err instanceof AmxError) {
        console.error(`${err.code}: ${err.message}`);
        if (err.file) console.error(`File: ${err.file}`);
        if (err.line !== undefined) console.error(`Line: ${err.line}`);
        if (err.column !== undefined) console.error(`Column: ${err.column}`);
      } else {
        console.error("Error:", err.message);
      }
      process.exit(1);
    }
  });

cli
  .command("run <input>", "Run an .amx file and print evaluated context as JSON")
  .action(async (input: string) => {
    try {
      const doc = await parseDocument(input);
      const context = evaluateDocument(doc, input);
      console.log(JSON.stringify(context, null, 2));
    } catch (err: any) {
      if (err instanceof AmxError) {
        console.error(`AMX${err.code}: ${err.message}`);
        if (err.file) console.error(`File: ${err.file}`);
        if (err.line !== undefined) console.error(`Line: ${err.line}`);
        if (err.column !== undefined) console.error(`Column: ${err.column}`);
      } else {
        console.error("Error:", err.message);
      }
      process.exit(1);
    }
  });

cli.help();
cli.version("0.1.0");

cli.parse();
