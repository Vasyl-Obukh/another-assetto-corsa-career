import { Navigate, Route, Routes } from 'react-router';

import { useSettings } from './utils.ts';
import type { PathsReport } from '../../../shared/types';
import { AppHeader } from '@/components';
import { path, ROUTE } from '@/lib/routes';
import { CarBrowser } from '@/screens/car-browser';
import { CarDetail } from '@/screens/car-detail';
import { ChampionshipDetail, Championships } from '@/screens/championships';
import { Diagnostics } from '@/screens/diagnostics';
import { Race } from '@/screens/race';
import { ResultDetail, Results } from '@/screens/results';
import { Settings } from '@/screens/settings';
import { Setup } from '@/screens/setup';
import { TrackBrowser } from '@/screens/track-browser';

interface AppProps {
  /**
   * The probe main ran before the first render.
   */
  initialReport: PathsReport;
}

export const App = ({ initialReport }: AppProps) => {
  const { settings } = useSettings();

  return settings.setupCompletedAt ? (
    <div className="flex h-full flex-col overflow-hidden">
      <AppHeader />

      <main className="min-h-0 flex-1">
        <Routes>
          <Route path={ROUTE.race} element={<Race />} />
          <Route path={ROUTE.championships} element={<Championships />} />
          <Route path={ROUTE.championship} element={<ChampionshipDetail />} />
          <Route path={ROUTE.results} element={<Results />} />
          <Route path={ROUTE.result} element={<ResultDetail />} />
          <Route path={ROUTE.cars} element={<CarBrowser />} />
          <Route path={ROUTE.car} element={<CarDetail />} />
          <Route path={ROUTE.tracks} element={<TrackBrowser />} />
          <Route
            path={ROUTE.diagnostics}
            element={<Diagnostics initialReport={initialReport} />}
          />
          <Route path={ROUTE.settings} element={<Settings />} />
          <Route path="*" element={<Navigate to={path.race()} replace />} />
        </Routes>
      </main>
    </div>
  ) : <Setup initialReport={initialReport} />;
};
