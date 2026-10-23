import { CarIcon, LockIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  Car, CareerEventView, CarSource, Skin,
} from '../../../../shared/types';
import { rentOf } from '../../../../shared/utils/car-prices';
import {
  CarPicker, carPictureSources, CarSourceBadge, ContentImage, PurchaseDialog, SkipDialog, SkipNote,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { useGarage } from '@/hooks';
import { useFormat } from '@/i18n';
import { CAUTION_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { Field } from '@/screens/race';

interface EnterPanelProps {
  /**
   * The round the career would be entering at.
   */
  view: CareerEventView;
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * Whether to say which round entering starts from, for a page that is not
   * already that round's own.
   */
  showFirstRound?: boolean;
  /**
   * A class, car and livery to open on rather than the panel's own first
   * choice - an earlier edition's, when the page was opened to enter again.
   */
  initial?: {
    /**
     * The class entry's id.
     */
    entry: string;
    /**
     * The car, or null to leave it to the player.
     */
    car: Car | null;
    /**
     * The livery, or null for the car's own choice.
     */
    skin: Skin | null;
  };
  /**
   * Called with the class, car and livery chosen, once the player has
   * confirmed whatever entering now costs.
   * @param entry The class entry's id
   * @param car The car and livery to race all season - the career's own where
   * it has the car, which main then races in the garage's livery
   */
  onEnter: (entry: string, car: { model: string; skin?: string }) => void;
}

export const EnterPanel = ({
  view, busy, showFirstRound = false, initial, onEnter,
}: EnterPanelProps) => {
  const { t } = useTranslation();
  const { formatDayShort, formatMoney } = useFormat();
  const garage = useGarage();
  // The first class the career may enter, not merely the first listed: a
  // multi-class championship's top class is usually the one out of reach.
  const [entry, setEntry] = useState(() => (
    view.classes.find((one) => one.id === initial?.entry)
    ?? view.classes.find((one) => one.eligible)
    ?? view.classes[0]
  )?.id ?? '');
  const [car, setCar] = useState<Car | null>(initial?.car ?? null);
  const [skin, setSkin] = useState<Skin | null>(initial?.skin ?? null);
  const [picking, setPicking] = useState(false);
  // Entering a championship already rounds in asks first, here rather than in
  // each page that shows the panel.
  const [confirming, setConfirming] = useState(false);
  // A car picked to buy rather than rent, and its livery, while it is bought.
  const [buying, setBuying] = useState<{ car: Car; skin: Skin | null } | null>(null);

  const chosen = view.classes.find((one) => one.id === entry);
  const ready = !!chosen?.eligible && view.raceable && car !== null && !busy;
  // A car the career owns races in the livery it wears, whatever was picked.
  const owned = car && garage ? garage.owned(car.id) : null;
  const source: CarSource = owned ? 'owned' : 'rented';
  const livery = owned && car ? car.skins.find((one) => one.id === owned.skin) ?? skin : skin;
  const enter = (): void => {
    if (car) onEnter(entry, { model: car.id, skin: livery?.id });
  };

  return (
    <Card className="gap-3 border-dashed border-primary py-3">
      <CardHeader className="px-3">
        <CardTitle>{t('event.enter.title', { series: view.seriesName })}</CardTitle>
        <CardDescription>{t('event.enter.body')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3">
        {view.classes.length > 1 ? (
          <Field id="event-class" label={t('event.enter.class')}>
            <Select
              value={entry}
              onValueChange={(next) => { setEntry(next); setCar(null); setSkin(null); }}
            >
              <SelectTrigger id="event-class" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {view.classes.map((one) => (
                  <SelectItem key={one.id} value={one.id}>{one.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}

        {chosen && !chosen.eligible ? (
          <Badge className={cn('gap-1 self-start', CAUTION_ACCENT)}>
            <LockIcon className="size-3" />
            {t('calendar.locked')}
          </Badge>
        ) : null}
        {!view.raceable ? (
          <p className="text-sm text-destructive">{t('event.enter.unraceable')}</p>
        ) : null}
        {chosen && chosen.cars.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('event.enter.noCars')}</p>
        ) : null}

        <div className="flex items-center gap-3">
          {/* The car as it will look all season, once there is one. */}
          {car ? (
            <div className="relative aspect-[16/10] w-16 shrink-0 overflow-hidden rounded-md bg-muted">
              <ContentImage
                sources={carPictureSources(car.id, livery?.id)}
                alt={car.name}
                className="object-cover"
                fallback={(
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CarIcon className="size-4 text-muted-foreground/40" />
                  </div>
                )}
              />
            </div>
          ) : null}
          <span className="flex min-w-0 flex-1 flex-col text-sm">
            {car ? (
              <>
                <span className="truncate font-medium">{car.name}</span>
                <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                  {garage ? <CarSourceBadge source={source} /> : null}
                  {livery ? <span className="truncate">{livery.name}</span> : null}
                </span>
              </>
            ) : <span className="text-muted-foreground">{t('event.enter.noCar')}</span>}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!chosen || chosen.cars.length === 0}
            onClick={() => setPicking(true)}
          >
            {car ? t('event.enter.change') : t('event.enter.pick')}
          </Button>
        </div>

        {/* A rented car costs a round's rent beside its fee; the fee is said
            in the championship's summary. */}
        {car && garage && !owned ? (
          <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 border-t pt-2.5 text-xs">
            <dt className="text-muted-foreground">{t('event.enter.rent')}</dt>
            <dd className="text-right font-semibold tabular-nums">
              {t('event.enter.perRound', { amount: formatMoney(rentOf(garage.priceOf(car))) })}
            </dd>
            <dd className="col-span-2 text-muted-foreground">{t('event.enter.rentHint')}</dd>
          </dl>
        ) : null}

        {/* Said before Enter is pressed as well as asked after, so what
            entering now costs is never a surprise. */}
        {view.behind.length > 0 ? (
          <SkipNote
            title={t('skip.behindNote', { count: view.behind.length })}
            hint={t('skip.behindNoteHint')}
          />
        ) : null}

        <Button
          type="button"
          disabled={!ready}
          onClick={() => {
            if (!car) return;
            if (view.behind.length > 0) setConfirming(true);
            else enter();
          }}
        >
          {t('event.enter.action')}
        </Button>

        {showFirstRound ? (
          <p className="flex items-baseline justify-between gap-2 border-t pt-2.5 text-xs">
            <span className="text-muted-foreground">{t('event.enter.firstRound')}</span>
            <span className="text-right">
              <span className="font-semibold">
                {t('championships.detail.roundAt', { number: view.number, round: view.roundName })}
              </span>
              <span className="text-muted-foreground">{t('event.enter.firstRoundDay', { day: formatDayShort(view.date) })}</span>
            </span>
          </p>
        ) : null}
      </CardContent>

      <SkipDialog
        open={confirming}
        title={t('skip.enterTitle')}
        description={t('skip.enterHint', { series: view.seriesName, count: view.behind.length })}
        rounds={view.behind}
        confirmLabel={t('skip.enterConfirm', { number: view.behind.length + 1 })}
        busy={busy}
        onConfirm={() => {
          setConfirming(false);
          enter();
        }}
        onClose={() => setConfirming(false)}
      />

      <CarPicker
        open={picking}
        selectedId={car?.id}
        selectedSkinId={skin?.id}
        // An empty id list would offer the whole library, so a class with no
        // installed car is not offered the picker at all.
        baseQuery={chosen && chosen.cars.length > 0 ? { ids: [...chosen.cars] } : undefined}
        trade={garage ? { mode: 'pick', garage } : undefined}
        onOpenChange={setPicking}
        onPick={(picked, pickedSkin) => { setCar(picked); setSkin(pickedSkin); setPicking(false); }}
        onPurchase={(picked, pickedSkin) => setBuying({ car: picked, skin: pickedSkin })}
      />
      {garage ? (
        <PurchaseDialog
          car={buying?.car ?? null}
          skin={buying?.skin ?? null}
          garage={garage}
          onClose={(bought) => {
            // Bought, it is the career's own and the car the panel enters in.
            if (bought !== undefined && buying) {
              setCar(buying.car);
              setSkin(bought);
            }
            setBuying(null);
          }}
        />
      ) : null}
    </Card>
  );
};
