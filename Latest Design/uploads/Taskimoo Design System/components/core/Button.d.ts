import * as React from 'react';

/**
 * Editorial action button. Ink-filled primary, functional red, hairline
 * secondary, quiet ghost — the four button roles used across Taskimoo.
 *
 * @startingPoint section="Core" subtitle="Primary / red / secondary / ghost button" viewport="700x150"
 */
export interface ButtonProps {
  /** Button label. Omit (with an icon) for an icon-only button. */
  children?: React.ReactNode;
  /** Visual role. @default "secondary" */
  variant?: 'primary' | 'red' | 'secondary' | 'ghost';
  /** @default "md" */
  size?: 'sm' | 'md';
  /** Leading icon node (pass a Lucide SVG element). */
  icon?: React.ReactNode;
  /** Trailing icon node. */
  iconRight?: React.ReactNode;
  disabled?: boolean;
  /** @default "button" */
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
}

export declare function Button(props: ButtonProps): JSX.Element;
