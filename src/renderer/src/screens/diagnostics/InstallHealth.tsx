import { CheckIcon, TriangleAlertIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils.ts';

interface InstallHealthProps {
  /**
   * Whether all three paths are found.
   */
  ready: boolean;
  /**
   * Whether the library has been scanned.
   */
  scanned: boolean;
}

/**
 * The whole tab's answer in one line: whether a race can be launched, and if
 * not, which of the two cards below says why.
 */
export const InstallHealth = ({ ready, scanned }: InstallHealthProps) => {
  const { t } = useTranslation();
  const healthy = ready && scanned;
  let detail = t('diagnostics.notScanned');
  if (healthy) detail = t('diagnostics.readyDetail');
  else if (!ready) detail = t('diagnostics.notFound');

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border px-5 py-3.5',
        healthy ? 'border-success/40 bg-success/7' : 'border-warning/50 bg-warning/10',
      )}
    >
      <span
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-full',
          healthy ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground',
        )}
      >
        {healthy ? <CheckIcon className="size-5" /> : <TriangleAlertIcon className="size-5" />}
      </span>
      <div className="flex flex-col">
        <span className="font-semibold">{healthy ? t('diagnostics.ready') : t('diagnostics.notReady')}</span>
        <span className="text-sm text-muted-foreground">{detail}</span>
      </div>
    </div>
  );
};
