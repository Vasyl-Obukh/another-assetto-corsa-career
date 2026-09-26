import { EyeOffIcon, LibraryIcon } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { withId } from './utils.ts';
import type { AddedContent } from '../../../../shared/types';
import { useSettings } from '@/app';
import { SWITCH_TRACK } from '@/components/browser/index.ts';
import { Switch } from '@/components/ui/switch.tsx';
import { cn } from '@/lib/utils.ts';

interface LibrarySwitchProps {
  /**
   * Which of the user's lists the entry belongs to.
   */
  kind: keyof AddedContent;
  /**
   * The car's or the circuit's folder ID.
   */
  id: string;
}

/**
 * Whether a mod the catalogue does not know is in the library, as a pill with
 * the same switch Your content gives it. Amber while it is left out, since
 * that is why the car or circuit is missing everywhere else.
 */
export const LibrarySwitch = ({ kind, id }: LibrarySwitchProps) => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();
  const switchId = useId();

  const { addedContent } = settings;
  const on = addedContent[kind].includes(id);
  const Icon = on ? LibraryIcon : EyeOffIcon;

  return (
    <label
      htmlFor={switchId}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-2 rounded-full border py-1 pr-1.5 pl-3 text-sm font-medium',
        on ? 'bg-card' : 'border-warning/50 bg-warning/10',
      )}
    >
      <Icon className={cn('size-3.5', on ? 'text-muted-foreground' : 'text-warning-foreground dark:text-warning')} />
      {on ? t('yourContent.inLibrary') : t('yourContent.notInLibrary')}
      <Switch
        id={switchId}
        checked={on}
        className={SWITCH_TRACK}
        onCheckedChange={(next) => patch({
          addedContent: { ...addedContent, [kind]: withId(addedContent[kind], id, next) },
        })}
      />
    </label>
  );
};
