# Sprint 117 Blueprint: V0.19 Affine Declarations and Unit Metadata

## Approach

1. Recheck the accepted Sprint 115 disposition and D115-04, D115-05, D115-07,
   D115-08, D115-09; verify the accepted Sprint 116 closeout, exact execution
   commit, worktree state, preservation baseline, host/tools, and separate
   Sprint 117 authorization before source/test edits.
2. Add required `offset: number` to `UnitMetadata`. Set offset 0 for base units;
   resolve/store finite offset for derived units. No runtime `MeasurementUnit`
   field is added in S117.
3. Refactor `resolveUnitExpression` around two internal result kinds: a finite
   dimensionless scalar value and an affine unit transform. Preserve the
   existing dimension vector and `hasUnit` semantic as needed by neighboring
   code, but do not use the affine scale field to represent arbitrary negative
   or zero scalar intermediates without explicit scalar handling.
4. Resolve `PI` and `E` as declaration-local scalars equal to `Math.PI` and
   `Math.E`. User/imported value identifiers, forward names, calls, record
   access, Booleans, strings, lists, and other AST nodes remain unsupported in
   unit declarations.
5. Implement scalar arithmetic first: literals, constants, parentheses,
   unary numeric minus, `+`, `-`, `*`, `/`, and signed integer `^`. Require every
   scalar result to be finite. Permit negative/zero scalar intermediates because
   they can be valid offsets or participate in a scalar expression; validate
   positivity only when the scalar is used as a unit scale factor or denominator
   where required.
6. Implement affine/unit operators around the complete pair
   $(scale, offset)$. Add/subtract offsets under D115-04; scale/divide affine
   transforms under D115-05; preserve existing offset-zero compound dimensions
   and powers; reject nonzero-offset compound unit forms except identity power 1.
7. Store resolved metadata on local/exported units. Verify existing module and
   editor registries retain the exact metadata object values through aliases,
   exports, imports, and re-exports; update module/editor production only if a
   concrete test exposes copying/reconstruction that drops offset.
8. Add focused declaration, registry, alias, import/re-export, PI/E, finite,
   composition, cycle/source-order, linear-regression, and diagnostic tests.
9. Run the separately approved focused suite, no-emit typecheck, patch check,
   changed-path audit, and ID reconciliation. Request a separate disposition;
   Sprint 118 remains independently gated.

## Implementation Decisions

| ID | Topic | Proposed S117 disposition |
| --- | --- | --- |
| D117-01 | Metadata shape | `UnitMetadata.offset` is required. Base/current-linear units store 0; no optional/undefined offset survives checked registry construction. |
| D117-02 | Resolver representation | Dimensionless results are explicit scalar values, separate from affine unit results. This prevents intermediate negative/zero offsets from triggering unit-scale checks. |
| D117-03 | Parser boundary | Reuse ordinary parsed declaration expressions and existing unary minus. S117 does not add unary plus, general statements, or a declaration tokenizer/evaluator. |
| D117-04 | PI/E precedence | In a derived unit expression, identifiers `PI` and `E` resolve as built-in scalar constants before unit lookup. A user/imported ordinary binding is never folded. Existing non-declaration runtime resolution remains unchanged. |
| D117-05 | Scalar validation | Each scalar intermediate/final result must be finite. Zero/negative is legal as a scalar; positivity is required only for a unit's effective scale and for accepted scale multipliers/divisors. |
| D117-06 | Unit composition | Existing offset-zero unit multiplication/division/power remains compatible. A nonzero affine offset may only be scaled/divided by positive scalar, shifted by scalar, aliased, or raised to identity power 1. |
| D117-07 | Identity/name | Offset composition never changes unit identity, module identity, declaration name, vector identity, import visibility, or base-unit uniqueness. A new alias receives a new name/identity but copies transformation values. |
| D117-08 | Runtime staging | S117 does not add offset to `MeasurementUnit`, `unitFromMetadata`, conversions, external text, SI library, or measurement operations. Registry metadata may exist without runtime consumers until S118. |
| D117-09 | Diagnostics | Reuse AMX3008 for declaration/operator/finite conditions. Preserve existing module cycle AMX5003 and import/export failures; no new stable code is allocated. |

## Source Baseline To Verify

- `UnitMetadata` currently contains vector and positive scale only.
- `checkUnit` creates base units at scale 1 and resolves derived units through
  `resolveUnitExpression`; local/exported/imported maps retain metadata values.
- `parseDeclarationExpression` already uses the ordinary expression parser.
  Existing AST/operator support includes binary `+`, `-`, `*`, `/`, `^` and
  unary minus, so S117 does not require a grammar expansion.
- `resolveUnitExpression` currently treats numeric literals as positive scale
  factors and supports only offset-zero `*`, `/`, and signed integer powers.
- Runtime PI/E identifiers resolve separately in the evaluator; unit declaration
  resolution does not currently permit them.
- Module loader and editor module analysis copy `UnitMetadata` references into
  imported maps; a richer metadata record should preserve offsets automatically,
  but tests must prove it.
- Runtime `MeasurementUnit` and `unitFromMetadata` are scale/vector consumers.
  They must remain out of S117 so affine values are not silently applied before
  S118 centralizes physical conversion.

## Candidate File Plan

Core production candidates:

- `src/typechecker/dimensionTypes.ts`
- `src/typechecker/checkDocument.ts`

Focused test candidates:

- `tests/dimensions.test.ts`
- `tests/parser.test.ts` for parser-adjacent/source-location assertions only
- `tests/editor.test.ts` only if existing module-analysis coverage is better
  owned there than in `tests/dimensions.test.ts`
- `tests/modules.test.ts` only for a distinct loader graph/re-export case

Review-only candidates until demonstrated necessary:

- `src/runtime/moduleLoader.ts`
- `src/editor/moduleAnalysis.ts`
- `src/runtime/measurement.ts`
- `src/parser/parseStatements.ts`

No SI, runtime evaluation, conversion, external-data, chart, renderer, editor UI,
published spec/example, package, or release path is approved by this package.

## Verification Candidates

Run only exact commands separately approved. Expected focused commands are:

```text
bun test tests/dimensions.test.ts tests/parser.test.ts tests/editor.test.ts tests/modules.test.ts
bunx tsc --noEmit
git diff --check
git status --short
```

The selection may be narrowed to the exact changed tests after execution-plan
review. Verify scale/offset values, vectors, identity, diagnostics/source ranges,
all linear regressions, SI inventory unchanged, aliases/imports/re-exports,
editor metadata, no offset in runtime `MeasurementUnit`, and no SI declaration
change.

## Stop Conditions

- Any design that adds offset to runtime measurement/conversion behavior before
  S118 is a scope violation and must stop for amendment.
- Any parser change beyond the accepted ordinary declaration expression is a
  product-language change requiring Lead Developer disposition.
- Any loss of offset through aliases/imports or a need to reconstruct metadata
  outside the approved file plan requires exact scope amendment.
- Any need for a new diagnostic identity is blocking; this package does not
  allocate one.
- Any ambiguity that changes D115-04/D115-05/D115-07/D115-09 must return to the
  product owner before implementation continues.
