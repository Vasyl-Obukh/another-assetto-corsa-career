import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { STATUS_TICK_MS } from './constants.ts';
import { saveStatusLine } from './utils.ts';
import type { SaveSummary } from '../../../../shared/types';
import { Shimmer } from '@/components/Shimmer.tsx';
import { useFormat } from '@/i18n';

interface SaveStatusProps {
  /**
   * The open career's saves, newest first, or null while they are read.
   */
  saves: readonly SaveSummary[] | null;
}

/**
 * When the career last saved, on the header's right: what the newest save was
 * and how long ago, kept current as the minutes pass.
 */
export const SaveStatus = ({ saves }: SaveStatusProps) => {
  const { t } = useTranslation();
  const { formatAgo } = useFormat();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), STATUS_TICK_MS);

    return () => clearInterval(timer);
  }, []);

  if (saves === null) return <Shimmer className="ml-auto h-3 w-52" />;

  const newest = saves[0];
  if (!newest) return null;

  return (
    <span className="ml-auto flex shrink-0 items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground">
      <span className="size-1.5 rounded-full bg-success" />
      {saveStatusLine(newest, formatAgo(newest.savedAt, now), t)}
    </span>
  );
};
