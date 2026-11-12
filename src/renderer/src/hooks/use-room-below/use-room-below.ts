import { useEffect, useState } from 'react';

/**
 * How tall an element may grow before it makes its page scroll: the scrolling
 * page's height, less where the element starts on it and the page's own
 * bottom padding.
 *
 * Measured where the element sits with the page at the top, so scrolling the
 * page never changes the answer, and kept current as the page is resized.
 * @param element The element, or null before it has mounted
 * @returns The height in pixels, or null while there is nothing to measure
 */
export const useRoomBelow = (element: HTMLElement | null): number | null => {
  const [room, setRoom] = useState<number | null>(null);

  useEffect(() => {
    if (!element) return undefined;

    let scroller = element.parentElement;
    while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) {
      scroller = scroller.parentElement;
    }
    if (!scroller) return undefined;
    const page = scroller;

    const measure = (): void => {
      const top = element.getBoundingClientRect().top - page.getBoundingClientRect().top + page.scrollTop;
      const column = page.firstElementChild;
      const padding = column ? Number.parseFloat(getComputedStyle(column).paddingBottom) || 0 : 0;
      setRoom(Math.max(0, Math.floor(page.clientHeight - top - padding)));
    };

    // A ResizeObserver reports once as soon as it starts observing, so this is
    // also what takes the first measurement. The page's own column is watched
    // too, since a header wrapping onto a second line moves the element down.
    const observer = new ResizeObserver(measure);
    observer.observe(page);
    if (page.firstElementChild) observer.observe(page.firstElementChild);

    return () => observer.disconnect();
  }, [element]);

  return room;
};
