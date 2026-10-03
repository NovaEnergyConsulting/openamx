# OpenAMX V0.7 Follow-up Requirements

## Status

Candidate requirements carried forward from the Lead Developer's V0.6 closeout on 2026-10-03. V0.6 is complete and approved for release with accepted exceptions; these items do not reopen Sprint 043 or modify the V0.6 master plan. Prioritize and scope them during V0.7 planning. No V0.7 release version or schedule is implied.

## Integrated Evidence

- Provide a repeatable isolated end-to-end project fixture with a recorded fixture/artifact hash and per-transition results for unsaved multi-module imports, logical and external data, settings precedence, editor refactoring, CSV/JSON editing, preview/cancel, all five output formats, conflicts, trash, recovery, stale-result rejection, and injected no-write failures.

## Data-Editor and Performance

- Verify cancellation or supersession of a mounted 100,000-row grid edit/parse, including bounded acknowledgement, stale-result rejection, cleanup, and preservation of current data.
- Measure representative integrated background analysis, validation, and export main-thread long tasks independently of the 100,000-row grid timing policy.
- Retain the descriptive 100,000-row measurements and verify full-range access, lossless editing/history, and exact bounded fallback under representative target environments. The V0.6 timing decision does not establish new numeric gates.

## UX and Accessibility

- Complete the remaining keyboard, focus restoration/trapping, contrast, dialog/drawer, dense/error/conflict/recovery visual-state review with the actual viewer, OS/session, and per-state outcomes recorded.
- Assess formal accessibility and screen-reader coverage as a separate scoped requirement; do not infer certification from V0.6 browser review.

## Platform and Release Engineering

- Exercise package, launch, and core workflows directly on named native macOS, Windows, and Ubuntu targets, including Hutch reliability. Record target versions and results; browser, service, and WSL evidence are not substitutes.
- Decide and record project licensing and Marketplace publication status before making publication claims.
- Complete named Office viewer compatibility round trips for the supported report formats and document limitations.

## Deferred Product Issues

- Review and remediate V0.5 source-visible report mobile overflow.
- Improve VS Code code-action safety for edits that become stale after action resolution, within the guarantees supported by the VS Code API.
