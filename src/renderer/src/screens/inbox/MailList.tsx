import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { MailRow } from './MailRow.tsx';
import { carModels, offerEdition } from './utils.ts';
import { useSlot } from '@/app';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';
import {
  byMonth, INBOX_PAGE_SIZE, pageCount, pageOf,
} from '@/lib/inbox';
import type { InboxItem } from '@/lib/inbox';
import { cn } from '@/lib/utils.ts';

interface MailListProps {
  /**
   * The mail the folder and the search list, newest first.
   */
  items: readonly InboxItem[];
  /**
   * Whether the career has any mail at all, which says which kind of nothing
   * an empty list is.
   */
  any: boolean;
  /**
   * What is typed into the search.
   */
  search: string;
  /**
   * The page shown, counting from one.
   */
  page: number;
  /**
   * The mail open beside the list, by id.
   */
  selected: string | null;
  /**
   * Called as the search is typed into.
   * @param search What it now holds
   */
  onSearch: (search: string) => void;
  /**
   * Called with the page to show.
   * @param page The page, counting from one
   */
  onPage: (page: number) => void;
  /**
   * Called with the mail to open.
   * @param id The mail's id
   */
  onOpen: (id: string) => void;
}

// The middle of the inbox: a search, the mail of every season newest first
// under the month it arrived in, thirty to a page.
export const MailList = ({
  items, any, search, page, selected, onSearch, onPage, onOpen,
}: MailListProps) => {
  const { t } = useTranslation();
  const { formatMonth, formatNumber } = useFormat();
  const pages = pageCount(items.length);
  const held = Math.min(page, pages);
  const shown = pageOf(items, held);
  const { career } = useSlot();
  // Only an invitation's row names its car.
  const carName = useCarNames(shown.flatMap((item) => (item.mail.invitation ? carModels(item) : [])));
  const from = (held - 1) * INBOX_PAGE_SIZE + 1;

  let empty: string | null = null;
  if (items.length === 0) empty = search.trim() === '' ? t(any ? 'inbox.emptyFolder' : 'inbox.empty') : t('inbox.noMatch');

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="border-b p-2.5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            placeholder={t('inbox.search')}
            aria-label={t('inbox.search')}
            className="pl-8"
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {byMonth(shown).map((month) => (
          <div key={month.month}>
            <h3 className="sticky top-0 z-10 border-b bg-muted/80 px-3 py-1 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase backdrop-blur">
              {formatMonth(month.month)}
            </h3>
            {month.items.map((item) => (
              <MailRow
                key={item.mail.id}
                item={item}
                car={carName(carModels(item)[0] ?? '')}
                edition={career && item.offers[0] ? offerEdition(career, item.offers[0], t) : ''}
                selected={item.mail.id === selected}
                onOpen={() => onOpen(item.mail.id)}
              />
            ))}
          </div>
        ))}
        {empty ? (
          <div className="flex flex-col gap-1 p-6 text-center text-sm text-muted-foreground">
            <span className={cn(!any && 'font-semibold text-foreground')}>{empty}</span>
            {!any ? <span>{t('inbox.emptyHint')}</span> : null}
          </div>
        ) : null}
      </div>

      {pages > 1 ? (
        <div className="flex items-center gap-2 border-t px-3 py-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {t('inbox.pager', {
              from: formatNumber(from),
              to: formatNumber(from + shown.length - 1),
              count: formatNumber(items.length),
            })}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={held <= 1}
              aria-label={t('inbox.previous')}
              onClick={() => onPage(held - 1)}
            >
              <ChevronLeftIcon />
            </Button>
            {Array.from({ length: pages }, (unused, at) => at + 1).map((one) => (
              <Button
                key={one}
                variant={one === held ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 min-w-7 px-2 tabular-nums"
                aria-current={one === held}
                onClick={() => onPage(one)}
              >
                {formatNumber(one)}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={held >= pages}
              aria-label={t('inbox.next')}
              onClick={() => onPage(held + 1)}
            >
              <ChevronRightIcon />
            </Button>
          </span>
        </div>
      ) : null}
    </section>
  );
};
