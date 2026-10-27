import { MailIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useSlot, useToast } from '@/app';
import { CONTRACT_ACCENT, HISTORIC_ACCENT } from '@/lib/accents';
import { inboxItem } from '@/lib/inbox';
import { path } from '@/lib/routes';

/**
 * Says so in a toast whenever mail arrives, whichever page the player is on -
 * one toast however many came at once.
 *
 * Only mail the open career gained while it was open: opening a career, or
 * loading a save, raises nothing for what its inbox already held.
 */
export const useMailToasts = (): void => {
  const { t } = useTranslation();
  const { career, mode } = useSlot();
  const { show } = useToast();
  const navigate = useNavigate();
  const seen = useRef<{ id: string; mail: ReadonlySet<string> } | null>(null);

  useEffect(() => {
    if (!career || mode !== 'career') {
      seen.current = null;
      return;
    }
    const before = seen.current;
    const now = new Set(career.inbox.map((mail) => mail.id));
    seen.current = { id: career.id, mail: now };
    // A save loaded over this one is another inbox, not mail arriving.
    if (!before || before.id !== career.id || [...before.mail].some((id) => !now.has(id))) return;

    const arrived = career.inbox
      .filter((mail) => !before.mail.has(mail.id) && !mail.opened)
      .map((mail) => inboxItem(career, mail));
    const [first, second] = arrived;
    if (!first) return;

    const eventOf = (item: typeof first): string => (
      item.event?.name ?? item.offers[0]?.seriesName ?? item.mail.invitation?.series ?? ''
    );
    if (!second) {
      const offer = first.offers[0];
      let detail = t('inbox.toast.oneDetail', { team: first.team?.name ?? t('inbox.organisers'), event: eventOf(first) });
      if (offer) {
        detail = first.offers.length > 1
          ? t('inbox.toast.offersDetail', { count: first.offers.length, series: offer.seriesName })
          : t('inbox.toast.offerDetail', { team: offer.teamName, series: offer.seriesName });
      }
      show({
        icon: MailIcon,
        tone: offer ? CONTRACT_ACCENT : HISTORIC_ACCENT,
        title: t('inbox.toast.one'),
        detail,
        action: { label: t('inbox.toast.read'), run: () => { void navigate(path.inbox(first.mail.id)); } },
      });

      return;
    }

    show({
      icon: MailIcon,
      tone: arrived.every((item) => item.offers.length > 0) ? CONTRACT_ACCENT : HISTORIC_ACCENT,
      title: t('inbox.toast.many', { count: arrived.length }),
      detail: arrived.length === 2
        ? t('inbox.toast.two', { first: eventOf(first), second: eventOf(second) })
        : t('inbox.toast.more', { first: eventOf(first), second: eventOf(second), count: arrived.length - 2 }),
      action: { label: t('inbox.toast.open'), run: () => { void navigate(path.inbox()); } },
    });
  }, [career, mode, show, t, navigate]);
};
