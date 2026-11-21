# Sprint 117 Affine Declaration Test Matrix

## Status and Scope

Architect-prepared execution matrix. All rows are NOT RUN during preparation.
The 22 Sprint 115 declaration cases assigned to S117 retain their stable IDs.
S117-specific IDs cover internal scalar, registry, staging, and integration
assertions not represented as separate product fixtures.

Runtime conversion, arithmetic, aggregate, SI library, chart normalization,
external unit parsing, renderer, and published-documentation cases remain
Sprint 118 or later and must not be reported as S117 PASS.

## Accepted Declaration Cases

| Case ID | Input/condition | Expected registry/diagnostic result | Owner evidence |
| --- | --- | --- | --- |
| AFF-LINEAR-01 | Existing `centimeter = 0.01 * meter` and all SI scale-only units | Same identity/vector/scale; offset exactly 0 | checker/registry regression |
| AFF-DECL-CEL-01 | `unit celsius = kelvin + 273.15` | Scale 1, offset 273.15, ThermodynamicTemperature vector | checker/registry |
| AFF-DECL-FHR-01 | Canonical `fahrenheit = (5 / 9) * kelvin + (273.15 - 160 / 9)` | Scale $5/9$, offset $273.15-160/9$ | checker/registry |
| AFF-ALIAS-01 | `degC = celsius`, `degF = fahrenheit` | Alias name/identity is new; vector/scale/offset copied exactly | checker/registry |
| AFF-IMPORT-01 | Export/import/re-export affine units | Offset/scale/vector/unit identity survive runtime and editor module maps | module/editor integration |
| AFF-PRECEDENCE-01 | `2 * kelvin / 4 + PI` and parenthesized equivalent | Scale 0.5, offset `Math.PI`; ordinary operator precedence retained | parser/checker/registry |
| AFF-PI-01 | PI in a scale expression | `Math.PI` scalar resolution; unit scale finite positive | checker |
| AFF-E-01 | E in an offset expression | `Math.E` offset; no environment constant folding | checker |
| AFF-USER-CONST-01 | User Number binding used as declaration scalar | AMX3008 unknown/not-yet-declared unit at identifier | checker diagnostic |
| AFF-IMPORTED-CONST-01 | Imported ordinary Number used in declaration | AMX3008; no binding value folded | module/checker diagnostic |
| AFF-FORWARD-01 | Later unit referenced | Existing AMX3008 at forward identifier | checker diagnostic |
| AFF-CALL-01 | Function call in declaration expression | AMX3008 unsupported expression; no function execution | checker diagnostic |
| AFF-TWO-UNIT-ADD-01 | `meter + second`, `kelvin + celsius` | AMX3008 at declaration `+`/`-`; incompatible/two-unit form rejected | checker diagnostic |
| AFF-REVERSE-SUB-01 | `273.15 - kelvin` | AMX3008 at `-`; unit term must be left | checker diagnostic |
| AFF-SCALE-ZERO-01 | `0 * meter` or equivalent zero effective scale | AMX3008 scale positive rule | checker diagnostic |
| AFF-SCALE-NEG-01 | `-1 * meter` | AMX3008 scale positive rule | checker diagnostic |
| AFF-SCALE-INF-01 | Overflowing scale/power | AMX3008 finite-positive scale | checker diagnostic |
| AFF-OFFSET-INF-01 | Overflowing offset expression | AMX3008 finite offset | checker diagnostic |
| AFF-CYCLE-01 | Local/import module cycle reaches unit graph | Preserve AMX5003 module cycle behavior | module integration |
| AFF-DIM-01 | Unsupported/incompatible dimension combination for accepted operator | AMX3008 at operator; no vector coercion | checker diagnostic |
| AFF-COMPOUND-01 | `celsius / second`, `2 / celsius`, `celsius ^ 2` | AMX3008 affine compound prohibition | checker diagnostic |
| AFF-POWER-IDENTITY-01 | `celsius ^ 1` | Vector/scale/offset preserved | checker/registry |

## S117 Scalar, Metadata, and Staging Cases

| Case ID | Input/assertion | Expected S117 result | Owner |
| --- | --- | --- | --- |
| S117-SCALAR-01 | `meter + (273.15 - 300)` | Offset -26.85; intermediate negative scalar accepted | checker/registry |
| S117-SCALAR-02 | `2 - 3` nested before a unit addition/multiplication context | Scalar branch permits zero/negative intermediate when finite and final form valid | checker |
| S117-SCALAR-NONFINITE-01 | `1 / 0` or arithmetic overflow before unit use | AMX3008 scalar finite/denominator diagnostic; no Infinity/NaN offset | checker |
| S117-SCALAR-ONLY-01 | `unit invalid = PI` / scalar expression | AMX3008 derived unit must reference a visible unit | checker |
| S117-POWER-01 | Non-integer/dynamic exponent or dimension-exponent overflow | AMX3008 existing exponent/range diagnostic at exponent/operator | checker |
| S117-AFFINE-SCALE-01 | `2 * celsius` and `celsius / 2` in declarations | Scale and offset both transformed: $(2s,2o)$ and $(s/2,o/2)$ | checker/registry |
| S117-LINEAR-COMPOUND-01 | Existing `meter / second`, `meter ^ 2`, `2 / second` scale-only forms | Existing vectors/scales preserved; offset remains 0 | checker regression |
| S117-BASE-01 | Base `unit kelvin: ThermodynamicTemperature` | `(scale, offset) = (1, 0)` and base registry entry retained | checker/registry |
| S117-METADATA-01 | Checked all units are inspected | Every UnitMetadata object has finite number `offset`; no optional undefined | checker/registry |
| S117-NAME-01 | Alias a nonzero-offset unit | Alias gets own name/identity/source while copied transform remains equal | registry |
| S117-SOURCE-01 | Invalid affine `+`, `^`, and offset-overflow fixtures | Primary code/range at operator/operand with complete declaration secondary source where available | diagnostics |
| S117-EDITOR-01 | Editor module analysis imports affine unit | Imported/check-result unit metadata has same scale/offset/identity as runtime loader | editor/module integration |
| S117-REEXPORT-01 | Intermediate module re-exports affine unit | Entry sees exact complete metadata; base vector identity unchanged | module integration |
| S117-NORUNTIME-01 | Registry-only affine declaration | No test evaluates measurement conversion/arithmetic; runtime `MeasurementUnit` shape remains unchanged | scope audit |
| S117-NOSI-01 | Current `libraries/si.amx` inventory | Exact declaration inventory/scales remain V0.18; no Celsius/Fahrenheit added | regression scope |

## Complete Registry Fixture

````text
# Sprint 117 affine metadata fixture

```amx
dimension ThermodynamicTemperature
unit kelvin: ThermodynamicTemperature
unit celsius = kelvin + 273.15
unit fahrenheit = (5 / 9) * kelvin + (273.15 - 160 / 9)
unit degC = celsius
unit scaledCelsius = 2 * celsius
unit halfCelsius = celsius / 2
unit piKelvin = kelvin + PI
unit eKelvin = E * kelvin
```
````

Expected registry assertions:

- `kelvin`: scale 1, offset 0;
- `celsius` and `degC`: scale 1, offset 273.15;
- `fahrenheit`: scale $5/9$, offset $273.15-160/9$;
- `scaledCelsius`: scale 2, offset 546.3;
- `halfCelsius`: scale 0.5, offset 136.575;
- `piKelvin`: scale 1, offset `Math.PI`;
- `eKelvin`: scale `Math.E`, offset 0.

No measurement attachment, runtime conversion, or SI import is required to
qualify this registry fixture.

## Complete Import/Re-Export Fixture

Library:

```amx
export dimension Temperature
export unit kelvin: Temperature
export unit celsius = kelvin + 273.15
```

Bridge:

```amx
import { Temperature, kelvin, celsius } from "./temperature.amx"
export { Temperature, kelvin, celsius }
```

Entry:

```amx
import { Temperature, kelvin, celsius } from "./bridge.amx"
unit degC = celsius
```

Expected: runtime loader and editor analysis expose the same unit identity,
scale, offset, vector, and module metadata for Celsius; `degC` receives copied
affine transform values.

## Diagnostic Fixtures

Use complete AMX envelopes for exact S117 evidence. Representative invalid
forms include:

```amx
dimension Temperature
unit kelvin: Temperature
unit invalid = kelvin + kelvin
```

```amx
dimension Temperature
unit kelvin: Temperature
unit invalid = 273.15 - kelvin
```

```amx
dimension Temperature
dimension Time
unit kelvin: Temperature
unit second: Time
unit invalid = (kelvin + 273.15) / second
```

Expected all three: AMX3008 at the combining `+`, `-`, or `/` operator under the
accepted affine eligibility messages. Source coordinates are recorded by the
Builder after production fixtures exist; planning prose is not evidence.

## Master-Plan Traceability

| Sprint 117 master-plan bullet | Case coverage | Required closeout status |
| --- | --- | --- |
| Extend UnitMetadata scale/offset | S117-BASE-01, S117-METADATA-01, AFF-LINEAR-01 | Focused registry/typecheck evidence |
| Resolve affine addition/subtraction/composition | AFF-DECL-*, AFF-PRECEDENCE-01, AFF-TWO-UNIT-ADD-01, AFF-REVERSE-SUB-01, S117-AFFINE-SCALE-01 | Executed positive/negative checker evidence |
| Resolve PI/E only statically | AFF-PI-01, AFF-E-01, AFF-USER-CONST-01, AFF-IMPORTED-CONST-01, AFF-CALL-01 | Executed declaration checker evidence |
| Preserve linear/alias/import/export identity | AFF-LINEAR-01, AFF-ALIAS-01, AFF-IMPORT-01, S117-NAME-01, S117-REEXPORT-01, S117-EDITOR-01 | Executed registry/module/editor evidence |
| Validate composition, cycles, dimensions, finite values | AFF-SCALE-*, AFF-OFFSET-INF-01, AFF-CYCLE-01, AFF-DIM-01, AFF-COMPOUND-01, S117-SCALAR-NONFINITE-01 | Executed diagnostics and module evidence |
| Carry affine metadata registry | S117-METADATA-01 and all alias/import cases | Executed registry evidence |
| Add parser/checker/registry/import/diagnostic tests | Complete matrix | Focused suite output and exact ranges |
| Do not broaden runtime operations | S117-NORUNTIME-01, S117-NOSI-01 | Scope audit and explicit NOT RUN S118 rows |
