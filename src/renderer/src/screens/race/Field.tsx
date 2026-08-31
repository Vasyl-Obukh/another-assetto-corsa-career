import type { ReactNode } from 'react';

interface FieldProps {
  /**
   * The control's id, which is what ties the label to it.
   */
  id: string;
  /**
   * The already-translated label.
   */
  label: string;
  /**
   * An already-translated line under the control, when one is worth having.
   */
  hint?: string;
  /**
   * The control itself, which must carry the same id.
   */
  children: ReactNode;
}

export const Field = ({
  id, label, hint, children,
}: FieldProps) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
    {children}
    {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
  </div>
);
