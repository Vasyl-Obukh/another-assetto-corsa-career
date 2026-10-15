
import { PointsSystems } from './PointsSystems.tsx';
import { PurseEditor } from './PurseEditor.tsx';
import { withPrizes } from './utils.ts';
import { WhoPays } from './WhoPays.tsx';
import type { Championship } from '../../../../shared/types';
import { useKindTranslation } from '@/i18n';

interface ScoringTabProps {
  /**
   * The championship being edited.
   */
  series: Championship;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the championship whenever anything here changes.
   * @param next The championship
   */
  onChange: (next: Championship) => void;
  /**
   * Called to open one class's own prize money.
   * @param entry The class entry's id
   */
  onClassPrizes: (entry: string) => void;
  /**
   * Whether only what a race pays is edited, for a historic event: it pays no
   * points and has no season for a final standing to be paid at.
   */
  prizesOnly?: boolean;
}

/**
 * What a place is worth: the points systems, then the championship's prize
 * money - each race's and the season's - and where every class's comes from.
 */
export const ScoringTab = ({
  series, locked, onChange, onClassPrizes, prizesOnly = false,
}: ScoringTabProps) => {
  const { t } = useKindTranslation();
  const prizes = { positions: series.prizes?.positions ?? [], standings: series.prizes?.standings ?? [] };

  return (
    <div className="flex flex-col gap-6">
      {prizesOnly ? null : (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h2 className="text-base font-semibold">{t('editor.points.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('editor.points.hintShort')}</p>
          </div>
          <PointsSystems series={series} locked={locked} onChange={onChange} />
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h2 className="text-base font-semibold">{t('editor.prizes.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('editor.prizeMoney.hint')}</p>
        </div>
        <div className="grid items-start gap-3 2xl:grid-cols-2">
          <PurseEditor
            idPrefix="purse-race"
            title={t('editor.purse.race')}
            hint={t('editor.purse.raceHint')}
            values={prizes.positions}
            disabled={locked}
            onChange={(positions) => onChange(withPrizes(series, { ...prizes, positions }))}
          />
          {prizesOnly ? null : (
            <PurseEditor
              idPrefix="purse-season"
              title={t('editor.purse.season')}
              hint={t('editor.purse.seasonHint')}
              values={prizes.standings}
              disabled={locked}
              onChange={(standings) => onChange(withPrizes(series, { ...prizes, standings }))}
            />
          )}
        </div>
        {series.entries.length > 1 ? <WhoPays series={series} onOpen={onClassPrizes} /> : null}
      </section>
    </div>
  );
};
