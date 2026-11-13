import { describe, expect, it } from '@jest/globals';

import type { CarSale } from '../../../types/index.ts';
import {
  dealOf, liveSale, saleDeals, saleEnds, saleOffs, salePrice, saleWeek,
} from '../car-sale.ts';

const SALE: CarSale = {
  week: '2027-03-08',
  headline: { model: 'deal_car', off: 60 },
  deals: [{ model: 'one_car', off: 20 }, { model: 'two_car', off: 45 }],
};

describe('shared/utils/car-sale', () => {
  describe('saleWeek', () => {
    it('keeps a Monday as the week it opens', () => {
      expect(saleWeek('2027-03-08')).toBe('2027-03-08');
    });

    it('takes a Sunday back to the Monday before it', () => {
      expect(saleWeek('2027-03-14')).toBe('2027-03-08');
    });

    it('opens the week of New Year in the year before', () => {
      expect(saleWeek('2027-01-01')).toBe('2026-12-28');
    });
  });

  describe('saleEnds', () => {
    it('closes a week on its Sunday', () => {
      expect(saleEnds('2026-12-28')).toBe('2027-01-03');
    });
  });

  describe('liveSale', () => {
    it('is the sale held while the clock is in its week', () => {
      expect(liveSale(SALE, '2027-03-14')).toBe(SALE);
    });

    it('is none once the clock has left its week', () => {
      expect(liveSale(SALE, '2027-03-15')).toBeNull();
    });

    it('is none for a career holding no sale', () => {
      expect(liveSale(undefined, '2027-03-10')).toBeNull();
    });
  });

  describe('salePrice', () => {
    it('takes the discount off the listed price', () => {
      expect(salePrice(150_000, 35)).toBe(97_500);
    });

    it('rounds to the nearest hundred', () => {
      expect(salePrice(99_950, 10)).toBe(90_000);
    });

    // A cheap car on a deep discount once rounded to nothing and was given away.
    it('never comes to less than a hundred, nor to more than the listed price', () => {
      expect(salePrice(160, 70)).toBe(100);
      expect(salePrice(80, 70)).toBe(80);
    });
  });

  describe('saleDeals', () => {
    it('lists the Deal of the week first, marked as such', () => {
      expect(saleDeals(SALE)).toEqual([
        { model: 'deal_car', off: 60, headline: true },
        { model: 'one_car', off: 20, headline: false },
        { model: 'two_car', off: 45, headline: false },
      ]);
    });

    it('lists only the deals of a sale drawn with no Deal of the week', () => {
      expect(saleDeals({ ...SALE, headline: null }).map((deal) => deal.model)).toEqual(['one_car', 'two_car']);
    });

    it('lists nothing with no sale running', () => {
      expect(saleDeals(null)).toEqual([]);
    });
  });

  describe('dealOf', () => {
    it('finds the Deal of the week', () => {
      expect(dealOf(SALE, 'deal_car')).toEqual({ model: 'deal_car', off: 60, headline: true });
    });

    it('finds any other car on sale', () => {
      expect(dealOf(SALE, 'two_car')).toEqual({ model: 'two_car', off: 45, headline: false });
    });

    it('finds nothing for a car not on sale, or with no sale running', () => {
      expect(dealOf(SALE, 'full_price')).toBeNull();
      expect(dealOf(null, 'deal_car')).toBeNull();
    });
  });

  describe('saleOffs', () => {
    it('reads each deal as its discount, by car', () => {
      expect(saleOffs(saleDeals(SALE))).toEqual({ deal_car: 60, one_car: 20, two_car: 45 });
    });
  });
});
