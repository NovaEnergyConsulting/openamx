# Sprint 072 Acceptance Criteria

Sprint 072 is complete when the three contract artifacts are complete, internally consistent, and traceable to the confirmed V0.12 master plan. No product feature is implemented or claimed as verified by this sprint.

## Contract Artifacts

- `grammar-examples.md` contains self-contained, labeled valid and invalid examples for record inheritance, enums, and braced `if` expressions/statements.
- `diagnostic-matrix.md` maps each invalid example to an expected diagnostic category and exact primary range in the original source; secondary ranges are recorded where needed to identify the conflicting declaration or branch.
- `requirement-test-matrix.md` traces every applicable requirement in the V0.12 master plan to one or more case IDs, explicit expected results, and an owning test suite/sprint.
- The three artifacts use the same stable case IDs and agree on source text, expected validity, diagnostic expectations, and ownership.

## Required Coverage

- Record inheritance covers single, multiple, and transitive parents; inherited-name collisions including same-type collisions; required, missing, and unnecessary `override`; valid type/optionality/default replacement; unknown, forward, non-record, and cyclic parents; effective child construction; module visibility; and rejection of child-to-parent assignment.
- Enums cover implicit values starting at 1; explicit homogeneous Number and String literals; unique names and values; empty/duplicate names; mixed primitive types; missing values in a partially explicit enum; expression-valued members; underlying primitive member results; and module/source-order behavior.
- Braced `if` covers expression and statement forms; required expression `else` and optional statement `else`; explicit value returns on every possible expression path; rejection of missing-return paths; expression-local return behavior; branch-local `let` declarations; persistent assignment to existing outer bindings; nested branches; Boolean condition checking; branch type compatibility; and selected-branch-only evaluation.
- The existing single-line `if condition then value else value` form is explicitly retained and has regression expectations.
- Formatting expectations cover valid declarations and blocks, formatting stability/idempotence, and preservation of existing syntax behavior.
- Module fixtures make visibility and source-order expectations explicit for inherited types and enums, including imports and exports; diagnostics identify source locations in the importing/declaring document as applicable.

## Readiness and Boundaries

- Every relevant master-plan bullet is mapped; no feature or support requirement is silently omitted.
- Source coordinates follow the existing 1-based, original-document, UTF-16-code-unit convention.
- Diagnostic IDs/messages follow established project conventions. Any new code allocation or semantic choice not authorized by the plan is explicitly identified for decision rather than assumed.
- Any unresolved semantic decision that could affect Sprints 073-075 is captured in `planning/questions.md` and clearly marked as blocking the affected requirement.
- The repository changes for this sprint are planning/contract documentation only. There are no production changes, feature-test failures, or claims that V0.12 behavior is implemented.
- Sprint 072 completion does not authorize feature implementation beyond the separately planned dependent sprints, publication, or release.
