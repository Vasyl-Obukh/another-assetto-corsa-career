import { CarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { dotted, entryImageSources } from './utils.ts';
import type { EventEntry } from '../../../../shared/types';
import { ContentImage } from '@/components';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useCarNames } from '@/hooks';

interface EntryPanelProps {
  /**
   * How the career is entered.
   */
  entry: EventEntry;
}

export const EntryPanel = ({ entry }: EntryPanelProps) => {
  const { t } = useTranslation();
  const carName = useCarNames([entry.car.model]);

  return (
    <Card className="gap-3 py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('event.entry.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
          <ContentImage
            sources={entryImageSources(entry.car.model, entry.car.skin)}
            alt={carName(entry.car.model)}
            className="object-cover"
            fallback={(
              <div className="absolute inset-0 flex items-center justify-center">
                <CarIcon className="size-8 text-muted-foreground/40" />
              </div>
            )}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{carName(entry.car.model)}</span>
          <span className="text-xs text-muted-foreground">{dotted([entry.team, entry.entryName])}</span>
          <span className="text-xs text-muted-foreground">{t('event.entry.season')}</span>
        </div>
      </CardContent>
    </Card>
  );
};
