import * as React from 'react';

/**
 * Transient confirmation / alert — a compact ink-on-paper card with a tone
 * accent rail, title, optional message, optional action, and dismiss.
 * Presentational; stack several in a fixed bottom-right container and wire
 * timers in your app.
 */
export interface ToastProps {
  /** Accent rail/icon color. @default "default" (ink) */
  tone?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  title?: React.ReactNode;
  message?: React.ReactNode;
  /** Leading icon node (Lucide SVG). */
  icon?: React.ReactNode;
  /** Inline action (e.g. an Undo button). */
  action?: React.ReactNode;
  onDismiss?: () => void;
}

export declare function Toast(props: ToastProps): JSX.Element;
