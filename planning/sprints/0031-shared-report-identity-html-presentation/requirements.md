# Sprint 031 Requirements: Shared Report Identity, HTML Presentation, and Branding

## Goal

Resolve portable project defaults and report-level identity overrides once in a trusted report-preparation boundary and redesign standalone HTML for professional offline presentation. Supply the same immutable resolved identity/content contract for Sprint 032 PDF/DOCX without reevaluating AMX or rereading inputs/modules. Preserve V0.2-V0.4 language, view, export and visible-source defaults.

## Inputs

- `planning/plan-openamxV05MasterSprintPlan.md`, Sprint 031; approved `docs/language-spec-v0.5.md`, especially sections 1-4
- `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/visual-review.md` and its F0-F5 fixture manifest
- `src/renderer/renderHtml.ts`, `src/renderer/reportPdf.ts`, `src/renderer/reportDocx.ts`, `src/runtime/moduleLoader.ts`, `src/cli.ts`, `desktop-app/src/bun/desktopService.ts`, `desktop-app/src/bun/desktopWorkflow.ts`; existing renderer/CLI/input/output tests
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md` for prior sprint dispositions and independent release residuals

## In Scope

- Define and implement a shared, immutable resolved report model for identity, formatted source visibility, final-environment narrative and original ordered show-time `viewEmissions`. Perform identity/config/asset validation and narrative preparation once at the trusted caller boundary; HTML serializes the prepared model. Keep legacy public entry points compatible where possible. Expose the model to Sprint 032 PDF/DOCX without pretending their branded layouts ship in Sprint 031.
- Add optional `report` to version-1 `.openamx/project.json` while retaining required `version` and `inputs`, existing input precedence, `.openamx/local.json` input-only policy, unknown-key errors and no-option CLI behavior. Implement exact approved report-frontmatter fields, field-by-field precedence, neutral defaults, source locations, duplicate-key handling, strict types and bounded diagnostics; validate selected project defaults even when overridden. Preserve top-level `title` and inert historical frontmatter keys.
- Add explicit `--project-root <dir>` to CLI `render` and `export pdf|docx` only for identity defaults, with no implicit project discovery, CLI input path-base changes or new `run` option. Desktop uses its selected canonical project root. Coordinate CLI/desktop access to the same identity resolution; do not make the webview read project config/assets or require an unbranded PDF/DOCX redesign before Sprint 032.
- Implement the approved logo policy in trusted code: POSIX project-relative `.png`/`.jpg` only, path/byte/pixel limits, symlink-free canonical containment, signature/dimension/frame validation, bounded sanitized PNG re-encoding that strips metadata and original filename, descriptive effective `logoAlt`, no remote access. Invalid/missing assets fail before writes with `AMX6001`/`AMX6002` and source location; no silent brand omission or absolute/private path disclosure. Validate even when an identity override masks an invalid project field.
- Apply accent validation and deterministic WCAG-contrast fallback for text/controls without recoloring chart series or data. Format-native HTML uses the approved tokens, typography/hierarchy and metadata/title/logo/footer; semantic header/main/footer, escaped plain text, narrative/source/view order, visible/hidden formatted source and print rules. Keep tables filter/sort/page semantics and static original-order print data; keep bar/column/line/scatter bindings, show-time snapshots, chart data alternatives and keyboard/focus/accessibility behavior intact.
- Ensure responsive offline HTML at 360 and 1280 px, 200% zoom and print: no external assets/requests, readable long text/tables, visible focus, accessible labels/status, empty/no-data states, inline sanitized image and deterministic structure for fixed source/identity/inputs. Existing HTML without V0.5 fields may change presentation but not values, source visibility, view order or interaction/print semantics.
- Add focused config, CLI, renderer and browser checks for precedence, null/invalid/duplicate/unknown fields, original YAML/JSON-pointer diagnostics, local logo attack/failure cases, neutral/contrast fallback, escaping/script safety, visible/hidden source, interactive/print behavior, deterministic HTML and V0.2-V0.4 compatibility. Include no-write and preserve-existing checks for invalid identity, analysis or destination, including named-output writes where the CLI render path shares the write barrier.

## Out of Scope

- Sprint 032 branded PDF/DOCX layout, logo placement in their final format-native documents and broad Office compatibility; Sprint 033 VS Code provider work; Sprint 034 end-to-end fixture construction and Lead Developer visual sign-off.
- Closing Sprint 029 native picker/quit and Sprint 030 editor exceptions by implication. Those open desktop items require separate evidence/remediation before full V0.5 feature acceptance; they do not block Sprint 031, which depends only on approved Sprint 028.
- New language/data/view kinds, chart semantics, remote images/fonts/styles/scripts, browser-print PDF fallback, UI-side filesystem/loader authority, pixel parity or formal WCAG/PDF/A/tagged-PDF claims.

## Constraints

- Use one evaluated document/final narrative environment/immutable view-emission order; never rerun module/input loading or evaluator for report branding. Trusted CLI and Bun desktop callers own canonical paths, configuration, assets and export checks. No adapter reads assets directly from HTML or webview context.
- Preserve validation-before-write and atomic destination behavior for CLI/desktop HTML/PDF/DOCX and existing named outputs. A malformed selected identity or asset must not replace any existing destination. Scope production changes to shared report/HTML/identity plumbing and required caller integration; no unrelated desktop/editor remediation.
- Preserve source-visible default (`sourceVisible: true`) and V0.2-V0.4 source/view order. Source hiding is presentation only, never a confidentiality guarantee. Leave inherited native platform/Hutch, broad Office, project license and Marketplace residuals explicitly OPEN unless separately verified.
