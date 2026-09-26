import { SESSION_SKELETON } from './constants.ts';
import { Shimmer } from '@/components';

/**
 * The weekend's sessions while they are read: a row each, in the two columns
 * the loaded list reads down.
 */
export const SessionsSkeleton = () => (
  <ul className="gap-x-6 space-y-1.5 sm:columns-2">
    {SESSION_SKELETON.map((badge) => (
      <li key={badge} className="flex break-inside-avoid items-center gap-2">
        <Shimmer className="h-3 w-7" />
        <Shimmer className={`h-5.5 ${badge}`} />
        <Shimmer className="h-3 w-16" />
      </li>
    ))}
  </ul>
);
