import { FinancesDoor } from './FinancesDoor.tsx';
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
 * Results, History and Finances side by side under the season, the places the
 * navigation does not list.
 */
export const HomeDoors = ({ career }: HomeDoorsProps) => (
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    <ResultsDoor career={career} />
    <HistoryDoor career={career} />
    <FinancesDoor career={career} />
  </div>
);
