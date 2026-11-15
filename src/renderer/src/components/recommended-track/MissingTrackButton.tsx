import { useState } from 'react';

import { MissingTrackCircuit } from './MissingTrackCircuit.tsx';
import { recommendedLayout } from '../../../../shared/utils/recommended-tracks';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { cn } from '@/lib/utils.ts';

interface MissingTrackButtonProps {
  /**
   * The recommended layout the round races, if it names one.
   */
  layout?: string;
  /**
   * What the chip says.
   */
  label: string;
  /**
   * The dialog's title.
   */
  title: string;
  /**
   * Classes for the chip.
   */
  className?: string;
}

/**
 * A round's "not installed" chip. At a recommended layout it is a button
 * opening the circuit's card - the Tracks tab's own - to choose a track or find
 * where to get one; at any other track it is only the chip.
 */
export const MissingTrackButton = ({
  layout, label, title, className,
}: MissingTrackButtonProps) => {
  const [open, setOpen] = useState(false);
  const entry = layout ? recommendedLayout(layout) : null;

  if (!entry) return <Badge variant="destructive" className={className}>{label}</Badge>;

  return (
    <>
      <Badge asChild variant="destructive" className={cn('hover:opacity-85', className)}>
        <button type="button" onClick={() => setOpen(true)}>{label}</button>
      </Badge>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {/* Inside the content, so the states are read only while it is open
              rather than once per chip down a calendar. */}
          <MissingTrackCircuit entry={entry} />
        </DialogContent>
      </Dialog>
    </>
  );
};
