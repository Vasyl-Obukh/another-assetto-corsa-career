import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { carsFor } from './utils.ts';
import type {
  Car, Round, RoundForecast, SeriesListing, Skin,
} from '../../../../shared/types';
import { CarPicker, WeekendForecast } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { CONTROL_WIDTH } from '@/lib/layout.ts';

interface EnterRoundDialogProps {
  /**
   * The round being entered, or null when the dialog is closed.
   */
  round: Round | null;
  /**
   * The championship and its availability.
   */
  listing: SeriesListing;
  /**
   * The round's weather forecast, or null when its weather is authored.
   */
  forecast: RoundForecast | null;
  /**
   * Whether the round is being set up right now.
   */
  busy: boolean;
  /**
   * Called when the dialog closes itself.
   */
  onClose: () => void;
  /**
   * Called with the class entry, car and livery the player chose.
   * @param entry The class entry's id
   * @param car The car's folder ID
   * @param skin The livery's folder name, or undefined when the car ships none
   */
  onConfirm: (entry: string, car: string, skin?: string) => void;
}

export const EnterRoundDialog = ({
  round, listing, forecast, busy, onClose, onConfirm,
}: EnterRoundDialogProps) => {
  const { t } = useTranslation();
  const [entry, setEntry] = useState(listing.series.entries[0]?.id ?? '');
  const [car, setCar] = useState<Car | null>(null);
  const [skin, setSkin] = useState<Skin | null>(null);
  const [picking, setPicking] = useState(false);

  const eligible = useMemo(
    () => (round ? carsFor(listing, entry, round.id) : []),
    [listing, entry, round],
  );

  // Never send an empty list: an empty `ids` is not a filter, so the picker
  // would offer the whole library rather than nothing.
  const baseQuery = eligible.length ? { ids: [...eligible] } : undefined;

  // A livery is only ever set alongside a car, so the second line never names
  // one without the other.
  const model = car === null ? t('championships.enter.car') : car.name;
  const chosen = skin === null
    ? model
    : t('championships.enter.carLivery', { car: model, livery: skin.name });

  return (
    <Dialog open={round !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('championships.enter.title', { round: round?.name ?? '' })}</DialogTitle>
          <DialogDescription>{t('championships.enter.hint')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {listing.series.entries.length > 1 ? (
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm">{t('championships.enter.entry')}</span>
              <Select
                value={entry}
                onValueChange={(next) => {
                  // Changing class throws the car away rather than carrying it
                  // across: a car eligible for one class almost never is for
                  // another, and keeping an ineligible one would be refused by
                  // main with nothing on screen to explain why.
                  setEntry(next);
                  setCar(null);
                  setSkin(null);
                }}
              >
                <SelectTrigger className={CONTROL_WIDTH}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {listing.series.entries.map((one) => (
                    <SelectItem key={one.id} value={one.id}>{one.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {/* Before the car, since the weather is part of what is being
              committed to - and it is the same draw the race will run. */}
          {forecast ? <WeekendForecast forecast={forecast} /> : null}

          <div className="flex items-center justify-between gap-4">
            <span className="min-w-0 flex-1 truncate text-sm" title={chosen}>{chosen}</span>
            <Button variant="outline" size="sm" onClick={() => setPicking(true)}>
              {t(car ? 'championships.enter.change' : 'championships.enter.pick')}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{t('championships.enter.cancel')}</Button>
          <Button
            disabled={car === null || busy}
            onClick={() => { if (car) onConfirm(entry, car.id, skin?.id); }}
          >
            {t('championships.enter.confirm')}
          </Button>
        </DialogFooter>

        <CarPicker
          open={picking}
          selectedId={car?.id}
          selectedSkinId={skin?.id}
          baseQuery={baseQuery}
          onOpenChange={setPicking}
          onPick={(picked, livery) => { setCar(picked); setSkin(livery); }}
        />
      </DialogContent>
    </Dialog>
  );
};
