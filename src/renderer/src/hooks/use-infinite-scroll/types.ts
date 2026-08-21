/**
 * The two elements an infinite list has to hand back to be observed.
 */
export interface InfiniteScroll {
  /**
   * Ref for the scrolling element, which is the observer's root.
   * @param node The element, or null as it unmounts
   */
  scrollRef(node: HTMLDivElement | null): void;
  /**
   * Ref for the marker at the end of the list.
   * @param node The element, or null as it unmounts
   */
  sentinelRef(node: HTMLDivElement | null): void;
}
