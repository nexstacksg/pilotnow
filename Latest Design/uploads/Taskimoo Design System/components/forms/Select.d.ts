import * as React from 'react';

/** A select option — a bare string, or an explicit value/label pair. */
export type SelectOption = string | { value: string; label: string };

/**
 * Native select styled to match Input — mono label, hairline border,
 * red focus ring, custom chevron.
 */
export interface SelectProps {
  label?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  /** Options as strings or {value,label} objects. */
  options?: SelectOption[];
  /** Disabled first option shown when nothing is selected. */
  placeholder?: string;
  hint?: React.ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md';
  id?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export declare function Select(props: SelectProps): JSX.Element;
