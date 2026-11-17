import { useEffect, useRef, useState } from 'react';

import { NO_ITEMS } from './constants.ts';
import { inGivingOrder, labelsToHide, pixels } from './utils.ts';

/**
 * Which nav items in a row have to show their icon alone for everything in the
 * row to fit on one line: one more, from the right, for each step the row
 * narrows past what the labels need. The row is the header, or a strip of tabs.
 *
 * Finds its items by what navFitItem and NAV_FIT_LABEL stamp on their markup.
 * An item marked last gives its label up only after every other has. Assumes
 * nothing else in the row grows or shrinks.
 * @param row The row, a flex row, or null before it has mounted
 * @param key What changes how long the labels are, such as the language and mode
 * @returns The ids of the items to show as icons alone
 */
export const useNavFit = (row: HTMLElement | null, key: string): ReadonlySet<string> => {
  const [fit, setFit] = useState({ key, hidden: NO_ITEMS });
  // What showing each item's label takes, in pixels. A label clipped to nothing
  // cannot be measured, so the last width it showed at stands in for it.
  const labels = useRef(new Map<string, number>());

  useEffect(() => {
    if (!row) return undefined;

    const known = labels.current;
    const measure = () => {
      const items = inGivingOrder(
        [...row.querySelectorAll<HTMLElement>('[data-nav-item]')],
        (item) => item.dataset.navLast !== undefined,
      );
      const idOf = (item: HTMLElement) => item.dataset.navItem ?? '';
      const widthOf = (item: HTMLElement) => known.get(`${key}|${idOf(item)}`) ?? 0;
      // What the labels hidden now would take back.
      let hidden = 0;
      items.forEach((item) => {
        const width = item.querySelector('[data-nav-label]')?.getBoundingClientRect().width ?? 0;
        if (width > 1) known.set(`${key}|${idOf(item)}`, width + pixels(getComputedStyle(item).columnGap));
        if (item.dataset.compact !== undefined) hidden += widthOf(item);
      });

      const style = getComputedStyle(row);
      const children = [...row.children];
      const content = children.reduce((sum, child) => sum + child.getBoundingClientRect().width, 0)
        + pixels(style.columnGap) * (children.length - 1)
        + pixels(style.paddingLeft) + pixels(style.paddingRight);
      const count = labelsToHide(items.map(widthOf), content + hidden - row.clientWidth);
      const ids = items.slice(0, count).map(idOf);

      setFit((was) => {
        const same = was.key === key && was.hidden.size === ids.length && ids.every((id) => was.hidden.has(id));
        return same ? was : { key, hidden: ids.length === 0 ? NO_ITEMS : new Set(ids) };
      });
    };

    // A ResizeObserver reports once as soon as it starts observing, so this is
    // also what takes the first measurement. The row's children too, since
    // a badge or an amount changes their widths without changing its own.
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    [...row.children].forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [row, key]);

  return fit.key === key ? fit.hidden : NO_ITEMS;
};
