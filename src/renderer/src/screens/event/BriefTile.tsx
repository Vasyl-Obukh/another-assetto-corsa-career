import type { ReactNode } from 'react';

interface BriefTileProps {
  /**
   * What the tile says it is.
   */
  label: string;
  /**
   * The value, and anything under it.
   */
  children: ReactNode;
}

export const BriefTile = ({ label, children }: BriefTileProps) => (
  <div className="flex flex-col gap-1 rounded-md border bg-card px-3 py-2.5">
    <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
      {label}
    </span>
    {children}
  </div>
);
