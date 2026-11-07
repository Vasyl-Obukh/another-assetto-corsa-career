import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FreeSlot } from './FreeSlot.tsx';
import { LockedSlot } from './LockedSlot.tsx';
import { SponsorCard } from './SponsorCard.tsx';
import { SponsorHistory } from './SponsorHistory.tsx';
import { dealRows, lockedSlots, paidIn } from './utils.ts';
import type { SponsorDeal } from '../../../../shared/types';
import { seasonYear } from '../../../../shared/utils/editions';
import { awaitingMail } from '../../../../shared/utils/inbox';
import {
  bestRung, formOf, goalStanding, liveDeals, partnerSlots, signingRepay,
} from '../../../../shared/utils/sponsors';
import { useSlot } from '@/app';
import {
  ConfirmDialog, ErrorCard, MoneyAmount, ScreenBody, ScreenHeader,
} from '@/components';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs.tsx';
import { useFormat } from '@/i18n';
import { invoke, toDisplayableError } from '@/lib/ipc';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';
import { tierMetalKey, UNDERLINE_TAB } from '@/screens/championships';
import { MoneyTile } from '@/screens/finances';

/**
 * The career's sponsors at `/home/sponsors`: its slots, its form and what its
 * sponsors have paid this year; a card for every deal it holds, a slot left
 * free and the partner slots still to open; and every deal it has signed on a
 * tab of its own.
 */
export const Sponsors = () => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const { career } = useSlot();
  const [ending, setEnding] = useState<SponsorDeal | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ReturnType<typeof toDisplayableError> | null>(null);
  const rows = useMemo(() => (career ? dealRows(career) : []), [career]);

  if (!career) return null;

  const live = liveDeals(career);
  const main = live.find((deal) => deal.slot === 'main') ?? null;
  const partners = live.filter((deal) => deal.slot === 'partner');
  const slots = partnerSlots(career.level);
  const free = Math.max(0, slots - partners.length);
  const season = career.seasons.at(-1);
  const form = formOf(career);
  const onCourse = live.filter((deal) => goalStanding(career, deal).onCourse === true).length;
  const best = bestRung(career.level);
  // A sponsor asking for another year says so on the slot its deal left free.
  const renewals = awaitingMail(career.inbox, career.date).filter((mail) => mail.sponsor?.renews);
  const partnerRenewals = renewals.filter((mail) => mail.sponsor?.slot === 'partner');

  /**
   * Ends the deal being asked about.
   * @param deal The deal
   */
  const end = (deal: SponsorDeal): void => {
    setBusy(true);
    invoke('career:endSponsor', { deal: deal.id }).then(
      () => setError(null),
      (thrown: unknown) => setError(toDisplayableError(thrown)),
    ).finally(() => {
      setBusy(false);
      setEnding(null);
    });
  };

  return (
    <ScreenBody className="flex flex-col gap-5 pb-6">
      <ScreenHeader back={{ to: path.home(), label: t('back.home') }}>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-semibold">{t('sponsors.title')}</h1>
          <span className="text-sm text-muted-foreground">{t('sponsors.subtitle')}</span>
        </div>
      </ScreenHeader>

      {error ? <ErrorCard error={error} onDismiss={() => setError(null)} /> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MoneyTile
          lead
          label={t('sponsors.figures.slots')}
          value={t('sponsors.figures.slotsValue', { held: live.length, of: slots + 1 })}
          hint={t('sponsors.figures.slotsHint', { rung: t(tierMetalKey(best)), count: slots })}
        />
        <MoneyTile
          label={t('sponsors.figures.form')}
          value={t(`sponsors.form.${form ?? 'none'}`)}
          hint={t('sponsors.figures.formHint')}
        />
        <MoneyTile
          label={t('sponsors.figures.paid', { year: season ? seasonYear(season) : '' })}
          value={<MoneyAmount amount={season ? paidIn(career, season.index) : 0} />}
          hint={t('sponsors.figures.paidHint')}
        />
        <MoneyTile
          label={t('sponsors.figures.goals')}
          value={t('sponsors.figures.slotsValue', { held: onCourse, of: live.length })}
          hint={t('sponsors.figures.goalsHint')}
        />
      </div>

      <Tabs defaultValue="current" className="gap-4">
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="current" className={cn(UNDERLINE_TAB, 'px-4 py-2.5')}>{t('sponsors.tabs.current')}</TabsTrigger>
          <TabsTrigger value="history" className={cn(UNDERLINE_TAB, 'px-4 py-2.5')}>{t('sponsors.tabs.history')}</TabsTrigger>
        </TabsList>
        <TabsContent value="current" className="flex flex-col gap-3">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {main ? <SponsorCard career={career} deal={main} onEnd={() => setEnding(main)} /> : (
              <FreeSlot slot="main" renewal={renewals.find((mail) => mail.sponsor?.slot === 'main')} />
            )}
            {partners.map((deal) => (
              <SponsorCard key={deal.id} career={career} deal={deal} onEnd={() => setEnding(deal)} />
            ))}
            {Array.from({ length: free }, (unused, at) => <FreeSlot key={at} slot="partner" renewal={partnerRenewals[at]} />)}
            {lockedSlots(career).map((slot) => <LockedSlot key={slot.rung} rung={slot.rung} rating={slot.rating} />)}
          </div>
        </TabsContent>
        <TabsContent value="history">
          <SponsorHistory rows={rows} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={ending !== null}
        busy={busy}
        title={t('sponsors.endDeal.title', { sponsor: ending?.sponsor.name ?? '' })}
        description={ending && signingRepay(ending, career.date) > 0
          ? t('sponsors.endDeal.repay', { repay: formatMoney(signingRepay(ending, career.date)) })
          : t('sponsors.endDeal.free')}
        confirmLabel={t('sponsors.endDeal.confirm')}
        onClose={() => setEnding(null)}
        onConfirm={() => {
          if (ending) end(ending);
        }}
      />
    </ScreenBody>
  );
};
