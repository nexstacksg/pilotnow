import * as React from 'react';

/** A crumb — a bare string label, or label + href/onClick. */
export type Crumb = string | { label: React.ReactNode; href?: string; onClick?: (e: React.MouseEvent) => void };

/**
 * Topbar breadcrumb trail. Faint chevron separators; the last item is the
 * current page (ink, medium). Earlier items are links.
 */
export interface BreadcrumbProps {
  items: Crumb[];
}

export declare function Breadcrumb(props: BreadcrumbProps): JSX.Element;
