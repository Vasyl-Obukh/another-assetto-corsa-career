import { ExternalLinkIcon, MailIcon, MoreVerticalIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useFormat } from '@/i18n';

interface MailFrameProps {
  /**
   * The chips heading it: what kind of mail it is, and anything it stands on.
   */
  chips: ReactNode;
  /**
   * The day it arrived, as an ISO date.
   */
  arrived: string;
  /**
   * Its subject.
   */
  title: string;
  /**
   * Called to mark it unread again.
   */
  onUnread: () => void;
  /**
   * The page it is about, offered in its menu.
   */
  link?: {
    /**
     * The URL.
     */
    to: string;
    /**
     * What opening it is called.
     */
    label: string;
  };
  /**
   * The mail itself.
   */
  children: ReactNode;
}

// A mail that wants no answer, opened beside the list: its chips, the day it
// came and its menu, its subject, then whatever it says. With no answer there
// is no reply bar - the one action is the menu's.
export const MailFrame = ({
  chips, arrived, title, onUnread, link, children,
}: MailFrameProps) => {
  const { t } = useTranslation();
  const { formatDay } = useFormat();
  const navigate = useNavigate();

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            {chips}
            <span className="ml-auto text-xs text-muted-foreground">{formatDay(arrived)}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" aria-label={t('inbox.menu.label')}>
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onUnread}>
                  <MailIcon />
                  {t('inbox.menu.unread')}
                </DropdownMenuItem>
                {link ? (
                  <DropdownMenuItem onSelect={() => { void navigate(link.to); }}>
                    <ExternalLinkIcon />
                    {link.label}
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex w-full max-w-3xl flex-col gap-5">
            <h2 className="text-xl font-semibold" data-selectable>{title}</h2>

            {children}
          </div>
        </div>
      </div>
    </section>
  );
};
