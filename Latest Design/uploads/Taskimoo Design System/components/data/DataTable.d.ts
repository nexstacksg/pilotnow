import * as React from 'react';

/** A column definition. */
export interface Column {
  /** Key into the row object; also the cell's value source. */
  key: string;
  /** Mono uppercase header label. */
  header: React.ReactNode;
  /** Cell text alignment. @default "left" */
  align?: 'left' | 'center' | 'right';
  /** Render cell value in Geist Mono, tabular (IDs, amounts, dates). */
  mono?: boolean;
  /** Bold ink cell (primary column). */
  strong?: boolean;
  /** Fixed column width (CSS value). */
  width?: string;
  /** Custom cell renderer — gets (value, row, rowIndex). Return any node. */
  render?: (value: any, row: any, rowIndex: number) => React.ReactNode;
}

/**
 * Dense editorial table — mono uppercase headers, hairline rules, hover
 * highlight, optional red left-rail on the selected row.
 */
export interface DataTableProps {
  columns: Column[];
  rows: any[];
  /** Field name or fn used as React key + selection match. @default "id" */
  rowKey?: string | ((row: any, i: number) => string | number);
  onRowClick?: (row: any, rowIndex: number) => void;
  /** Key of the selected row — gets the red left rail. */
  selectedKey?: string | number;
  /** Node shown when `rows` is empty. */
  empty?: React.ReactNode;
}

export declare function DataTable(props: DataTableProps): JSX.Element;
