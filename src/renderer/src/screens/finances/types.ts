import type { LucideIcon } from 'lucide-react';

/**
 * Which page's row a lead tile heads, which picks its icon and colour.
 */
export type TileLead = 'balance' | 'contracts' | 'sponsors' | 'rating';

/**
 * How a lead tile is set apart from the tiles beside it.
 */
export interface TileAccent {
  /**
   * The icon Home's door gives its page.
   */
  icon: LucideIcon;
  /**
   * The tile's own fill and border: the page's colour washed over a card.
   */
  tile: string;
  /**
   * The well the icon sits in.
   */
  well: string;
}
