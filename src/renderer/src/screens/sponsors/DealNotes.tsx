import { useTranslation } from 'react-i18next';

import type { Career, SponsorDeal } from '../../../../shared/types';
import {
  climbNewsId, dealRung, perkOf, seatBackedIn,
} from '../../../../shared/utils/sponsors';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { KEEP_ACCENT, USED_ACCENT } from '@/lib/accents';
import { tierAccent, tierMetalKey } from '@/screens/championships';

interface DealNotesProps {
  /**
   * The career.
   */
  career: Career;
  /**
   * The deal.
   */
  deal: SponsorDeal;
}

/**
 * What a card says beyond a deal's terms: whether its backing is still to use,
 * and the rung whose figures a deal that climbs pays.
 */
export const DealNotes = ({ career, deal }: DealNotesProps) => {
  const { t } = useTranslation();
  const { formatDay } = useFormat();
  const car = perkOf(deal, 'carBacking');
  const seat = perkOf(deal, 'seatBacking');
  const bought = car ? career.ledger.find((line) => line.key === `sponsor:${deal.id}:car`) : undefined;
  const seated = seat ? seatBackedIn(career, deal.id) : null;
  const rung = dealRung(deal, career.level);
  const climbed = perkOf(deal, 'climbs') && rung < deal.rung
    ? career.inbox.find((mail) => mail.id === climbNewsId(deal.id, rung))
    : undefined;

  return (
    <>
      {car || seat ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {bought || seated ? (
            <Badge className={USED_ACCENT}>{t(seated ? 'sponsors.backing.inUse' : 'sponsors.backing.used')}</Badge>
          ) : (
            <Badge className={KEEP_ACCENT.kept}>{t('sponsors.backing.available')}</Badge>
          )}
          {bought ? t('sponsors.backing.usedOn', { car: bought.car?.name ?? '', day: formatDay(bought.date) }) : null}
          {seated ? t('sponsors.backing.seatIn', {
            team: seated.contract?.teamName ?? '', series: seated.championship.name,
          }) : null}
          {!bought && !seated ? t(car ? 'sponsors.backing.carFree' : 'sponsors.backing.seatFree') : null}
        </div>
      ) : null}
      {climbed ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge className={tierAccent(rung)}>{t(tierMetalKey(rung))}</Badge>
          {t('sponsors.climbed', { rung: t(tierMetalKey(rung)), day: formatDay(climbed.arrived) })}
        </div>
      ) : null}
    </>
  );
};
