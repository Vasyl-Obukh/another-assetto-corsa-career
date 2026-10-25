import { MedalIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useSlot, useToast } from '@/app';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { disciplineKey } from '@/screens/championships';

/**
 * Says so in a toast whenever a session the career just raced opens a rung,
 * whichever page the player is on as it lands.
 *
 * Only lines the open career gained while it was open: opening a career, or
 * loading a save, raises nothing for what its log already held.
 */
export const useRatingToasts = (): void => {
  const { t } = useTranslation();
  const { formatNumber, formatSigned } = useFormat();
  const { career, mode } = useSlot();
  const { show } = useToast();
  const navigate = useNavigate();
  const seen = useRef<{ id: string; length: number } | null>(null);

  useEffect(() => {
    if (!career || mode !== 'career') {
      seen.current = null;
      return;
    }
    const before = seen.current;
    seen.current = { id: career.id, length: career.ratingLog.length };
    if (!before || before.id !== career.id || career.ratingLog.length < before.length) return;

    const added = career.ratingLog.slice(before.length);
    // A session landing adds the lines of its own round alone; anything wider
    // is another save of the same career loaded over this one.
    const rounds = new Set(added.map((line) => `${line.season}:${line.series}:${line.edition}:${line.round}`));
    const landed = rounds.size === 1 && added.every((line) => (
      line.kind === 'race' || line.kind === 'qualifying' || line.kind === 'promotion'
    ));
    if (!landed) return;

    for (const line of added) {
      if (line.kind !== 'promotion' || !line.discipline) continue;
      const session = added.findLast((one) => one.key === line.key.replace(/^promotion:/, ''));
      show({
        icon: MedalIcon,
        tone: DISCIPLINE_ACCENT[line.discipline],
        title: t('rating.toast.promoted', { tier: line.tier ?? 1, discipline: t(disciplineKey(line.discipline)) }),
        detail: t('rating.toast.detail', {
          change: formatSigned(session?.change ?? 0), rating: formatNumber(line.rating ?? 0),
        }),
        action: { label: t('rating.toast.open'), run: () => { void navigate(path.rating()); } },
      });
    }
  }, [career, mode, show, t, formatNumber, formatSigned, navigate]);
};
