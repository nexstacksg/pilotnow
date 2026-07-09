import * as React from 'react';

/** Initials avatar with an AI-agent star variant. */
export interface AvatarProps {
  /** Explicit initials. If omitted, derived from `name`. */
  initials?: string;
  /** Full name — used for the tooltip and to derive initials. */
  name?: string;
  /** Render the agent marker (ink background, red star). */
  ai?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md';
  /** Color preset. */
  tone?: 'red' | 'dark';
}

export declare function Avatar(props: AvatarProps): JSX.Element;
