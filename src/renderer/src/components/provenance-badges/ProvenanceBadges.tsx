import { useTranslation } from 'react-i18next';

import {
  DISTRIBUTOR_TAG_CLASS,
  distributorTagKey,
  makerTagKey,
  PACK_TAG_KEY,
  packNameKey,
  SOURCE_TAG_CLASS,
  sourceTagKey,
} from './utils.ts';
import type { ContentProvenance } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';

interface ProvenanceBadgesProps {
  /**
   * Where the car or track layout came from.
   */
  provenance: ContentProvenance;
}

export const ProvenanceBadges = ({ provenance }: ProvenanceBadgesProps) => {
  const { t } = useTranslation();
  const {
    source, pack, maker, distributor,
  } = provenance;

  // The most specific thing known, in one badge: the pack for DLC, the maker for
  // a mod we recognise, the bare source otherwise. DLC keeps its prefix so a
  // pack name still reads as something you have to own.
  let label = t(sourceTagKey(source));
  if (pack !== null) label = t(PACK_TAG_KEY, { pack: t(packNameKey(pack)) });
  else if (maker !== null) label = t(makerTagKey(maker));

  return (
    <>
      <Badge className={SOURCE_TAG_CLASS[source]}>{label}</Badge>
      {distributor === null ? null : (
        <Badge className={DISTRIBUTOR_TAG_CLASS}>{t(distributorTagKey(distributor))}</Badge>
      )}
    </>
  );
};
