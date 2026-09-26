import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { TierMedal } from './TierMedal.tsx';
import { disciplineKey } from './utils.ts';
import type { Discipline } from '../../../../shared/types';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface SeasonBandProps {
  /**
   * Every discipline the championship's classes race in, each once.
   */
  disciplines: readonly Discipline[];
  /**
   * Every tier its classes enter at, each once, top rung first.
   */
  tiers: readonly number[];
  /**
   * The menu button, placed in the band's far corner.
   */
  menu: ReactNode;
  /**
   * Classes for everything but the menu, for a card that is switched off.
   */
  dimmed?: string | false;
}

// A settings card's head: a band in its discipline's colour - split between
// them, for a grid mixing two - with the tiers it enters at as medals and the
// menu in the corner.
export const SeasonBand = ({
  disciplines, tiers, menu, dimmed,
}: SeasonBandProps) => {
  const { t } = useTranslation();
  const last = disciplines.length - 1;

  return (
    <div className="flex">
      {disciplines.map((discipline, index) => (
        <div
          key={discipline}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 py-2 pr-2 pl-4 text-xs font-semibold',
            DISCIPLINE_ACCENT[discipline],
          )}
        >
          <span className={cn('truncate', dimmed)}>{t(disciplineKey(discipline))}</span>

          {index === last ? (
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <div className={cn('flex -space-x-1', dimmed)}>
                {tiers.map((tier) => (
                  <TierMedal key={tier} tier={tier} className="size-6 text-xs ring-2 ring-card" />
                ))}
              </div>
              {/* Above the stretched title, or its click would swallow the menu's. */}
              <div className="relative z-10">{menu}</div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};
