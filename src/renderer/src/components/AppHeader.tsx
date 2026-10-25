import { AppNav } from './app-nav/index.ts';
import { BalanceLink } from './money/index.ts';
import { RatingLink } from './rating/index.ts';
import { SaveStatus } from './saves/index.ts';
import { SlotMenu } from './slot-menu/index.ts';
import { useSlot } from '@/app';
import { useSaves } from '@/hooks';
import { CAREER_NAV, CHAMPIONSHIP_NAV, QUICK_NAV } from '@/lib/routes';

export const AppHeader = () => {
  const { mode, career } = useSlot();
  // Read once for the menu and the status beside the nav.
  const saves = useSaves(career?.id ?? null);
  const nav = { career: CAREER_NAV, championship: CHAMPIONSHIP_NAV, quick: QUICK_NAV, start: [] }[mode];

  return (
    <header className="flex shrink-0 items-center gap-6 border-b px-8 py-3">
      <SlotMenu saves={saves} />
      <AppNav entries={nav} />
      {career ? (
        <div className="ml-auto flex min-w-0 items-center gap-4">
          <SaveStatus saves={saves.saves} />
          {/* A standalone championship has no money and no ladder. */}
          {mode === 'career' ? <RatingLink rating={career.globalRating} /> : null}
          {mode === 'career' ? <BalanceLink money={career.money} /> : null}
        </div>
      ) : null}
    </header>
  );
};
