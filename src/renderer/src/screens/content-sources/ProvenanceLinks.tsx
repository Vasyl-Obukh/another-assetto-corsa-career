import { ExternalLinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { hostOf } from './utils.ts';
import { DISTRIBUTOR_PAGES, MAKER_PAGES, PACK_PAGES } from '../../../../shared/constants';
import type { ContentProvenance } from '../../../../shared/types';
import { distributorNameKey, makerNameKey, packNameKey } from '@/components';

interface ProvenanceLinksProps {
  /**
   * Where the content comes from.
   */
  provenance: ContentProvenance;
}

/**
 * The page each source of a car or a circuit is got from - its pack, its mod
 * team and its redistributor, whichever it has - one link apiece.
 */
export const ProvenanceLinks = ({ provenance }: ProvenanceLinksProps) => {
  const { t } = useTranslation();
  const { pack, maker, distributor } = provenance;

  const links = [
    pack === null ? null : { name: t(packNameKey(pack)), url: PACK_PAGES[pack] },
    maker === null ? null : { name: t(makerNameKey(maker)), url: MAKER_PAGES[maker] },
    distributor === null ? null : { name: t(distributorNameKey(distributor)), url: DISTRIBUTOR_PAGES[distributor] },
  ].filter((link) => link !== null);

  // A plain anchor with target="_blank": the window's open handler sends it to
  // the real browser, as the content sources tab's links are.
  return links.map((link) => (
    <a
      key={link.url}
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 self-start font-medium text-primary hover:underline"
    >
      {t('cars.detail.getFrom', { name: link.name, host: hostOf(link.url) })}
      <ExternalLinkIcon className="size-3.5 opacity-70" />
    </a>
  ));
};
