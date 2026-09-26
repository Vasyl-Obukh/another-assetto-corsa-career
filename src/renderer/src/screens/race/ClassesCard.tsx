import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { QuickClassItem } from './QuickClassItem.tsx';
import { QuickClassPanel } from './QuickClassPanel.tsx';
import type { QuickRace, Track } from '../../../../shared/types';
import { carsOf } from '../../../../shared/utils/eligibility';
import {
  addClass, carFits, moveClass, removeClass, withClass,
} from '../../../../shared/utils/quick-race';
import { useClasses } from '@/app';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { useCars } from '@/hooks';
import { classAccent } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface ClassesCardProps {
  /**
   * The race weekend.
   */
  race: QuickRace;
  /**
   * Its layout, whose pit boxes cap the field, or null while it has none.
   */
  track: Track | null;
  /**
   * Whether the weekend has started, in which case nothing can change.
   */
  locked: boolean;
  /**
   * Called with the race whenever a class changes.
   * @param next The race
   */
  onChange: (next: QuickRace) => void;
}

/**
 * What a race weekend's field is drawn from: its classes down the side, each
 * with how many cars it holds, and the one picked opened beside them - the
 * championship editor's classes, cut to what a single race asks.
 */
export const ClassesCard = ({
  race, track, locked, onChange,
}: ClassesCardProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const [picked, setPicked] = useState<string | null>(null);
  const cars = new Map(race.classes.map((one) => [one.id, carsOf(one.eligibility, catalogue)]));
  const installed = useCars([...new Set([...cars.values()].flat())]);
  const open = race.classes.find((one) => one.id === picked) ?? race.classes[0];
  const fits = carFits(race, catalogue);
  const total = race.classes.reduce((sum, one) => sum + one.cars, 0);
  const pits = track?.pitboxes ?? null;
  const span = Math.max(total, pits ?? 0, 1);

  /**
   * How many of a class's cars are installed.
   * @param id The class
   * @returns The count
   */
  const installedIn = (id: string): number => (cars.get(id) ?? []).filter((car) => installed.has(car)).length;

  /**
   * Adds a class, numbered after the ones there are, and opens it.
   */
  const add = (): void => {
    const added = addClass(race, t('race.classes.defaultName', { number: race.classes.length + 1 }));
    onChange(added.race);
    setPicked(added.id);
  };

  return (
    <Card className="gap-4 p-4">
      {race.classes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{t('race.classes.none')}</span>
          <span>{t('race.classes.noneHint')}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={locked}
            onClick={add}
          >
            <PlusIcon />
            {t('race.classes.add')}
          </Button>
        </div>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[19rem_minmax(0,1fr)]">
          <div className="flex flex-col gap-2">
            {race.classes.map((one, slot) => (
              <QuickClassItem
                key={one.id}
                entry={one}
                slot={slot}
                yours={one.id === race.playerClass}
                misfit={one.id === race.playerClass && !fits}
                installed={installedIn(one.id)}
                selected={one.id === open?.id}
                locked={locked}
                onSelect={() => setPicked(one.id)}
                onCount={(count) => onChange(withClass(race, one.id, { cars: count }))}
              />
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-dashed"
              disabled={locked}
              onClick={add}
            >
              <PlusIcon />
              {t('race.classes.add')}
            </Button>

            {/* The grid split by class against the pit lane, amber once it
                will not fit. */}
            <div className="mt-1 flex flex-col gap-1.5">
              <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted">
                {race.classes.map((one, slot) => (
                  <span
                    key={one.id}
                    className={cn('h-full', classAccent(slot).mark)}
                    style={{ width: `${(one.cars / span) * 100}%` }}
                  />
                ))}
              </div>
              <span className={cn(
                'text-xs',
                pits !== null && total > pits ? 'font-medium text-warning-foreground dark:text-warning' : 'text-muted-foreground',
              )}
              >
                {pits === null
                  ? t('race.classes.total', { count: total })
                  : t('race.classes.totalOfPits', { count: total, pits })}
              </span>
            </div>
          </div>

          {open ? (
            <QuickClassPanel
              key={open.id}
              entry={open}
              slot={race.classes.indexOf(open)}
              count={race.classes.length}
              installed={installedIn(open.id)}
              raceGrid={race.grid ?? {}}
              locked={locked}
              onChange={(patch) => onChange(withClass(race, open.id, patch))}
              onMove={(by) => onChange(moveClass(race, open.id, by))}
              onRemove={() => { onChange(removeClass(race, open.id)); setPicked(null); }}
            />
          ) : null}
        </div>
      )}
    </Card>
  );
};
