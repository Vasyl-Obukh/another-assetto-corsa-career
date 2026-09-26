import { FolderIcon, RefreshCwIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PathList } from './PathList.tsx';
import type { PathKind } from './types.ts';
import type { PathOverrides, PathsReport } from '../../../../shared/types';
import { SettingsSection } from '@/components/SettingsSection.tsx';
import { Button } from '@/components/ui/button.tsx';

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
   * @param kind Which path to reset
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
    <SettingsSection
      icon={FolderIcon}
      tone="look"
      title={t('paths.title')}
      hint={t('paths.description')}
      footer={(
        <Button variant="outline" size="sm" disabled={busy} onClick={onRefresh}>
          <RefreshCwIcon />
          {t('paths.recheck')}
        </Button>
      )}
    >
      <PathList report={report} overrides={overrides} busy={busy} onPick={onPick} onClear={onClear} />
    </SettingsSection>
  );
};
