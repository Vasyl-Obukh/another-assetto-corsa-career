import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppNav } from './app-nav/index.ts';
import { BalanceLink } from './money/index.ts';
import { RatingLink } from './rating/index.ts';
import { SAVE_STATUS_ID, SaveStatus } from './saves/index.ts';
import { SlotMenu } from './slot-menu/index.ts';
import { ThemeToggle } from './theme-toggle/index.ts';
import { useSlot } from '@/app';
import { useNavFit, useSaves } from '@/hooks';
import { CAREER_NAV, CHAMPIONSHIP_NAV, QUICK_NAV } from '@/lib/routes';

export const AppHeader = () => {
  const { i18n } = useTranslation();
  const { mode, career } = useSlot();
  // Read once for the menu and the status beside the nav.
  const saves = useSaves(career?.id ?? null);
  const nav = { career: CAREER_NAV, championship: CHAMPIONSHIP_NAV, quick: QUICK_NAV, start: [] }[mode];
  const [header, setHeader] = useState<HTMLElement | null>(null);
  // Short of room, the nav's labels give way one at a time from the right, and
  // the save line's time after them all; everything else always shows in full.
  const compact = useNavFit(header, `${i18n.language}|${mode}`);

  return (
    <header ref={setHeader} className="flex shrink-0 items-center gap-6 border-b px-8 py-3">
      <SlotMenu saves={saves} />
      <AppNav entries={nav} compact={compact} />
      <div className="ml-auto flex shrink-0 items-center gap-4">
        {/* A quick race has no saves, and a standalone championship no money
            and no ladder. */}
        {career ? <SaveStatus saves={saves.saves} compact={compact.has(SAVE_STATUS_ID)} /> : null}
        <ThemeToggle />
        {mode === 'career' && career ? <RatingLink rating={career.globalRating} /> : null}
        {mode === 'career' && career ? <BalanceLink money={career.money} /> : null}
      </div>
    </header>
  );
};
