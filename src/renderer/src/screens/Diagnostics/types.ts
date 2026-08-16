import type { PathOverrides } from '../../../../shared/types';

/**
 * Which of the three paths a row refers to.
 */
export type PathKind = keyof PathOverrides;
