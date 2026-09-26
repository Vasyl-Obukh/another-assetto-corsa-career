import { DlcBadge, ProvenanceBadges } from './provenance-badges/index.ts';
import { ContentSource } from '../../../shared/types';
import type { DLCPack, ModDistributor, ModMaker } from '../../../shared/types';

interface SourceChipsProps {
  /**
   * DLC packs to name.
   */
  packs: readonly DLCPack[];
  /**
   * Mod teams to name.
   */
  makers: readonly ModMaker[];
  /**
   * Redistributors to name, which read as a mod chip with the redistributor's
   * own beside it, the way their content does in the browsers.
   */
  distributors?: readonly ModDistributor[];
}

// The provenance chips the browsers already wear, so a pack reads in the DLC hue
// and a mod team in the mod hue here too. The packs share one DLC chip that
// names them on hover, since a list of them is what took the room.
export const SourceChips = ({ packs, makers, distributors = [] }: SourceChipsProps) => (
  <>
    <DlcBadge packs={packs} />
    {makers.map((maker) => (
      <ProvenanceBadges
        key={maker}
        provenance={{
          source: ContentSource.MOD, pack: null, maker, distributor: null,
        }}
      />
    ))}
    {distributors.map((distributor) => (
      <ProvenanceBadges
        key={distributor}
        provenance={{
          source: ContentSource.MOD, pack: null, maker: null, distributor,
        }}
      />
    ))}
  </>
);
