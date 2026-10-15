
import { ChoiceChips } from './ChoiceChips.tsx';
import { JUMP_START_CHOICES, TRACK_DEFAULT, TYRES_OUT_CHOICES } from './constants.ts';
import { GridFields } from './GridFields.tsx';
import { PaneHeading } from './PaneHeading.tsx';
import { SwitchLine } from './SwitchLine.tsx';
import type {
  RegulatedAssists, Regulations, SeriesGrid,
} from '../../../../shared/types';
import { Card } from '@/components/ui/card.tsx';
import { useKindTranslation } from '@/i18n';
import { useFormat } from '@/i18n';
import { RegulationsInputs } from '@/screens/race';

interface RulesCardProps {
  /**
   * The AI offsets as the championship states them.
   */
  grid: SeriesGrid;
  /**
   * What the field's offsets are called in the sum its figures write out -
   * the championship's, or a race event's own.
   */
  own: string;
  /**
   * The rules as the championship states them.
   */
  regulations: Regulations;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with both offsets whenever either changes.
   * @param grid The offsets to apply
   */
  onGrid: (grid: SeriesGrid) => void;
  /**
   * Called with the whole set of rules whenever any part of it changes.
   * @param regulations The rules to apply
   */
  onRegulations: (regulations: Regulations) => void;
}

/**
 * Everything a race of the championship is run under, in three panes: how
 * strong the field is, what the series allows, and what it does about the rules
 * being broken.
 */
export const RulesCard = ({
  grid, own, regulations, locked, onGrid, onRegulations,
}: RulesCardProps) => {
  const { t } = useKindTranslation();
  const { formatNumber } = useFormat();
  const jump = regulations.jumpStartPenalty ?? 0;
  // A penalty the document states that none of the chips name stays offered,
  // so opening a hand-written file never loses it.
  const jumpChoices = JUMP_START_CHOICES.includes(jump)
    ? JUMP_START_CHOICES
    : [...JUMP_START_CHOICES, jump].sort((a, b) => a - b);

  return (
    <Card className="grid gap-0 py-0 lg:grid-cols-3">
      <div className="flex flex-col gap-3 p-6">
        <PaneHeading>{t('editor.grid.title')}</PaneHeading>
        <GridFields grid={grid} own={own} idPrefix="editor" locked={locked} onChange={onGrid} />
      </div>

      <div className="flex flex-col gap-3 border-t p-6 lg:border-t-0 lg:border-l">
        <PaneHeading>{t('editor.regulations.title')}</PaneHeading>
        <p className="text-xs text-muted-foreground">{t('editor.regulations.hint')}</p>
        {/* The race screen's own controls: their keys are exactly the ones
            Regulations.assists holds. */}
        <RegulationsInputs
          assists={regulations.assists ?? {}}
          locked={locked}
          onChange={(assists: RegulatedAssists) => onRegulations({ ...regulations, assists })}
        />
      </div>

      <div className="flex flex-col gap-3 border-t p-6 lg:border-t-0 lg:border-l">
        <PaneHeading>{t('editor.regulations.raceControl')}</PaneHeading>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('editor.regulations.allowedTyresOut')}</span>
          {/* Neutral on purpose: a count, not a set any screen colours. */}
          <ChoiceChips<number>
            label={t('editor.regulations.allowedTyresOut')}
            options={TYRES_OUT_CHOICES}
            value={regulations.allowedTyresOut ?? TRACK_DEFAULT}
            labelOf={(wheels) => (wheels === TRACK_DEFAULT
              ? t('editor.regulations.tyresOutTrack')
              : formatNumber(wheels))}
            disabled={locked}
            onChange={(wheels) => onRegulations({
              ...regulations,
              allowedTyresOut: wheels === TRACK_DEFAULT ? undefined : wheels,
            })}
          />
          <span className="text-xs text-muted-foreground">{t('editor.regulations.allowedTyresOutHint')}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('editor.regulations.jumpStartPenalty')}</span>
          <ChoiceChips<number>
            label={t('editor.regulations.jumpStartPenalty')}
            options={jumpChoices}
            value={jump}
            labelOf={(seconds) => (seconds === 0
              ? t('editor.regulations.jumpStartNone')
              : t('editor.regulations.seconds', { value: formatNumber(seconds) }))}
            disabled={locked}
            onChange={(seconds) => onRegulations({
              ...regulations,
              jumpStartPenalty: seconds === 0 ? undefined : seconds,
            })}
          />
          <span className="text-xs text-muted-foreground">{t('editor.regulations.jumpStartPenaltyHint')}</span>
        </div>

        <SwitchLine
          id="editor-penalties"
          label={t('editor.regulations.penalties')}
          value={regulations.penalties ?? false}
          disabled={locked}
          onChange={(penalties) => onRegulations({ ...regulations, penalties })}
        />
      </div>
    </Card>
  );
};
