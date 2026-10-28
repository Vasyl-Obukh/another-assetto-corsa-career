import { ContractsDoor } from './ContractsDoor.tsx';
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
 * Results, History, Finances, Rating and Contracts side by side under the
 * season, the places the navigation does not list.
 */
export const HomeDoors = ({ career }: HomeDoorsProps) => (
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
    <ResultsDoor career={career} />
    <HistoryDoor career={career} />
    <FinancesDoor career={career} />
    <RatingDoor career={career} />
    <ContractsDoor career={career} />
  </div>
);
