export type DataCell = string | number | boolean | Date | null;

export interface Dataset {
  fileName: string;
  format: string;
  columns: string[];
  rows: DataCell[][];
}

export interface ColumnInsight {
  name: string;
  dataType: string;
  nonEmpty: number;
  missing: number;
  unique: number;
}

export interface DatasetInsight {
  rowCount: number;
  columnCount: number;
  missingCells: number;
  duplicateRows: number;
  numericColumns: number;
  columns: ColumnInsight[];
}
