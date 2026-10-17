import { AppNav } from './app-nav/index.ts';
import { SaveStatus } from './saves/index.ts';
import { SlotMenu } from './slot-menu/index.ts';
import { useSlot } from '@/app';
import { useSaves } from '@/hooks';
import { CAREER_NAV, QUICK_NAV } from '@/lib/routes';

export const AppHeader = () => {
  const { mode, career } = useSlot();
  // Read once for the menu and the status beside the nav.
  const saves = useSaves(career?.id ?? null);

  return (
    <header className="flex shrink-0 items-center gap-6 border-b px-8 py-3">
      <SlotMenu saves={saves} />
      <AppNav entries={mode === 'quick' ? QUICK_NAV : CAREER_NAV} />
      {career ? <SaveStatus saves={saves.saves} /> : null}
    </header>
  );
};
