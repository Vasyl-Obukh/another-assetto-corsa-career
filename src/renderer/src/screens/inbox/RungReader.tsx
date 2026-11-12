import { ChevronDownIcon, MedalIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { Career, RungNews } from '../../../../shared/types';
import { ratingFloor } from '../../../../shared/utils/career-eligibility';
import { MailFrame, newsSubject, Sender } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import type { InboxItem } from '@/lib/inbox';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';
import {
  disciplineKey, tierAccent, TierMedal, tierMetalKey,
} from '@/screens/championships';

interface RungReaderProps {
  /**
   * The career, whose driver the mail is to.
   */
  career: Career;
  /**
   * The mail, which must hold a rung.
   */
  item: InboxItem & { mail: { rung: RungNews } };
  /**
   * Called to mark it unread again.
   */
  onUnread: () => void;
}

// A rung opened, or lost as a season closed, as the categorisation panel
// writes it - worded as Home's banner, which it stands beside rather than
// replaces.
export const RungReader = ({ career, item, onUnread }: RungReaderProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { mail } = item;
  const { rung } = mail;
  const up = rung.dir === 'up';
  const discipline = t(disciplineKey(rung.discipline));

  return (
    <MailFrame
      chips={(
        <Badge className={cn('gap-1', tierAccent(rung.tier))}>
          {t('inbox.news.tier', { tier: rung.tier, metal: t(tierMetalKey(rung.tier)) })}
        </Badge>
      )}
      arrived={mail.arrived}
      title={newsSubject(mail, '', t) ?? ''}
      onUnread={onUnread}
      link={{ to: path.rating(), label: t('home.rating.open') }}
    >
      <Sender
        from={mail.from ?? { role: 'categorisation' }}
        driver={career.driver.name}
        accent={tierAccent(rung.tier)}
        icon={MedalIcon}
        role={discipline}
      />

      <section
        className={cn(
          'flex flex-wrap items-center gap-4 rounded-xl px-4 py-3 shadow-sm',
          // The tier's metal, never the discipline's colour, which the inbox's own hues sit on.
          up ? tierAccent(rung.tier) : 'border border-warning bg-warning/20',
        )}
      >
        {up ? <TierMedal tier={rung.tier} className="ring-2 ring-card" /> : <ChevronDownIcon className="size-5 text-warning-foreground" />}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-semibold">{newsSubject(mail, '', t)}</span>
          <span className={cn('text-sm', up ? 'opacity-85' : 'text-muted-foreground')}>
            {up
              ? t('home.rating.promotedDetail', {
                rating: formatNumber(rung.rating),
                metal: t(tierMetalKey(rung.tier)),
                floor: formatNumber(ratingFloor(rung.tier)),
                discipline,
              })
              : t('home.rating.droppedDetail', {
                rating: formatNumber(rung.rating),
                metal: t(tierMetalKey(rung.tier)),
                floor: formatNumber(ratingFloor(rung.tier - 1)),
              })}
          </span>
        </span>
      </section>

      <div className="flex flex-wrap gap-2">
        {up ? (
          <Button asChild variant="outline" size="sm">
            <Link to={path.championships()}>{t('home.rating.ladder')}</Link>
          </Button>
        ) : null}
        <Button asChild variant="outline" size="sm">
          <Link to={path.rating()}>{t('home.rating.open')}</Link>
        </Button>
      </div>
    </MailFrame>
  );
};
