
import { ConditionsEditor } from './ConditionsEditor.tsx';
import { PaneHeading } from './PaneHeading.tsx';
import { RoundBasics } from './RoundBasics.tsx';
import { SessionsSplit } from './SessionsSplit.tsx';
import { withFormat, withRound } from './utils.ts';
import type {
  Championship, SeriesAvailability, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import { Card } from '@/components/ui/card.tsx';
import { useKindTranslation } from '@/i18n';
import { ConditionsSummaryLine, withSessionConditions } from '@/screens/race';

interface HistoricEventTabProps {
  /**
   * The historic event being edited.
   */
  series: Championship;
  /**
   * The draft checked against what is installed, or null before it has been.
   */
  checked: SeriesAvailability | null;
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
   * Whether it is being raced just now, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the whole event whenever anything here changes.
   * @param next The event
   */
  onChange: (next: Championship) => void;
}

// A historic event's one round and its one format on a single tab, with no
// date: a career puts it on a weekday of its own.
export const HistoricEventTab = ({
  series, checked, weather, controllers, system, locked, onChange,
}: HistoricEventTabProps) => {
  const { t } = useKindTranslation();
  const round = series.rounds[0];
  const format = series.eventFormats.find((one) => one.id === series.defaultEventFormat) ?? series.eventFormats[0];

  if (round === undefined || format === undefined) return null;

  const conditions = round.conditions ?? {};

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-4 p-6">
        <PaneHeading>{t('historicEditor.track')}</PaneHeading>
        <RoundBasics
          series={series}
          round={round}
          availability={checked?.rounds.find((one) => one.round === round.id)}
          locked={locked}
          single
          onChange={(next) => onChange(withRound(series, round.id, next))}
        />
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h2 className="text-base font-semibold">{t('historicEditor.format')}</h2>
          <p className="text-sm text-muted-foreground">{t('historicEditor.formatHint')}</p>
        </div>
        <Card className="gap-0 overflow-hidden py-0">
          <SessionsSplit
            series={series}
            format={format}
            weather={weather}
            controllers={controllers}
            system={system}
            locked={locked}
            scoring={false}
            behind="round"
            head={{
              label: t('historicEditor.whole'),
              detail: <ConditionsSummaryLine conditions={conditions} className="truncate text-xs" />,
              page: (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-base font-semibold">{t('historicEditor.whole')}</h3>
                    <span className="text-xs text-muted-foreground">{t('historicEditor.wholeHint')}</span>
                  </div>
                  <ConditionsEditor
                    idPrefix="historic-event"
                    conditions={conditions}
                    behind={series.generatedWeather ? 'climate' : 'default'}
                    layout="rows"
                    weather={weather}
                    controllers={controllers}
                    system={system}
                    locked={locked}
                    onChange={(next) => onChange(withRound(series, round.id, withSessionConditions(round, next)))}
                  />
                </div>
              ),
            }}
            onChange={(next) => onChange(withFormat(series, format.id, next))}
          />
        </Card>
      </section>
    </div>
  );
};
