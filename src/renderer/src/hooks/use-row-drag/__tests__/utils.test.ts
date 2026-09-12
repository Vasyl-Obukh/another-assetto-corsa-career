import { describe, expect, it } from '@jest/globals';

import { dropEdge } from '../utils.ts';

describe('renderer/hooks/use-row-drag/utils', () => {
  describe('dropEdge', () => {
    it('marks nothing when no row is being dragged', () => {
      expect(dropEdge(null, 2, 2)).toBeNull();
    });

    it('marks only the row the pointer is over', () => {
      expect(dropEdge(0, 2, 1)).toBeNull();
      expect(dropEdge(0, 2, 2)).not.toBeNull();
    });

    it('marks nothing over the row being dragged, which would move nowhere', () => {
      expect(dropEdge(1, 1, 1)).toBeNull();
    });

    // A fixed side would be wrong by one row in one of the two directions,
    // because moveTo takes the row out before putting it back.
    it('marks the far edge for a row moved later and the near edge for one moved earlier', () => {
      expect(dropEdge(0, 2, 2)).toBe('after');
      expect(dropEdge(3, 1, 1)).toBe('before');
    });
  });
});
