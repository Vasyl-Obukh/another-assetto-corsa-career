import { SearchIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';

interface SearchFieldProps {
  /**
   * What the user has typed so far.
   */
  value: string;
  /**
   * The already-translated placeholder.
   */
  placeholder: string;
  /**
   * Replaces the search text.
   * @param next What the user has typed
   */
  onChange(next: string): void;
}

export const SearchField = ({ value, placeholder, onChange }: SearchFieldProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative min-w-56 flex-1 basis-64">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        placeholder={placeholder}
        aria-label={t('browse.search')}
        className="pr-9 pl-9"
        onChange={(event) => onChange(event.target.value)}
      />
      {value === '' ? null : (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('browse.clearSearch')}
          className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
          onClick={() => onChange('')}
        >
          <XIcon />
        </Button>
      )}
    </div>
  );
};
