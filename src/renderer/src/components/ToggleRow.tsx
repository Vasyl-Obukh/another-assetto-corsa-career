import { useTranslation } from 'react-i18next';

import { FieldRow } from './FieldRow.tsx';
import { Button } from '@/components/ui/button.tsx';
import { CONTROL_WIDTH } from '@/lib/layout';

interface ToggleRowProps {
  /**
   * The already-translated name of the thing being switched.
   */
  label: string;
  /**
   * An already-translated line under it, for anything the label cannot carry.
   */
  hint?: string;
  /**
   * Whether it is on.
   */
  value: boolean;
  /**
   * Whether it cannot be changed just now.
   */
  disabled?: boolean;
  /**
   * Switches it.
   * @param next Whether it should now be on
   */
  onChange(next: boolean): void;
}

export const ToggleRow = ({
  label, hint, value, disabled = false, onChange,
}: ToggleRowProps) => {
  const { t } = useTranslation();

  return (
    <FieldRow label={label} hint={hint}>
      <Button
        type="button"
        variant={value ? 'secondary' : 'outline'}
        size="sm"
        className={CONTROL_WIDTH}
        aria-pressed={value}
        disabled={disabled}
        onClick={() => onChange(!value)}
      >
        {value ? t('toggle.on') : t('toggle.off')}
      </Button>
    </FieldRow>
  );
};
