import { useTranslation } from 'react-i18next';

import {
  ROUND_COLUMN, ROW_GAP, ROW_GRIP, ROW_NUMBER,
} from './constants.ts';
import { cn } from '@/lib/utils.ts';

/**
 * The calendar's column headings, over the same fixed columns every round row
 * lays out, so the rows below read as a table.
 */
export const RoundHeading = () => {
  const { t } = useTranslation();

  return (
    <div aria-hidden className={cn('-mx-2 flex items-end px-2 pb-1 text-xs text-muted-foreground', ROW_GAP)}>
      <span className={ROW_GRIP} />
      <span className={ROW_NUMBER} />
      <span className={ROUND_COLUMN.MAP} />
      <span className="min-w-0 flex-1">{t('editor.calendar.round')}</span>
      <span className={ROUND_COLUMN.WEEKEND}>{t('editor.calendar.format')}</span>
      <span className={ROUND_COLUMN.RACES}>{t('editor.calendar.races')}</span>
      <span className={ROUND_COLUMN.OWN}>{t('editor.calendar.own')}</span>
      <span className={ROUND_COLUMN.FEE}>{t('editor.calendar.entryFee')}</span>
      <span className={ROUND_COLUMN.ACTIONS} />
    </div>
  );
};
