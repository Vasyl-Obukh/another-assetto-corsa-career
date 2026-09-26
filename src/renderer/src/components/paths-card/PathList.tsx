import { PATH_KINDS } from './constants.ts';
import { PathRow } from './PathRow.tsx';
import type { PathKind } from './types.ts';
import type { PathOverrides, PathsReport } from '../../../../shared/types';

interface PathListProps {
  /**
   * What probing found for all three paths.
   */
  report: PathsReport;
  /**
   * Paths the user has set by hand.
   */
  overrides: PathOverrides;
  /**
   * Whether a probe or override is in flight.
   */
  busy: boolean;
  /**
   * Opens a picker for one path.
   * @param kind Which path to pick
   */
  onPick(kind: PathKind): void;
  /**
   * Drops the override for one path.
   * @param kind Which path to reset
   */
  onClear(kind: PathKind): void;
}

/**
 * The three paths the app needs, a row each - shared by the diagnostics tab and
 * first-run setup, which ask the same question.
 */
export const PathList = ({
  report, overrides, busy, onPick, onClear,
}: PathListProps) => (
  <div className="flex flex-col">
    {PATH_KINDS.map((kind) => (
      <PathRow
        key={kind}
        kind={kind}
        probe={report[kind]}
        overridden={overrides[kind] !== undefined}
        busy={busy}
        onPick={onPick}
        onClear={onClear}
      />
    ))}
  </div>
);
