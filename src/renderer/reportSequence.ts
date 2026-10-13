import type { PreparedReportItem, PreparedDiagramEmission, PreparedReport } from './reportPreparation';

export type OrderedReportEntry =
  | { readonly type: 'item'; readonly item: PreparedReportItem }
  | { readonly type: 'diagram'; readonly diagram: PreparedDiagramEmission };

export function orderedReportSequence(report: PreparedReport): readonly OrderedReportEntry[] {
  const diagramsByPosition = new Map<number, PreparedDiagramEmission[]>();
  const seenOrders = new Set<number>();
  for (const diagram of report.diagrams ?? []) {
    if (!Number.isInteger(diagram.beforeItemIndex)
      || diagram.beforeItemIndex < 0
      || diagram.beforeItemIndex > report.items.length) {
      throw new Error(`Prepared diagram has invalid insertion position ${diagram.beforeItemIndex}.`);
    }
    if (!Number.isInteger(diagram.order) || diagram.order < 0 || seenOrders.has(diagram.order)) {
      throw new Error(`Prepared diagram has invalid or duplicate order ${diagram.order}.`);
    }
    seenOrders.add(diagram.order);
    const diagrams = diagramsByPosition.get(diagram.beforeItemIndex) ?? [];
    diagrams.push(diagram);
    diagramsByPosition.set(diagram.beforeItemIndex, diagrams);
  }

  const sequence: OrderedReportEntry[] = [];
  for (let itemIndex = 0; itemIndex <= report.items.length; itemIndex++) {
    const diagrams = diagramsByPosition.get(itemIndex) ?? [];
    diagrams.sort((left, right) => left.order - right.order);
    for (const diagram of diagrams) sequence.push({ type: 'diagram', diagram });
    const item = report.items[itemIndex];
    if (item) sequence.push({ type: 'item', item });
  }
  return sequence;
}
