interface PaneHeadingProps {
  /**
   * The heading, already translated.
   */
  children: string;
}

/**
 * What one pane of a split card holds, in small capitals above its fields.
 */
export const PaneHeading = ({ children }: PaneHeadingProps) => (
  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{children}</h3>
);
