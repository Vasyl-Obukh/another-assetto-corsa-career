import { useTranslation } from 'react-i18next';

import { DistributorBadge } from './DistributorBadge.tsx';
import { DlcBadge } from './DlcBadge.tsx';
import {
  CUSTOM_TAG_CLASS,
  makerTagKey,
  PACK_TAG_KEY,
  packNameKey,
  SOURCE_TAG_CLASS,
  sourceTagKey,
} from './utils.ts';
import type { ContentProvenance } from '../../../../shared/types';
import { isUserAdded, isUserAddedCircuit } from '../../../../shared/utils/library';
import { useSettings } from '@/app';
import { Badge } from '@/components/ui/badge.tsx';

interface ProvenanceBadgesProps {
  /**
   * Where the car or track layout came from.
   */
  provenance: ContentProvenance;
  /**
   * Folder ID of the car, so a mod the user added reads as Custom. Left out
   * where that says nothing - on the page that adds them, the switch already
   * does.
   */
  carId?: string;
  /**
   * Folder ID of the circuit, so a mod the user added reads as Custom. Left out
   * where that says nothing, as `carId` is.
   */
  trackId?: string;
  /**
   * Whether a pack reads as a bare DLC chip that names it on hover, as it does
   * wherever a championship lists what it needs.
   */
  compact?: boolean;
}

export const ProvenanceBadges = ({
  provenance, carId, trackId, compact = false,
}: ProvenanceBadgesProps) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const {
    source, pack, maker, distributor,
  } = provenance;

  const { cars, tracks } = settings.addedContent;
  const custom = (carId !== undefined && isUserAdded(provenance, carId, cars))
    || (trackId !== undefined && isUserAddedCircuit(provenance, trackId, tracks));

  // The most specific thing known, in one badge: the pack for DLC, the maker for
  // a mod we recognise, Custom for an anonymous mod the user added, the bare
  // source otherwise. DLC keeps its prefix so a pack name still reads as
  // something you have to own.
  let label = t(sourceTagKey(source));
  if (pack !== null) label = t(PACK_TAG_KEY, { pack: t(packNameKey(pack)) });
  else if (maker !== null) label = t(makerTagKey(maker));
  else if (custom) label = t('content.customTag');

  if (compact && pack !== null) return <DlcBadge packs={[pack]} />;

  return (
    <>
      <Badge className={custom ? CUSTOM_TAG_CLASS : SOURCE_TAG_CLASS[source]}>{label}</Badge>
      {distributor === null ? null : <DistributorBadge distributor={distributor} />}
    </>
  );
};
