import * as React from 'react';

/**
 * Custom-drawn checkbox / radio with the editorial ink fill. `red` fills
 * with functional red instead of ink. Renders label + optional description.
 */
export interface CheckboxProps {
  label?: React.ReactNode;
  /** Secondary line beneath the label. */
  description?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  /** Fill with functional red instead of ink when checked. */
  red?: boolean;
  /** @default "checkbox" — pass "radio" for a round selector. */
  type?: 'checkbox' | 'radio';
  id?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export declare function Checkbox(props: CheckboxProps): JSX.Element;
