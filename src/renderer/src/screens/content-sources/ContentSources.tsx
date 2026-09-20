import { FillerCard } from './FillerCard.tsx';
import { SourceLinksCard } from './SourceLinksCard.tsx';
import { SourcesCard } from './SourcesCard.tsx';
import { ErrorCard, ScreenBody } from '@/components';
import { useChampionships } from '@/hooks';

export const ContentSources = () => {
  const championships = useChampionships();

  return (
    <ScreenBody className="flex flex-col gap-6 py-6" backToTop>
      {championships.error ? (
        <ErrorCard error={championships.error} onDismiss={championships.dismissError} />
      ) : null}

      <SourcesCard listings={championships.listings} />

      <FillerCard listings={championships.listings} />

      <SourceLinksCard />
    </ScreenBody>
  );
};
