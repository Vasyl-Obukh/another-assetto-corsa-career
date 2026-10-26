import { useState } from 'react';


import { ChoiceChips } from './ChoiceChips.tsx';
import { MIN_MONEY, PURSE_SCALES } from './constants.ts';
import { NumberField } from './NumberField.tsx';
import { PurseEditor } from './PurseEditor.tsx';
import { paysInAll, withEntryPrizes } from './utils.ts';
import type { Championship, ClassEntry } from '../../../../shared/types';
import { ConfirmDialog } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useKindTranslation } from '@/i18n';
import { useFormat } from '@/i18n';

interface ClassPrizesProps {
  /**
   * The championship, for the purse a class shares.
   */
  series: Championship;
  /**
   * The class whose prize money this is.
   */
  entry: ClassEntry;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the class entry whenever its prize money changes.
   * @param next The entry
   */
  onChange: (next: ClassEntry) => void;
}

/**
 * What a class is paid: the championship's purse, shown as it stands with a
 * way to start one of its own from it, or a purse of its own, generated and
 * adjusted exactly as the championship's is.
 */
export const ClassPrizes = ({
  series, entry, locked, onChange,
}: ClassPrizesProps) => {
  const { t } = useKindTranslation();
  const { formatMoney } = useFormat();
  const [scale, setScale] = useState(1);
  const [dropping, setDropping] = useState(false);
  const own = entry.prizes !== undefined;
  const race = series.prizes?.positions ?? [];
  const season = series.prizes?.standings ?? [];
  const prizes = { positions: entry.prizes?.positions ?? [], standings: entry.prizes?.standings ?? [] };

  return (
    <div className="flex flex-col gap-4">
      {/* First, since the purse below and the choice heading it belong together. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField
          id={`${entry.id}-entry-fee`}
          label={t('editor.classPrizes.fee')}
          hint={t('editor.classPrizes.feeHint', { name: entry.name })}
          value={entry.entryFee}
          min={MIN_MONEY}
          placeholder={t('editor.calendar.feeDefault', { fee: formatMoney(series.entryFee ?? 0) })}
          disabled={locked}
          onChange={(entryFee) => onChange({ ...entry, entryFee })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <b className="text-sm">{t('editor.classPrizes.paid', { name: entry.name })}</b>
        {/* Neutral on purpose: which of two purses, not a set with a colour. */}
        <ChoiceChips<'shared' | 'own'>
          label={t('editor.classPrizes.paid', { name: entry.name })}
          options={['shared', 'own']}
          value={own ? 'own' : 'shared'}
          labelOf={(mode) => t(`editor.classPrizes.${mode}`)}
          disabled={locked}
          onChange={(mode) => {
            if (mode === 'own' && !own) onChange({ ...entry, prizes: { positions: race, standings: season } });
            if (mode === 'shared' && own) setDropping(true);
          }}
        />
        {own ? (
          <span className="ml-auto text-xs text-muted-foreground">
            {t('editor.classPrizes.compare', {
              championship: formatMoney(paysInAll(race)),
              name: entry.name,
              own: formatMoney(paysInAll(prizes.positions)),
            })}
          </span>
        ) : null}
      </div>

      {own ? null : (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed px-3 py-2.5">
          <span className="min-w-0 flex-1 text-sm">{t('editor.classPrizes.start', { name: entry.name })}</span>
          <span className="text-xs text-muted-foreground">{t('editor.classPrizes.scaledBy')}</span>
          <ChoiceChips<string>
            label={t('editor.classPrizes.scaledBy')}
            options={PURSE_SCALES.map(String)}
            value={String(scale)}
            labelOf={(value) => t('editor.classPrizes.times', { value })}
            disabled={locked}
            onChange={(value) => setScale(Number(value))}
          />
          <Button
            type="button"
            size="sm"
            disabled={locked}
            onClick={() => onChange({
              ...entry,
              prizes: {
                positions: race.map((value) => Math.round(value * scale)),
                standings: season.map((value) => Math.round(value * scale)),
              },
            })}
          >
            {t('editor.classPrizes.make')}
          </Button>
        </div>
      )}

      <div className="grid items-start gap-3 2xl:grid-cols-2">
        {/* Keyed on whose purse it is, so switching over starts its controls
            from the table it now shows. */}
        <PurseEditor
          key={own ? `${entry.id}-race` : 'shared-race'}
          idPrefix={`${entry.id}-purse-race`}
          title={t('editor.purse.race')}
          hint={t('editor.purse.raceHint')}
          values={own ? prizes.positions : race}
          disabled={locked || !own}
          onChange={(positions) => onChange(withEntryPrizes(entry, { ...prizes, positions }))}
        />
        <PurseEditor
          key={own ? `${entry.id}-season` : 'shared-season'}
          idPrefix={`${entry.id}-purse-season`}
          title={t('editor.purse.season')}
          hint={t('editor.purse.seasonHint')}
          values={own ? prizes.standings : season}
          disabled={locked || !own}
          onChange={(standings) => onChange(withEntryPrizes(entry, { ...prizes, standings }))}
        />
      </div>

      <ConfirmDialog
        open={dropping}
        title={t('editor.classPrizes.dropTitle', { name: entry.name })}
        description={t('editor.classPrizes.dropBody', { name: entry.name })}
        confirmLabel={t('editor.classPrizes.drop')}
        onClose={() => setDropping(false)}
        onConfirm={() => { setDropping(false); onChange({ ...entry, prizes: undefined }); }}
      />
    </div>
  );
};
