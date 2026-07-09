import * as React from 'react';

/** One status track — its full stage pipeline, the current index, and tone. */
export interface StatusTrack {
  /** Ordered stage names, e.g. ['Idea','Bidding','Quoted','Won','Invoiced','Paid','Closed']. */
  stages: string[];
  /** Index of the current stage (0-based). */
  current: number;
  /** "risk" turns the current segment + kicker functional red. @default "normal" */
  tone?: 'normal' | 'risk';
}

/**
 * Taskimoo's signature component — the two parallel truths a project
 * carries, shown side by side: COMMERCIAL and DELIVERY stepped pipelines.
 * Never collapse them into one status; this keeps them visibly parallel.
 *
 * @startingPoint section="Data" subtitle="Parallel commercial + delivery pipelines" viewport="520x180"
 */
export interface DualStatusProps {
  /** Commercial pipeline track (idea → bidding → … → paid → closed). */
  commercial?: StatusTrack;
  /** Delivery pipeline track (draft → planned → … → released → closed). */
  delivery?: StatusTrack;
  /** Collapse each track to a single label + current-stage pill. @default false */
  compact?: boolean;
  /** Wrap in a bordered card. @default true */
  bordered?: boolean;
}

export declare function DualStatus(props: DualStatusProps): JSX.Element;
