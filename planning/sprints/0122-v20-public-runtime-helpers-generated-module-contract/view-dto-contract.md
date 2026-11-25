# Sprint 122 Structured View and Run Result DTO Contract

## Status and Authority

Approved S122 type contract. Preserve accepted D121-04, D121-09, and D121-15:
results contain explicit entry exports; table/chart snapshots are captured by
`show`; diagrams are declaration-time emissions in a separate `kind`; all
views are ordered by module and source/evaluation position; diagrams do not
gain AMX `show` syntax. The product owner additionally approved a legacy
diagram schema alongside the structured generated-module schema on
2026-11-25.

## Run Result

Candidate helper-owned generic:

```ts
export interface AMXRunResult<TExports extends object> {
  readonly exports: Readonly<TExports>;
  readonly views: readonly AMXShownView[];
}
```

- Generated entry owns `AMXRunInputs` and `AMXRunExports`; helper owns
  `AMXRunResult<TExports>`, shared value/view types, and runtime constructors.
- Each `run(inputs)` call creates fresh state, validates first, executes
  synchronously, and returns a new result. An invalid input or runtime error
  returns no result object.
- `exports` contains only explicitly exported entry-module values. Names are
  original AMX keys even when internal generated TypeScript identifiers are
  mangled. Functions, types, and enums may be module exports for AMX imports
  but are not serialized into the entry exports object.
- `views` is readonly and preserves accepted module order, then source and
  evaluation order. Repeated `show` statements remain separate events.

## Shared Value DTOs

- `AMXViewData` is a recursively readonly JSON-like value: string, finite
  number, Boolean, null, arrays, and string-keyed records. Measurements in
  table/chart snapshots are represented by accepted display values plus
  separate measurement descriptors, not live internal `MeasurementValue`
  objects.
- Snapshot constructors detach nested arrays/records before deep-freezing.
  They must not freeze, mutate, or retain mutable references to caller-owned
  data. Cyclic values and unsupported objects fail with a documented AMX
  runtime error rather than stack overflow.
- View IDs/source locations are not renderer identities and must not expose
  ECharts, accessibility-model, report-preparation, DOM, or file-path internals.

## Table DTO

```ts
export interface AMXTableView {
  readonly kind: 'table';
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly columns: readonly { readonly field: string; readonly label: string }[];
  readonly rows: readonly (readonly AMXViewData[])[];
}
```

Preserve declaration order, selected column order, row order, null placement,
and the AMX snapshot at each executed `show`. Unselected source record fields
are omitted if that is the current table emission contract. S122 tests exact
column/row data and snapshot independence after later mutation.

## Diagram DTOs and Compatibility

`AMXDiagramView` retains the S121 legacy type name and shape. Its optional
`schema` property preserves source compatibility for old typed object literals;
the S122 constructor returns the tagged `AMXLegacyDiagramView` with
`schema: 'legacy-v1'`. Structured generated modules use the distinct
`AMXStructuredDiagramView` with `schema: 'structured-v2'`. Both have
`kind: 'diagram'`; `AMXShownView` includes both, and returned DTOs narrow by
`schema`. There is no implicit or lossy conversion between schemas.

```ts
export interface AMXLegacyDiagramElement {
  readonly type: string;
  readonly name: string;
  readonly properties: Readonly<Record<string, AMXViewData>>;
}

export interface AMXDiagramView {
  readonly kind: 'diagram';
  readonly schema?: 'legacy-v1';
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly canvas: Readonly<{ width: number; height: number; coordinates: 'bottom-left-y-up' }>;
  readonly timeline: Readonly<{ variable: string; from: number; to: number; duration: number }>;
  readonly initialFrame: Readonly<{ time: number; elements: readonly AMXLegacyDiagramElement[] }>;
}

export interface AMXLegacyDiagramView extends AMXDiagramView {
  readonly schema: 'legacy-v1';
}

export type AMXDiagramPrimitiveElement =
  | { readonly primitive: 'line'; readonly name: string; readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number; readonly stroke: string; readonly lineWidth: number; readonly arrow: 'none' | 'start' | 'end' | 'both' }
  | { readonly primitive: 'rectangle'; readonly name: string; readonly x: number; readonly y: number; readonly width: number; readonly height: number; readonly stroke: string; readonly fill?: string; readonly lineWidth: number }
  | { readonly primitive: 'circle'; readonly name: string; readonly cx: number; readonly cy: number; readonly r: number; readonly stroke: string; readonly fill?: string; readonly lineWidth: number }
  | { readonly primitive: 'text'; readonly name: string; readonly x: number; readonly y: number; readonly value: string; readonly fill: string };

export interface AMXStructuredDiagramView {
  readonly kind: 'diagram';
  readonly schema: 'structured-v2';
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly canvas: Readonly<{ width: number; height: number; coordinates: 'bottom-left-y-up' }>;
  readonly timeline: Readonly<{ variable: string; from: number; to: number; duration: number }>;
  readonly initialFrame: Readonly<{ time: number; elements: readonly AMXDiagramPrimitiveElement[] }>;
}

export type AMXShownView = AMXTableView | AMXChartView | AMXDiagramView | AMXStructuredDiagramView;
```

The legacy constructor overload retains the S121 input signature and adds only
the tagged runtime `schema` property. The structured overload requires the
closed primitive union; it never exposes renderer models or private scene data.

## Chart DTO

```ts
interface AMXChartView {
  readonly kind: 'chart';
  readonly name: string;
  readonly chartKind: 'bar' | 'column' | 'line' | 'scatter';
  readonly title: string;
  readonly description: string;
  readonly data: readonly AMXViewData[];
  readonly labels?: readonly string[];
  readonly headings?: readonly string[];
  readonly measurementDescriptors?: readonly AMXChartMeasurementDescriptor[];
  readonly showTable: boolean;
}
```

Each measurement descriptor carries role (`series`, `x`, or `y`), optional
source field, display label, and the accepted display-unit descriptor (`text`,
`scale`, dimension vector, and unit factors). Chart data is already normalized
to the selected display unit by AMX evaluation; helper constructors do not
renormalize it. `showTable: false` retains structured chart data but indicates
no table representation is selected in the view DTO; the DTO never includes
renderer markup or an alternate hidden table payload.

The exact field set is reconciled against `ChartViewEmission` and the S121
accepted parity fixture. Any added field must preserve renderer independence
and be covered by a compatibility test.

## Declaration-Time Diagram DTO

`AMXStructuredDiagramView` represents the current declaration-time scene and
initial frame. It does not embed `DiagramDeclarationNode`, captured
`Environment`, WeakMap state, serialized private envelopes, playback
controllers, or renderer payloads.
Recursive loop/conditional membership and source ordering must match the
current AMX model's initial frame. A missing/unsupported primitive is a
contract failure, not an omitted diagram event.

## Ordering and Snapshot Fixtures

- Imported module diagram emissions are ordered according to the accepted
  module traversal order relative to entry-module table/chart `show` events.
- Two `show` statements around a reassignment produce two snapshots with the
  values at each evaluation point.
- A declaration-time diagram appears even without `show`; a table/chart
  declaration does not appear unless executed by `show`.
- Source ordering ties are stable: module order, document node order, then
  statement order. Preserve identity only when it is part of the accepted
  public DTO, not by exposing internal node indexes.