import * as React from 'react';

/**
 * Bordered section container with an optional head (title + meta + actions).
 * The most-reused surface across Taskimoo.
 *
 * @startingPoint section="Surfaces" subtitle="Section card with head + body" viewport="700x260"
 */
export interface SectionCardProps {
  /** Head title (left). Omit to hide the head entirely. */
  title?: React.ReactNode;
  /** Mono meta string shown next to the title. */
  meta?: React.ReactNode;
  /** Right-aligned actions (buttons, pills). */
  actions?: React.ReactNode;
  /** Pad the body 12px. Defaults to flush (false) — good for tables/feeds. */
  pad?: boolean;
  children: React.ReactNode;
}

export declare function SectionCard(props: SectionCardProps): JSX.Element;
