import { FlagIcon, LayersIcon, PackageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DISTRIBUTORS, DLC_PACKS, MOD_MAKERS } from './constants.ts';
import { SourceRow } from './SourceRow.tsx';
import { toggled } from './utils.ts';
import { DISTRIBUTOR_PAGES, MAKER_PAGES, PACK_PAGES } from '../../../../shared/constants';
import { ContentSource } from '../../../../shared/types';
import type { ContentSources as Sources } from '../../../../shared/types';
import { allSourcesBut, hiddenCount } from '../../../../shared/utils/content-sources';
import { useSettings } from '@/app';
import {
  distributorNameKey, ErrorCard, makerNameKey, packNameKey, ProvenanceBadges, SettingsSection,
  SwitchTile,
} from '@/components';
import { SOURCE_TAG_CLASS } from '@/components/provenance-badges';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useChampionships } from '@/hooks';
import { useFormat } from '@/i18n';

/**
 * Which championships are offered, by the DLC and mods they need: a switch per
 * source. The Content sources tab, and a step of first-run setup.
 */
export const ContentSourcesBody = () => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const championships = useChampionships();
  const { settings, patch } = useSettings();
  const { listings } = championships;
  const offered = settings.offeredContentSources;

  /**
   * How many championships need a source: those every other source switched
   * on still leaves out. The same whether it is on or off, since off is where
   * every source starts.
   * @param alone The source, as the only one switched off
   * @returns The row's status line
   */
  const status = (alone: Partial<Sources>): string => {
    const count = hiddenCount(listings, allSourcesBut(alone));

    return count === 0
      ? t('championshipLibrary.neededByNone')
      : t('championshipLibrary.neededBy', { count, shown: formatNumber(count) });
  };

  /**
   * The switch and status of one source the player can switch on.
   * @param list Which of the three lists it is kept in
   * @param value The source
   * @param order Every source of its list, in the order settings keeps them
   * @returns The row's switch and status
   */
  const switchable = <K extends keyof Sources>(
    list: K,
    value: Sources[K][number],
    order: readonly Sources[K][number][],
  ) => {
    const current: readonly Sources[K][number][] = offered[list];

    return {
      on: current.includes(value),
      status: status({ [list]: [value] }),
      onChange: () => patch({ offeredContentSources: { ...offered, [list]: toggled(current, value, order) } }),
    };
  };
  const fillers = listings.filter((listing) => listing.filler).length;
  const shown = listings.length - hiddenCount(listings, offered);

  return (
    <div className="flex flex-col gap-5">
      {championships.error ? (
        <ErrorCard error={championships.error} onDismiss={championships.dismissError} />
        ) : null}

      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {t('championshipLibrary.offered', { offered: formatNumber(shown), total: formatNumber(listings.length) })}
        </span>
        {' '}
        {t('championshipLibrary.sourcesHint')}
      </p>

      <SettingsSection
        icon={FlagIcon}
        tone="dlc"
        title={t('championshipLibrary.kunos')}
        hint={t('championshipLibrary.kunosHint')}
        footer={(
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={offered.packs.length === DLC_PACKS.length}
              onClick={() => patch({ offeredContentSources: { ...offered, packs: [...DLC_PACKS] } })}
            >
              {t('championshipLibrary.offerAll')}
            </Button>
            <span>{t('championshipLibrary.specHint')}</span>
          </>
          )}
      >
        {/* No switch: a base-only ladder is always offered. */}
        <SourceRow
          chips={<Badge className={SOURCE_TAG_CLASS[ContentSource.BASE]}>{t('content.sourceTag.base')}</Badge>}
          name={t('championshipLibrary.base')}
          status={t('championshipLibrary.alwaysOffered')}
        />

        {DLC_PACKS.map((pack) => (
          <SourceRow
            key={pack}
            chips={<Badge className={SOURCE_TAG_CLASS[ContentSource.DLC]}>{t('content.sourceTag.dlc')}</Badge>}
            name={t(packNameKey(pack))}
            url={PACK_PAGES[pack]}
            {...switchable('packs', pack, DLC_PACKS)}
          />
          ))}
      </SettingsSection>

      <SettingsSection
        icon={PackageIcon}
        tone="mod"
        title={t('championshipLibrary.mods')}
        hint={t('championshipLibrary.modsHint')}
        footer={t('championshipLibrary.modsFooter')}
      >
        {MOD_MAKERS.map((maker) => (
          <SourceRow
            key={maker}
            chips={(
              <ProvenanceBadges provenance={{
                  source: ContentSource.MOD, pack: null, maker, distributor: null,
                }}
              />
              )}
            name={t(makerNameKey(maker))}
            url={MAKER_PAGES[maker]}
            {...switchable('makers', maker, MOD_MAKERS)}
          />
          ))}

        {DISTRIBUTORS.map((distributor) => (
          <SourceRow
            key={distributor}
            chips={(
              <ProvenanceBadges provenance={{
                  source: ContentSource.MOD, pack: null, maker: null, distributor,
                }}
              />
              )}
            name={t(distributorNameKey(distributor))}
            url={DISTRIBUTOR_PAGES[distributor]}
            {...switchable('distributors', distributor, DISTRIBUTORS)}
          />
          ))}
      </SettingsSection>

      <SettingsSection
        icon={LayersIcon}
        tone="look"
        title={t('championshipLibrary.filler')}
        hint={t('championshipLibrary.fillerHint')}
      >
        <div className="max-w-md">
          <SwitchTile
            label={t('championshipLibrary.fillerOffered')}
            hint={t('championshipLibrary.hides', { count: fillers })}
            checked={settings.showFillerSeries}
            onChange={(next) => patch({ showFillerSeries: next })}
          />
        </div>
      </SettingsSection>
    </div>
  );
};
