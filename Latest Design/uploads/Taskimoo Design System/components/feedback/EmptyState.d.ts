import * as React from 'react';

/**
 * Dashed-border placeholder for empty lists, boards and search results.
 * Optional icon, title, description, and an action.
 */
export interface EmptyStateProps {
  /** Leading icon node (Lucide SVG). */
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Action node (usually a Button). */
  action?: React.ReactNode;
  /** Tighter padding for inline / in-card use. @default false */
  compact?: boolean;
}

export declare function EmptyState(props: EmptyStateProps): JSX.Element;
