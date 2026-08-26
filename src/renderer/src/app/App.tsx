import { Navigate, Route, Routes } from 'react-router';

import { useSettings } from './utils.ts';
import type { PathsReport } from '../../../shared/types';
import { AppHeader } from '@/components';
import { path, ROUTE } from '@/lib/routes';
import { CarBrowser } from '@/screens/car-browser';
import { CarDetail } from '@/screens/car-detail';
import { Diagnostics } from '@/screens/diagnostics';
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
          <Route path={ROUTE.cars} element={<CarBrowser />} />
          <Route path={ROUTE.car} element={<CarDetail />} />
          <Route path={ROUTE.tracks} element={<TrackBrowser />} />
          <Route
            path={ROUTE.diagnostics}
            element={<Diagnostics initialReport={initialReport} />}
          />
          <Route path="*" element={<Navigate to={path.cars()} replace />} />
        </Routes>
      </main>
    </div>
  ) : <Setup initialReport={initialReport} />;
};
