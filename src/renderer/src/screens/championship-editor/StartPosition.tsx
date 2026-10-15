import { MinusIcon, PlusIcon } from 'lucide-react';


import { TICKED_SLOTS } from './constants.ts';
import type { StartClass } from './types.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Slider } from '@/components/ui/slider.tsx';
import { useKindTranslation } from '@/i18n';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface StartPositionProps {
  /**
   * The slot, from one.
   */
  value: number;
  /**
   * The class it is a slot in.
   */
  within: StartClass;
  /**
   * Whether nothing may change just now.
   */
  disabled: boolean;
  /**
   * Called with the slot picked.
   * @param slot The slot, from one
   */
  onChange: (slot: number) => void;
}

/**
 * The slot a race of the player's own starts them in, as a slider from pole
 * to the back of their class, so it cannot name a place nobody holds.
 */
export const StartPosition = ({
  value, within, disabled, onChange,
}: StartPositionProps) => {
  const { t } = useKindTranslation();
  const { formatNumber } = useFormat();
  const count = Math.max(1, within.count);
  const slot = Math.min(Math.max(1, value), count);
  const slots = Array.from({ length: count }, (_, index) => index + 1);
  const ticked = count <= TICKED_SLOTS ? slots : [1, count];

  return (
    <div className="flex max-w-md flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <span className="text-xl font-bold tabular-nums">{t('editor.sessions.slot', { slot: formatNumber(slot) })}</span>
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          {t('editor.sessions.slotIn')}
          <Badge className={within.chip}>{within.name}</Badge>
          {t('editor.sessions.slotOf', { count })}
        </span>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="size-7"
          aria-label={t('editor.stepper.less', { label: t('editor.sessions.startSlot') })}
          disabled={disabled || slot <= 1}
          onClick={() => onChange(slot - 1)}
        >
          <MinusIcon />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="size-7"
          aria-label={t('editor.stepper.more', { label: t('editor.sessions.startSlot') })}
          disabled={disabled || slot >= count}
          onClick={() => onChange(slot + 1)}
        >
          <PlusIcon />
        </Button>
      </div>
      <Slider
        min={1}
        max={count}
        step={1}
        value={[slot]}
        disabled={disabled || count === 1}
        aria-label={t('editor.sessions.startSlot')}
        className="px-1 py-1.5"
        onValueChange={([next]) => onChange(next ?? slot)}
      />
      <div className="flex justify-between px-1 text-[0.7rem] text-muted-foreground tabular-nums">
        {ticked.map((one) => (
          <span key={one} className={cn(one === slot && 'font-bold text-primary')}>{formatNumber(one)}</span>
        ))}
      </div>
    </div>
  );
};
