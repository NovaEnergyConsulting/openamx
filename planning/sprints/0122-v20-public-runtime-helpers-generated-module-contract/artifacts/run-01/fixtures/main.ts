import {
  AMXInputError,
  amxAttach,
  amxBinary,
  amxBuiltin,
  amxChartView,
  amxConvert,
  amxDiagramView,
  amxFormatValue,
  amxTableView,
  requireAMXRecord,
  validateAMXValue
} from 'openamx/transpiler-runtime';
import type {
  AMXDiagramView,
  AMXInputDescriptor,
  AMXMeasurement,
  AMXMeasurementInput,
  AMXRunResult,
  AMXShownView,
  AMXUnitDescriptor
} from 'openamx/transpiler-runtime';

const s121DiagramTypeCheck: AMXDiagramView = {
  kind: 'diagram', name: 'legacy', title: 'Legacy', description: '',
  canvas: { width: 10, height: 10, coordinates: 'bottom-left-y-up' },
  timeline: { variable: 'time', from: 0, to: 1, duration: 1 },
  initialFrame: { time: 0, elements: [{ type: 'legacy-point', name: 'p', properties: { x: 1 } }] }
};

export type Status = 'ready' | 'failed';
export type Priority = 1 | 2;

export interface AMXRowInput {
  readonly status: Status;
  readonly priority: Priority;
  readonly amount: number;
  readonly tag?: string;
  readonly note?: string | null;
}

export interface AMXRunInputs {
  readonly amount: number;
  readonly status: Status;
  readonly priority: Priority;
  readonly distance: AMXMeasurementInput<'Length'>;
  readonly rows: readonly AMXRowInput[];
}

interface AMXRow {
  readonly status: Status;
  readonly priority: Priority;
  readonly amount: number;
  readonly tag: string;
  readonly note: string | null;
}

interface RuntimeInputs {
  readonly amount: number;
  readonly status: Status;
  readonly priority: Priority;
  readonly distance: AMXMeasurement<'Length'>;
  readonly rows: readonly AMXRow[];
}

export interface AMXRunExports {
  readonly total: number;
  readonly status: Status;
  readonly priority: Priority;
  readonly distanceMeters: AMXMeasurement<'Length'>;
  readonly temperatureDelta: AMXMeasurement<'ThermodynamicTemperature'>;
  readonly distanceText: string;
}

const meter: AMXUnitDescriptor<'Length'> = {
  identity: 'meter', name: 'meter', scale: 1, offset: 0,
  vector: { Length: 1 },
  factors: [{ identity: 'meter', name: 'meter', exponent: 1 }]
};

const kilometer: AMXUnitDescriptor<'Length'> = {
  identity: 'kilometer', name: 'kilometer', scale: 1000, offset: 0,
  vector: { Length: 1 },
  factors: [{ identity: 'kilometer', name: 'kilometer', exponent: 1 }]
};

const celsius: AMXUnitDescriptor<'ThermodynamicTemperature'> = {
  identity: 'celsius', name: 'celsius', scale: 1, offset: 273.15,
  vector: { ThermodynamicTemperature: 1 },
  factors: [{ identity: 'celsius', name: 'celsius', exponent: 1 }]
};

const statusDescriptor: AMXInputDescriptor<Status> = {
  kind: 'enum', enumName: 'Status', members: ['ready', 'failed']
};

const priorityDescriptor: AMXInputDescriptor<Priority> = {
  kind: 'enum', enumName: 'Priority', members: [1, 2]
};

const distanceDescriptor: AMXInputDescriptor<AMXMeasurement<'Length'>> = {
  kind: 'measurement', dimensionName: 'Length', dimensionVector: { Length: 1 },
  units: { meter, kilometer }
};

const rowsDescriptor: AMXInputDescriptor<readonly AMXRow[]> = {
  kind: 'list',
  element: {
    kind: 'record', recordName: 'Row', fields: [
      { name: 'status', descriptor: statusDescriptor },
      { name: 'priority', descriptor: priorityDescriptor },
      { name: 'amount', descriptor: { kind: 'number' } },
      { name: 'tag', descriptor: { kind: 'string' }, defaultValue: () => 'default' },
      { name: 'note', descriptor: { kind: 'nullable', value: { kind: 'string' } }, optional: true }
    ]
  }
};

const inputNames = ['amount', 'status', 'priority', 'distance', 'rows'] as const;

function normalizeInputs(value: unknown): RuntimeInputs {
  const record = requireAMXRecord(value, 'inputs', inputNames);
  for (const name of inputNames) {
    if (!Object.prototype.hasOwnProperty.call(record, name)) {
      throw new AMXInputError(name, 'required AMX input', 'missing');
    }
  }
  return {
    amount: validateAMXValue<number>(record.amount, { kind: 'number' }, { inputPath: 'amount', file: 'entry.amx' }),
    status: validateAMXValue(record.status, statusDescriptor, { inputPath: 'status', file: 'entry.amx' }),
    priority: validateAMXValue(record.priority, priorityDescriptor, { inputPath: 'priority', file: 'entry.amx' }),
    distance: validateAMXValue(record.distance, distanceDescriptor, { inputPath: 'distance', file: 'entry.amx' }),
    rows: validateAMXValue(record.rows, rowsDescriptor, { inputPath: 'rows', file: 'entry.amx' })
  };
}

export function run(inputs: AMXRunInputs): AMXRunResult<AMXRunExports> {
  const normalized = normalizeInputs(inputs);
  const rowTotal = amxBuiltin('sum', [normalized.rows.map(row => row.amount)]);
  const totalResult = amxBinary('+', normalized.amount, rowTotal);
  if (typeof totalResult !== 'number') throw new TypeError('Checked total expression did not produce a Number');

  const distanceMeters = amxConvert(normalized.distance, meter) as AMXMeasurement<'Length'>;
  const temperatureDelta = amxBinary(
    '-',
    amxAttach(20, celsius),
    amxAttach(10, celsius)
  ) as AMXMeasurement<'ThermodynamicTemperature'>;
  const distanceData = [
    amxConvert(normalized.distance, kilometer).value,
    amxConvert(amxAttach(500, meter), kilometer).value
  ];

  const table = amxTableView(
    'rowsTable',
    [
      { field: 'amount', label: 'Amount' },
      { field: 'tag', label: 'Tag' },
      { field: 'note', label: 'Note' }
    ],
    normalized.rows.map(row => [row.amount, row.tag, row.note]),
    'Input rows'
  );
  const chart = amxChartView({
    name: 'distanceChart', chartKind: 'line', title: 'Distance', description: 'Normalized measurements',
    data: distanceData, labels: ['input', 'comparison'],
    headings: ['label', 'Distance (kilometer)'],
    measurementDescriptors: [{ role: 'series', label: 'Distance', unit: {
      text: 'kilometer', scale: 1000, vector: { Length: 1 },
      factors: [{ identity: 'kilometer', name: 'kilometer', exponent: 1 }]
    } }],
    showTable: false
  });
  const diagram = amxDiagramView({
    schema: 'structured-v2', name: 'scene', title: 'Scene', description: 'Initial frame',
    canvas: { width: 100, height: 80, coordinates: 'bottom-left-y-up' },
    timeline: { variable: 'time', from: 0, to: 1, duration: 1 },
    initialFrame: { time: 0, elements: [
      { primitive: 'line', name: 'axis', x1: 0, y1: 0, x2: 10, y2: 10, stroke: '#111111', lineWidth: 1, arrow: 'none' },
      { primitive: 'rectangle', name: 'block', x: 2, y: 3, width: 4, height: 5, stroke: '#222222', fill: '#eeeeee', lineWidth: 1 },
      { primitive: 'circle', name: 'pivot', cx: 5, cy: 6, r: 2, stroke: '#333333', fill: '#ffffff', lineWidth: 1 },
      { primitive: 'text', name: 'label', x: 7, y: 8, value: 'AMX', fill: '#444444' }
    ] }
  });

  const exports: AMXRunExports = {
    total: totalResult,
    status: normalized.status,
    priority: normalized.priority,
    distanceMeters,
    temperatureDelta,
    distanceText: `Distance ${amxFormatValue(normalized.distance)}`
  };
  const views: readonly AMXShownView[] = [diagram, table, chart];
  return { exports: Object.freeze(exports), views: Object.freeze(views) };
}