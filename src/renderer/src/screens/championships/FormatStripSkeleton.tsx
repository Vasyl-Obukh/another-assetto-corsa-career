import { FORMAT_SKELETON_BLOCKS } from './constants.ts';
import { Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';

interface FormatStripSkeletonProps {
  /**
   * How many session blocks to hold places for.
   */
  blocks?: number;
}

/**
 * A weekend's strip of session blocks while the championship is read, a block
 * the size of each loaded one.
 */
export const FormatStripSkeleton = ({ blocks = FORMAT_SKELETON_BLOCKS }: FormatStripSkeletonProps) => (
  <span className="flex shrink-0 items-center gap-0.5">
    {slots(blocks).map((at) => <Shimmer key={at} className="size-5 rounded" />)}
  </span>
);
