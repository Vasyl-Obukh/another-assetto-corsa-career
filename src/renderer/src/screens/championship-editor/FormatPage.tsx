import { CopyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { RowActions } from './RowActions.tsx';
import { SessionsSplit } from './SessionsSplit.tsx';
import {
  roundsRunning, withDefaultFormat, withFormat, withoutFormat,
} from './utils.ts';
import type {
  Championship, Weather, WeatherController, WeatherSystem, WeekendFormat,
} from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { FormatStrip } from '@/screens/championships';

interface FormatPageProps {
  /**
   * The championship, for its default and its points systems.
   */
  series: Championship;
  /**
   * The format being edited.
   */
  format: WeekendFormat;
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
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the championship whenever the format changes.
   * @param next The championship
   */
  onChange: (next: Championship) => void;
  /**
   * Called to duplicate the format.
   */
  onDuplicate: () => void;
}

/**
 * One weekend format: its name and whether it is the default, its sessions
 * down the side by day, and the session picked opened beside them.
 */
export const FormatPage = ({
  series, format, weather, controllers, system, locked, onChange, onDuplicate,
}: FormatPageProps) => {
  const { t } = useTranslation();
  const isDefault = series.defaultWeekendFormat === format.id;
  const running = roundsRunning(series, format.id);

  /**
   * Puts the format back on the championship.
   * @param next The format
   */
  const apply = (next: WeekendFormat): void => onChange(withFormat(series, format.id, next));

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <FormatStrip sessions={format.sessions} />
        <Input
          aria-label={t('editor.formats.name')}
          className="w-56 font-semibold"
          value={format.name}
          disabled={locked}
          onChange={(event) => apply({ ...format, name: event.target.value })}
        />
        {/* Filled: most rounds run it. */}
        {isDefault ? (
          <Badge>{t('championships.format.default')}</Badge>
        ) : (
          <Button type="button" size="sm" variant="outline" disabled={locked} onClick={() => onChange(withDefaultFormat(series, format.id))}>
            {t('editor.rows.makeDefault')}
          </Button>
        )}
        <span className="text-xs text-muted-foreground">
          {running === 0 ? t('editor.formats.unused') : t('editor.formats.rounds', { count: running })}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button type="button" size="sm" variant="outline" disabled={locked} onClick={onDuplicate}>
            <CopyIcon />
            {t('editor.formats.duplicate')}
          </Button>
          <RowActions
            label={format.name}
            locked={locked}
            // A championship with no weekend formats has no way of running a round.
            removable={series.weekendFormats.length > 1}
            onRemove={() => onChange(withoutFormat(series, format.id))}
          />
        </div>
      </div>

      <SessionsSplit
        series={series}
        format={format}
        weather={weather}
        controllers={controllers}
        system={system}
        locked={locked}
        onChange={apply}
      />
    </Card>
  );
};
