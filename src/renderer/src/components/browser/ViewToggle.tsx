import { LayoutGridIcon, ListIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { BrowserView } from '@/lib/browser-memory';
import { cn } from '@/lib/utils.ts';

interface ViewToggleProps {
  /**
   * The layout showing.
   */
  value: BrowserView;
  /**
   * Switches layout.
   * @param next The layout to show
   */
  onChange(next: BrowserView): void;
}

/**
 * Cards or a table, side by side as one control.
 */
export const ViewToggle = ({ value, onChange }: ViewToggleProps) => {
  const { t } = useTranslation();
  const options = [
    { view: 'cards', label: t('browse.cards'), icon: <LayoutGridIcon className="size-4" /> },
    { view: 'list', label: t('browse.list'), icon: <ListIcon className="size-4" /> },
  ] as const;

  return (
    <div className="flex shrink-0 overflow-hidden rounded-lg border bg-card shadow-xs">
      {options.map((option) => (
        <button
          key={option.view}
          type="button"
          aria-pressed={value === option.view}
          aria-label={option.label}
          title={option.label}
          className={cn(
            'grid h-9 w-9 place-items-center text-muted-foreground hover:text-foreground',
            value === option.view && 'bg-accent text-foreground',
          )}
          onClick={() => onChange(option.view)}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
};
