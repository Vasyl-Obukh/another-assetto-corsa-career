import { FolderOpenIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from './StatusBadge.tsx';
import type { PathKind } from './types.ts';
import type { PathProbe } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';

interface PathRowProps {
  /**
   * Which path this row is for.
   */
  kind: PathKind;
  /**
   * What probing found for it.
   */
  probe: PathProbe;
  /**
   * Whether the user has set this path by hand.
   */
  overridden: boolean;
  /**
   * Whether a probe or override is in flight.
   */
  busy: boolean;
  /**
   * Opens a picker for this path.
   * @param kind Which path to pick
   */
  onPick(kind: PathKind): void;
  /**
   * Drops the override for this path.
   * @param kind Which path to clear
   */
  onClear(kind: PathKind): void;
}

export const PathRow = ({
  kind,
  probe,
  overridden,
  busy,
  onPick,
  onClear,
}: PathRowProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-[11rem_1fr_auto] items-start gap-4 py-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{t(`paths.${kind}`)}</span>
        <StatusBadge probe={probe} />
      </div>

      <div className="flex min-w-0 flex-col gap-1 pt-0.5">
        <span
          data-selectable
          className="truncate font-mono text-sm text-muted-foreground"
          title={probe.value ?? undefined}
        >
          {probe.value ?? t('paths.undetected')}
        </span>
        {probe.origin ? (
          <span className="text-xs text-muted-foreground/70">{t(`paths.origin.${probe.origin}`)}</span>
        ) : null}
        {probe.error ? (
          <span className="text-xs text-destructive">{probe.error}</span>
        ) : null}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={busy} onClick={() => onPick(kind)}>
          <FolderOpenIcon />
          {t('paths.change')}
        </Button>
        {overridden ? (
          <Button
            variant="ghost"
            size="icon"
            disabled={busy}
            aria-label={t('paths.clear')}
            title={t('paths.clear')}
            onClick={() => onClear(kind)}
          >
            <XIcon />
          </Button>
        ) : null}
      </div>
    </div>
  );
};
