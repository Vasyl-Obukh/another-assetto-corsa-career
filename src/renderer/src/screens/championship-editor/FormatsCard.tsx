import { CalendarClockIcon, PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ROW_SCOPE } from './constants.ts';
import { EditorSection } from './EditorSection.tsx';
import { FormatDialog } from './FormatDialog.tsx';
import { FormatPanel } from './FormatPanel.tsx';
import {
  nextFormat, withDefaultFormat, withFormat, withoutFormat,
} from './utils.ts';
import type {
  Championship, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import type { RowEditState } from '@/hooks';
import { moveAt, nextSession } from '@/screens/race';

interface FormatsCardProps {
  /**
   * The championship being edited.
   */
  series: Championship;
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
   * Called with the whole championship whenever the formats change.
   * @param next The championship to apply
   */
  onChange: (next: Championship) => void;
}

export const FormatsCard = ({
  series, weather, controllers, system, rows, locked, onChange,
}: FormatsCardProps) => {
  const { t } = useTranslation();
  const formats = series.weekendFormats;
  const adding = rows.adding(ROW_SCOPE.FORMATS);

  return (
    <EditorSection
      icon={<CalendarClockIcon />}
      title={t('editor.formats.title')}
      hint={t('editor.formats.hint')}
      summary={t('editor.formats.count', { count: formats.length })}
      className="flex flex-col gap-3"
    >
      {/* No empty line: the last format cannot be removed. */}
      {formats.map((format, index) => (
        <FormatPanel
          key={format.id}
          series={series}
          format={format}
          number={index + 1}
          count={formats.length}
          weather={weather}
          controllers={controllers}
          system={system}
          rows={rows}
          locked={locked}
          editing={rows.editing(ROW_SCOPE.FORMATS, format.id)}
          onChange={(next) => onChange(withFormat(series, format.id, next))}
          onEdit={() => rows.edit(ROW_SCOPE.FORMATS, format.id)}
          onDefault={() => onChange(withDefaultFormat(series, format.id))}
          onMove={(by) => onChange({
            ...series,
            weekendFormats: moveAt([...formats], index, by),
          })}
          onRemove={() => onChange(withoutFormat(series, format.id))}
        />
      ))}

      {/* Named first: the format lands with one race, edited in its panel. */}
      {adding ? (
        <FormatDialog
          format={nextFormat(series, [nextSession([])])}
          locked={locked}
          onConfirm={(next) => {
            onChange({ ...series, weekendFormats: [...formats, next] });
            rows.close();
          }}
          onCancel={rows.close}
        />
      ) : null}

      <div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={locked || !rows.editable}
          onClick={() => rows.add(ROW_SCOPE.FORMATS)}
        >
          <PlusIcon />
          {t('editor.formats.add')}
        </Button>
      </div>
    </EditorSection>
  );
};
