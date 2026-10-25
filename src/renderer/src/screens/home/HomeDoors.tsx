import { FinancesDoor } from './FinancesDoor.tsx';
import { HistoryDoor } from './HistoryDoor.tsx';
import { RatingDoor } from './RatingDoor.tsx';
import { ResultsDoor } from './ResultsDoor.tsx';
import type { Career } from '../../../../shared/types';

interface HomeDoorsProps {
  /**
   * The career.
   */
  career: Career;
}

/**
 * Results, History, Finances and Rating side by side under the season, the
 * places the navigation does not list.
 */
export const HomeDoors = ({ career }: HomeDoorsProps) => (
  <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
    <ResultsDoor career={career} />
    <HistoryDoor career={career} />
    <FinancesDoor career={career} />
    <RatingDoor career={career} />
  </div>
);
