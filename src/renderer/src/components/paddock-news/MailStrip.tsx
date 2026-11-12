import { ChevronRightIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { cn } from '@/lib/utils.ts';

interface MailStripProps {
  /**
   * Where it opens.
   */
  to: string;
  /**
   * Its icon.
   */
  icon: LucideIcon;
  /**
   * The icon's well colour.
   */
  accent: string;
  /**
   * What it opens.
   */
  title: string;
  /**
   * The line under it.
   */
  detail: ReactNode;
  /**
   * What opening it is called.
   */
  open: string;
}

// The page a mail is about, as a strip in its body: a round, a championship,
// a review.
export const MailStrip = ({
  to, icon: Icon, accent, title, detail, open,
}: MailStripProps) => (
  <Link to={to} className="hover-outline flex items-center gap-3 rounded-lg border bg-card px-3.5 py-2.5">
    <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg [&_svg]:size-4', accent)}>
      <Icon />
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-sm font-semibold">{title}</span>
      <span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground">{detail}</span>
    </span>
    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
      {open}
      <ChevronRightIcon className="size-4" />
    </span>
  </Link>
);
