import { TargetIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Contract, KeepStanding } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { CONTRACT_END_ACCENT, KEEP_ACCENT } from '@/lib/accents';
import { keepMark } from '@/lib/contracts';

interface KeepBlockProps {
  /**
   * The contract, which says what keeps the player on and what came of it.
   */
  contract: Pick<Contract, 'keep' | 'kept'>;
  /**
   * Where the player and their teammate stand in the class's table.
   */
  standing: KeepStanding;
}

// What keeps the player on for the next season, and where they stand against
// it: the target, their place and their teammate's, and On course or Short of
// it - or, once the team has decided, what came of it.
export const KeepBlock = ({ contract, standing }: KeepBlockProps) => {
  const { t } = useTranslation();
  const always = contract.keep === undefined;

  const mark = keepMark(contract, standing);
  let chip = mark ? <Badge className={KEEP_ACCENT[mark]}>{t(`championships.contract.mark.${mark}`)}</Badge> : null;
  let hint = t('championships.contract.judged');
  if (contract.kept === 'released') {
    chip = <Badge className={CONTRACT_END_ACCENT.released}>{t('contracts.ended.released')}</Badge>;
    hint = t('championships.contract.releasedHint');
  } else if (contract.kept) {
    chip = <Badge className={CONTRACT_END_ACCENT.renewed}>{t(`championships.contract.kept.${contract.kept}`)}</Badge>;
    hint = t(`championships.contract.keptHint.${contract.kept}`);
  }

  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
        {t('championships.contract.keepTitle')}
      </span>
      <span className="flex items-center gap-1.5 text-sm font-semibold">
        <TargetIcon className="size-4 shrink-0 text-contract-foreground" />
        {always
          ? t('championships.contract.keepAlways')
          : t('championships.contract.keepPlace', { place: contract.keep })}
      </span>
      {always ? null : (
        <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5">
          <dt className="text-muted-foreground">{t('championships.contract.you')}</dt>
          <dd className="text-right font-semibold tabular-nums">
            {standing.place === null
              ? t('championships.contract.unplaced')
              : t('championships.contract.placeOf', { place: standing.place, size: standing.size })}
          </dd>
          {standing.mate === null ? null : (
            <>
              <dt className="text-muted-foreground">{t('championships.contract.teammate')}</dt>
              <dd className="text-right font-semibold tabular-nums">{t('championships.contract.place', { place: standing.mate })}</dd>
            </>
          )}
        </dl>
      )}
      <span className="flex flex-wrap items-center gap-1.5">
        {chip}
        <span className="text-muted-foreground">{hint}</span>
      </span>
    </div>
  );
};
