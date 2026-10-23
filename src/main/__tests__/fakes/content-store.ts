import { fake } from './fake.ts';
import type { Content } from '../../../shared/types/index.ts';
import type { ContentStore } from '../../content-store/index.ts';

/**
 * A content store with nothing installed: what planning an event reads, a car
 * looked up by its folder ID, and what one costs - and nothing more. Its library
 * is everything installed.
 * @param content What the install holds, empty unless the test says otherwise
 * @param prices What each installed car costs, by folder ID - nothing for one
 * the test leaves out
 * @returns The store
 */
export const fakeContentStore = (
  content: Partial<Content> = {},
  prices: Readonly<Record<string, number>> = {},
): ContentStore => {
  const cars = content.cars ?? [];

  return fake<ContentStore>('content', {
    content: async () => ({
      cars: [], tracks: [], weather: [], controllers: [], issues: [], ...content,
    }),
    car: async (id) => cars.find((one) => one.id === id) ?? null,
    price: async (id) => (cars.some((one) => one.id === id) ? prices[id] ?? 0 : null),
  });
};
