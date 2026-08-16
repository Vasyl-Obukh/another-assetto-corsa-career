import { RefreshCwIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PATH_KINDS } from './constants.ts';
import { PathRow } from './PathRow.tsx';
import type { PathKind } from './types.ts';
import type { PathOverrides, PathsReport } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { Separator } from '@/components/ui/separator.tsx';

interface PathsCardProps {
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
   * @param kind Which path to clear
   */
  onClear(kind: PathKind): void;
  /**
   * Probes every path again.
   */
  onRefresh(): void;
}

export const PathsCard = ({
  report,
  overrides,
  busy,
  onPick,
  onClear,
  onRefresh,
}: PathsCardProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('paths.title')}</CardTitle>
        <CardDescription>{t('paths.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
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

        <Separator className="my-4" />

        <Button variant="outline" size="sm" disabled={busy} onClick={onRefresh}>
          <RefreshCwIcon />
          {t('paths.recheck')}
        </Button>
      </CardContent>
    </Card>
  );
};
