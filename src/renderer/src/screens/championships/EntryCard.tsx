import { useTranslation } from 'react-i18next';

import { disciplineKey } from './utils.ts';
import type { ClassEntry, EntryAvailability } from '../../../../shared/types';
import { carSpecName } from '../../../../shared/utils/car-classes';
import { Badge } from '@/components/ui/badge.tsx';

interface EntryCardProps {
  /**
   * One way into the championship.
   */
  entry: ClassEntry;
  /**
   * What it can field against the installed content.
   */
  availability: EntryAvailability | undefined;
}

export const EntryCard = ({ entry, availability }: EntryCardProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-medium">{entry.name}</span>

        <Badge variant="outline">{t(disciplineKey(entry.ladder.discipline))}</Badge>
        <Badge variant="outline">{t('championships.tier', { tier: entry.ladder.tier })}</Badge>
        <Badge variant="outline">{t('championships.grid', { count: entry.entrants })}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {entry.eligibility.kind === 'spec' ? (
          <Badge variant="secondary">{carSpecName(entry.eligibility.spec)}</Badge>
        ) : (
          <Badge variant="outline">{t('championships.entries.cars')}</Badge>
        )}

        <Badge variant={availability?.enough ? 'secondary' : 'destructive'}>
          {t('championships.entries.eligible', { count: availability?.eligible.length ?? 0 })}
        </Badge>
      </div>

      {availability && !availability.enough ? (
        <p className="text-sm text-destructive">{t('championships.entries.notEnough')}</p>
      ) : null}

      {entry.bop?.length ? (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{t('championships.entries.bop')}</span>
          {entry.bop.map((bop) => (
            <span key={bop.car} className="text-sm">
              {t('championships.entries.bopRow', {
                car: bop.car,
                adjustments: [
                  bop.ballast ? t('championships.entries.ballast', { value: bop.ballast }) : null,
                  bop.restrictor
                    ? t('championships.entries.restrictor', { value: bop.restrictor })
                    : null,
                ].filter(Boolean).join(', '),
              })}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};
