import type { DataCell, Dataset } from "./types";

export async function readDataset(file: File): Promise<Dataset> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "csv" || extension === "tsv") {
    const text = (await file.text()).replace(/^\uFEFF/, "");
    const rows = parseDelimitedText(text, extension === "tsv" ? "\t" : ",");
    return matrixToDataset(file.name, extension.toUpperCase(), rows);
  }

  if (extension === "json") {
    const data: unknown = JSON.parse(await file.text());
    return jsonToDataset(file.name, data);
  }

  throw new Error(
    "This first version reads CSV, TSV, and JSON files. Excel file support will be added later."
  );
}

function parseDelimitedText(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        cell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === delimiter && !insideQuotes) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

function jsonToDataset(fileName: string, data: unknown): Dataset {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("JSON must contain a non-empty array of records or rows.");
  }

  if (data.every(isRecord)) {
    const records = data as Record<string, unknown>[];
    const columns = Array.from(new Set(records.flatMap((record) => Object.keys(record))));
    const matrix: unknown[][] = [
      columns,
      ...records.map((record) => columns.map((column) => record[column] ?? null)),
    ];
    return matrixToDataset(fileName, "JSON", matrix);
  }

  if (data.every(Array.isArray)) {
    return matrixToDataset(fileName, "JSON", data as unknown[][]);
  }

  throw new Error("JSON should be an array of objects or an array of rows.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function matrixToDataset(
  fileName: string,
  format: string,
  matrix: unknown[][],
): Dataset {
  if (matrix.length < 2 || matrix[0].length === 0) {
    throw new Error("The file needs a header row and at least one data row.");
  }

  const columns = makeUniqueHeaders(matrix[0]);
  const rows = matrix
    .slice(1)
    .map((values) => columns.map((_, index) => toDataCell(values[index])))
    .filter((values) => values.some((value) => !isMissing(value)));

  if (rows.length === 0) {
    throw new Error("No data rows were found below the header row.");
  }

  return { fileName, format, columns, rows };
}

function makeUniqueHeaders(values: unknown[]): string[] {
  const used = new Set<string>();

  return values.map((value, index) => {
    const baseName = value == null || String(value).trim() === ""
      ? `Column ${index + 1}`
      : String(value).trim();
    let name = baseName;
    let suffix = 2;

    while (used.has(name)) {
      name = `${baseName} (${suffix})`;
      suffix += 1;
    }
    used.add(name);
    return name;
  });
}

function toDataCell(value: unknown): DataCell {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value instanceof Date) return value;
  if (typeof value === "object") return JSON.stringify(value) ?? String(value);
  return String(value);
}

function isMissing(value: DataCell): boolean {
  return value === null || (typeof value === "string" && value.trim() === "");
}

