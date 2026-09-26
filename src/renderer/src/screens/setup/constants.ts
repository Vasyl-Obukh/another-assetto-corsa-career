import type { SetupStep } from './types.ts';

/**
 * The steps, in order.
 */
export const SETUP_STEPS: readonly SetupStep[] = [
  {
    id: 'paths', title: 'setup.steps.paths', sub: 'setup.steps.pathsSub', hint: 'setup.steps.pathsHint',
  },
  {
    id: 'scan', title: 'setup.steps.scan', sub: 'setup.steps.scanSub', hint: 'setup.steps.scanHint',
  },
  {
    id: 'yours', title: 'setup.steps.yours', sub: 'setup.steps.yoursSub', hint: 'setup.steps.yoursHint',
  },
];
