import { useSettings } from './utils.ts';
import type { PathsReport } from '../../../shared/types';
import { AppHeader } from '../components';
import { Diagnostics } from '@/screens/diagnostics';
import { Setup } from '@/screens/setup';

interface AppProps {
  /**
   * The probe main ran before the first render.
   */
  initialReport: PathsReport;
}

export const App = ({ initialReport }: AppProps) => {
  const { settings } = useSettings();

  // Not a router: there are two screens and the second only exists until setup
  // is done. Completing it patches settings, which re-renders this branch.
  if (!settings.setupCompletedAt) return <Setup initialReport={initialReport} />;

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-8 overflow-y-auto px-8 py-8">
      <AppHeader />

      <main className="pb-8">
        <Diagnostics initialReport={initialReport} />
      </main>
    </div>
  );
};
