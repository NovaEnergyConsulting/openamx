import { describe, expect, it } from 'bun:test';
import { parseDocumentText } from '../src/parser/parseDocument';
import { createChartViewModel } from '../src/renderer/chartModel';
import { evaluateDocumentEnvironment } from '../src/runtime/evaluateDocument';
import type { ChartViewEmission } from '../src/runtime/environment';
import { effectiveReportAccent } from '../src/renderer/reportPreparation';

function capture(source: string): ChartViewEmission {
  const document = parseDocumentText(`\`\`\`amx\n${source}\n\`\`\``);
  const emission = evaluateDocumentEnvironment(document, 'chart-model.amx').viewEmissions[0];
  if (!emission || emission.kind !== 'chart') throw new Error('Expected chart emission');
  return emission;
}

function model(source: string, accent = '#146C94') {
  return createChartViewModel(capture(source), { accent });
}

describe('shared chart model', () => {
  it('keeps bar duplicates, negatives, nulls, and first-row-top order', () => {
    const chart = model(`type Item {\n  category: String\n  amount: Number?\n}\nlet items: Item[] = [\n  Item { category = "same", amount = -2 },\n  Item { category = "same", amount = 0 },\n  Item { category = "last", amount = null }\n]\nchart amounts = bar(items) {\n  title: "Amounts"\n  description: "Signed amounts"\n  category: category\n  series amount as "Amount"\n}\nshow amounts`);
    const option = chart.option as any;
    expect(option.yAxis.inverse).toBe(true);
    expect(option.yAxis.data).toEqual(chart.table.rows.map(row => row.id));
    expect(option.yAxis.axisLabel.formatter(option.yAxis.data[0])).toBe('same');
    expect(option.yAxis.axisLabel.formatter(option.yAxis.data[1])).toBe('same');
    expect(option.series[0].data).toEqual([-2, 0, null]);
    expect(chart.table.rows.map(row => row.values[0])).toEqual(['same', 'same', 'last']);
  });

  it('keeps scalar column labels, values, duplicates, and null gaps', () => {
    const chart = model(`let values: Number?[] = [0, -3, null]\nlet labels: String[] = ["repeat", "repeat", "last"]\nchart valuesChart = column(values) {\n  title: "Values"\n  description: "Scalar values"\n  series "Value"\n  labels: labels\n}\nshow valuesChart`);
    const option = chart.option as any;
    expect(option.xAxis.data.map((id: string) => option.xAxis.axisLabel.formatter(id))).toEqual(['repeat', 'repeat', 'last']);
    expect(option.series[0].data).toEqual([0, -3, null]);
    expect(chart.table.rows.map(row => row.values)).toEqual([['repeat', 0], ['repeat', -3], ['last', null]]);
  });

  it('uses ordered category positions for scalar line data', () => {
    const chart = model(`let values: Number?[] = [2, null, 1]
chart trend = line(values) {
  title: "Scalar line"
  description: "Index order"
  series "Value"
}
show trend`);
    const option = chart.option as any;
    expect(option.xAxis.type).toBe('category');
    expect(option.xAxis.data.map((id: string) => option.xAxis.axisLabel.formatter(id))).toEqual(['1', '2', '3']);
    expect(option.series[0].data).toEqual([[option.xAxis.data[0], 2], [option.xAxis.data[1], null], [option.xAxis.data[2], 1]]);
    expect(chart.dateTimePresentation).toBeUndefined();
  });

  it('preserves numeric line x order, duplicate coordinates, and null gaps', () => {
    const chart = model(`type Sample {\n  x: Number\n  y: Number?\n}\nlet samples: Sample[] = [\n  Sample { x = 3, y = 1 },\n  Sample { x = 1, y = null },\n  Sample { x = 1, y = 0 }\n]\nchart trend = line(samples) {\n  title: "Trend"\n  description: "Input-order trend"\n  x: x\n  series y as "Y"\n}\nshow trend`);
    const option = chart.option as any;
    expect(option.xAxis.type).toBe('value');
    expect(option.series[0].data).toEqual([[3, 1], [1, null], [1, 0]]);
    expect(option.series[0].connectNulls).toBe(false);
    expect(chart.table.rows.map(row => row.values)).toEqual([[3, 1], [1, null], [1, 0]]);
  });

  it('does not reinterpret captured measurement-display strings as DateTime x values', () => {
    const chart = model(`dimension Length
unit meter: Length
unit kilometer = 1000 * meter
type Sample {
  distance: Length
  amount: Number
}
let samples: Sample[] = [
  Sample { distance = 1 kilometer, amount = 2 },
  Sample { distance = 500 meter, amount = 3 }
]
chart trend = line(samples) {
  title: "Measured x"
  description: "Captured display strings"
  x: distance
  series amount as "Amount"
}
show trend`);
    const option = chart.option as any;
    expect(chart.table.rows.map(row => row.values[0])).toEqual(['1 kilometer', '500 meter']);
    expect(option.xAxis.type).toBe('category');
    expect(option.xAxis.data.map((id: string) => option.xAxis.axisLabel.formatter(id))).toEqual(['1 kilometer', '500 meter']);
    expect(option.series[0].data.map((point: unknown[]) => point[1])).toEqual([2, 3]);
    expect(chart.dateTimePresentation).toBeUndefined();
  });

  it('presents DateTime in UTC ISO while keeping captured source order', () => {
    const chart = model(`type Sample {\n  at: DateTime\n  value: Number?\n}\nlet samples: Sample[] = [\n  Sample { at = "2025-01-02T00:30:00+02:00", value = 1 },\n  Sample { at = "2025-01-01T22:30:00Z", value = null },\n  Sample { at = "2025-01-01T22:30:00Z", value = 2 }\n]\nchart trend = line(samples) {\n  title: "Timeline"\n  description: "Timestamp order"\n  x: at\n  series value as "Value"\n}\nshow trend`);
    const option = chart.option as any;
    expect(chart.dateTimePresentation).toBe('UTC ISO 8601');
    expect(option.xAxis.type).toBe('time');
    expect(option.xAxis.axisLabel.formatter('2025-01-02T00:30:00+02:00')).toBe('2025-01-01T22:30:00.000Z');
    expect(option.series[0].data).toEqual([
      ['2025-01-02T00:30:00+02:00', 1],
      ['2025-01-01T22:30:00Z', null],
      ['2025-01-01T22:30:00Z', 2]
    ]);
    const tooltip = option.tooltip.formatter([{
      seriesName: 'Value',
      axisValue: '2025-01-02T00:30:00+02:00',
      value: ['2025-01-02T00:30:00+02:00', 1]
    }]);
    expect(tooltip).toContain('2025-01-01T22:30:00.000Z');
    expect(chart.tooltip.dateTimePresentation).toBe('UTC ISO 8601');
  });

  it('groups scatter in first-seen order and retains null-coordinate rows in the table', () => {
    const chart = model(`type Sample {\n  x: Number?\n  y: Number?\n  group: String\n}\nlet samples: Sample[] = [\n  Sample { x = 1, y = 2, group = "B" },\n  Sample { x = null, y = 4, group = "A" },\n  Sample { x = 1, y = 2, group = "B" },\n  Sample { x = 5, y = null, group = "A" }\n]\nchart points = scatter(samples) {\n  title: "Points"\n  description: "Grouped points"\n  x: x\n  y: y\n  group: group\n}\nshow points`);
    const option = chart.option as any;
    expect(option.series.map((series: any) => series.name)).toEqual(['B', 'A']);
    expect(option.series.map((series: any) => series.data)).toEqual([[[1, 2], [1, 2]], []]);
    expect(chart.plottedPointCount).toBe(2);
    expect(chart.table.rows.map(row => row.values)).toEqual([[1, 2, 'B'], [null, 4, 'A'], [1, 2, 'B'], [5, null, 'A']]);
  });

  it('assigns independent normalized measurement axes and preserves unit metadata', () => {
    const chart = model(`dimension Length\nunit meter: Length\nunit kilometer = 1000 * meter\ntype Sample {\n  category: String\n  distance: Length?\n  height: Length?\n}\nlet samples: Sample[] = [\n  Sample { category = "A", distance = 1 kilometer, height = 500 meter },\n  Sample { category = "B", distance = 500 meter, height = 1 kilometer }\n]\nchart amounts = column(samples) {\n  title: "Measurements"\n  description: "Independent display units"\n  category: category\n  series distance as "Distance"\n  series height as "Height"\n}\nshow amounts`);
    const option = chart.option as any;
    expect(chart.axes.map(axis => [axis.name, axis.unit?.text])).toEqual([['kilometer', 'kilometer'], ['meter', 'meter']]);
    expect(option.yAxis.map((axis: any) => axis.name)).toEqual(['kilometer', 'meter']);
    expect(option.series.map((series: any) => series.data)).toEqual([[1, 0.5], [500, 1000]]);
    expect(chart.series.map(series => series.unit?.text)).toEqual(['kilometer', 'meter']);
    const tooltip = option.tooltip.formatter([{
      seriesName: 'Distance', dataIndex: 0, axisValue: chart.table.rows[0].id, value: 1
    }]);
    expect(tooltip).toContain('Distance');
    expect(tooltip).toContain('1 kilometer');
  });

  it('keeps scatter x and y measurement units distinct in axes, headings, and tooltips', () => {
    const chart = model(`dimension Length\ndimension Time\nunit meter: Length\nunit kilometer = 1000 * meter\nunit second: Time\nunit hour = 3600 * second\ntype Sample {\n  x: Length?\n  y: Time?\n  group: String\n}\nlet samples: Sample[] = [\n  Sample { x = 1000 meter, y = 3600 second, group = "A" },\n  Sample { x = 2 kilometer, y = 1 hour, group = "A" }\n]\nchart points = scatter(samples) {\n  title: "Travel points"\n  description: "Independent units"\n  x: x\n  y: y\n  group: group\n}\nshow points`);
    const option = chart.option as any;
    expect(chart.axes.map(axis => [axis.role, axis.name])).toEqual([['x', 'meter'], ['y', 'second']]);
    expect(chart.table.headings).toEqual(['x (meter)', 'y (second)', 'group']);
    expect(option.xAxis.name).toBe('meter');
    expect(option.yAxis.name).toBe('second');
    const tooltip = option.tooltip.formatter({ seriesName: 'A', value: [1000, 3600] });
    expect(tooltip).toContain('1000 meter');
    expect(tooltip).toContain('3600 second');
  });

  it('retains all-null data without inventing a unit and links truthful summary to the full table', () => {
    const chart = model(`dimension Length\nunit meter: Length\ntype Sample {\n  category: String\n  distance: Length?\n}\nlet samples: Sample[] = [Sample { category = "A", distance = null }]\nchart amounts = bar(samples) {\n  title: "Empty measurements"\n  description: "No measured values"\n  category: category\n  series distance as "Distance"\n}\nshow amounts`);
    expect(chart.emptyState).toEqual({ label: 'No data' });
    expect(chart.plottedPointCount).toBe(0);
    expect(chart.table.headings).toEqual(['label', 'Distance']);
    expect(chart.table.rows[0].values).toEqual(['A', null]);
    expect(chart.axes).toEqual([{ id: 'x:unitless', role: 'x' }]);
    expect((chart.option as any).graphic.style.text).toBe('No data');
    expect(chart.accessibility.tableId).toBe(chart.table.id);
    expect(chart.accessibility.summary).toContain('1 source rows; 0 plotted points');
  });

  it('is stable and immutable with deterministic palette extension and contrast-safe accent fallback', () => {
    const source = `type Sample {\n  category: String\n  a: Number\n  b: Number\n  c: Number\n  d: Number\n  e: Number\n  f: Number\n}\nlet samples: Sample[] = [Sample { category = "A", a = 1, b = 2, c = 3, d = 4, e = 5, f = 6 }]\nchart amounts = column(samples) {\n  title: "Amounts"\n  description: "Six series"\n  category: category\n  series a as "A"\n  series b as "B"\n  series c as "C"\n  series d as "D"\n  series e as "E"\n  series f as "F"\n}\nshow amounts`;
    const emission = capture(source);
    const fallbackAccent = effectiveReportAccent('#FFFFFF');
    const first = createChartViewModel(emission, { accent: fallbackAccent });
    const second = createChartViewModel(emission, { accent: fallbackAccent });
    const colors = first.series.map(series => series.color);
    expect(colors.slice(0, 4)).toEqual(['#146c94', '#d97706', '#15803d', '#b42318']);
    expect(colors[4]).toBe(second.series[4].color);
    expect(new Set(colors).size).toBe(colors.length);
    expect((first.option as any).title.textStyle.color).toBe('#146C94');
    expect(first.series).toEqual(second.series);
    expect(first.table).toEqual(second.table);
    expect(JSON.stringify(first.option, (_key, value) => typeof value === 'function' ? '[Function]' : value))
      .toBe(JSON.stringify(second.option, (_key, value) => typeof value === 'function' ? '[Function]' : value));
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.option)).toBe(true);
    expect(Object.isFrozen(first.table.rows[0].values)).toBe(true);
    expect(Object.isFrozen(emission.data[0])).toBe(true);
  });
});
