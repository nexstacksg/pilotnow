import * as React from 'react';

/** Chip — rounded tag for filters and metadata, larger than Pill. */
export interface ChipProps {
  children: React.ReactNode;
  /** CSS color for a leading dot. */
  dot?: string;
  /** Red-tinted variant. */
  red?: boolean;
  /** Geist Mono label. */
  mono?: boolean;
}

export declare function Chip(props: ChipProps): JSX.Element;
