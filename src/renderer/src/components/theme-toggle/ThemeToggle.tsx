import { MoonIcon, SunIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useSettings } from '@/app';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { cn } from '@/lib/utils.ts';

// Shows the theme in force; a click picks the other outright, leaving "system"
// to be chosen again in Settings.
export const ThemeToggle = () => {
  const { t } = useTranslation();
  const { theme, patch } = useSettings();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          role="switch"
          aria-checked={theme === 'dark'}
          aria-label={t('theme.dark')}
          className="relative flex h-8 w-15 shrink-0 rounded-full border bg-card p-0.75 transition-colors hover:border-primary/45"
          onClick={() => patch({ theme: next })}
        >
          {/* The thumb slides under the theme in force. */}
          <span
            className={cn(
              'absolute top-0.75 left-0.75 h-6 w-6.5 rounded-full bg-primary/15 transition-transform',
              theme === 'dark' && 'translate-x-6.5',
            )}
          />
          <span className={cn('relative grid h-6 w-6.5 place-items-center', theme === 'light' ? 'text-primary' : 'text-muted-foreground')}>
            <SunIcon className="size-3.5" />
          </span>
          <span className={cn('relative grid h-6 w-6.5 place-items-center', theme === 'dark' ? 'text-primary' : 'text-muted-foreground')}>
            <MoonIcon className="size-3.5" />
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{t(`theme.${next}`)}</TooltipContent>
    </Tooltip>
  );
};
