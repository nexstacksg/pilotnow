import * as React from 'react';

/**
 * Thin determinate progress bar for milestone / completion counts. Ink
 * fill by default; `tone` switches to a semantic color. Optional label +
 * mono count row.
 */
export interface ProgressBarProps {
  /** Current value. @default 0 */
  value?: number;
  /** Maximum value. @default 100 */
  max?: number;
  /** Label shown on the left of the head row. */
  label?: React.ReactNode;
  /** Show the value on the right of the head row. @default false */
  showValue?: boolean;
  /** Override the auto "value / max" text (e.g. "63%"). */
  valueText?: React.ReactNode;
  /** Fill color. @default "ink" */
  tone?: 'ink' | 'red' | 'green' | 'amber' | 'blue';
  /** @default "md" */
  size?: 'sm' | 'md';
}

export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
