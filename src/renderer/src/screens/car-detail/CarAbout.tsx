import { useTranslation } from 'react-i18next';

import { DetailPanel } from '@/components';

interface CarAboutProps {
  /**
   * The author's description, line breaks kept.
   */
  description: string;
}

/**
 * The car's description in the author's own words.
 */
export const CarAbout = ({ description }: CarAboutProps) => {
  const { t } = useTranslation();

  return (
    <DetailPanel title={t('cars.detail.about')}>
      <p className="text-sm leading-relaxed whitespace-pre-line">{description}</p>
    </DetailPanel>
  );
};
