import type { EChartsOption } from 'echarts';
import type { ChartDeclarationNode, ChartFieldOptionNode, ChartSeriesOptionNode } from '../ast/types';
import type { ChartMeasurementDescriptor, ChartMeasurementUnitDescriptor, ChartViewEmission, ViewDataValue } from '../runtime/environment';
import type { ResolvedReportIdentity } from './reportPreparation';

const SERIES_PALETTE = ['#146c94', '#d97706', '#15803d', '#b42318'] as const;
const NO_DATA_LABEL = 'No data';

export interface ChartTableRow {
  readonly id: string;
  readonly values: readonly ViewDataValue[];
}

export interface ChartTableModel {
  readonly id: string;
  readonly caption: string;
  readonly headings: readonly string[];
  readonly rows: readonly ChartTableRow[];
}

export interface ChartAxisModel {
  readonly id: string;
  readonly role: 'x' | 'y';
  readonly name?: string;
  readonly unit?: ChartMeasurementDescriptor['unit'];
}

export interface ChartSeriesModel {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly axisId?: string;
  readonly unit?: ChartMeasurementDescriptor['unit'];
}

export interface ChartAccessibilityModel {
  readonly role: 'img';
  readonly title: string;
  readonly description: string;
  readonly summary: string;
  readonly tableId: string;
}

export interface ChartTooltipModel {
  readonly trigger: 'axis' | 'item';
  readonly includesCategoryOrCoordinates: true;
  readonly includesSeriesOrGroup: true;
  readonly includesDisplayUnits: true;
  readonly dateTimePresentation?: 'UTC ISO 8601';
}

export interface ChartViewModel {
  readonly kind: ChartDeclarationNode['kind'];
  readonly title: string;
  readonly description: string;
  readonly dimensions: Readonly<{ width: 720; height: 360 }>;
  readonly option: EChartsOption;
  readonly table: ChartTableModel;
  readonly series: readonly ChartSeriesModel[];
  readonly axes: readonly ChartAxisModel[];
  readonly tooltip: ChartTooltipModel;
  readonly plottedPointCount: number;
  readonly accessibility: ChartAccessibilityModel;
  readonly emptyState?: Readonly<{ label: typeof NO_DATA_LABEL }>;
  readonly dateTimePresentation?: 'UTC ISO 8601';
}

interface ChartRow {
  readonly id: string;
  readonly source: ViewDataValue;
  readonly label: ViewDataValue;
  readonly x: ViewDataValue;
  readonly group: ViewDataValue;
}

export function createChartViewModel(
  emission: ChartViewEmission,
  identity: Pick<ResolvedReportIdentity, 'accent'>
): ChartViewModel {
  const declaration = emission.declaration;
  const title = optionText(declaration, 'viewTitleOption') ?? emission.name;
  const description = optionText(declaration, 'viewDescriptionOption') ?? `${declaration.kind} chart`;
  const id = `openamx-chart-${emission.documentNodeIndex}-${emission.statementIndex}`;
  const table = buildTable(emission, title, id);
  const rowInputs = buildRows(emission, id);
  const seriesOptions = declaration.options.filter(isChartSeries);
  const valueAxisRole = declaration.kind === 'bar' ? 'x' : 'y';
  const accent = identity.accent;
  const groups = declaration.kind === 'scatter' ? buildGroups(emission, rowInputs) : [];
  const seriesNames = declaration.kind === 'scatter'
    ? groups.map(group => group.name)
    : seriesOptions.map(option => option.label);
  const series = seriesNames.map((name, index) => {
    const descriptor = declaration.kind === 'scatter'
      ? undefined
      : emission.measurementDescriptors?.find(item => item.role === 'series' && item.field === seriesOptions[index]?.field);
    const axisId = descriptor ? axisIdentity(valueAxisRole, descriptor) : `${valueAxisRole}:unitless`;
    return Object.freeze({
      id: declaration.kind === 'scatter' ? groups[index].id : seriesIdentity(seriesOptions[index], index),
      name,
      color: chartColor(index),
      ...(declaration.kind === 'scatter' ? {} : { axisId }),
      ...(descriptor ? { unit: copyUnit(descriptor.unit) } : {})
    });
  });
  const axes = buildAxes(emission, seriesOptions);
  const xOption = fieldOption(declaration, 'x');
  const xDescriptor = emission.measurementDescriptors?.find(item => item.role === 'x');
  const dateTimeX = declaration.kind === 'line' && !!xOption
    && rowInputs.some(row => isDateTimeValue(row.x))
    && rowInputs.every(row => row.x === null || isDateTimeValue(row.x));
  const categoryLineX = declaration.kind === 'line' && !!xOption && !dateTimeX
    && rowInputs.some(row => typeof row.x === 'string');
  const scalarLine = declaration.kind === 'line' && !xOption;

  let optionSeries: Record<string, unknown>[];
  let plottedPointCount = 0;
  let xAxis: unknown;
  let yAxis: unknown;
  let grid: Record<string, unknown>;
  const categoryLabels = new Map(table.rows.map(row => [row.id, valueText(row.values[0] ?? null)]));

  if (declaration.kind === 'scatter') {
    optionSeries = groups.map((group, index) => {
      const points = group.points.filter(point => typeof point[0] === 'number' && typeof point[1] === 'number');
      plottedPointCount += points.length;
      return {
        id: group.id,
        name: group.name,
        type: 'scatter',
        data: points,
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: { color: chartColor(index) },
        emphasis: { itemStyle: { color: accent } }
      };
    });
    xAxis = valueAxis(axes.find(axis => axis.role === 'x'), 'bottom');
    yAxis = valueAxis(axes.find(axis => axis.role === 'y'), 'left');
    grid = { left: 88, right: 32, top: 56, bottom: 62, containLabel: true };
  } else if (declaration.kind === 'bar' || declaration.kind === 'column') {
    const categoryRows = rowInputs;
    const valueAxes = axes.filter(axis => axis.role === (declaration.kind === 'bar' ? 'x' : 'y'));
    optionSeries = seriesOptions.map((seriesOption, index) => {
      const values = categoryRows.map(row => seriesValue(row.source, seriesOption));
      plottedPointCount += values.filter(value => typeof value === 'number').length;
      const axisIndex = valueAxes.findIndex(axis => axis.id === series[index].axisId);
      return {
        id: series[index].id,
        name: series[index].name,
        type: 'bar',
        data: values,
        ...(declaration.kind === 'bar' ? { xAxisIndex: Math.max(0, axisIndex), yAxisIndex: 0 } : { xAxisIndex: 0, yAxisIndex: Math.max(0, axisIndex) }),
        barMaxWidth: 28,
        itemStyle: { color: series[index].color },
        emphasis: { itemStyle: { color: accent } }
      };
    });
    const categoryData = categoryRows.map(row => row.id);
    const categoryLabels = Object.fromEntries(categoryRows.map(row => [row.id, valueText(row.label)]));
    const categoryAxis = {
      type: 'category',
      data: categoryData,
      axisLabel: { hideOverlap: true, formatter: (value: string) => categoryLabels[value] ?? value },
      axisTick: { alignWithLabel: true }
    };
    const axesForValues = valueAxes.map((axis, index) => valueAxis(axis, 'bottom', index * 34));
    if (declaration.kind === 'bar') {
      xAxis = axesForValues;
      yAxis = { ...categoryAxis, inverse: true };
      grid = { left: 112, right: 36, top: 56, bottom: Math.max(62, axesForValues.length * 36 + 24), containLabel: true };
    } else {
      xAxis = categoryAxis;
      yAxis = axesForValues;
      grid = {
        left: 56 + Math.ceil(valueAxes.length / 2) * 44,
        right: 32 + Math.floor(valueAxes.length / 2) * 44,
        top: 56,
        bottom: 72,
        containLabel: true
      };
    }
  } else {
    const xValues = scalarLine
      ? rowInputs.map(row => row.label)
      : rowInputs.map(row => row.x);
    const xLabels = Object.fromEntries(rowInputs.map((row, index) => [row.id, valueText(xValues[index])]));
    const xAxisType = scalarLine || categoryLineX ? 'category' : dateTimeX ? 'time' : 'value';
    const valueAxes = axes.filter(axis => axis.role === 'y');
    optionSeries = seriesOptions.map((seriesOption, index) => {
      const points = rowInputs.map(row => [scalarLine || categoryLineX ? row.id : row.x, seriesValue(row.source, seriesOption)]);
      plottedPointCount += points.filter(point => typeof point[1] === 'number').length;
      const axisIndex = valueAxes.findIndex(axis => axis.id === series[index].axisId);
      return {
        id: series[index].id,
        name: series[index].name,
        type: 'line',
        data: points,
        encode: { x: 0, y: 1 },
        yAxisIndex: Math.max(0, axisIndex),
        connectNulls: false,
        showSymbol: true,
        smooth: false,
        itemStyle: { color: series[index].color },
        lineStyle: { color: series[index].color },
        emphasis: { itemStyle: { color: accent }, lineStyle: { color: accent } }
      };
    });
    xAxis = xAxisType === 'category'
      ? {
        type: 'category',
        data: rowInputs.map(row => row.id),
        axisLabel: { hideOverlap: true, formatter: (value: string) => categoryLineX ? categoryLabels.get(value) ?? value : xLabels[value] ?? value }
      }
      : {
        type: xAxisType,
        ...(xDescriptor ? { name: xDescriptor.unit.text } : {}),
        ...(dateTimeX ? {
          axisLabel: { hideOverlap: true, formatter: utcIsoAxisLabel },
          axisPointer: { label: { formatter: (params: { value: string | number }) => utcIsoAxisLabel(params.value) } }
        } : {})
      };
    yAxis = valueAxes.map((axis, index) => valueAxis(axis, index % 2 === 0 ? 'left' : 'right', Math.floor(index / 2) * 40));
    grid = {
      left: 56 + Math.ceil(valueAxes.length / 2) * 40,
      right: 32 + Math.floor(valueAxes.length / 2) * 40,
      top: 56,
      bottom: 62,
      containLabel: true
    };
  }

  const empty = plottedPointCount === 0;
  const option = {
    animation: false,
    aria: { enabled: false },
    color: series.map(item => item.color),
    textStyle: { fontFamily: 'sans-serif', fontSize: 12, color: '#263238' },
    title: { text: title, left: 'center', textStyle: { color: accent, fontSize: 16, fontWeight: 600 } },
    tooltip: {
      trigger: declaration.kind === 'scatter' ? 'item' : 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: unknown) => formatTooltip(params, declaration.kind, series, axes, categoryLabels, dateTimeX)
    },
    legend: { show: series.length > 1, top: 30, data: series.map(item => item.name) },
    grid,
    xAxis,
    yAxis,
    series: optionSeries,
    ...(empty ? {
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: { text: NO_DATA_LABEL, fill: '#52606d', fontSize: 14 }
      }
    } : {})
  } as EChartsOption;

  const accessibility: ChartAccessibilityModel = Object.freeze({
    role: 'img',
    title,
    description,
    summary: `${table.rows.length} source rows; ${plottedPointCount} plotted points. Complete chart data is in table ${table.id}.${dateTimeX ? ' DateTime values are presented in UTC ISO 8601 format; source order is preserved.' : ''}`,
    tableId: table.id
  });
  const tooltip: ChartTooltipModel = Object.freeze({
    trigger: declaration.kind === 'scatter' ? 'item' : 'axis',
    includesCategoryOrCoordinates: true,
    includesSeriesOrGroup: true,
    includesDisplayUnits: true,
    ...(dateTimeX ? { dateTimePresentation: 'UTC ISO 8601' as const } : {})
  });
  const model: ChartViewModel = {
    kind: declaration.kind,
    title,
    description,
    dimensions: Object.freeze({ width: 720, height: 360 }),
    option,
    table,
    series: Object.freeze(series),
    axes,
    tooltip,
    plottedPointCount,
    accessibility,
    ...(empty ? { emptyState: Object.freeze({ label: NO_DATA_LABEL }) } : {}),
    ...(dateTimeX ? { dateTimePresentation: 'UTC ISO 8601' as const } : {})
  };
  return deepFreeze(model);
}

function buildTable(emission: ChartViewEmission, title: string, id: string): ChartTableModel {
  const declaration = emission.declaration;
  const category = fieldOption(declaration, 'category');
  const x = fieldOption(declaration, 'x');
  const group = fieldOption(declaration, 'group');
  const seriesOptions = declaration.options.filter(isChartSeries);
  let headings: string[];
  const rows = emission.data.map((value, index) => {
    let values: ViewDataValue[];
    if (isRecord(value)) {
      if (declaration.kind === 'scatter') {
        values = [value[x?.field ?? 'x'] ?? null, value[fieldOption(declaration, 'y')?.field ?? 'y'] ?? null];
        if (emission.headings?.length === 3) values.push(group ? value[group.field] ?? null : '');
      } else if (declaration.kind === 'line') {
        values = [value[x?.field ?? 'x'] ?? null, ...seriesOptions.map(option => option.field ? value[option.field] ?? null : null)];
      } else {
        values = [value[category?.field ?? 'category'] ?? null, ...seriesOptions.map(option => option.field ? value[option.field] ?? null : null)];
      }
    } else {
      const labels = emission.labels ?? emission.data.map((_item, labelIndex) => String(labelIndex + 1));
      values = [labels[index] ?? String(index + 1), value];
    }
    return Object.freeze({
      id: `${id}-row-${index + 1}`,
      values: Object.freeze(values.map(cloneValue))
    });
  });

  if (declaration.kind === 'scatter') {
    headings = emission.headings ? [...emission.headings] : ['x', 'y', ...(group ? ['group'] : [])];
  } else if (declaration.kind === 'line' && x) {
    const xDescriptor = emission.measurementDescriptors?.find(item => item.role === 'x');
    headings = [xDescriptor ? `x (${xDescriptor.unit.text})` : 'x', ...seriesOptions.map((option, index) => {
      const seriesHeading = emission.headings?.[index + 1] ?? option.label;
      return seriesHeading;
    })];
  } else {
    headings = emission.headings ? [...emission.headings] : ['label', ...seriesOptions.map(option => option.label)];
  }
  return Object.freeze({
    id: `${id}-data`,
    caption: `Data for ${title}`,
    headings: Object.freeze(headings),
    rows: Object.freeze(rows)
  });
}

function buildRows(emission: ChartViewEmission, id: string): ChartRow[] {
  const declaration = emission.declaration;
  const category = fieldOption(declaration, 'category');
  const x = fieldOption(declaration, 'x');
  const group = fieldOption(declaration, 'group');
  return emission.data.map((source, index) => {
    const label = isRecord(source)
      ? declaration.kind === 'scatter' ? source[group?.field ?? ''] ?? null
        : declaration.kind === 'line' ? source[x?.field ?? 'x'] ?? null
          : source[category?.field ?? 'category'] ?? null
      : emission.labels?.[index] ?? String(index + 1);
    return Object.freeze({
      id: `${id}-row-${index + 1}`,
      source,
      label,
      x: isRecord(source) ? source[x?.field ?? 'x'] ?? null : String(index + 1),
      group: isRecord(source) ? source[group?.field ?? ''] ?? null : null
    });
  });
}

function buildGroups(emission: ChartViewEmission, rows: readonly ChartRow[]): Array<{ id: string; name: string; points: Array<[ViewDataValue, ViewDataValue]> }> {
  const x = fieldOption(emission.declaration, 'x');
  const y = fieldOption(emission.declaration, 'y');
  const groupOption = fieldOption(emission.declaration, 'group');
  const groups = new Map<string, { id: string; name: string; points: Array<[ViewDataValue, ViewDataValue]> }>();
  for (const row of rows) {
    const source = isRecord(row.source) ? row.source : {};
    const groupValue = groupOption ? source[groupOption.field] ?? null : null;
    const key = groupValue === null ? '__ungrouped__' : `${typeof groupValue}:${String(groupValue)}`;
    let group = groups.get(key);
    if (!group) {
      const index = groups.size;
      group = {
        id: groupOption ? `group-${index + 1}` : 'group-all',
        name: groupOption ? valueText(groupValue) : 'All points',
        points: []
      };
      groups.set(key, group);
    }
    group.points.push([source[x?.field ?? 'x'] ?? null, source[y?.field ?? 'y'] ?? null]);
  }
  return [...groups.values()];
}

function buildAxes(emission: ChartViewEmission, seriesOptions: readonly ChartSeriesOptionNode[]): ChartAxisModel[] {
  const descriptors = emission.measurementDescriptors ?? [];
  if (emission.declaration.kind === 'scatter') {
    return (['x', 'y'] as const).map(role => {
      const descriptor = descriptors.find(item => item.role === role);
      return Object.freeze({
        id: descriptor ? axisIdentity(role, descriptor) : `${role}:unitless`,
        role,
        ...(descriptor ? { name: descriptor.unit.text, unit: copyUnit(descriptor.unit) } : {})
      });
    });
  }
  const role: 'x' | 'y' = emission.declaration.kind === 'bar' ? 'x' : 'y';
  const axes = new Map<string, ChartAxisModel>();
  for (const option of seriesOptions) {
    const descriptor = descriptors.find(item => item.role === 'series' && item.field === option.field);
    const id = descriptor ? axisIdentity(role, descriptor) : `${role}:unitless`;
    if (!axes.has(id)) axes.set(id, Object.freeze({
      id,
      role,
      ...(descriptor ? { name: descriptor.unit.text, unit: copyUnit(descriptor.unit) } : {})
    }));
  }
  if (!axes.size) axes.set(`${role}:unitless`, Object.freeze({ id: `${role}:unitless`, role }));
  if (emission.declaration.kind === 'line') {
    const descriptor = descriptors.find(item => item.role === 'x');
    if (descriptor) axes.set(axisIdentity('x', descriptor), Object.freeze({
      id: axisIdentity('x', descriptor), role: 'x', name: descriptor.unit.text, unit: copyUnit(descriptor.unit)
    }));
  }
  return [...axes.values()];
}

function seriesValue(source: ViewDataValue, option: ChartSeriesOptionNode): number | null {
  const value = option.field && isRecord(source) ? source[option.field] : source;
  return typeof value === 'number' ? value : null;
}

function valueAxis(axis: ChartAxisModel | undefined, position: 'left' | 'right' | 'bottom', offset = 0): Record<string, unknown> {
  return {
    type: 'value',
    scale: false,
    ...(axis?.name ? { name: axis.name } : {}),
    ...(position === 'bottom' ? { position: 'bottom', offset } : { position, offset }),
    axisLabel: { hideOverlap: true },
    splitLine: { show: position !== 'bottom' }
  };
}

function formatTooltip(
  input: unknown,
  kind: ChartDeclarationNode['kind'],
  series: readonly ChartSeriesModel[],
  axes: readonly ChartAxisModel[],
  categoryLabels: ReadonlyMap<string, string>,
  dateTimeX: boolean
): string {
  const entries = (Array.isArray(input) ? input : [input]).filter(isUnknownRecord);
  return entries.map(entry => {
    const name = typeof entry.seriesName === 'string' ? entry.seriesName : '';
    const seriesModel = typeof entry.seriesId === 'string'
      ? series.find(item => item.id === entry.seriesId) ?? series.find(item => item.name === name)
      : series.find(item => item.name === name);
    const seriesIndex = seriesModel ? series.indexOf(seriesModel) : -1;
    const rawValue = entry.value;
    const values = Array.isArray(rawValue) ? rawValue : Array.isArray(entry.data) ? entry.data as unknown[] : [];
    if (kind === 'scatter') {
      const xValue = values[0] ?? null;
      const yValue = values[1] ?? null;
      const xUnit = axes.find(axis => axis.role === 'x')?.name;
      const yUnit = axes.find(axis => axis.role === 'y')?.name;
      return `<div><strong>${escapeTooltipText(name)}</strong><br>x: ${escapeTooltipText(tooltipValue(xValue, false))}${xUnit ? ` ${escapeTooltipText(xUnit)}` : ''}<br>y: ${escapeTooltipText(tooltipValue(yValue, false))}${yUnit ? ` ${escapeTooltipText(yUnit)}` : ''}</div>`;
    }
    const rawCategory = entry.axisValue ?? values[0] ?? entry.name;
    const category = typeof rawCategory === 'string' && categoryLabels.has(rawCategory)
      ? categoryLabels.get(rawCategory)!
      : dateTimeX ? tooltipValue(rawCategory, true) : tooltipValue(rawCategory, false);
    const rawData = Array.isArray(rawValue) ? rawValue : [];
    const value = kind === 'line' ? rawData[1] : rawValue;
    const unit = seriesModel?.unit?.text;
    const xUnit = kind === 'line' ? axes.find(axis => axis.role === 'x')?.name : undefined;
    const seriesLabel = escapeTooltipText(name || `Series ${seriesIndex + 1}`);
    const coordinate = `${escapeTooltipText(category)}${xUnit ? ` ${escapeTooltipText(xUnit)}` : ''}`;
    const detail = `${coordinate}: ${escapeTooltipText(tooltipValue(value, false))}${unit ? ` ${escapeTooltipText(unit)}` : ''}`;
    return `<div><strong>${seriesLabel}</strong><br>${detail}</div>`;
  }).join('');
}

function tooltipValue(value: unknown, dateTime: boolean): string {
  if (value === null || value === undefined) return 'No value';
  if (dateTime && (typeof value === 'string' || typeof value === 'number')) return utcIsoAxisLabel(value) || String(value);
  return String(value);
}

function escapeTooltipText(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]!);
}

function axisIdentity(role: 'x' | 'y', descriptor: ChartMeasurementDescriptor): string {
  const dimensions = Object.entries(descriptor.unit.vector).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0);
  return `${role}:${descriptor.unit.text}:${descriptor.unit.scale}:${JSON.stringify(dimensions)}`;
}

function copyUnit(unit: ChartMeasurementUnitDescriptor): ChartMeasurementUnitDescriptor {
  return Object.freeze({
    text: unit.text,
    scale: unit.scale,
    vector: Object.freeze({ ...unit.vector }),
    factors: Object.freeze(unit.factors.map(factor => Object.freeze({ ...factor })))
  });
}

function seriesIdentity(option: ChartSeriesOptionNode | undefined, index: number): string {
  return option?.field ? `series:${option.field}` : `series:${index + 1}`;
}

function chartColor(index: number): string {
  if (index < SERIES_PALETTE.length) return SERIES_PALETTE[index];
  return hslToHex((index * 137.508 + 21) % 360, 68, 34);
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const segment = hue / 60;
  const x = chroma * (1 - Math.abs(segment % 2 - 1));
  const [red, green, blue] = segment < 1 ? [chroma, x, 0]
    : segment < 2 ? [x, chroma, 0]
      : segment < 3 ? [0, chroma, x]
        : segment < 4 ? [0, x, chroma]
          : segment < 5 ? [x, 0, chroma] : [chroma, 0, x];
  const match = l - chroma / 2;
  return `#${[red, green, blue].map(channel => Math.round((channel + match) * 255).toString(16).padStart(2, '0')).join('')}`;
}

function utcIsoAxisLabel(value: string | number): string {
  const date = new Date(typeof value === 'number' ? value : Date.parse(value));
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function isDateTimeValue(value: ViewDataValue): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function fieldOption(declaration: ChartDeclarationNode, role: ChartFieldOptionNode['role']): ChartFieldOptionNode | undefined {
  return declaration.options.find((option): option is ChartFieldOptionNode => option.type === 'chartFieldOption' && option.role === role);
}

function optionText(declaration: ChartDeclarationNode, type: 'viewTitleOption' | 'viewDescriptionOption'): string | undefined {
  const option = declaration.options.find(item => item.type === type);
  return option && option.type === type ? option.value : undefined;
}

function isChartSeries(option: ChartDeclarationNode['options'][number]): option is ChartSeriesOptionNode {
  return option.type === 'chartSeriesOption';
}

function isRecord(value: ViewDataValue): value is { readonly [field: string]: ViewDataValue } {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isUnknownRecord(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function valueText(value: ViewDataValue): string {
  return value === null ? '' : String(value);
}

function cloneValue(value: ViewDataValue): ViewDataValue {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneValue(item)]));
  return value;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}