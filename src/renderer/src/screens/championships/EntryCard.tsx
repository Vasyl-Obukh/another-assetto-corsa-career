import { useTranslation } from 'react-i18next';

import { EntryCars } from './EntryCars.tsx';
import { SeatList } from './SeatList.tsx';
import { disciplineKey, tierAccent } from './utils.ts';
import type { ClassEntry, EntryAvailability, Team } from '../../../../shared/types';
import { carSpecName } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { useCars } from '@/hooks';
import { DISCIPLINE_ACCENT } from '@/lib/accents';

interface EntryCardProps {
  /**
   * One class the championship is entered as.
   */
  entry: ClassEntry;
  /**
   * What it can field against the installed content.
   */
  availability: EntryAvailability | undefined;
  /**
   * Every team the championship fields, for naming the one in each seat.
   */
  teams: readonly Team[];
}

export const EntryCard = ({ entry, availability, teams }: EntryCardProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const eligible = availability?.eligible ?? [];
  // One lookup for both the pictures and the balance table's names.
  const cars = useCars([...eligible, ...(entry.bop ?? []).map((bop) => bop.car)]);
  const fielded = eligible
    .flatMap((id) => cars.get(id) ?? [])
    .sort((left, right) => left.name.localeCompare(right.name));

  return (
    // Separated from the next class rather than boxed, the way the calendar
    // card does: a bordered box inside a bordered card is one frame too many,
    // and most championships run a single class.
    <div className="flex flex-col gap-2 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-medium">{entry.name}</span>

        <Badge className={DISCIPLINE_ACCENT[entry.ladder.discipline]}>
          {t(disciplineKey(entry.ladder.discipline))}
        </Badge>

        <Badge className={tierAccent(entry.ladder.tier)}>
          {t('championships.tier', { tier: entry.ladder.tier })}
        </Badge>
        <Badge variant="outline">{t('championships.grid', { count: entry.seats.length })}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Neutral on purpose: specs are an open set the user can add to, so
            no palette could give each its own colour. */}
        {entry.eligibility.kind === 'spec' ? (
          <Badge variant="secondary">{carSpecName(entry.eligibility.spec, catalogue)}</Badge>
        ) : (
          <Badge variant="outline">{t('championships.entries.cars')}</Badge>
        )}

        <Badge variant={availability?.enough ? 'success' : 'destructive'}>
          {t('championships.entries.eligible', { count: availability?.eligible.length ?? 0 })}
        </Badge>
      </div>

      {availability && !availability.enough ? (
        <p className="text-sm text-destructive">{t('championships.entries.notEnough')}</p>
      ) : null}

      {fielded.length > 0 ? <EntryCars cars={fielded} /> : null}

      {entry.bop?.length ? (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{t('championships.entries.bop')}</span>
          {entry.bop.map((bop) => (
            <span key={bop.car} className="text-sm">
              {t('championships.entries.bopRow', {
                car: cars.get(bop.car)?.name ?? bop.car,
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

      {/* Last in the card, so opening it moves nothing above it. The band under
          the pointer is the only thing saying it opens at all, and it is pulled
          out by its own padding so the label still lines up with the seats. */}
      <Accordion type="single" collapsible>
        <AccordionItem value="seats" className="border-b-0">
          <AccordionTrigger className="-mx-2 rounded-md px-2 py-2 hover:bg-accent/60 hover:no-underline">
            {t('championships.entries.seats')}
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-2">
            <SeatList seats={entry.seats} teams={teams} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
