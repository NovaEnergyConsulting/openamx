# Sprint 120 Closeout Contract

## Evidence and Disposition Separation

Sprint 120 produces four distinct records for every gate:

1. **Raw status:** PASS, FAIL, BLOCKED/UNAVAILABLE, or NOT RUN.
2. **Builder interpretation:** factual result, coverage, risk, and recommendation.
3. **Residual:** named condition, owner, downstream/scope impact, and evidence.
4. **Product-owner disposition:** accepted/closed, accepted with residuals, or
   blocked/open, recorded separately by date and authority.

Raw failure/unavailable evidence is never rewritten by an owner acceptance.
A V0.19-specific subtest pass does not convert a full host aggregate failure.

## V0.19 Feature Contract

### Chart Stream

Integrated evidence must prove the complete chain:

1. `showTable` AST retains expression/source;
2. parser accepts all chart kinds and rejects malformed/duplicate/table misuse;
3. checker enforces Boolean expression and ordinary diagnostics;
4. evaluation resolves one Boolean per `show` snapshot;
5. chart emission/model carries explicit Boolean;
6. HTML/browser JSON/ARIA, PDF, and DOCX omit false tables and preserve true tables;
7. four-state Example 07 output and migration text match the accepted contract.

### Affine Stream

Integrated evidence must prove:

1. registry metadata contains finite scale/offset and PI/E resolution;
2. aliases/imports/re-exports/editor module metadata preserve the transform;
3. runtime unit/physical/display helpers use offset;
4. conversion, comparison, subtraction, rejected direct affine operations,
   physical aggregates, min/max, abs/round/unary display behavior work;
5. chart normalization retains selected unit/labels/null/source behavior;
6. external input/output remains `{ value, unit }`;
7. SI exports are 16 dimensions/50 units with `celsius`, `fahrenheit`, `degC`,
   `degF` and accepted transforms;
8. Example 05/spec/editor/formatter presentation matches the runtime contract.

## Residual Handling

The known Sprint 119 residual entering S120 is the full VS Code extension-host
aggregate: 20 pass/9 fail on unrelated Windows temporary-directory `EBUSY`
cleanup and drive-letter/path-case comparisons. V0.19 grammar, formatting, and
diagnostic host cases pass independently.

S120 must:

- rerun the exact configured host command under the approved environment;
- preserve exact new aggregate, V0.19 row outcomes, and failure signatures;
- retain the residual if unchanged unless direct evidence and a separate owner
  disposition resolve it;
- not promote a Vite/desktop/editor unit pass or V0.19 subset to a full extension
  host PASS.

Other possible raw gates:

- broad root unrelated failure;
- desktop Hutch/typecheck/UI/native unavailability;
- native WebView/cross-platform unavailability;
- generated-runtime/build hash difference;
- artifact output/table inspection failure;
- historical V0.18 residual outside V0.19 scope.

Each is recorded with owner and impact. A V0.18 residual is not silently imported
as a V0.19 product defect; an environment/harness failure affecting V0.19
verification may still remain a V0.19 evidence residual.

## Release and Publication Boundary

Sprint 120 may recommend V0.19 integrated acceptance/closeout only. It does not:

- prepare or publish GitHub/npm/VS Code releases;
- change `package.json`, desktop extension/package versions, lockfiles, or tags;
- sign/build/publish installers, VSIX packages, desktop binaries, or CLI
  artifacts for distribution;
- deploy, submit Marketplace/registry content, or claim platform support;
- perform or certify native/cross-platform behavior unless separately authorized.

Any request to do those actions requires a distinct release plan and approval.
The master plan's explicit closeout non-authorization is repeated in acceptance,
evidence, and final disposition.

## Recommendation Sufficiency

A closeout recommendation must state:

- complete chart and affine requirement coverage or exact missing scope;
- focused/broad/root build/typecheck results;
- full extension aggregate plus V0.19 subset;
- desktop typecheck/UI/harness/native classifications;
- HTML/PDF/DOCX output truth and artifact hashes;
- Examples 05/07 results and spec/README migration review;
- named residuals, raw status, owner, and separate owner disposition;
- no release/package/platform action.

Acceptance with residuals is a product-owner decision, not a Builder shortcut.
