import type { ReactNode } from 'react';

interface FieldRowProps {
  /**
   * The already-translated name of the setting.
   */
  label: string;
  /**
   * The control's `id`, when it is a real form control that a `<label>` can be
   * bound to. Left out where the control is a listbox carrying its own
   * `aria-label` instead.
   */
  htmlFor?: string;
  /**
   * An already-translated line under the row, for anything the label cannot
   * carry.
   */
  hint?: string;
  /**
   * The control itself, which sets its own width from `CONTROL_WIDTH`.
   */
  children: ReactNode;
}

export const FieldRow = ({
  label, htmlFor, hint, children,
}: FieldRowProps) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between gap-4">
      {htmlFor === undefined ? (
        <span className="text-sm font-medium">{label}</span>
      ) : (
        <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      )}

      {children}
    </div>

    {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
  </div>
);
