import type { ReactNode } from 'react';

interface BriefTileProps {
  /**
   * What the tile says it is.
   */
  label: string;
  /**
   * A control at the end of the label's row, when it holds one.
   */
  action?: ReactNode;
  /**
   * The value, and anything under it.
   */
  children: ReactNode;
}

export const BriefTile = ({ label, action, children }: BriefTileProps) => (
  <div className="flex flex-col gap-1 rounded-md border bg-card px-3 py-2.5">
    <div className="flex items-center justify-between gap-2">
      <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {/* Pulled into the row's own height, so a tile with one is the height of
          the tiles beside it and its value starts clear of it. */}
      {action ? <div className="-my-2 shrink-0">{action}</div> : null}
    </div>
    {children}
  </div>
);
