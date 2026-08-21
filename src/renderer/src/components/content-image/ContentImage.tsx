import { useState } from 'react';

import type { ContentImageProps } from './types.ts';
import { cn } from '@/lib/utils.ts';

export const ContentImage = ({
  sources,
  fallback,
  alt,
  className,
}: ContentImageProps) => {
  const [failed, setFailed] = useState(0);
  const source = sources[failed];

  if (source === undefined) return fallback;

  return (
    <img
      // Remounting on the source keeps the failure count honest: without it a
      // browser that has already errored may not fire onError for the next src.
      key={source}
      src={source}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn('absolute inset-0 size-full', className)}
      onError={() => setFailed((current) => current + 1)}
    />
  );
};
