import { ArrowLeftIcon, PlayIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { PickStep } from './PickStep.tsx';
import { SeatStep } from './SeatStep.tsx';
import { Stepper } from './Stepper.tsx';
import type { SeatChoice, Step } from './types.ts';
import { classCars } from './utils.ts';
import type { CareerDriver } from '../../../../shared/types';
import { roundRaceableIn, seatRaceableIn } from '../../../../shared/utils/round-availability';
import { useSettings, useSlot } from '@/app';
import {
  ErrorCard, ScreenBody, ScreenHeader, SkipNote,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useChampionships } from '@/hooks';
import { toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';
import { path } from '@/lib/routes';

/**
 * New championship: a standalone championship in two steps - which
 * championship, then the seat in it and who races it, in which year.
 */
export const NewChampionship = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { createChampionship } = useSlot();
  // Read once for both steps, so the seat has the championship picked at once.
  const championships = useChampionships();

  const [step, setStep] = useState<Step>('pick');
  const [series, setSeries] = useState<string | null>(null);
  const [seat, setSeat] = useState<SeatChoice>({ entry: '', car: null, skin: null });
  const [driver, setDriver] = useState<CareerDriver>({
    name: settings.driverName ?? '', nation: settings.driverNation ?? null,
  });
  const [year, setYear] = useState(new Date().getFullYear());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DisplayableError | null>(null);

  const listing = championships.listings.find((one) => one.series.id === series) ?? null;
  // In the car picked, once there is one: a round that does not run it is as
  // far out of reach as one missing its track.
  const stuck = listing?.series.rounds.filter((round) => !(seat.car
    ? seatRaceableIn(listing.availability, round.id, seat.entry, seat.car.id)
    : roundRaceableIn(listing.availability, round.id))).length ?? 0;
  const ready = listing !== null && seat.car !== null && driver.name.trim() !== '' && !busy;

  /**
   * Picks a championship and goes straight on to its seat. One picked afresh
   * starts the seat afresh, in the first class anything installed can race;
   * the same one picked again keeps it.
   * @param id The championship's id
   */
  const choose = (id: string): void => {
    if (id !== series) {
      const picked = championships.listings.find((one) => one.series.id === id);
      const classes = picked ? classCars(picked) : [];
      const first = classes.find((one) => one.cars.length > 0) ?? classes[0];
      setSeries(id);
      setSeat({ entry: first?.entry.id ?? '', car: null, skin: null });
    }
    setStep('seat');
  };

  /**
   * Starts the championship and opens it, saying why where it could not start.
   */
  const start = async (): Promise<void> => {
    if (!listing || !seat.car) return;
    setBusy(true);
    try {
      await createChampionship({
        driver: { name: driver.name.trim(), nation: driver.nation },
        year,
        series: listing.series.id,
        entry: seat.entry,
        car: { model: seat.car.id, skin: seat.skin?.id },
      });
      void navigate(path.standalone());
    } catch (thrown: unknown) {
      setError(toDisplayableError(thrown));
      setBusy(false);
    }
  };

  const header = (
    <ScreenHeader
      back={{ to: path.start(), label: t('back.start') }}
      aside={step === 'pick' ? (
        <Button variant="ghost" onClick={() => { void navigate(-1); }}>{t('newChampionship.cancel')}</Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" disabled={busy} onClick={() => setStep('pick')}>
            <ArrowLeftIcon />
            {t('newChampionship.back')}
          </Button>
          <Button disabled={!ready} onClick={() => { void start(); }}>
            <PlayIcon />
            {t('newChampionship.start')}
          </Button>
        </div>
      )}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <h1 className="text-2xl font-semibold">{t('newChampionship.title')}</h1>
        <Stepper step={step} />
      </div>
    </ScreenHeader>
  );

  if (step === 'pick' || !listing) {
    return (
      <PickStep
        heading={header}
        championships={championships}
        picked={series}
        onChoose={choose}
      />
    );
  }

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      {header}
      {error ? <ErrorCard error={error} onDismiss={() => setError(null)} /> : null}
      {/* Not a reason to refuse Start: the content may be installed before the
          season gets there, and a round still out of reach is skipped then. */}
      {stuck > 0 ? (
        <SkipNote title={t('newChampionship.stuckTitle', { count: stuck })} hint={t('newChampionship.stuckHint', { count: stuck })} />
      ) : null}
      <SeatStep
        listing={listing}
        seat={seat}
        onSeat={setSeat}
        driver={driver}
        onDriver={setDriver}
        year={year}
        onYear={setYear}
        busy={busy}
      />
    </ScreenBody>
  );
};
