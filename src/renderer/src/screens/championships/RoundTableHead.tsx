import { useTranslation } from 'react-i18next';

interface RoundTableHeadProps {
  /**
   * Whether the table has a career's columns - a date and the player's results.
   */
  career: boolean;
}

export const RoundTableHead = ({ career }: RoundTableHeadProps) => {
  const { t } = useTranslation();

  return (
    <thead>
      <tr className="bg-muted/60 text-left text-xs text-muted-foreground">
        <th className="w-10 py-2.5 pr-2 pl-4 font-normal">{t('championships.detail.roundNumber')}</th>
        <th className="w-20 py-2.5 pr-3 font-normal" aria-hidden />
        <th className="py-2.5 pr-3 font-normal">{t('championships.detail.round')}</th>
        {career ? <th className="py-2.5 pr-3 font-normal">{t('championships.detail.date')}</th> : null}
        <th className="py-2.5 pr-3 font-normal">{t('championships.detail.event')}</th>
        <th className="py-2.5 pr-3 font-normal">{t('championships.detail.raceOrWinners')}</th>
        {career ? <th className="py-2.5 pr-3 font-normal">{t('championships.detail.you')}</th> : null}
        <th className="py-2.5 pr-4 font-normal" aria-hidden />
      </tr>
    </thead>
  );
};
