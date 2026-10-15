import { useTranslation } from 'react-i18next';
import type { PathParam } from 'react-router';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import { HISTORIC_TABS } from './constants.ts';
import { HistoricDetailSkeleton } from './HistoricDetailSkeleton.tsx';
import type { HistoricTab } from './types.ts';
import { isSeriesActive, withSeriesActive } from '../../../../shared/utils/series-toggles';
import { useSettings } from '@/app';
import {
  ErrorCard, HistoricChip, ScreenBody, ScreenHeader, SWITCH_TRACK,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs.tsx';
import { useChampionship, usePageName, useSeriesCommands } from '@/hooks';
import { useFormat, WordingKind } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { DETAIL_TAB_PARAM, path, ROUTE } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';
import {
  ChampionshipActions, disciplineKey, fieldSize, FormatsCard, HistoricClasses, HistoricOverview, HistoricPrizes,
  OriginBadge, RulesSheet, tierAccent, UNDERLINE_TAB,
} from '@/screens/championships';
import { historicSwitches } from '@/screens/historic-library';

// A historic event as the settings tab opens it: read-only, a tab each for
// where and how it runs, its grid and what it pays, with its switch and the
// whole menu, whose Edit is the one way into the editor.
export const HistoricDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatMoney } = useFormat();
  const { id = '' } = useParams<PathParam<typeof ROUTE.settingsHistoricEvent>>();
  const historic = useChampionship(id, 'historic');
  const commands = useSeriesCommands('historic');
  const { settings, patch } = useSettings();
  const [search, setSearch] = useSearchParams();

  const { listing } = historic;
  const back = { to: path.settingsHistoric(), label: t('back.settingsHistoric') };
  usePageName(listing?.series.name ?? null);
  const error = historic.error ?? commands.error;

  const wanted = search.get(DETAIL_TAB_PARAM);
  const tab: HistoricTab = HISTORIC_TABS.find((one) => one === wanted) ?? 'event';
  const openTab = (picked: HistoricTab): void => {
    const query = new URLSearchParams(search);
    if (picked === HISTORIC_TABS[0]) query.delete(DETAIL_TAB_PARAM);
    else query.set(DETAIL_TAB_PARAM, picked);
    setSearch(query, { replace: true });
  };

  const active = listing ? isSeriesActive(listing, historicSwitches(settings)) : false;
  const setActive = (next: boolean): void => {
    if (listing) patch({ historicActive: withSeriesActive(listing, settings.historicActive, next) });
  };

  const series = listing?.series;
  const disciplines = [...new Set(series?.entries.map((entry) => entry.ladder.discipline) ?? [])];
  const tiers = [...new Set(series?.entries.map((entry) => entry.ladder.tier) ?? [])].sort((a, b) => a - b);
  const prize = series?.prizes?.positions?.[0];

  return (
    <WordingKind.Provider value="historic">
      <ScreenBody className="flex flex-col gap-4 pb-8">
        <ScreenHeader back={back}>
          {listing && series ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <HistoricChip />
                  {disciplines.map((discipline) => (
                    <Badge key={discipline} className={DISCIPLINE_ACCENT[discipline]}>
                      {t(disciplineKey(discipline))}
                    </Badge>
                  ))}
                  {tiers.map((tier) => (
                    <Badge key={tier} className={tierAccent(tier)}>{t('championships.tier', { tier })}</Badge>
                  ))}
                  <OriginBadge origin={listing.origin} />
                </div>
                <h1 className="text-2xl font-semibold" data-selectable>{series.name}</h1>
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{t('historicLibrary.cars', { count: fieldSize(series) })}</span>
                  {prize === undefined ? null : <span>{t('calendar.prize', { amount: formatMoney(prize) })}</span>}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <label htmlFor="historic-active" className="text-sm text-muted-foreground">
                  {t('historicLibrary.drawn')}
                </label>
                <Switch id="historic-active" checked={active} className={SWITCH_TRACK} onCheckedChange={setActive} />
                <ChampionshipActions
                  listing={listing}
                  commands={commands}
                  manage
                  kind="historic"
                  active={active}
                  onToggle={() => setActive(!active)}
                  onDeleted={() => navigate(back.to, { replace: true })}
                />
              </div>
            </div>
          ) : null}
        </ScreenHeader>

        {error ? (
          <ErrorCard
            error={error}
            onDismiss={() => { historic.dismissError(); commands.dismissError(); }}
          />
        ) : null}

        {historic.loading ? <HistoricDetailSkeleton tab={tab} /> : null}

        {!historic.loading && listing === null && !historic.error ? (
          <p className="text-sm text-muted-foreground">{t('historicLibrary.notFound')}</p>
        ) : null}

        {listing && series ? (
          <Tabs value={tab} onValueChange={(value) => openTab(value as HistoricTab)} className="min-w-0 gap-4">
            <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
              {HISTORIC_TABS.map((one) => (
                <TabsTrigger key={one} value={one} className={cn(UNDERLINE_TAB, 'gap-2 px-4 py-2.5')}>
                  {t(`historicLibrary.tabs.${one}`)}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="event" className="flex flex-col gap-4">
              <Card className="py-4">
                <CardContent className="px-4">
                  <HistoricOverview event={series} availability={listing.availability} />
                </CardContent>
              </Card>
              <div className="grid items-start gap-4 lg:grid-cols-2">
                <FormatsCard series={series} />
                <RulesSheet regulations={series.regulations ?? {}} />
              </div>
            </TabsContent>

            <TabsContent value="classes">
              <HistoricClasses event={series} availability={listing.availability} />
            </TabsContent>

            <TabsContent value="prizes">
              <Card className="py-4">
                <CardContent className="px-4">
                  <HistoricPrizes event={series} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}

      </ScreenBody>
    </WordingKind.Provider>
  );
};
