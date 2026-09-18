import { useTranslation } from 'react-i18next';

import { MOD_MAKERS } from './constants.ts';
import { DlcPacksField } from './DlcPacksField.tsx';
import { toggled } from './utils.ts';
import type { SeriesListing } from '../../../../shared/types';
import { hiddenCount } from '../../../../shared/utils/content-sources';
import { useSettings } from '@/app';
import {
  FieldGrid, FieldRow, makerNameKey, ToggleRow,
} from '@/components';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';

interface SourcesCardProps {
  /**
   * The championship library, for what switching each source off would hide.
   */
  listings: readonly SeriesListing[];
}

export const SourcesCard = ({ listings }: SourcesCardProps) => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();
  const hidden = settings.hiddenContentSources;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('championshipLibrary.sources')}</CardTitle>
        <CardDescription>{t('championshipLibrary.sourcesHint')}</CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGrid>
          {/* No control: a base-only ladder is always offered. */}
          <FieldRow label={t('championshipLibrary.base')} hint={t('championshipLibrary.baseHint')}>
            <span className="text-sm text-muted-foreground">{t('championshipLibrary.alwaysOffered')}</span>
          </FieldRow>

          <DlcPacksField listings={listings} />

          {MOD_MAKERS.map((maker) => (
            <ToggleRow
              key={maker}
              label={t(makerNameKey(maker))}
              hint={t('championshipLibrary.hides', {
                count: hiddenCount(listings, { packs: [], makers: [maker] }),
              })}
              value={!hidden.makers.includes(maker)}
              onChange={() => patch({
                hiddenContentSources: { ...hidden, makers: toggled(hidden.makers, maker, MOD_MAKERS) },
              })}
            />
          ))}
        </FieldGrid>
      </CardContent>
    </Card>
  );
};
