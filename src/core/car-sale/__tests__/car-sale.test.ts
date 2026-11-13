import { describe, expect, it } from '@jest/globals';

import { DEAL_OFF, HEADLINE_OFF, SALE_SHARE } from '../../../shared/utils/car-sale/index.ts';
import { drawSale } from '../car-sale.ts';

const MODELS = Array.from({ length: 400 }, (_, at) => `car_${String(at).padStart(3, '0')}`);
const WEEK = '2027-03-08';

describe('core/car-sale', () => {
  describe('drawSale', () => {
    it('draws the same sale for the same career and week', () => {
      expect(drawSale(MODELS, WEEK, 'career-a')).toEqual(drawSale(MODELS, WEEK, 'career-a'));
    });

    it('draws a different sale another week, and for another career', () => {
      const sale = drawSale(MODELS, WEEK, 'career-a');

      expect(drawSale(MODELS, '2027-03-15', 'career-a').deals).not.toEqual(sale.deals);
      expect(drawSale(MODELS, WEEK, 'career-b').deals).not.toEqual(sale.deals);
    });

    it('takes no notice of the order the library lists its cars in', () => {
      expect(drawSale([...MODELS].reverse(), WEEK, 'career-a')).toEqual(drawSale(MODELS, WEEK, 'career-a'));
    });

    it('puts a share of the library on sale besides the Deal of the week', () => {
      const { deals } = drawSale(MODELS, WEEK, 'career-a');

      expect(deals.length).toBeGreaterThanOrEqual(Math.round(MODELS.length * SALE_SHARE[0]));
      expect(deals.length).toBeLessThanOrEqual(Math.round(MODELS.length * SALE_SHARE[1]));
    });

    it('discounts within each range, and never names a car twice', () => {
      const { week, headline, deals } = drawSale(MODELS, WEEK, 'career-a');
      const models = [headline?.model, ...deals.map((deal) => deal.model)];

      expect(week).toBe(WEEK);
      expect(headline?.off).toBeGreaterThanOrEqual(HEADLINE_OFF[0]);
      expect(headline?.off).toBeLessThanOrEqual(HEADLINE_OFF[1]);
      expect(deals.every((deal) => deal.off >= DEAL_OFF[0] && deal.off <= DEAL_OFF[1])).toBe(true);
      expect(new Set(models).size).toBe(models.length);
    });

    it('puts at least one car on sale beside the Deal of the week from a small library', () => {
      expect(drawSale(['one_car', 'two_car'], WEEK, 'career-a').deals).toHaveLength(1);
    });

    it('makes a library of one car the Deal of the week and nothing more', () => {
      const sale = drawSale(['one_car'], WEEK, 'career-a');

      expect(sale.headline?.model).toBe('one_car');
      expect(sale.deals).toEqual([]);
    });

    it('draws nothing from an empty library', () => {
      expect(drawSale([], WEEK, 'career-a')).toEqual({ week: WEEK, headline: null, deals: [] });
    });
  });
});
