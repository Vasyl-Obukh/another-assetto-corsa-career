import { KeyRoundIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SkinStep } from './SkinStep.tsx';
import type { Car, CarQuery, Skin } from '../../../../shared/types';
import { rentOf } from '../../../../shared/utils/car-prices';
import { PurchaseButton } from '@/components/car-trade/index.ts';
import type { CarTrade } from '@/components/car-trade/index.ts';
import { CarSwatch } from '@/components/content-image/index.ts';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useFormat } from '@/i18n';
import { CarBrowserBody } from '@/screens/car-browser';

interface CarPickerProps {
  /**
   * Whether the picker is showing.
   */
  open: boolean;
  /**
   * Folder ID of the car already chosen, when there is one.
   */
  selectedId?: string;
  /**
   * Folder name of the livery already chosen, when there is one.
   */
  selectedSkinId?: string;
  /**
   * A query the browser is narrowed by before the user filters anything.
   *
   * What restricts the picker to the cars a championship's class entry may
   * field. Omitted, the picker offers the whole library.
   */
  baseQuery?: CarQuery;
  /**
   * Whether the livery is part of what is being picked.
   *
   * A seat pins a car and a livery, so it asks both questions. An eligibility
   * list and a balance-of-performance table name a model alone, and a livery
   * step there is a question whose answer would be thrown away. Defaults to
   * true.
   */
  pickSkin?: boolean;
  /**
   * The career's garage, for a picker choosing the car a championship is
   * entered in: every card says what the car costs, a car the career owns is
   * picked in the livery it wears, and any other ends its livery step in Rent
   * or Purchase.
   */
  trade?: CarTrade;
  /**
   * Called with a car and livery to buy rather than rent, from the livery
   * step of a picker given the garage. The dialog closes itself first.
   * @param car The chosen car
   * @param skin The chosen livery, or null when the car ships none
   */
  onPurchase?: (car: Car, skin: Skin | null) => void;
  /**
   * Called when the dialog opens or closes itself - Escape, the close button,
   * or a click outside.
   * @param open Whether it should now be showing
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Called with the car and livery that were picked. The dialog closes itself
   * first.
   * @param car The chosen car
   * @param skin The chosen livery, or null when the car ships none
   */
  onPick: (car: Car, skin: Skin | null) => void;
}

export const CarPicker = ({
  open, selectedId, selectedSkinId, baseQuery, pickSkin = true, trade, onPurchase, onOpenChange, onPick,
}: CarPickerProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();

  // Which car's liveries are being chosen between, or null while the library is
  // showing. A one-livery car never sets this: confirming it would be a step
  // with only one answer.
  const [chosen, setChosen] = useState<Car | null>(null);
  // The livery picked in the livery step of a car to rent or buy, which waits
  // for one of the two buttons rather than answering at once.
  const [livery, setLivery] = useState<Skin | null>(null);

  const close = (next: boolean): void => {
    if (!next) {
      setChosen(null);
      setLivery(null);
    }
    onOpenChange(next);
  };

  const pick = (car: Car, skin: Skin | null): void => {
    close(false);
    onPick(car, skin);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex h-[85vh] max-w-[min(90rem,calc(100vw-4rem))] flex-col gap-4 px-0 sm:max-w-[min(90rem,calc(100vw-4rem))]">
        <DialogHeader className="px-6">
          <DialogTitle>{chosen ? t('race.pick.skin') : t('race.pick.car')}</DialogTitle>
          <DialogDescription>
            {chosen ? t('race.pick.skinHint') : t('race.pick.carHint')}
          </DialogDescription>
        </DialogHeader>

        {/* The browser paints its own scroller, so this only has to give it a
            height to fill and a minimum of zero to shrink into. The second step
            is laid over it rather than swapped for it: unmounting the browser
            would throw away the filters and the scroll offset the user was at,
            and going back would land them at the top of the whole library. It
            needs a z-index of its own: the browser's toolbar is sticky at z-10,
            so being later in the DOM is not enough to cover it. */}
        <div className="relative min-h-0 flex-1">
          <div className="h-full" inert={chosen !== null}>
            <CarBrowserBody
              selectedId={selectedId}
              baseQuery={baseQuery}
              trade={trade ? { ...trade, mode: 'pick' } : undefined}
              onSelect={(car) => {
                const [only] = car.skins;
                const owned = trade?.garage.owned(car.id);
                // A car the career owns races in the livery it wears; any other
                // asks which, and whether to rent it or buy it, however few
                // liveries it ships.
                if (owned) pick(car, car.skins.find((one) => one.id === owned.skin) ?? only ?? null);
                else if (trade) {
                  setChosen(car);
                  setLivery(car.skins.find((one) => one.id === selectedSkinId) ?? only ?? null);
                // A car with no livery at all is refused at launch by
                // race.car.noSkins rather than here, which is where every other
                // "that cannot race" answer is given.
                } else if (!pickSkin) pick(car, null);
                else if (car.skins.length < 2) pick(car, only ?? null);
                else setChosen(car);
              }}
            />
          </div>

          {chosen ? (
            <div className="absolute inset-0 z-20 flex flex-col bg-background">
              <div className="min-h-0 flex-1">
                <SkinStep
                  car={chosen}
                  selectedId={trade ? livery?.id : selectedSkinId}
                  onBack={() => setChosen(null)}
                  onPick={(skin) => (trade ? setLivery(skin) : pick(chosen, skin))}
                />
              </div>
              {trade ? (
                <div className="flex shrink-0 flex-wrap items-center gap-3 border-t px-6 pt-4">
                  {livery ? (
                    <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                      <CarSwatch model={chosen.id} skin={livery.id} />
                      <span className="truncate">{livery.name}</span>
                    </span>
                  ) : null}
                  <span className="ml-auto flex gap-2">
                    <PurchaseButton
                      withPrice
                      price={trade.garage.priceOf(chosen)}
                      payable={trade.garage.payableFor(chosen)}
                      balance={trade.garage.balance}
                      onPurchase={() => {
                        close(false);
                        onPurchase?.(chosen, livery);
                      }}
                    />
                    <Button type="button" onClick={() => pick(chosen, livery)}>
                      <KeyRoundIcon />
                      {t('trade.rent', { rent: formatMoney(rentOf(trade.garage.listedOf(chosen), trade.rung)) })}
                    </Button>
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
