import * as React from 'react';

/**
 * Centered dialog over a 30%-black backdrop. Header (mono eyebrow + title
 * + close), scrollable body, optional right-aligned footer actions. Closes
 * on backdrop click and Escape.
 */
export interface ModalProps {
  /** Render the modal when true. */
  open: boolean;
  /** Called on close (backdrop, Escape, or × button). Omit × by omitting this. */
  onClose?: () => void;
  title?: React.ReactNode;
  /** Mono uppercase kicker above the title. */
  eyebrow?: React.ReactNode;
  children?: React.ReactNode;
  /** Right-aligned footer actions (buttons). */
  footer?: React.ReactNode;
  /** Max width. @default "md" */
  size?: 'sm' | 'md' | 'lg';
}

export declare function Modal(props: ModalProps): JSX.Element | null;
