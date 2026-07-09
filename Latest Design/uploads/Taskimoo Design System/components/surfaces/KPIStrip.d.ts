import * as React from 'react';

export interface KPIItem {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Color the value: pass (green), fail (red), block (amber). */
  tone?: 'pass' | 'fail' | 'block';
}

/**
 * Bordered KPI / summary strip — large tabular numbers with mono labels.
 *
 * @startingPoint section="Surfaces" subtitle="KPI summary strip" viewport="700x110"
 */
export interface KPIStripProps {
  items: KPIItem[];
}

export declare function KPIStrip(props: KPIStripProps): JSX.Element;
