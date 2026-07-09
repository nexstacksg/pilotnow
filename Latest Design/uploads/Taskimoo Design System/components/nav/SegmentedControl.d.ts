import * as React from 'react';

/** A segment — a bare string, or value/label with optional icon. */
export type SegmentOption = string | { value: string; label?: React.ReactNode; icon?: React.ReactNode };

/**
 * Compact 2–4 option switch for toolbars. Active option inverts to
 * ink-on-paper. Controlled (`value`) or uncontrolled (`defaultValue`).
 */
export interface SegmentedControlProps {
  options: SegmentOption[];
  value?: string;
  defaultValue?: string;
  /** @default "md" */
  size?: 'sm' | 'md';
  onChange?: (value: string) => void;
}

export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
