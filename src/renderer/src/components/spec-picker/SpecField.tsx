import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SpecPicker } from './SpecPicker.tsx';
import type { SpecId } from '../../../../shared/types';
import { carClassName, carSpecName, classOfSpec } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import { useSpecCounts } from '@/hooks';
import { cn } from '@/lib/utils.ts';

interface SpecFieldProps {
  /**
   * The control's id, which ties a label to it.
   */
  id: string;
  /**
   * The spec it holds.
   */
  value: SpecId;
  /**
   * Whether nothing may change just now.
   */
  disabled?: boolean;
  /**
   * Called with the spec picked.
   * @param spec The spec
   */
  onChange: (spec: SpecId) => void;
}

/**
 * A spec as a form field: its name, its class and how much of it is installed,
 * the height of any other field, opening the spec picker.
 */
export const SpecField = ({
  id, value, disabled = false, onChange,
}: SpecFieldProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const [open, setOpen] = useState(false);
  const counts = useSpecCounts(true);
  const owner = classOfSpec(value, catalogue);
  const total = catalogue.specById.get(value) ? (catalogue.carsBySpec.get(value)?.length ?? 0) : 0;

  return (
    <>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        // The height of the Spec / List chips beside it, so switching to a list
        // moves nothing.
        className={cn(
          'flex h-8.25 w-full min-w-0 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-left text-sm shadow-xs',
          'hover:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
        )}
      >
        <span className="min-w-0 flex-1 truncate font-medium">{carSpecName(value, catalogue)}</span>
        <span className="shrink-0 truncate text-xs text-muted-foreground">
          {[owner ? carClassName(owner, catalogue) : null, t('specPicker.installed', { installed: counts?.get(value) ?? 0, count: total })]
            .filter(Boolean).join(' · ')}
        </span>
        <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
      </button>
      <SpecPicker open={open} selected={value} onOpenChange={setOpen} onPick={onChange} />
    </>
  );
};
