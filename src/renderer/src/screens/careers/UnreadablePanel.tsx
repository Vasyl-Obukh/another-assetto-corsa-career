import { TriangleAlertIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { HUB_WORDING } from './constants.ts';
import type { CareerKind, UnreadableCareer } from '../../../../shared/types';
import { NationFlag } from '@/components';
import { CAUTION_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface UnreadablePanelProps {
  /**
   * Which kind of career it is.
   */
  kind: CareerKind;
  /**
   * The career picked.
   */
  career: UnreadableCareer;
}

/**
 * Why the career picked cannot be opened, in place of the way back into it.
 * Its folder and Delete stay underneath, as for any career.
 */
export const UnreadablePanel = ({ kind, career }: UnreadablePanelProps) => {
  const { t } = useTranslation();
  const wording = HUB_WORDING[kind];

  return (
    <section className="flex items-start gap-4 rounded-xl border bg-card p-5">
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg [&_svg]:size-5', CAUTION_ACCENT)}>
        <TriangleAlertIcon />
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h2 className="text-lg font-semibold">{t(wording.unreadableTitle)}</h2>
        {career.driver ? (
          <span className="flex items-center gap-2 text-sm font-medium">
            <NationFlag code={career.driver.nation ?? undefined} />
            {career.driver.name}
          </span>
        ) : null}
        <p className="text-sm text-muted-foreground">{t(wording.unreadableBody)}</p>
      </div>
    </section>
  );
};
