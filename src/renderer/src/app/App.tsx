import { Navigate, Route, Routes } from 'react-router';

import { useSettings, useSlot } from './utils.ts';
import type { PathsReport } from '../../../shared/types';
import { AppHeader } from '@/components';
import { TooltipProvider } from '@/components/ui/tooltip.tsx';
import { useNavHistory } from '@/hooks';
import { path, ROUTE } from '@/lib/routes';
import { Calendar } from '@/screens/calendar';
import { CarClasses } from '@/screens/car-classes';
import { CarDetail } from '@/screens/car-detail';
import { Careers } from '@/screens/careers';
import { ChampionshipEditor } from '@/screens/championship-editor';
import { ChampionshipLibrary } from '@/screens/championship-library';
import { ChampionshipReview } from '@/screens/championship-review';
import { ChampionshipDetail, Championships } from '@/screens/championships';
import { ContentSources } from '@/screens/content-sources';
import { Diagnostics } from '@/screens/diagnostics';
import { Event } from '@/screens/event';
import { Finances } from '@/screens/finances';
import { Garage } from '@/screens/garage';
import { HistoricDetail } from '@/screens/historic-detail';
import { HistoricLibrary } from '@/screens/historic-library';
import { History } from '@/screens/history';
import { Home } from '@/screens/home';
import { NewCareer } from '@/screens/new-career';
import { NewChampionship } from '@/screens/new-championship';
import { Race, RaceEvent } from '@/screens/race';
import { ResultDetail, Results } from '@/screens/results';
import { CareerSettings, Settings, SettingsLayout } from '@/screens/settings';
import { Setup } from '@/screens/setup';
import { Start } from '@/screens/start';
import { Store } from '@/screens/store';
import { TrackDetail } from '@/screens/track-detail';
import { YearReview } from '@/screens/year-review';
import { YourContent } from '@/screens/your-content';

interface AppProps {
  /**
   * The probe main ran before the first render.
   */
  initialReport: PathsReport;
}

export const App = ({ initialReport }: AppProps) => {
  const { settings } = useSettings();
  const { mode } = useSlot();
  // Keeps the window's history for every Back to name the page it returns to.
  useNavHistory();

  if (!settings.setupCompletedAt) return <Setup initialReport={initialReport} />;

  // Settings, the library they manage and the pages those open are the same
  // in every mode.
  const shared = [
    <Route key="settings" path={ROUTE.settings} element={<SettingsLayout />}>
      <Route index element={<Settings />} />
      {mode === 'career' || mode === 'championship'
        ? <Route path={ROUTE.settingsCareer} element={<CareerSettings />} />
        : null}
      <Route path={ROUTE.diagnostics} element={<Diagnostics initialReport={initialReport} />} />
      <Route path={ROUTE.settingsContent} element={<YourContent />} />
      <Route path={ROUTE.settingsClasses} element={<CarClasses />} />
      <Route path={ROUTE.settingsChampionships} element={<ChampionshipLibrary />} />
      <Route path={ROUTE.settingsSources} element={<ContentSources />} />
      <Route path={ROUTE.settingsHistoric} element={<HistoricLibrary />} />
    </Route>,
    <Route key="settingsChampionship" path={ROUTE.settingsChampionship} element={<ChampionshipDetail manage />} />,
    <Route key="championshipNew" path={ROUTE.championshipNew} element={<ChampionshipEditor />} />,
    <Route key="championshipEdit" path={ROUTE.championshipEdit} element={<ChampionshipEditor />} />,
    <Route key="historicEvent" path={ROUTE.settingsHistoricEvent} element={<HistoricDetail />} />,
    <Route key="historicNew" path={ROUTE.historicNew} element={<ChampionshipEditor kind="historic" />} />,
    <Route key="historicEdit" path={ROUTE.historicEdit} element={<ChampionshipEditor kind="historic" />} />,
    // Your content opens a car or a circuit the library does not hold yet.
    <Route key="car" path={ROUTE.car} element={<CarDetail />} />,
    <Route key="track" path={ROUTE.track} element={<TrackDetail />} />,
  ];

  if (mode === 'start') {
    return (
      <TooltipProvider delayDuration={300}>
        <main className="h-full overflow-hidden">
          <Routes>
            <Route path={ROUTE.start} element={<Start initialReport={initialReport} />} />
            <Route path={ROUTE.careers} element={<Careers />} />
            <Route path={ROUTE.careerNew} element={<NewCareer />} />
            <Route path={ROUTE.standalones} element={<Careers kind="championship" />} />
            <Route path={ROUTE.standaloneNew} element={<NewChampionship />} />
            {shared}
            <Route path="*" element={<Navigate to={path.start()} replace />} />
          </Routes>
        </main>
      </TooltipProvider>
    );
  }

  return (
    // One provider for the app: Radix wants a Provider above every Tooltip, and
    // its delay is a property of the app rather than of whatever is hovered.
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full flex-col overflow-hidden">
        <AppHeader />

        <main className="min-h-0 flex-1">
          {mode === 'quick' ? (
            <Routes>
              <Route path={ROUTE.race} element={<Race />} />
              <Route path={ROUTE.raceEvent} element={<RaceEvent />} />
              <Route path={ROUTE.results} element={<Results />} />
              <Route path={ROUTE.result} element={<ResultDetail />} />
              {shared}
              <Route path="*" element={<Navigate to={path.race()} replace />} />
            </Routes>
          ) : null}
          {/* One championship's own page, its rounds, its results and its
              review: a career's pages, less the calendar and the library. */}
          {mode === 'championship' ? (
            <Routes>
              <Route path={ROUTE.standalone} element={<ChampionshipDetail standalone />} />
              {/* Where every link to a championship's page leads - only ever
                  its own - with the tab it asks for. */}
              <Route path={ROUTE.championship} element={<ChampionshipDetail standalone />} />
              <Route path={ROUTE.event} element={<Event />} />
              <Route path={ROUTE.results} element={<Results />} />
              <Route path={ROUTE.result} element={<ResultDetail />} />
              <Route path={ROUTE.championshipReview} element={<ChampionshipReview />} />
              {shared}
              <Route path="*" element={<Navigate to={path.standalone()} replace />} />
            </Routes>
          ) : null}
          {mode === 'career' ? (
            <Routes>
              <Route path={ROUTE.home} element={<Home />} />
              <Route path={ROUTE.calendar} element={<Calendar />} />
              <Route path={ROUTE.event} element={<Event />} />
              <Route path={ROUTE.championships} element={<Championships />} />
              <Route path={ROUTE.championship} element={<ChampionshipDetail />} />
              <Route path={ROUTE.results} element={<Results />} />
              <Route path={ROUTE.result} element={<ResultDetail />} />
              <Route path={ROUTE.history} element={<History />} />
              <Route path={ROUTE.finances} element={<Finances />} />
              <Route path={ROUTE.yearReview} element={<YearReview />} />
              <Route path={ROUTE.championshipReview} element={<ChampionshipReview />} />
              <Route path={ROUTE.store} element={<Store />} />
              <Route path={ROUTE.garage} element={<Garage />} />
              {shared}
              <Route path="*" element={<Navigate to={path.home()} replace />} />
            </Routes>
          ) : null}
        </main>
      </div>
    </TooltipProvider>
  );
};
