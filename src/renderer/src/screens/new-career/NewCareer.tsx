import {
  CalendarDaysIcon, CoinsIcon, MinusIcon, PlayIcon, PlusIcon, TrendingUpIcon, UserIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { LEVEL_EXAMPLES } from './constants.ts';
import { LevelTiles } from './LevelTiles.tsx';
import { SummaryPanel } from './SummaryPanel.tsx';
import { levelOptions, openPerDiscipline } from './utils.ts';
import {
  DEFAULT_STARTING_MONEY, MAX_START_YEAR, MIN_START_YEAR, STARTING_MONEY_STOPS,
} from '../../../../shared/constants';
import { useSettings, useSlot } from '@/app';
import {
  ErrorCard, ScreenBody, ScreenHeader, SettingsSection,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Slider } from '@/components/ui/slider.tsx';
import { useChampionships } from '@/hooks';
import { useFormat } from '@/i18n';
import { toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';
import { path } from '@/lib/routes';
import { NationPicker } from '@/screens/championship-editor';
import { isListed } from '@/screens/championships';

/**
 * New career: who races it, the year it opens in, the money it starts with and
 * the rung every discipline starts on - and beside them, what that adds up to.
 */
export const NewCareer = () => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { createCareer } = useSlot();
  const library = useChampionships();
  const thisYear = new Date().getFullYear();

  const [name, setName] = useState(settings.driverName ?? '');
  const [nation, setNation] = useState<string | null>(settings.driverNation ?? null);
  const [year, setYear] = useState(thisYear);
  // What the year field holds while it is typed in, which may be no year yet.
  const [yearText, setYearText] = useState(String(thisYear));
  const [moneyAt, setMoneyAt] = useState(Math.max(0, STARTING_MONEY_STOPS.indexOf(DEFAULT_STARTING_MONEY)));
  const [picked, setPicked] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DisplayableError | null>(null);

  // Only what a career could race, as the Championships page lists it.
  const listings = useMemo(
    () => library.listings.filter((listing) => isListed(listing, settings)),
    [library.listings, settings],
  );
  const options = library.loading ? null : levelOptions(listings, LEVEL_EXAMPLES);
  // The lowest rung unless one was picked: a career climbs from the bottom.
  const level = picked ?? options?.[0]?.tier ?? null;
  const money = STARTING_MONEY_STOPS[moneyAt] ?? DEFAULT_STARTING_MONEY;
  const ready = name.trim() !== '' && level !== null && !busy;

  const keepYear = (next: number): void => {
    const kept = Math.min(MAX_START_YEAR, Math.max(MIN_START_YEAR, next));
    setYear(kept);
    setYearText(String(kept));
  };

  // Taken as typed once it is a year a career can open in, and held to the
  // range only when the field is left.
  const typeYear = (text: string): void => {
    setYearText(text);
    const next = Number(text);
    if (Number.isInteger(next) && next >= MIN_START_YEAR && next <= MAX_START_YEAR) setYear(next);
  };

  const start = async (): Promise<void> => {
    if (level === null) return;
    setBusy(true);
    try {
      await createCareer({
        driver: { name: name.trim(), nation }, year, level, money,
      });
      void navigate(path.home());
    } catch (thrown: unknown) {
      setError(toDisplayableError(thrown));
      setBusy(false);
    }
  };

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader
        back={{ to: path.start(), label: t('back.start') }}
        aside={(
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => { void navigate(-1); }}>{t('newCareer.cancel')}</Button>
            <Button disabled={!ready} onClick={() => { void start(); }}>
              <PlayIcon />
              {t('newCareer.start')}
            </Button>
          </div>
        )}
      >
        <h1 className="text-2xl font-semibold">{t('newCareer.title')}</h1>
      </ScreenHeader>

      {error ? <ErrorCard error={error} onDismiss={() => setError(null)} /> : null}
      {library.error ? <ErrorCard error={library.error} onDismiss={library.dismissError} /> : null}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <SettingsSection icon={UserIcon} tone="you" title={t('newCareer.driver')} hint={t('newCareer.driverHint')}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-career-name" className="text-sm font-medium">{t('newCareer.name')}</label>
                <Input
                  id="new-career-name"
                  value={name}
                  placeholder={t('newCareer.namePlaceholder')}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-career-nation" className="text-sm font-medium">{t('newCareer.nation')}</label>
                <NationPicker
                  id="new-career-nation"
                  value={nation ?? undefined}
                  used={[]}
                  disabled={busy}
                  onChange={(next) => setNation(next ?? null)}
                />
              </div>
            </div>
          </SettingsSection>

          <div className="grid gap-4 lg:grid-cols-2">
            <SettingsSection
              icon={CalendarDaysIcon}
              tone="calendar"
              title={t('newCareer.season')}
              hint={t('newCareer.seasonHint')}
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t('newCareer.earlier')}
                  disabled={year <= MIN_START_YEAR}
                  onClick={() => keepYear(year - 1)}
                >
                  <MinusIcon />
                </Button>
                <Input
                  aria-label={t('newCareer.season')}
                  type="number"
                  min={MIN_START_YEAR}
                  max={MAX_START_YEAR}
                  value={yearText}
                  onChange={(event) => typeYear(event.target.value)}
                  onBlur={() => keepYear(Number(yearText) || year)}
                  className="w-24 text-center font-semibold tabular-nums"
                />
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t('newCareer.later')}
                  disabled={year >= MAX_START_YEAR}
                  onClick={() => keepYear(year + 1)}
                >
                  <PlusIcon />
                </Button>
                <Button variant="ghost" size="sm" disabled={year === thisYear} onClick={() => keepYear(thisYear)}>
                  {t('newCareer.thisYear')}
                </Button>
              </div>
            </SettingsSection>

            <SettingsSection icon={CoinsIcon} tone="money" title={t('newCareer.money')} hint={t('newCareer.moneyHint')}>
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-semibold tabular-nums">{formatMoney(money)}</span>
                <Slider
                  min={0}
                  max={STARTING_MONEY_STOPS.length - 1}
                  step={1}
                  value={[moneyAt]}
                  aria-label={t('newCareer.money')}
                  onValueChange={([next]) => setMoneyAt(next)}
                />
                <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                  <span>{formatMoney(STARTING_MONEY_STOPS[0])}</span>
                  <span>{formatMoney(STARTING_MONEY_STOPS[STARTING_MONEY_STOPS.length - 1])}</span>
                </div>
              </div>
            </SettingsSection>
          </div>

          <SettingsSection icon={TrendingUpIcon} tone="ladder" title={t('newCareer.level')} hint={t('newCareer.levelHint')}>
            <LevelTiles options={options} value={level} onChange={setPicked} />
          </SettingsSection>
        </div>

        <SummaryPanel
          name={name}
          nation={nation}
          year={year}
          money={money}
          level={level}
          open={level === null || library.loading ? null : openPerDiscipline(listings, level)}
        />
      </div>
    </ScreenBody>
  );
};
