import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import type { Back, BackFallback } from './types.ts';
import { currentIndex, previousVisit } from '@/lib/nav-history';
import { BACK_LABEL, routeOf } from '@/lib/routes';

/**
 * Back for the page the window is on: to the page it came from, named as that
 * page named itself, and to the screen's fixed parent where there is none.
 *
 * Going back is a step back through the history rather than a new entry, so a
 * chain of pages unwinds in order and a navigation blocker still gets its say.
 * @param fallback Where Back leads with no earlier page, and its name
 * @returns What Back says and where it goes
 */
export const useBack = (fallback: BackFallback): Back => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Read for its re-render: the label follows the entry the window is on.
  useLocation();

  const previous = previousVisit(currentIndex());
  if (previous === null) return { label: fallback.label, go: () => { void navigate(fallback.to); } };

  const route = routeOf(previous.pathname);

  return {
    label: previous.name ?? (route === null ? fallback.label : t(BACK_LABEL[route])),
    go: () => { void navigate(-1); },
  };
};
