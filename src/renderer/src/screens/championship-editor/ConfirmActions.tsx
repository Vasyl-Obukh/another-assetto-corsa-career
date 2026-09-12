import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';

interface ConfirmActionsProps {
  /**
   * Whether a weekend is under way, in which case nothing may be committed.
   */
  locked: boolean;
  /**
   * Called to commit, for a form that is not a `<form>`.
   *
   * Left out inside one, where Confirm submits instead and the form's own
   * `onSubmit` commits - which is what makes Enter confirm with no key handler
   * anywhere. A dialog that is only a dialog has no submit to fire, so it hands
   * the handler over directly.
   */
  onConfirm?: () => void;
  /**
   * Called to throw the changes away.
   */
  onCancel: () => void;
}

/**
 * The pair every form in the editor ends with.
 *
 * Cancel first and ghost, Confirm second and filled - the order and the weight
 * ConfirmDialog already uses, so the two read the same way whichever one the
 * user meets.
 */
export const ConfirmActions = ({ locked, onConfirm, onCancel }: ConfirmActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
        {t('confirm.cancel')}
      </Button>

      {onConfirm === undefined ? (
        <Button type="submit" size="sm" disabled={locked}>
          {t('editor.rows.confirm')}
        </Button>
      ) : (
        <Button type="button" size="sm" disabled={locked} onClick={onConfirm}>
          {t('editor.rows.confirm')}
        </Button>
      )}
    </div>
  );
};
