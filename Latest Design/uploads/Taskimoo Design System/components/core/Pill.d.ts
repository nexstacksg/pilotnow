import * as React from 'react';

/**
 * Status pill — the smallest state marker (kanban, tables, task rows).
 *
 * @startingPoint section="Core" subtitle="Status pill with tone + dot" viewport="700x120"
 */
export interface PillProps {
  children: React.ReactNode;
  /** Semantic tone. Omit for the neutral grey pill. */
  tone?: 'red' | 'green' | 'amber' | 'blue';
  /** CSS color for a leading status dot (e.g. var(--status-progress)). */
  dot?: string;
  /** Render label in Geist Mono. */
  mono?: boolean;
}

export declare function Pill(props: PillProps): JSX.Element;
