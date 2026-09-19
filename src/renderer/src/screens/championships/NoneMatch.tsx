import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';

interface NoneMatchProps {
  /**
   * Drops every filter and the search text.
   */
  onClear: () => void;
}

// What a championship list says when its filters leave nothing, with the way
// back out beside it.
export const NoneMatch = ({ onClear }: NoneMatchProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-sm text-muted-foreground">{t('browse.noneFiltered')}</p>
      <Button variant="outline" size="sm" onClick={onClear}>{t('browse.clearAll')}</Button>
    </div>
  );
};
