import {
  CarIcon, MinusIcon, PlusIcon, UserIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CalendarPanel } from './CalendarPanel.tsx';
import { SeasonHero } from './SeasonHero.tsx';
import { SeatCar } from './SeatCar.tsx';
import type { SeatChoice } from './types.ts';
import { classCars } from './utils.ts';
import { MAX_START_YEAR, MIN_START_YEAR } from '../../../../shared/constants';
import type { CareerDriver, SeriesListing } from '../../../../shared/types';
import { SettingsSection } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useChampionshipPreview } from '@/hooks';
import { classAccent } from '@/lib/accents';
import { ChoiceChips, NationPicker } from '@/screens/championship-editor';

interface SeatStepProps {
  /**
   * The championship picked.
   */
  listing: SeriesListing;
  /**
   * The seat chosen so far.
   */
  seat: SeatChoice;
  /**
   * Changes the seat.
   * @param seat The seat as it now is
   */
  onSeat: (seat: SeatChoice) => void;
  /**
   * Who races it.
   */
  driver: CareerDriver;
  /**
   * Changes who races it.
   * @param driver The driver as they now are
   */
  onDriver: (driver: CareerDriver) => void;
  /**
   * The year it is raced in.
   */
  year: number;
  /**
   * Changes the year.
   * @param year The year, already held to the range a season may open in
   */
  onYear: (year: number) => void;
  /**
   * Whether the championship is being started, which holds the fields.
   */
  busy: boolean;
}

/**
 * New championship's second step: the season down the left, dated in the year
 * asked for, and the seat - a class first for a multi-class championship, then
 * a car and its livery - and who races it on the right.
 */
export const SeatStep = ({
  listing, seat, onSeat, driver, onDriver, year, onYear, busy,
}: SeatStepProps) => {
  const { t } = useTranslation();
  const preview = useChampionshipPreview(listing.series.id, year);
  const classes = useMemo(() => classCars(listing), [listing]);
  const chosen = classes.find((one) => one.entry.id === seat.entry) ?? classes[0];
  // What the year field holds while it is typed in, which may be no year yet.
  const [yearText, setYearText] = useState(String(year));
  const multi = classes.length > 1;
  const thisYear = new Date().getFullYear();

  /**
   * Sets the year, held to the range a season may open in, and shows it.
   * @param next The year asked for
   */
  const keepYear = (next: number): void => {
    const kept = Math.min(MAX_START_YEAR, Math.max(MIN_START_YEAR, next));
    onYear(kept);
    setYearText(String(kept));
  };

  /**
   * Takes the year field as it is typed, setting the year once it reads as one.
   * @param text What the field holds
   */
  const typeYear = (text: string): void => {
    setYearText(text);
    const next = Number(text);
    if (Number.isInteger(next) && next >= MIN_START_YEAR && next <= MAX_START_YEAR) onYear(next);
  };

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[28rem_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <SeasonHero listing={listing} />
        <CalendarPanel
          listing={listing}
          preview={preview}
          entry={chosen?.entry.id ?? ''}
          year={year}
          playerName={driver.name}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <SettingsSection
          icon={CarIcon}
          tone="you"
          title={t('newChampionship.seat')}
          hint={multi ? t('newChampionship.seatHintMulti') : t('newChampionship.seatHint')}
        >
          <div className="flex flex-col gap-4">
            {/* The class first, as a quick race asks it, each chip in its
                class's colour; then the car from it. */}
            {multi ? (
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">{t('race.car.racesIn')}</span>
                <ChoiceChips<string>
                  label={t('race.car.racesIn')}
                  options={classes.map((one) => one.entry.id)}
                  value={chosen?.entry.id ?? ''}
                  labelOf={(id) => classes.find((one) => one.entry.id === id)?.entry.name ?? id}
                  accentOf={(id) => classAccent(classes.findIndex((one) => one.entry.id === id)).chip}
                  disabled={busy}
                  onChange={(id) => onSeat({ entry: id, car: null, skin: null })}
                />
              </div>
            ) : null}

            <SeatCar
              cars={chosen?.cars ?? []}
              car={seat.car}
              skin={seat.skin}
              busy={busy}
              onPick={(car, skin) => onSeat({ entry: chosen?.entry.id ?? seat.entry, car, skin })}
            />
          </div>
        </SettingsSection>

        <SettingsSection icon={UserIcon} tone="you" title={t('newChampionship.driver')} hint={t('newChampionship.driverHint')}>
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-championship-name" className="text-sm font-medium">{t('newCareer.name')}</label>
                <Input
                  id="new-championship-name"
                  value={driver.name}
                  placeholder={t('newCareer.namePlaceholder')}
                  disabled={busy}
                  onChange={(event) => onDriver({ ...driver, name: event.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-championship-nation" className="text-sm font-medium">{t('newCareer.nation')}</label>
                <NationPicker
                  id="new-championship-nation"
                  value={driver.nation ?? undefined}
                  used={[]}
                  disabled={busy}
                  onChange={(next) => onDriver({ ...driver, nation: next ?? null })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-championship-season" className="text-sm font-medium">
                  {t('newChampionship.season')}
                </label>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={t('newCareer.earlier')}
                    disabled={busy || year <= MIN_START_YEAR}
                    onClick={() => keepYear(year - 1)}
                  >
                    <MinusIcon />
                  </Button>
                  <Input
                    id="new-championship-season"
                    type="number"
                    min={MIN_START_YEAR}
                    max={MAX_START_YEAR}
                    value={yearText}
                    disabled={busy}
                    onChange={(event) => typeYear(event.target.value)}
                    onBlur={() => keepYear(Number(yearText) || year)}
                    className="w-20 text-center font-semibold tabular-nums"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={t('newCareer.later')}
                    disabled={busy || year >= MAX_START_YEAR}
                    onClick={() => keepYear(year + 1)}
                  >
                    <PlusIcon />
                  </Button>
                  <Button variant="ghost" size="sm" disabled={busy || year === thisYear} onClick={() => keepYear(thisYear)}>
                    {t('newCareer.thisYear')}
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t('newChampionship.aidsHint')}</p>
          </div>
        </SettingsSection>
      </div>

    </div>
  );
};
