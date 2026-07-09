import * as React from 'react';

export interface TaskTag {
  label: string;
  /** Render the tag red-tinted (e.g. "Blocked"). */
  red?: boolean;
}

/**
 * Kanban work-item card — id, title, tags, status, due, assignee.
 *
 * @startingPoint section="Work" subtitle="Kanban work-item card" viewport="700x200"
 */
export interface TaskCardProps {
  /** Work-item id, e.g. "TASK-148". Rendered in mono. */
  id: string;
  title: string;
  tags?: TaskTag[];
  statusLabel?: string;
  /** CSS color for the status dot (use a --status-* token). */
  statusColor?: string;
  /** Due-date label, e.g. "May 12". */
  due?: string;
  /** Render the due date red. */
  overdue?: boolean;
  /** Assignee initials. */
  assignee?: string;
  /** Adds the red left rail. */
  selected?: boolean;
  onClick?: () => void;
}

export declare function TaskCard(props: TaskCardProps): JSX.Element;
