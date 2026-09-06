import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import { CONTROL_WIDTH } from '@/lib/layout';

interface ToggleButtonProps {
  /**
   * The control's id, for a layout that binds a label to it.
   */
  id?: string;
  /**
   * What the control is switching, for a layout that has no bound label.
   */
  label?: string;
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

export const ToggleButton = ({
  id, label, value, disabled = false, onChange,
}: ToggleButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button
      id={id}
      type="button"
      variant={value ? 'secondary' : 'outline'}
      size="sm"
      className={CONTROL_WIDTH}
      aria-label={label}
      aria-pressed={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
    >
      {value ? t('toggle.on') : t('toggle.off')}
    </Button>
  );
};
