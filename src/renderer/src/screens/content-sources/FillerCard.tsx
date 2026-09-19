import { useTranslation } from 'react-i18next';

import type { SeriesListing } from '../../../../shared/types';
import { useSettings } from '@/app';
import { FieldGrid, ToggleRow } from '@/components';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';

interface FillerCardProps {
  /**
   * The championship library, for how many the switch hides.
   */
  listings: readonly SeriesListing[];
}

export const FillerCard = ({ listings }: FillerCardProps) => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();
  const count = listings.filter((listing) => listing.filler).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('championshipLibrary.filler')}</CardTitle>
        <CardDescription>{t('championshipLibrary.fillerHint')}</CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGrid>
          <ToggleRow
            label={t('championshipLibrary.fillerOffered')}
            hint={t('championshipLibrary.hides', { count })}
            value={settings.showFillerSeries}
            onChange={(next) => patch({ showFillerSeries: next })}
          />
        </FieldGrid>
      </CardContent>
    </Card>
  );
};
