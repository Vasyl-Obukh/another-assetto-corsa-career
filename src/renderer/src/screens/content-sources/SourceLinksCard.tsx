import { useTranslation } from 'react-i18next';

import {
  DISTRIBUTORS, DLC_PACKS, MOD_MAKERS, SOURCE_LINK_WIDTH,
} from './constants.ts';
import { SourceLinkRow } from './SourceLinkRow.tsx';
import { DISTRIBUTOR_PAGES, MAKER_PAGES, PACK_PAGES } from '../../../../shared/constants';
import {
  distributorNameKey, makerNameKey, packNameKey, SourceChips,
} from '@/components';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { cn } from '@/lib/utils.ts';

// The switches above say which sources a career wants; this says where each one
// is got from, which is the other half of the same question. Every source the
// catalogue names is listed, the base game apart - it can never be missing.
export const SourceLinksCard = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('championshipLibrary.whereToGet')}</CardTitle>
        <CardDescription>{t('championshipLibrary.whereToGetHint')}</CardDescription>
      </CardHeader>

      <CardContent>
        {/* One column rather than the settings grid: these are a reference
            list, not controls. */}
        <div className={cn('flex flex-col gap-1', SOURCE_LINK_WIDTH)}>
          {DLC_PACKS.map((pack) => (
            <SourceLinkRow key={pack} name={t(packNameKey(pack))} url={PACK_PAGES[pack]}>
              <SourceChips packs={[pack]} makers={[]} />
            </SourceLinkRow>
          ))}

          {MOD_MAKERS.map((maker) => (
            <SourceLinkRow key={maker} name={t(makerNameKey(maker))} url={MAKER_PAGES[maker]}>
              <SourceChips packs={[]} makers={[maker]} />
            </SourceLinkRow>
          ))}

          {DISTRIBUTORS.map((distributor) => (
            <SourceLinkRow
              key={distributor}
              name={t(distributorNameKey(distributor))}
              url={DISTRIBUTOR_PAGES[distributor]}
            >
              <SourceChips packs={[]} makers={[]} distributors={[distributor]} />
            </SourceLinkRow>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
