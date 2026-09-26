import { useState } from 'react';

import { nationFlagUrl } from '../../../shared/utils/content-url';
import { cn } from '@/lib/utils.ts';

interface NationFlagProps {
  /**
   * The nation's code, one of NATION_CODES, or undefined for none.
   */
  code: string | undefined;
  /**
   * Whether it stands for a nation taken from elsewhere rather than stated,
   * which draws it faded.
   */
  dim?: boolean;
  /**
   * Classes for its size, which defaults to a list row's.
   */
  className?: string;
}

/**
 * A nation's flag, the very image Assetto Corsa shows beside a driver - served
 * out of the install, so the editor and the game can never disagree about it.
 * No nation, or a flag that will not load, is an empty dashed frame of the same
 * size, so a column of them stays aligned.
 */
export const NationFlag = ({ code, dim = false, className }: NationFlagProps) => {
  // Keyed on the code, so a flag that failed does not stay failed once the
  // code changes.
  const [failed, setFailed] = useState<string | null>(null);
  const size = cn('h-3.5 w-5 shrink-0 rounded-[2px]', className);

  if (code === undefined || failed === code) {
    return <span aria-hidden className={cn(size, 'border border-dashed')} />;
  }

  return (
    <img
      src={nationFlagUrl(code)}
      alt=""
      decoding="async"
      className={cn(size, 'object-cover shadow-[0_0_0_1px_var(--color-border)]', dim && 'opacity-45 saturate-50')}
      onError={() => setFailed(code)}
    />
  );
};
