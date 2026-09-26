import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { QuickRaceView } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { classAccent } from '@/lib/accents';

interface RaceWeekendHeadProps {
  /**
   * The race weekend.
   */
  view: QuickRaceView;
  /**
   * Where it is launched from, on the right.
   */
  launch: ReactNode;
}

/**
 * The top of a race weekend's page, laid out as a round's: its classes as
 * chips in their colours, its name, and a line of what it is - with the
 * launch where the round page puts its map, in reach from anywhere below.
 */
export const RaceWeekendHead = ({ view, launch }: RaceWeekendHeadProps) => {
  const { t } = useTranslation();
  const { race } = view;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1.5">
        {race.classes.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {race.classes.map((one, slot) => (
              <Badge key={one.id} className={classAccent(slot).chip}>
                {t('race.head.class', { name: one.name, count: one.cars })}
              </Badge>
            ))}
          </div>
        ) : null}
        <h1 className={view.title ? 'text-2xl font-semibold' : 'text-2xl font-semibold text-muted-foreground'} data-selectable>
          {view.title || t('race.untitled')}
        </h1>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{t('race.head.own')}</span>
          {view.grid.length > 0 ? <span>{t('race.head.grid', { count: view.grid.length })}</span> : null}
          <span>{t('race.head.sessions', { count: race.sessions.length })}</span>
        </p>
      </div>
      {launch}
    </div>
  );
};
