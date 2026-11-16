import type { Car } from '../../../../shared/types';
import type { Garage } from '@/hooks';

/**
 * What a car browser does with money, for one inside a career: the Store,
 * selling every car; the Garage, the cars the career owns; or a picker, which
 * shows what each car costs and answers with the one picked.
 */
export interface CarTrade {
  /**
   * Which of the three the browser is.
   */
  mode: 'store' | 'garage' | 'pick';
  /**
   * The career's garage, which prices every car and knows which it owns.
   */
  garage: Garage;
  /**
   * The rung a car rented from a picker is raced on, which caps its rent -
   * absent elsewhere, where a rent shown is the most it can come to.
   */
  rung?: number;
  /**
   * Called to buy a car, from its card or its row in the Store.
   * @param car The car
   */
  onPurchase?: (car: Car) => void;
  /**
   * Called to repaint a car the career owns, from the Garage.
   * @param car The car
   */
  onRepaint?: (car: Car) => void;
  /**
   * Called to sell a car the career owns, from the Garage.
   * @param car The car
   */
  onSell?: (car: Car) => void;
}
