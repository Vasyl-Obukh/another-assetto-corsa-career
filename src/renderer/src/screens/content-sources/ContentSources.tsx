import { FlagIcon, LayersIcon, PackageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DISTRIBUTORS, DLC_PACKS, MOD_MAKERS } from './constants.ts';
import { SourceRow } from './SourceRow.tsx';
import { toggled } from './utils.ts';
import { DISTRIBUTOR_PAGES, MAKER_PAGES, PACK_PAGES } from '../../../../shared/constants';
import { ContentSource } from '../../../../shared/types';
import type { HiddenContentSources } from '../../../../shared/types';
import { hiddenCount } from '../../../../shared/utils/content-sources';
import { useSettings } from '@/app';
import {
  distributorNameKey, ErrorCard, makerNameKey, packNameKey, ProvenanceBadges, ScreenBody, SettingsSection,
  SwitchTile,
} from '@/components';
import { SOURCE_TAG_CLASS } from '@/components/provenance-badges';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useChampionships } from '@/hooks';
import { useFormat } from '@/i18n';

/**
 * Nothing switched off, for asking what one source alone would hide.
 */
const NONE: HiddenContentSources = { packs: [], makers: [], distributors: [] };

export const ContentSources = () => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const championships = useChampionships();
  const { settings, patch } = useSettings();
  const { listings } = championships;
  const hidden = settings.hiddenContentSources;

  /**
   * What a source means for the library: how many championships it alone
   * would hide, and whether those are hidden now.
   * @param alone The source, as the only one switched off
   * @param on Whether it is switched on
   * @returns The row's status line
   */
  const status = (alone: Partial<HiddenContentSources>, on: boolean): string => {
    const count = hiddenCount(listings, { ...NONE, ...alone });
    if (!on) return t('championshipLibrary.hiddenNow', { count, shown: formatNumber(count) });

    return count === 0
      ? t('championshipLibrary.neededByNone')
      : t('championshipLibrary.neededBy', { count, shown: formatNumber(count) });
  };

  /**
   * The switch and status of one source the user can switch off.
   * @param list Which of the three lists it is kept in
   * @param value The source
   * @param order Every source of its list, in the order settings keeps them
   * @returns The row's switch, status and warning
   */
  const switchable = <K extends keyof HiddenContentSources>(
    list: K,
    value: HiddenContentSources[K][number],
    order: readonly HiddenContentSources[K][number][],
  ) => {
    const current: readonly HiddenContentSources[K][number][] = hidden[list];
    const on = !current.includes(value);

    return {
      on,
      warn: !on,
      status: status({ [list]: [value] }, on),
      onChange: () => patch({ hiddenContentSources: { ...hidden, [list]: toggled(current, value, order) } }),
    };
  };
  const fillers = listings.filter((listing) => listing.filler).length;
  const offered = listings.length - hiddenCount(listings, hidden);

  return (
    <ScreenBody className="py-6" backToTop>
      {/* Capped and kept to the tabs' left edge: these are rows to read across,
          which drift apart on the wide column the browsers need. */}
      <div className="flex max-w-6xl flex-col gap-5">
        {championships.error ? (
          <ErrorCard error={championships.error} onDismiss={championships.dismissError} />
        ) : null}

        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {t('championshipLibrary.offered', { offered: formatNumber(offered), total: formatNumber(listings.length) })}
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
                disabled={hidden.packs.length === 0}
                onClick={() => patch({ hiddenContentSources: { ...hidden, packs: [] } })}
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
    </ScreenBody>
  );
};
