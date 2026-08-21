import { Navigate, Route, Routes } from 'react-router';

import { ROUTES } from './constants.ts';
import { useSettings } from './utils.ts';
import type { PathsReport } from '../../../shared/types';
import { AppHeader } from '@/components';
import { CarBrowser } from '@/screens/car-browser';
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
          <Route path={ROUTES.cars} element={<CarBrowser />} />
          <Route path={ROUTES.tracks} element={<TrackBrowser />} />
          <Route
            path={ROUTES.diagnostics}
            element={<Diagnostics initialReport={initialReport} />}
          />
          <Route path="*" element={<Navigate to={ROUTES.cars} replace />} />
        </Routes>
      </main>
    </div>
  ) : <Setup initialReport={initialReport} />;
};
