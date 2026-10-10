import { ChartLineIcon, ChevronRightIcon, TrophyIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { cn } from '@/lib/utils.ts';

interface DoorProps {
  /**
   * Where it leads.
   */
  to: string;
  /**
   * The colour its icon's well wears.
   */
  accent: string;
  /**
   * Which icon it carries.
   */
  icon: 'results' | 'history';
  /**
   * Its name.
   */
  title: string;
  /**
   * What it holds, in a line.
   */
  hint: ReactNode;
  /**
   * The small capitals heading its preview.
   */
  kicker: string;
  /**
   * The preview of what it holds.
   */
  children: ReactNode;
}

/**
 * One of Home's two ways into what the career has done - Results and History,
 * neither of which is in the navigation - drawn large and with a preview of
 * what is behind it, so it reads as a place rather than a link.
 */
export const Door = ({
  to, accent, icon, title, hint, kicker, children,
}: DoorProps) => {
  const { t } = useTranslation();

  return (
    <Link
      to={to}
      className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-colors hover:border-primary/45"
    >
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', accent)}>
          {icon === 'results' ? <ChartLineIcon className="size-5" /> : <TrophyIcon className="size-5" />}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-base font-semibold">{title}</span>
          <div className="truncate text-xs text-muted-foreground">{hint}</div>
        </div>
        <span className="ml-auto flex items-center gap-0.5 text-sm font-medium text-primary">
          {t('home.doors.open')}
          <ChevronRightIcon className="size-4" />
        </span>
      </div>
      <div className="flex min-h-28 flex-col gap-2 border-t px-4 pt-2.5 pb-4">
        <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">{kicker}</span>
        {children}
      </div>
    </Link>
  );
};
