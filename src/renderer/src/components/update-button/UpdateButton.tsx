import { DownloadIcon, LoaderCircleIcon, RotateCwIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useUpdate } from '@/hooks';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface UpdateButtonProps {
  /**
   * Whether it stands among the start screen's large buttons rather than in
   * the header, and so matches their height.
   */
  large?: boolean;
}

/**
 * A newer version at the right of the header, once there is one: offered,
 * then fetching, then waiting for a restart. Nothing at all otherwise.
 */
export const UpdateButton = ({ large = false }: UpdateButtonProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { status, download, install } = useUpdate();
  const state = status?.state;
  const pill = cn(
    'flex shrink-0 items-center gap-1.5 rounded-lg border bg-card text-sm font-semibold transition-colors',
    large ? 'h-10 px-4' : 'h-8 px-2.5',
  );

  if (state?.phase === 'available') {
    return (
      <button type="button" className={cn(pill, 'hover:border-primary/45')} onClick={download}>
        <DownloadIcon className="size-4 text-primary" />
        {t('update.header.available', { version: state.version })}
      </button>
    );
  }

  if (state?.phase === 'downloading') {
    return (
      <span role="status" className={cn(pill, 'text-muted-foreground tabular-nums')}>
        <LoaderCircleIcon className="size-4 animate-spin text-primary" />
        {t('update.header.downloading', { percent: formatNumber(state.percent) })}
      </span>
    );
  }

  if (state?.phase === 'ready') {
    return (
      <button type="button" className={cn(pill, 'border-primary/45 hover:bg-primary/8')} onClick={install}>
        <RotateCwIcon className="size-4 text-primary" />
        {t('update.header.ready')}
      </button>
    );
  }

  return null;
};
