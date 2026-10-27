import { CarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { carPictureSources, ContentImage } from '@/components';
import { useCarNames } from '@/hooks';
import type { HistoricRow } from '@/lib/season-review';

interface SeatLineProps {
  /**
   * The historic event, with the seat the player was invited into.
   */
  seat: HistoricRow;
}

// The seat a historic event invites the player into: the car and the team
// behind it - or the car they entered it in at their own cost.
export const SeatLine = ({ seat }: SeatLineProps) => {
  const { t } = useTranslation();
  const carName = useCarNames(seat.car ? [seat.car] : []);
  const { car } = seat;
  if (!car) return null;

  return (
    <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-3 rounded-lg border p-2">
      <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-muted">
        <ContentImage
          sources={carPictureSources(car)}
          alt={carName(car)}
          className="object-cover"
          fallback={(
            <div className="absolute inset-0 flex items-center justify-center">
              <CarIcon className="size-5 text-muted-foreground/40" />
            </div>
          )}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-medium">{carName(car)}</span>
        {seat.invited && seat.team ? (
          <span className="truncate text-xs text-muted-foreground">{seat.team}</span>
        ) : null}
        <span className="text-xs text-muted-foreground">
          {t(seat.invited ? 'home.historic.invited' : 'home.historic.entered')}
        </span>
      </div>
    </div>
  );
};
