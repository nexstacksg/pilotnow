import * as React from 'react';

/**
 * Text input with optional mono label, leading icon, and hint/error line.
 * Red focus ring; `invalid` flips border + hint to functional red.
 *
 * @startingPoint section="Forms" subtitle="Labelled text input with icon + states" viewport="360x120"
 */
export interface InputProps {
  /** Mono uppercase label shown above the field. */
  label?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  /** @default "text" */
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'tel';
  /** Leading icon node (Lucide SVG). */
  icon?: React.ReactNode;
  /** Helper line below the field. Turns red when `invalid`. */
  hint?: React.ReactNode;
  /** Error state — red border + red hint. */
  invalid?: boolean;
  disabled?: boolean;
  /** Render the typed value in Geist Mono, tabular (for IDs / numbers). */
  mono?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md';
  id?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export declare function Input(props: InputProps): JSX.Element;
