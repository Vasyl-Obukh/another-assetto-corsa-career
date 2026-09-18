import { ContentSource } from '../../../../shared/types';
import type { DLCPack, ModMaker } from '../../../../shared/types';
import { ProvenanceBadges } from '@/components';

interface SourceChipsProps {
  /**
   * DLC packs to name.
   */
  packs: readonly DLCPack[];
  /**
   * Mod teams to name.
   */
  makers: readonly ModMaker[];
}

// The provenance chips the browsers already wear, so a pack reads in the DLC hue
// and a mod team in the mod hue here too.
export const SourceChips = ({ packs, makers }: SourceChipsProps) => (
  <>
    {packs.map((pack) => (
      <ProvenanceBadges
        key={pack}
        provenance={{
          source: ContentSource.DLC, pack, maker: null, distributor: null,
        }}
      />
    ))}
    {makers.map((maker) => (
      <ProvenanceBadges
        key={maker}
        provenance={{
          source: ContentSource.MOD, pack: null, maker, distributor: null,
        }}
      />
    ))}
  </>
);
