# Sprint 119 Contract: Editors, Specification, Examples, and Migration

## VS Code TextMate Contract

The actual VS Code TextMate grammar remains the source for extension-host
syntax tokens. S119 verifies and, where needed, adds:

- `showTable` as `keyword.other.option.amx` within executable AMX blocks;
- `+`, `-`, `*`, `/`, and `^` as `keyword.operator.amx` in ordinary and unit
  declaration expressions;
- `PI` and `E` as `constant.language.amx` in affine unit declarations;
- unit names, numeric literals, parentheses, colon/equal punctuation, and chart
  option text under their existing stable scopes;
- no matching syntax token in narrative, ordinary Markdown fences, or inert code.

Existing chart title/description/field/series scopes and prior V0.18 nested
diagram tokenization remain. A grammar update is conditional on the host test:
if PI/E/operators already pass, preserve the rule and add only the missing
`showTable` scope/test coverage.

## Parser-Proven Shared Highlighting

`editorHighlightFacts` is the desktop/shared source. S119 adds facts by walking
AST nodes, never by scanning arbitrary chart/unit lines:

- for `chartShowTableOption`, emit the exact `showTable` token as `keyword` using
  the option source;
- traverse its expression with the normal expression walker so identifiers,
  literals, function names, fields, and operators retain exact ranges;
- for a `unitDeclaration` expression, emit declaration-expression operator
  tokens from the AST's `operatorSource` as `keyword` without changing values;
- PI/E remain reference/constant facts under the existing policy unless an
  established editor semantic distinguishes constants;
- preserve existing inert-fence behavior, LF/CRLF mapping, UTF-16 offsets,
  statement/option source order, and parser ownership.

A narrow AST operator highlight helper is preferred. A broad text regex over
`unit ...` or chart blocks is forbidden. If a new highlight `kind` is needed,
all shared RPC/UI types/styles/tests must be included in the exact file plan;
otherwise reuse `keyword` for option/operator tokens.

## Desktop and Formatting Contract

Desktop CodeMirror consumes shared highlights and renders `.amx-token-keyword`.
Applicable Vite UI coverage verifies:

- `showTable` appears as a keyword token;
- affine declaration `+`/`-` operator tokens and PI/E receive the approved
  shared presentation;
- invalid `showTable` or affine declaration source receives a diagnostic at the
  existing parser-proven line/token;
- formatting valid V0.19 source twice is stable and does not reorder chart
  options or rewrite expression text;
- no native-WebView/cross-platform claim is inferred from Vite-harness evidence.

Core formatter production is not expected to need a V19-specific rewrite. If a
focused test proves `showTable` or affine expression indentation instability,
the smallest formatter fix is allowed with an exact amendment; S119 does not
reorder options or canonicalize declaration algebra.

## V0.19 Specification Contract

Create `docs/language-spec-v0.19.md` as an additive document linking at least
V0.18, V0.16, V0.14, V0.13, and the README. It must specify:

1. `showTable <Boolean expression>` for bar/column/line/scatter; no colon;
   duplicate/non-Boolean/malformed behavior; ordinary environment; evaluation
   once per `show`; omitted false migration; actual omission in interactive/
   preview/PDF/DOCX and true compatibility.
2. Canonical affine unit formula $p=v\times scale+offset$; scale positive finite,
   offset finite; scalar-only/PI/E declaration rules; D115-04 offset `+/-`;
   D115-05 affine composition restrictions; aliases/imports.
3. Runtime conversion, equality/order, left-unit subtraction, rejected direct
   affine addition/scaling/multiplication/division/powers/roots, physical
   `sum`/`mean`, selected `min`/`max`, display `abs`/`round`/unary minus.
4. SI exports `celsius`, `fahrenheit`, `degC`, `degF`; invariant
   $0 C=32 F=273.15 K$.
5. Charts normalize compatible affine values physically while retaining first
   selected display unit; scalar/table/interpolation display intent remains.
6. External input/output remain `{ value, unit }`; atomic affine aliases are
   accepted and affine compound external-unit text is rejected.
7. Existing diagnostics by phase and no hidden/CSS-only/screen-reader-only table
   fallback.
8. Compatibility and exclusions: no exact arithmetic, interval/delta type,
   arbitrary affine composition, new external shape, release, deployment, or
   platform certification.
9. Migration instructions: add `showTable true` to a V0.18 chart whose table is
   intentionally retained; audit temperature/unit operations against affine
   restrictions; no automatic source migration is claimed.

Normative examples must be executable as supported source or clearly identified
as rejected examples/diagnostics. Historical specifications are links, not
edited V0.19 sections.

## README and Migration

README keeps the existing narrative but:

- updates “latest language additions” to mention V0.19 chart table visibility
  and affine temperature/offset units;
- links the V0.19 additive specification in the language navigation;
- links/characterizes updated Examples 05 and 07;
- states that V0.19 chart data tables are omitted by default unless
  `showTable true` or another Boolean expression resolves true.

The migration note must not imply CSS hiding, deprecation, automatic rewriting,
or release authority. It may be in the V0.19 specification and Example 07;
README may summarize and link rather than duplicate every rule.

## Example 05 Contract

Example 05 remains a runnable, self-contained learning guide with import closure
unchanged where practical. Add an executable affine section with locally
declared forms matching the standard SI library:

```amx
dimension ThermodynamicTemperature
unit kelvin: ThermodynamicTemperature
unit celsius = kelvin + 273.15
unit fahrenheit = (5 / 9) * kelvin + (273.15 - 160 / 9)
unit degC = celsius
unit degF = fahrenheit
```

Include PI/E declaration examples with visible units, for example a finite
scaled unit and a finite shifted offset, without inventing domain semantics.
Include conversions, equality at the conventional invariant, left-unit
subtraction, sum/mean physical aggregation, first-unit display, `min`/`max`, and
`abs`/`round` where useful.

Representative invalid operations are shown in an inert `text` fence and
explained: direct affine addition, multiplication/division, powers/roots, and
non-Boolean `showTable` are not required in this lesson if owned elsewhere.
Executable AMX must not contain the rejected operations. The narrative states
that the standard `libraries/si.amx` exports the same C/F/aliases.

Expected values and interpolation use stable exact cases or explicit tolerances
in tests. Update the lesson objective, prerequisite/support statement, expected
outcome, and README lesson description consistently.

## Example 07 Contract

Use four distinct chart declarations over the same existing valid scores so the
lesson remains deterministic:

- one chart with omitted `showTable` (table omitted);
- one with `showTable false` (table omitted);
- one with `showTable true` (table retained);
- one with a Boolean expression resolving true, and optionally a fixture that
  reassignment can resolve false in evaluation tests without changing the
  lesson's primary export result.

The displayed report explains that V0.18 tables were implicit and V0.19 requires
`showTable true` or a true expression to retain them. Expected output names,
score values, named JSON/CSV exports, navigation, and mappings remain stable.
Focused rendering evidence identifies each chart and asserts exact absence/
presence, not merely a table count over the whole document.

## Documentation/Example Test Contract

- Spec links resolve; no historical spec was modified.
- README and spec contain exact V0.19 feature/migration terms.
- Example 05 parses/checks/evaluates; expected affine values, display units, and
  SI metadata are asserted; formatting is idempotent; no import-closure break.
- Example 07 executes with lesson 06 inputs; exports retain existing results;
  HTML false charts have no table, true/dynamic true do; focused PDF/DOCX test may
  exercise the document or a smaller copied fixture with the same forms.
- Test status distinguishes parser/checker/runtime from actual output rendering.
