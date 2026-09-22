import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { dotted } from './utils.ts';
import type { Car, CareerEventView, Skin } from '../../../../shared/types';
import { CarPicker } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
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
   * Called with the class, car and livery chosen.
   * @param entry The class entry's id
   * @param car The car and livery to race all season
   */
  onEnter: (entry: string, car: { model: string; skin?: string }) => void;
}

export const EnterPanel = ({ view, busy, onEnter }: EnterPanelProps) => {
  const { t } = useTranslation();
  // The first class the career may enter, not merely the first listed: a
  // multi-class championship's top class is usually the one out of reach.
  const [entry, setEntry] = useState(
    () => (view.classes.find((one) => one.eligible) ?? view.classes[0])?.id ?? '',
  );
  const [car, setCar] = useState<Car | null>(null);
  const [skin, setSkin] = useState<Skin | null>(null);
  const [picking, setPicking] = useState(false);

  const chosen = view.classes.find((one) => one.id === entry);
  const ready = !!chosen?.eligible && view.raceable && car !== null && !busy;

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
          <Badge variant="outline" className="self-start">{t('calendar.locked')}</Badge>
        ) : null}
        {!view.raceable ? (
          <p className="text-sm text-destructive">{t('event.enter.unraceable')}</p>
        ) : null}
        {chosen && chosen.cars.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('event.enter.noCars')}</p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm">
            {car
              ? dotted([car.name, skin?.name])
              : <span className="text-muted-foreground">{t('event.enter.noCar')}</span>}
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

        <Button
          type="button"
          disabled={!ready}
          onClick={() => car && onEnter(entry, { model: car.id, skin: skin?.id })}
        >
          {t('event.enter.action')}
        </Button>
      </CardContent>

      <CarPicker
        open={picking}
        selectedId={car?.id}
        selectedSkinId={skin?.id}
        // An empty id list would offer the whole library, so a class with no
        // installed car is not offered the picker at all.
        baseQuery={chosen && chosen.cars.length > 0 ? { ids: [...chosen.cars] } : undefined}
        onOpenChange={setPicking}
        onPick={(picked, pickedSkin) => { setCar(picked); setSkin(pickedSkin); setPicking(false); }}
      />
    </Card>
  );
};
