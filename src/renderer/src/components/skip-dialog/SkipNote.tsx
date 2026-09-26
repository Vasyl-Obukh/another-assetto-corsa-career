import { TriangleAlertIcon } from 'lucide-react';

interface SkipNoteProps {
  /**
   * What the action would cost, as one sentence that leads.
   */
  title: string;
  /**
   * What that means, after it.
   */
  hint: string;
}

/**
 * The amber line above a button that would cost rounds, so what it costs is
 * read before it is pressed rather than only in the dialog after.
 */
export const SkipNote = ({ title, hint }: SkipNoteProps) => (
  <p className="flex items-start gap-2.5 rounded-lg bg-warning/20 px-3 py-2.5 text-sm">
    <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
    <span>
      <span className="font-semibold">{title}</span>
      {' '}
      {hint}
    </span>
  </p>
);
