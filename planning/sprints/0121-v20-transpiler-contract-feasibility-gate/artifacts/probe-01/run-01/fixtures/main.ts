import { twice } from './helpers.ts';
import {
  amxAttach,
  amxChartView,
  amxConvert,
  amxDiagramView,
  amxEqual,
  requireAMXNumber,
  type AMXMeasurement,
  type AMXShownView,
  type AMXUnitDescriptor
} from 'openamx/transpiler-runtime';

export interface AMXRunInputs {
  readonly amount: number;
}

export interface AMXRunExports {
  readonly doubled: number;
  readonly inMeters: AMXMeasurement;
  readonly sameDistance: boolean;
}

export interface AMXRunResult {
  readonly exports: Readonly<AMXRunExports>;
  readonly views: readonly AMXShownView[];
}

const lengthVector = { Length: 1 } as const;
const meter: AMXUnitDescriptor = {
  identity: 'main.amx::meter',
  name: 'meter',
  scale: 1,
  offset: 0,
  vector: lengthVector
};
const kilometer: AMXUnitDescriptor = {
  identity: 'main.amx::kilometer',
  name: 'kilometer',
  scale: 1000,
  offset: 0,
  vector: lengthVector
};

export function run(inputs: AMXRunInputs): AMXRunResult {
  const amount = requireAMXNumber(inputs.amount, 'amount');
  const distance = amxAttach(1, kilometer);
  const inMeters = amxConvert(distance, meter);
  const views: AMXShownView[] = [
    amxChartView({
      name: 'sample',
      chartKind: 'column',
      title: 'Sample',
      description: 'Sample values',
      data: [2, 4],
      showTable: true
    }),
    amxDiagramView({
      name: 'empty',
      title: 'Empty',
      description: 'No authored elements',
      canvas: { width: 10, height: 10, coordinates: 'bottom-left-y-up' },
      timeline: { variable: 't', from: 0, to: 1, duration: 1 },
      initialFrame: { time: 0, elements: [] }
    })
  ];
  return {
    exports: {
      doubled: twice(amount),
      inMeters,
      sameDistance: amxEqual(distance, amxAttach(1000, meter))
    },
    views
  };
}