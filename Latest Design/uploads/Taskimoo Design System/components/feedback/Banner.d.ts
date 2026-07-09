import * as React from 'react';

/**
 * Inline message strip. Tones map to the semantic palette plus `ai` for
 * the red-shifted agent surface. Left accent rule, optional icon, title +
 * body, optional actions and dismiss.
 */
export interface BannerProps {
  /** @default "info" */
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'ai';
  title?: React.ReactNode;
  /** Body text. */
  children?: React.ReactNode;
  /** Leading icon node (Lucide SVG). */
  icon?: React.ReactNode;
  /** Right/below action nodes (buttons). */
  actions?: React.ReactNode;
  /** Show a dismiss button and handle its click. */
  onDismiss?: () => void;
}

export declare function Banner(props: BannerProps): JSX.Element;
