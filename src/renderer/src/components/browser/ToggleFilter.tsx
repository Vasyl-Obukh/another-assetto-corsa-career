import { Button } from '@/components/ui/button.tsx';

interface ToggleFilterProps {
  /**
   * The already-translated name of the filter.
   */
  label: string;
  /**
   * Whether it is on. The query only narrows when it is explicitly true.
   */
  value: boolean;
  /**
   * Turns it on or off.
   * @param next Whether it should now narrow the results
   */
  onChange(next: boolean): void;
}

export const ToggleFilter = ({ label, value, onChange }: ToggleFilterProps) => (
  <Button
    variant={value ? 'secondary' : 'outline'}
    size="sm"
    aria-pressed={value}
    onClick={() => onChange(!value)}
  >
    {label}
  </Button>
);
