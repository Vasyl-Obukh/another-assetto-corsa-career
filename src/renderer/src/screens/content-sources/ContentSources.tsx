import { ContentSourcesBody } from './ContentSourcesBody.tsx';
import { ScreenBody } from '@/components';

export const ContentSources = () => (
  <ScreenBody className="py-6" backToTop>
    {/* Capped and kept to the tabs' left edge: these are rows to read across,
        which drift apart on the wide column the browsers need. */}
    <div className="max-w-6xl">
      <ContentSourcesBody />
    </div>
  </ScreenBody>
);
