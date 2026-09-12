import { useTranslation } from 'react-i18next';

import { FormatDialog } from './FormatDialog.tsx';
import { FormatSessions } from './FormatSessions.tsx';
import { PanelRow } from './PanelRow.tsx';
import { roundsRunning } from './utils.ts';
import type {
  Championship, Weather, WeatherController, WeatherSystem, WeekendFormat,
} from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import type { RowEditState } from '@/hooks';

interface FormatPanelProps {
  /**
   * The championship the format belongs to.
   */
  series: Championship;
  /**
   * The format this panel holds.
   */
  format: WeekendFormat;
  /**
   * Its position in the list, counting from one.
   */
  number: number;
  /**
   * How many formats the championship declares.
   */
  count: number;
  /**
   * Every installed weather preset.
   */
  weather: Weather[];
  /**
   * Every installed CSP weather controller.
   */
  controllers: WeatherController[];
  /**
   * Which mod renders the weather.
   */
  system: WeatherSystem;
  /**
   * Which row of the editor has its form open.
   */
  rows: RowEditState;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Whether this format's own dialog is open.
   */
  editing: boolean;
  /**
   * Called with the whole format whenever any part of it changes.
   * @param next The format to apply
   */
  onChange: (next: WeekendFormat) => void;
  /**
   * Called to open the format's own dialog - its name.
   */
  onEdit: () => void;
  /**
   * Called to make this the format a round runs when it names none.
   */
  onDefault: () => void;
  /**
   * Called to move the format along the list.
   * @param by How far, positive being later
   */
  onMove: (by: number) => void;
  /**
   * Called to drop the format from the championship.
   */
  onRemove: () => void;
}

/**
 * One way of running a weekend: its name on a panel, its sessions inside it.
 *
 * The same shape a class entry takes, and for the same reason - a format is a
 * container rather than a row, and the sessions below have to read as its
 * contents rather than as a list that happens to follow it.
 */
export const FormatPanel = ({
  series, format, number, count, weather, controllers, system, rows, locked, editing,
  onChange, onEdit, onDefault, onMove, onRemove,
}: FormatPanelProps) => {
  const { t } = useTranslation();
  const isDefault = series.defaultWeekendFormat === format.id;
  const rounds = roundsRunning(series, format.id);

  return (
    <div className="overflow-hidden rounded-lg border">
      <PanelRow
        name={format.name}
        label={format.name}
        first={number === 1}
        last={number === count}
        locked={locked}
        editable={rows.editable}
        // A championship with no weekend formats has no way of running a
        // round, which validateSeries refuses.
        removable={count > 1}
        onMakeDefault={isDefault ? undefined : onDefault}
        onEdit={onEdit}
        onMove={onMove}
        onRemove={onRemove}
      >
        {/* Filled: most of the calendar runs this one. Only worth saying when
            there is something to default against. */}
        {count > 1 && isDefault ? <Badge>{t('championships.format.default')}</Badge> : null}

        {/* Neutral on purpose: a count, not one of a closed set. It is how a
            format nothing runs - legal, and reported by nothing - gets noticed. */}
        <Badge variant="outline" className="shrink-0">
          {t('editor.formats.rounds', { count: rounds })}
        </Badge>
      </PanelRow>

      {editing ? (
        <FormatDialog
          format={format}
          locked={locked}
          onConfirm={(next) => { onChange(next); rows.close(); }}
          onCancel={rows.close}
        />
      ) : null}

      <div className="px-3 py-3">
        <FormatSessions
          series={series}
          format={format}
          weather={weather}
          controllers={controllers}
          system={system}
          rows={rows}
          locked={locked}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
