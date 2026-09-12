import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge.tsx';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';

interface EditorSectionProps {
  /**
   * The section's icon, which is what makes it findable while scrolling.
   */
  icon: ReactNode;
  /**
   * The already-translated heading.
   */
  title: string;
  /**
   * An already-translated line under it, for what the heading cannot carry.
   */
  hint?: string;
  /**
   * An already-translated count or summary, shown at the end of the heading.
   *
   * What lets the page be read at a glance: "6 teams", "2 classes, 16 seats",
   * "5 rounds". A section with nothing worth counting passes none.
   */
  summary?: string;
  /**
   * Classes for the content, which owns its own layout.
   */
  className?: string;
  /**
   * The section's controls.
   */
  children: ReactNode;
}

/**
 * One card of the editor, headed the same way as every other.
 *
 * A component rather than six copies of the same header: the editor is a long
 * page of cards, and an icon and a count in every heading are what make it
 * navigable rather than a wall of identical grey fields.
 */
export const EditorSection = ({
  icon, title, hint, summary, className, children,
}: EditorSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <span className="text-muted-foreground [&>svg]:size-4">{icon}</span>
        <span className="min-w-0 flex-1 truncate">{title}</span>
        {summary === undefined ? null : (
          <Badge variant="outline" className="shrink-0 font-normal">{summary}</Badge>
        )}
      </CardTitle>

      {hint === undefined ? null : <CardDescription>{hint}</CardDescription>}
    </CardHeader>

    <CardContent className={className}>{children}</CardContent>
  </Card>
);
