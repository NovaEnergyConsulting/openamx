# OpenAMX

**Open Asset Management eXchange**

OpenAMX is an open-source, text-based, computable document format for Asset Management knowledge.

It is designed for engineers, asset managers, reliability professionals, consultants and infrastructure planners who need to create documents that combine human-readable narrative with structured data, calculations, assumptions, references and executable logic.

OpenAMX aims to become a “Markdown on steroids” for Asset Management: readable as plain text, executable by software, renderable into professional documents, and suitable for long-term version control.

---

## Why OpenAMX?

Asset management professionals produce critical documents such as:

- Strategic Asset Management Plans
- Asset Management Plans
- Asset strategies
- Criticality assessments
- Risk assessments
- Maintenance strategies
- Lifecycle cost models
- Investment cases
- Renewal plans
- Decision papers

Today, these artefacts are often split across Word documents, Excel spreadsheets, PDFs, PowerPoint decks, databases and specialist software tools.

This creates persistent problems:

- Calculations become separated from conclusions.
- Assumptions are hard to trace.
- Engineering logic is lost when documents are rendered to static formats.
- Reports cannot easily be re-run when inputs change.
- Knowledge is difficult to reuse across projects.
- Reviews and audits require manual checking.
- Documents become representations of decisions rather than living decision models.

OpenAMX addresses this by allowing a document to contain both narrative and computation in a single plain-text source file.

---

## Vision

OpenAMX documents should be:

- **Readable by humans**
- **Processable by machines**
- **Stored as plain text**
- **Version controlled with Git**
- **Composable through imports**
- **Executable to produce calculated outputs**
- **Renderable into professional reports**
- **Extensible for Asset Management-specific libraries and templates**

The goal is not to replace engineers or asset managers.

The goal is to make engineering intent, assumptions, calculations and decision logic explicit, reusable and auditable.

---

## What is an `.amx` File?

An `.amx` file is a plain-text OpenAMX source document.

Example:

```amx
---
title: Transformer Replacement Strategy
author: Carlos Gamez
version: 0.1
status: draft
---

import "./criticality.amx" as criticality
import csv "./data/assets.csv" as assets

# Transformer Replacement Strategy

This document evaluates the lifecycle cost and risk exposure associated with Transformer TX-001.

let replacementCost = 1250000
let annualRiskCost = 85000
let projectLife = 25

let lifecycleRiskCost = annualRiskCost * projectLife
let totalLifecycleCost = replacementCost + lifecycleRiskCost

## Recommendation

Replace Transformer TX-001 during FY2029.

The calculated lifecycle risk cost is {{ lifecycleRiskCost }}.

The calculated total lifecycle cost is {{ totalLifecycleCost }}.
```

---

## Installation (using bun)

This project requires [bun](https://bun.sh/) as the package manager (per v0.1 decisions).

```bash
bun install
```

## Build

```bash
bun run build
```

## Test

```bash
bun test
```

## Usage (future)

Once implemented (Sprint 006+):

```bash
# Render an .amx document to standalone HTML
openamx render examples/hello-world.amx --out examples/hello-world.html

# Or via npm-style script
bun run render:hello
```

## Current Status (Sprint 001)

This repository currently contains **project scaffolding only**.

- All `src/` modules are placeholders (no parser, evaluator, renderer, or CLI logic).
- Examples and tests are minimal stubs/skeletons.
- The project builds and tests pass with empty results.
- Language implementation begins in Sprint 002.

See `.agents/planning/sprints/0001-project-scaffolding/` for sprint artifacts.
See `.agents/planning/decisions.md` for v0.1 scope and technology decisions.
See `.agents/language-spec-v0.1.md` for the authoritative specification (sections 1-18).

**Limitations (v0.1 scope):**
- No imports (CSV/JSON/.amx)
- No units, charts, tables, PDF/Word export
- Single-line `if ... then ... else` only (no `else if`)
- No Langium / VS Code extension (deferred)
- Full mono-repo structure planned for later phases

For the complete list of out-of-scope items, see the sprint requirements and decisions files.
