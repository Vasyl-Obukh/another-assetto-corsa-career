import { fake } from './fake.ts';
import type { Content } from '../../../shared/types/index.ts';
import type { ContentStore } from '../../content-store/index.ts';

/**
 * A content store with nothing installed: what planning an event reads, and
 * nothing more.
 * @param content What the install holds, empty unless the test says otherwise
 * @returns The store
 */
export const fakeContentStore = (content: Partial<Content> = {}): ContentStore => fake<ContentStore>('content', {
  content: async () => ({
    cars: [], tracks: [], weather: [], controllers: [], issues: [], ...content,
  }),
});
