import type { ReactNode } from 'react';

import { BackLink } from './BackLink.tsx';

/**
 * The pinned header's own classes.
 *
 * The same sticky, translucent bar the browsers' toolbar is, one layer higher:
 * editor rows lift their menus and count badges to `z-10`, and being later in
 * the DOM would draw them over a header at the toolbar's own `z-10`.
 */
const SCREEN_HEADER = 'sticky top-0 z-20 flex flex-col gap-2 border-b bg-background/95 py-4 backdrop-blur';

interface ScreenHeaderProps {
  /**
   * Where Back goes, and what it says.
   */
  back: {
    /**
     * The route Back navigates to.
     */
    to: string;
    /**
     * Its label, already translated.
     */
    label: string;
  };
  /**
   * What sits at the right of Back's row, kept in reach while the page
   * scrolls - a page-wide switch, say.
   */
  aside?: ReactNode;
  /**
   * The title row, once the screen has something to title - Back is shown
   * without it, so a screen that is loading or found nothing still has a way
   * out.
   */
  children?: ReactNode;
}

/**
 * The top of a screen reached from another, pinned while the page scrolls.
 *
 * First child of a `ScreenBody` with no top padding, so it starts flush with
 * the top of the scroller the way the browsers' toolbar does.
 */
export const ScreenHeader = ({ back, aside, children }: ScreenHeaderProps) => (
  <header className={SCREEN_HEADER}>
    {aside === undefined ? <BackLink to={back.to} label={back.label} /> : (
      <div className="flex items-center justify-between gap-3">
        <BackLink to={back.to} label={back.label} />
        {aside}
      </div>
    )}
    {children}
  </header>
);
