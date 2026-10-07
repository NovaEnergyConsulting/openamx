# Sprint 058 Acceptance Criteria

Sprint 058 is complete when:

- The Builder audits all applicable V0.9 language features across shared editor analysis/formatting, VS Code providers/TextMate grammar, and desktop editor/worker/RPC surfaces. A compact capability matrix records supported, corrected, and not-applicable cases.
- Demonstrated parity defects are fixed without redefining parser, checker, runtime, diagnostic, data, or report semantics. Clients agree on accepted/rejected syntax and relevant diagnostic/type/symbol facts.
- Tests cover string escapes/interpolation, multiline record `=`, 1-based indexing/list mutation, dimension/unit declarations and imports, measurements/conversions, and measurement-aware input/output diagnostics as they appear in editors.
- Formatting of valid feature-rich source is parse-format-parse meaning-preserving and idempotent. Invalid source, including record constructor colons, remains rejected and is never silently repaired.
- Completion, hover/type facts, definition/navigation, references, rename, outline/symbols, and source ranges are verified for the capabilities that each client already provides. Imported dimension/unit identities resolve to their declaring symbols; no client-specific capability is invented just for parity.
- VS Code TextMate tokenization is tested separately from shared AST analysis and agrees for the V0.9 token forms. Incomplete drafts do not crash providers or color inert/narrative content as executable syntax.
- Original-document locations and offsets remain correct with front matter/narrative, executable-fence delimiters, nested expressions, imported modules, and both LF and CRLF line endings.
- The V0.9 language specification and README accurately describe implemented behavior and link to one another. A migration guide covers exactly the approved record constructor delimiter, string escape, and strict-checking compatibility changes; it distinguishes constructor colons from annotation/type-declaration colons and does not promise auto-repair.
- Representative examples demonstrate current V0.9 syntax and relevant module/data/report integration. Every added or changed positive example executes successfully; negative fixtures remain negative.
- Bundled Help Center content provides locally searchable V0.9 syntax and migration guidance, with valid unique topic IDs and preserved existing shortcuts, actions, and offline behavior.
- Focused feature tests, root build/full tests, and available extension/desktop checks are run and recorded. Integrated evidence covers representative V0.9 authoring and execution paths and documents exact commands/results/host.
- Sprint 053, 054, and 057 residuals remain separately identified and unpassed. Any new platform-specific failure is reported with the affected command and is not represented as a pass.
- Sprint 058 Builder evidence and `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` contain changed files, exact validation results, residuals/questions, and a separate Lead Developer disposition request. The Builder does not self-accept this sprint or claim final V0.9 acceptance.

## Required Regression Set

1. Feature-rich valid and invalid AMX parses/checks consistently in shared, VS Code, and desktop analysis.
2. VS Code TextMate grammar recognizes V0.9 syntax while respecting strings, incomplete syntax, executable fences, inert fences, and narrative.
3. Completion, hover/type, definitions/references/rename, outline/symbols, and diagnostics resolve declaration identity across explicit module imports.
4. Formatter idempotence and parse-format-parse meaning are verified; invalid record delimiters remain errors.
5. LF/CRLF, front matter, narrative offsets, and multi-fence locations agree with original-document coordinates.
6. Current examples and representative JSON/CSV measurement/report workflows execute and preserve the approved output behavior.
7. README/spec/migration links, Help topic JSON validity, local search terms, and help UI tests pass.
8. Root build/tests plus extension and desktop verification results are recorded distinctly, including failures/unavailable host checks.

Sprint completion is not equivalent to Lead Developer acceptance, release readiness, native cross-platform certification, or publication.

## Lead Developer Disposition

**2026-10-07: COMPLETE / APPROVED.** The Lead Developer accepts Sprint 058 as complete with recorded verification residuals. The Hutch wrapper stall and unavailable TextMate-tokenizer run remain unpassed checks; accepting sprint closeout does not represent them as passed. Historical Sprint 053, 054, and 057 Windows findings remain separately identified and unpassed. This disposition does not claim final V0.9 acceptance, release readiness, native/platform certification, or publication.