import { HistoryDoor } from './HistoryDoor.tsx';
import { ResultsDoor } from './ResultsDoor.tsx';
import type { Career } from '../../../../shared/types';

interface HomeDoorsProps {
  /**
   * The career.
   */
  career: Career;
}

/**
 * Results and History side by side under the season, the two places the
 * navigation no longer lists.
 */
export const HomeDoors = ({ career }: HomeDoorsProps) => (
  <div className="grid gap-5 md:grid-cols-2">
    <ResultsDoor career={career} />
    <HistoryDoor career={career} />
  </div>
);
