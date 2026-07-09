import * as React from 'react';

/**
 * Toggle / switch for binary settings. Ink-filled track when on
 * (functional red via `red`), with an optional label + description.
 */
export interface ToggleProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  /** Fill the track with functional red instead of ink when on. */
  red?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md';
  id?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export declare function Toggle(props: ToggleProps): JSX.Element;
