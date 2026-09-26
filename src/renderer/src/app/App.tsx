import { Navigate, Route, Routes } from 'react-router';

import { useSettings } from './utils.ts';
import type { PathsReport } from '../../../shared/types';
import { AppHeader } from '@/components';
import { TooltipProvider } from '@/components/ui/tooltip.tsx';
import { useNavHistory } from '@/hooks';
import { path, ROUTE } from '@/lib/routes';
import { Calendar } from '@/screens/calendar';
import { CarBrowser } from '@/screens/car-browser';
import { CarClasses } from '@/screens/car-classes';
import { CarDetail } from '@/screens/car-detail';
import { ChampionshipEditor } from '@/screens/championship-editor';
import { ChampionshipLibrary } from '@/screens/championship-library';
import { ChampionshipDetail, Championships } from '@/screens/championships';
import { ContentSources } from '@/screens/content-sources';
import { Diagnostics } from '@/screens/diagnostics';
import { Event } from '@/screens/event';
import { Home } from '@/screens/home';
import { Race, RaceWeekend } from '@/screens/race';
import { ResultDetail, Results } from '@/screens/results';
import { Settings, SettingsLayout } from '@/screens/settings';
import { Setup } from '@/screens/setup';
import { TrackBrowser } from '@/screens/track-browser';
import { TrackDetail } from '@/screens/track-detail';
import { YourContent } from '@/screens/your-content';

interface AppProps {
  /**
   * The probe main ran before the first render.
   */
  initialReport: PathsReport;
}

export const App = ({ initialReport }: AppProps) => {
  const { settings } = useSettings();
  // Keeps the window's history for every Back to name the page it returns to.
  useNavHistory();

  return settings.setupCompletedAt ? (
    // One provider for the app: Radix wants a Provider above every Tooltip, and
    // its delay is a property of the app rather than of whatever is hovered.
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full flex-col overflow-hidden">
        <AppHeader />

        <main className="min-h-0 flex-1">
          <Routes>
            <Route path={ROUTE.home} element={<Home />} />
            <Route path={ROUTE.race} element={<Race />} />
            <Route path={ROUTE.raceWeekend} element={<RaceWeekend />} />
            <Route path={ROUTE.calendar} element={<Calendar />} />
            <Route path={ROUTE.event} element={<Event />} />
            <Route path={ROUTE.championships} element={<Championships />} />
            <Route path={ROUTE.championship} element={<ChampionshipDetail />} />
            <Route path={ROUTE.results} element={<Results />} />
            <Route path={ROUTE.result} element={<ResultDetail />} />
            <Route path={ROUTE.cars} element={<CarBrowser />} />
            <Route path={ROUTE.car} element={<CarDetail />} />
            <Route path={ROUTE.tracks} element={<TrackBrowser />} />
            <Route path={ROUTE.track} element={<TrackDetail />} />
            <Route path={ROUTE.settings} element={<SettingsLayout />}>
              <Route index element={<Settings />} />
              <Route
                path={ROUTE.diagnostics}
                element={<Diagnostics initialReport={initialReport} />}
              />
              <Route path={ROUTE.settingsContent} element={<YourContent />} />
              <Route path={ROUTE.settingsClasses} element={<CarClasses />} />
              <Route path={ROUTE.settingsChampionships} element={<ChampionshipLibrary />} />
              <Route path={ROUTE.settingsSources} element={<ContentSources />} />
            </Route>
            <Route path={ROUTE.settingsChampionship} element={<ChampionshipDetail manage />} />
            <Route path={ROUTE.championshipNew} element={<ChampionshipEditor />} />
            <Route path={ROUTE.championshipEdit} element={<ChampionshipEditor />} />
            <Route path="*" element={<Navigate to={path.home()} replace />} />
          </Routes>
        </main>
      </div>
    </TooltipProvider>
  ) : <Setup initialReport={initialReport} />;
};
