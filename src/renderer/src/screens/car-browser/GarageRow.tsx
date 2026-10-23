import {
  CarIcon, ChevronRightIcon, MoreVerticalIcon, PaletteIcon, TagIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { carImageSources } from './utils.ts';
import type { Car } from '../../../../shared/types';
import { repaintOf } from '../../../../shared/utils/car-prices';
import { liveryName } from '../../../../shared/utils/garage';
import { nationOfCountry } from '../../../../shared/utils/nations';
import {
  carPictureSources, CarSwatch, ContentImage, NationFlag, SpecBadge,
} from '@/components';
import type { CarTrade } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger,
} from '@/components/ui/context-menu.tsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useFormat } from '@/i18n';
import { path } from '@/lib/routes';
import type { NavState } from '@/lib/routes';

interface GarageRowProps {
  /**
   * The car, which the career owns.
   */
  car: Car;
  /**
   * What the browser does with money.
   */
  trade: CarTrade;
}

/**
 * The Garage's line items, drawn with one menu primitive's parts: Repaint and
 * Sell with what each costs or pays, then the car's page.
 */
type MenuItems = (
  Item: typeof DropdownMenuItem | typeof ContextMenuItem,
  Separator: typeof DropdownMenuSeparator | typeof ContextMenuSeparator,
) => ReactNode;

/**
 * One car the career owns as a line of the Garage's table: the livery it
 * wears, when it was bought, what it races in, what a repaint costs and what it
 * sells for, with Repaint and Sell in the row's menu - its button, or a
 * right-click anywhere on the row - so every row keeps the same columns.
 */
export const GarageRow = ({ car, trade }: GarageRowProps) => {
  const { t } = useTranslation();
  const { formatDay, formatMoney, formatNation } = useFormat();
  const navigate = useNavigate();
  const { garage } = trade;
  const owned = garage.owned(car.id);
  if (!owned) return null;

  const nation = nationOfCountry(car.country);
  const livery = liveryName(car, owned.skin) ?? '';
  const racing = garage.racingIn(car.id).map((entry) => entry.championship.name);
  const repaint = repaintOf(owned.paid);
  const value = garage.valueOf(owned);
  const state = { section: 'garage' } satisfies NavState;
  const open = (): void => {
    navigate(path.car({ id: car.id }), { state });
  };

  const items: MenuItems = (Item, Separator) => (
    <>
      <Item onSelect={() => trade.onRepaint?.(car)}>
        <PaletteIcon />
        {t('trade.repaint')}
        <span className="ml-auto pl-6 text-muted-foreground tabular-nums">{formatMoney(repaint)}</span>
      </Item>
      <Item onSelect={() => trade.onSell?.(car)}>
        <TagIcon />
        {t('trade.sell')}
        <span className="ml-auto pl-6 text-muted-foreground tabular-nums">{formatMoney(value)}</span>
      </Item>
      <Separator />
      <Item onSelect={open}>
        <ChevronRightIcon />
        {t('trade.openCar')}
      </Item>
    </>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <tr className="cursor-pointer border-t first:border-t-0 hover:bg-accent/50" onClick={open}>
          <td className="w-20 py-1.5 pr-1 pl-2.5 @[44rem]:w-28">
            <div className="relative h-10 w-16 overflow-hidden rounded-md bg-muted @[44rem]:h-13 @[44rem]:w-24">
              <ContentImage
                sources={[...carPictureSources(car.id, owned.skin), ...carImageSources(car)]}
                alt=""
                className="object-cover"
                fallback={<CarIcon className="absolute inset-0 m-auto size-5 text-muted-foreground/40" />}
              />
            </div>
          </td>
          <td className="px-2.5 py-1.5">
            <div className="flex min-w-0 flex-col gap-0.5">
              <Link
                to={path.car({ id: car.id })}
                state={state}
                className="font-semibold hover:underline"
                onClick={(event) => event.stopPropagation()}
              >
                {car.name}
              </Link>
              <span className="flex flex-wrap items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground">
                <span className="truncate">{car.brand ?? t('browse.unknown')}</span>
                {nation === null ? null : (
                  <span title={formatNation(nation)} className="flex shrink-0"><NationFlag code={nation} /></span>
                )}
                <SpecBadge carId={car.id} />
              </span>
            </div>
          </td>
          <td className="px-2.5 py-1.5 whitespace-nowrap">
            <span className="flex items-center gap-2">
              <CarSwatch model={car.id} skin={owned.skin} />
              {livery}
            </span>
          </td>
          <td className="px-2.5 py-1.5 whitespace-nowrap">{formatDay(owned.bought)}</td>
          <td className="px-2.5 py-1.5">
            {racing.length > 0 ? racing.join(', ') : <span className="text-muted-foreground">{t('common.dash')}</span>}
          </td>
          <td className="px-2.5 py-1.5 text-right whitespace-nowrap tabular-nums">{formatMoney(repaint)}</td>
          <td className="px-2.5 py-1.5 text-right font-semibold whitespace-nowrap tabular-nums">{formatMoney(value)}</td>
          <td className="w-12 px-2.5 py-1.5 text-right" onClick={(event) => event.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="size-8" aria-label={t('trade.actions', { car: car.name })}>
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">{items(DropdownMenuItem, DropdownMenuSeparator)}</DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
      </ContextMenuTrigger>
      <ContextMenuContent>{items(ContextMenuItem, ContextMenuSeparator)}</ContextMenuContent>
    </ContextMenu>
  );
};
