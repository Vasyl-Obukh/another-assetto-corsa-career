/**
 * What a round of each class costs the open career, against what it holds.
 */
export interface RoundCosts {
  /**
   * Whether the career can pay for a round of a class: its next round's fee
   * and the cheapest rent the class allows.
   * @param series The championship's id
   * @param entry The class entry's id
   * @returns True when it can, false too for a class nothing installed can
   * enter - and true for every class until the costs have been read, so a
   * switch left on keeps its place rather than emptying the board
   */
  affordable(series: string, entry: string): boolean;
}
