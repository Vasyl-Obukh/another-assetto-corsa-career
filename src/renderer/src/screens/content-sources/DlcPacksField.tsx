import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DLC_PACKS } from './constants.ts';
import { toggled } from './utils.ts';
import type { DLCPack, SeriesListing } from '../../../../shared/types';
import { hiddenCount } from '../../../../shared/utils/content-sources';
import { useSettings } from '@/app';
import { FieldRow, packNameKey } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { useFormat } from '@/i18n';
import { CONTROL_WIDTH } from '@/lib/layout';
import { cn } from '@/lib/utils.ts';

interface DlcPacksFieldProps {
  /**
   * The championship library, for what switching each pack off would hide.
   */
  listings: readonly SeriesListing[];
}

export const DlcPacksField = ({ listings }: DlcPacksFieldProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { settings, patch } = useSettings();
  const hidden = settings.hiddenContentSources;

  /**
   * Offers one pack's championships or stops offering them.
   * @param pack The pack to switch
   */
  const toggle = (pack: DLCPack) => {
    patch({ hiddenContentSources: { ...hidden, packs: toggled(hidden.packs, pack, DLC_PACKS) } });
  };

  return (
    <FieldRow label={t('championshipLibrary.dlc')} hint={t('championshipLibrary.dlcHint')}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(CONTROL_WIDTH, 'justify-between font-normal')}
            aria-label={t('championshipLibrary.dlc')}
          >
            {t('championshipLibrary.packCount', {
              count: formatNumber(DLC_PACKS.length - hidden.packs.length),
              total: formatNumber(DLC_PACKS.length),
            })}
            <ChevronDownIcon className="opacity-60" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-72 p-2">
          <div role="listbox" aria-multiselectable className="max-h-80 overflow-y-auto">
            {DLC_PACKS.map((pack) => {
              const selected = !hidden.packs.includes(pack);
              const hides = hiddenCount(listings, { packs: [pack], makers: [] });

              return (
                <button
                  key={pack}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm',
                    'hover:bg-accent hover:text-accent-foreground',
                  )}
                  onClick={() => toggle(pack)}
                >
                  <CheckIcon className={cn('size-4 shrink-0', selected ? 'opacity-100' : 'opacity-0')} />
                  <span className="min-w-0 flex-1 truncate">{t(packNameKey(pack))}</span>
                  {/* A count rather than one of a set, so it stays muted. */}
                  {hides > 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {t('championshipLibrary.championshipCount', { count: hides })}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            disabled={hidden.packs.length === 0}
            onClick={() => patch({ hiddenContentSources: { ...hidden, packs: [] } })}
          >
            {t('championshipLibrary.offerAll')}
          </Button>
        </PopoverContent>
      </Popover>
    </FieldRow>
  );
};
