import type { PathsReport } from '../../../shared/types';
import { AppHeader } from '../components';
import { Diagnostics } from '@/screens/Diagnostics';

interface AppProps {
  /**
   * The probe main ran before the first render.
   */
  initialReport: PathsReport;
}

export const App = ({ initialReport }: AppProps) => (
  <div className="mx-auto flex h-full max-w-4xl flex-col gap-8 overflow-y-auto px-8 py-8">
    <AppHeader />

    <main className="pb-8">
      <Diagnostics initialReport={initialReport} />
    </main>
  </div>
);
