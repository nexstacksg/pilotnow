import * as React from 'react';

/** A tab — a bare string, or an explicit value/label with optional count. */
export type TabItem = string | { value: string; label: React.ReactNode; count?: number };

/**
 * Horizontal subnav tabs. Active tab gets an ink underline; optional mono
 * count per tab. Controlled (`value`+`onChange`) or uncontrolled
 * (`defaultValue`).
 *
 * @startingPoint section="Navigation" subtitle="Underlined subnav tabs with counts" viewport="520x80"
 */
export interface TabsProps {
  /** Tabs as strings or {value,label,count} objects. */
  items: TabItem[];
  /** Controlled active value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export declare function Tabs(props: TabsProps): JSX.Element;
