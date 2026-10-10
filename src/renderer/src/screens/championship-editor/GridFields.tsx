import { useTranslation } from 'react-i18next';

import { AiResult } from './AiResult.tsx';
import { AI_RANGE, DRIVER_AGGRESSION_SPREAD, DRIVER_STRENGTH_SPREAD } from '../../../../shared/constants';
import type { SeriesGrid } from '../../../../shared/types';
import { useSettings } from '@/app';
import { useFormat } from '@/i18n';

interface GridFieldsProps {
  /**
   * The AI offsets as they are stated.
   */
  grid: SeriesGrid;
  /**
   * The offsets laid over the player's own difficulty before these, each with
   * what it is called in the sum - a championship's under a class's, a race's
   * under one of its classes.
   */
  above?: readonly { label: string; grid: SeriesGrid | undefined }[];
  /**
   * What these offsets are called in the sum, already translated.
   */
  own: string;
  /**
   * Prefix for the control ids, so a class entry's own spread does not collide
   * with the championship's.
   */
  idPrefix: string;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with both offsets whenever either changes.
   * @param grid The offsets to apply
   */
  onChange: (grid: SeriesGrid) => void;
}

/**
 * The two offsets an AI field is described by, wherever it is described, each
 * as the figure the field races at: the player's own difficulty, every layer
 * over it, and this one, held so the sum never leaves 0-100. Side by side where
 * there is room, one above the other in a narrow pane.
 */
export const GridFields = ({
  grid, above = [], own, idPrefix, locked, onChange,
}: GridFieldsProps) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { formatNumber } = useFormat();

  return (
    <div className="@container">
      <div className="grid gap-3 @xl:grid-cols-2">
        <AiResult
          id={`${idPrefix}-ai-strength`}
          label={t('editor.grid.strengthShort')}
          base={settings.opponents.strength}
          layers={above.map((layer) => ({ label: layer.label, value: layer.grid?.strength }))}
          own={own}
          value={grid.strength}
          spread={DRIVER_STRENGTH_SPREAD}
          ends={[formatNumber(AI_RANGE.min), formatNumber(AI_RANGE.max)]}
          locked={locked}
          onChange={(strength) => onChange({ ...grid, strength })}
        />
        <AiResult
          id={`${idPrefix}-ai-aggression`}
          label={t('editor.grid.aggressionShort')}
          base={settings.opponents.aggression}
          layers={above.map((layer) => ({ label: layer.label, value: layer.grid?.aggression }))}
          own={own}
          value={grid.aggression}
          spread={DRIVER_AGGRESSION_SPREAD}
          ends={[t('race.ai.clean'), t('race.ai.ruthless')]}
          locked={locked}
          onChange={(aggression) => onChange({ ...grid, aggression })}
        />
      </div>
    </div>
  );
};
