import { AlertTriangleIcon } from 'lucide-react';

import { useAppError } from '@/i18n';
import type { DisplayableError } from '@/lib/ipc';

interface ProblemListProps {
  /**
   * What is wrong. The list renders nothing at all when this is empty.
   */
  problems: readonly DisplayableError[];
  /**
   * The heading, already counted and translated by the caller.
   */
  label: string;
  /**
   * A line under the list saying what it means, or undefined for none.
   */
  hint?: string;
}

export const ProblemList = ({ problems, label, hint }: ProblemListProps) => {
  const describeError = useAppError();

  if (problems.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-md border border-destructive/50 p-3">
      <span className="flex items-center gap-2 text-sm font-medium text-destructive">
        <AlertTriangleIcon className="size-4" />
        {label}
      </span>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
        {problems.map((problem) => (
          <li key={(problem.code ?? '') + problem.message} data-selectable>
            {describeError(problem)}
          </li>
        ))}
      </ul>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
};
