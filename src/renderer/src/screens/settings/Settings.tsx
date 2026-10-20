import { useState } from 'react';

import { AppearanceSection } from './AppearanceSection.tsx';
import { GENERAL_SECTIONS } from './constants.ts';
import { ContentManagerSection } from './ContentManagerSection.tsx';
import { CurrencySection } from './CurrencySection.tsx';
import { DriverSection } from './DriverSection.tsx';
import { DrivingAidsSection } from './DrivingAidsSection.tsx';
import { OpponentsSection } from './OpponentsSection.tsx';
import { SavesSection } from './SavesSection.tsx';
import { SectionIndex } from './SectionIndex.tsx';
import { WeatherSection } from './WeatherSection.tsx';
import { ScreenBody } from '@/components';

export const Settings = () => {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);

  return (
    <ScreenBody className="py-6" scrollRef={setScroller} backToTop>
      {/* Capped, unlike the browsers: these are forms, whose controls drift
          apart on the whole width. */}
      <div className="grid max-w-7xl grid-cols-[12rem_minmax(0,1fr)] gap-7">
        <SectionIndex sections={GENERAL_SECTIONS} scroller={scroller} />

        <div className="flex min-w-0 flex-col gap-5">
          <AppearanceSection />
          <DriverSection />
          <DrivingAidsSection />
          <OpponentsSection />
          <WeatherSection />
          <SavesSection />
          <CurrencySection />
          <ContentManagerSection />
        </div>
      </div>
    </ScreenBody>
  );
};
