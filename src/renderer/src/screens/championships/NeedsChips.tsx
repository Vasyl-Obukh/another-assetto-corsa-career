import { ContentSource } from '../../../../shared/types';
import type { SeriesRequirements } from '../../../../shared/types';
import { ProvenanceBadges, SourceChips } from '@/components';

interface NeedsChipsProps {
  /**
   * What the championship needs.
   */
  requires: SeriesRequirements;
}

// The content a championship cannot run without, as the provenance chips the
// browsers wear: one base-game chip when that is all it needs, otherwise every
// pack, mod team and redistributor by name.
export const NeedsChips = ({ requires }: NeedsChipsProps) => {
  const needsOnlyBase = requires.sources.every((source) => source === ContentSource.BASE);
  // A mod nobody is credited with has no maker to name, so it reads as a bare
  // Mod - unless a redistributor's chip, which wears Mod already, says it.
  const uncredited = requires.sources.includes(ContentSource.MOD)
    && requires.makers.length === 0 && requires.distributors.length === 0;

  if (needsOnlyBase) {
    return (
      <ProvenanceBadges
        provenance={{
          source: ContentSource.BASE, pack: null, maker: null, distributor: null,
        }}
      />
    );
  }

  return (
    <>
      <SourceChips packs={requires.packs} makers={requires.makers} distributors={requires.distributors} />
      {uncredited ? (
        <ProvenanceBadges
          provenance={{
            source: ContentSource.MOD, pack: null, maker: null, distributor: null,
          }}
        />
      ) : null}
    </>
  );
};
