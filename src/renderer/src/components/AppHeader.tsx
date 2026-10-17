import { AppNav } from './app-nav/index.ts';
import { SlotMenu } from './slot-menu/index.ts';
import { useSlot } from '@/app';
import { CAREER_NAV, QUICK_NAV } from '@/lib/routes';

export const AppHeader = () => {
  const { mode } = useSlot();

  return (
    <header className="flex shrink-0 items-center gap-6 border-b px-8 py-3">
      <SlotMenu />
      <AppNav entries={mode === 'quick' ? QUICK_NAV : CAREER_NAV} />
    </header>
  );
};
