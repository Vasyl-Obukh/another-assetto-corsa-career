import {
  CheckIcon, FolderOpenIcon, RotateCcwIcon, TriangleAlertIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { PathKind } from './types.ts';
import type { PathProbe } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useAppError } from '@/i18n';
import { ORIGIN_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

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
   * Drops the override for this path, going back to detecting it.
   * @param kind Which path to reset
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
  const describeError = useAppError();

  return (
    <div className="grid grid-cols-[1.5rem_10rem_minmax(0,1fr)_auto] items-center gap-3 border-t py-3 first:border-t-0">
      {/* Green when found; red for a path that was named and is not there,
          amber for one nothing has named yet - the first is broken and the
          second is merely not done. */}
      <span
        aria-label={probe.exists ? t('paths.found') : t(probe.value ? 'paths.missing' : 'paths.undetected')}
        className={cn(
          'grid size-6 place-items-center rounded-full',
          probe.exists && 'bg-provenance-base text-provenance-base-foreground',
          !probe.exists && probe.value && 'bg-destructive text-destructive-foreground',
          !probe.exists && !probe.value && 'bg-warning text-warning-foreground',
        )}
      >
        {probe.exists ? <CheckIcon className="size-3.5" /> : <TriangleAlertIcon className="size-3.5" />}
      </span>

      <span className="text-sm font-medium">{t(`paths.${kind}`)}</span>

      <div className="flex min-w-0 flex-col items-start gap-1">
        <span
          data-selectable
          className={cn('max-w-full truncate font-mono text-sm', !probe.value && 'text-muted-foreground')}
          title={probe.value ?? undefined}
        >
          {probe.value ?? t('paths.undetected')}
        </span>
        {/* Whose answer this is - the user's own in the hue that means "yours". */}
        {probe.origin ? (
          <Badge variant="secondary" className={cn('font-normal', overridden && ORIGIN_ACCENT.user)}>
            {t(`paths.origin.${probe.origin}`)}
          </Badge>
        ) : null}
        {probe.error ? (
          <span className="text-xs text-destructive">{describeError(probe.error)}</span>
        ) : null}
      </div>

      <div className="flex gap-2">
        {/* Forgetting the user's folder detects it again rather than leaving
            the path empty, so it says that rather than wearing a cross. */}
        {overridden ? (
          <Button variant="ghost" size="sm" disabled={busy} title={t('paths.clearHint')} onClick={() => onClear(kind)}>
            <RotateCcwIcon />
            {t('paths.clear')}
          </Button>
        ) : null}
        <Button variant="outline" size="sm" disabled={busy} onClick={() => onPick(kind)}>
          <FolderOpenIcon />
          {t('paths.change')}
        </Button>
      </div>
    </div>
  );
};
