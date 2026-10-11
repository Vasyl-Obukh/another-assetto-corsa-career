import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { classAccent } from '@/lib/accents';

interface StrengthClassesProps {
  /**
   * Every class of the field and the strength it races at, in the field's own
   * order, which is what picks each one's colour.
   */
  classes: readonly {
    /**
     * The class entry's id.
     */
    entry: string;
    /**
     * Its display name.
     */
    name: string;
    /**
     * The strength it races at.
     */
    figure: number;
  }[];
  /**
   * The player's class, by its entry id.
   */
  mine: string | null;
}

/**
 * Each class of a multi-class field and the strength it races at, which a step
 * shared by every car moves together.
 */
export const StrengthClasses = ({ classes, mine }: StrengthClassesProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  return (
    <div className="flex flex-col gap-1.5 border-t pt-2.5">
      <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
        {t('strength.classes')}
      </span>
      {classes.map((one, at) => (
        <div key={one.entry} className="flex items-center gap-2 text-sm">
          <span className="flex min-w-0 flex-1 items-center gap-1.5">
            <Badge className={classAccent(at).chip}>{one.name}</Badge>
            {one.entry === mine ? <span className="text-xs text-muted-foreground">{t('strength.yours')}</span> : null}
          </span>
          <span className="font-semibold tabular-nums">{formatNumber(one.figure)}</span>
        </div>
      ))}
    </div>
  );
};
