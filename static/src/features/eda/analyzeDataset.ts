import type { ColumnInsight, DataCell, Dataset, DatasetInsight } from "./types";

export function analyzeDataset(dataset: Dataset): DatasetInsight {
  const columns: ColumnInsight[] = dataset.columns.map((name, columnIndex) => {
    const values = dataset.rows.map((row) => row[columnIndex] ?? null);
    const presentValues = values.filter((value) => !isMissing(value));

    return {
      name,
      dataType: inferType(presentValues),
      nonEmpty: presentValues.length,
      missing: values.length - presentValues.length,
      unique: new Set(presentValues.map(canonicalValue)).size,
    };
  });

  let missingCells = 0;
  const seenRows = new Set<string>();
  let duplicateRows = 0;

  for (const row of dataset.rows) {
    for (const value of row) {
      if (isMissing(value ?? null)) missingCells += 1;
    }

    const key = JSON.stringify(row.map(canonicalValue));
    if (seenRows.has(key)) duplicateRows += 1;
    else seenRows.add(key);
  }

  return {
    rowCount: dataset.rows.length,
    columnCount: dataset.columns.length,
    missingCells,
    duplicateRows,
    numericColumns: columns.filter((column) => column.dataType === "Number").length,
    columns,
  };
}

function inferType(values: DataCell[]): string {
  if (values.length === 0) return "Empty";

  const types = new Set(values.map(valueType));
  return types.size === 1 ? Array.from(types)[0] : "Mixed";
}

function valueType(value: DataCell): string {
  if (value instanceof Date) return "Date";
  if (typeof value === "number") return "Number";
  if (typeof value === "boolean") return "Boolean";

  const text = String(value).trim();
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text) && Number.isFinite(Number(text))) {
    return "Number";
  }
  if (/^(true|false)$/i.test(text)) return "Boolean";
  if (/^\d{4}-\d{2}-\d{2}(?:$|[T ])/.test(text) && Number.isFinite(Date.parse(text))) {
    return "Date";
  }
  return "Text";
}

function isMissing(value: DataCell): boolean {
  return value === null || (typeof value === "string" && value.trim() === "");
}

function canonicalValue(value: DataCell): string {
  if (value instanceof Date) return `date:${value.toISOString()}`;
  if (value === null) return "null:";
  return `${typeof value}:${String(value)}`;
}
