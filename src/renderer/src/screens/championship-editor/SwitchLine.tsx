import { Switch } from '@/components/ui/switch.tsx';

interface SwitchLineProps {
  /**
   * The control's id, which the label points at.
   */
  id: string;
  /**
   * What is switched, already translated.
   */
  label: string;
  /**
   * A line under it, already translated.
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
   * Called when it is switched.
   * @param next Whether it is now on
   */
  onChange: (next: boolean) => void;
}

/**
 * A switch at the end of its own label, for a pane too narrow for the settings
 * layout's two columns.
 */
export const SwitchLine = ({
  id, label, hint, value, disabled, onChange,
}: SwitchLineProps) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex min-w-0 flex-col gap-0.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
    <Switch id={id} checked={value} disabled={disabled} onCheckedChange={onChange} />
  </div>
);
