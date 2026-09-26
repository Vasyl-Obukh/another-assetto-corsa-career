import { SearchIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RailSearchProps {
  /**
   * What has been typed.
   */
  value: string;
  /**
   * What it asks for, already translated.
   */
  placeholder: string;
  /**
   * Replaces what has been typed.
   * @param next The text
   */
  onChange(next: string): void;
}

/**
 * The small search box at the top of a long rail list.
 */
export const RailSearch = ({ value, placeholder, onChange }: RailSearchProps) => {
  const { t } = useTranslation();

  return (
    <div className="mb-1.5 flex items-center gap-1.5 rounded-md border bg-background px-2 text-muted-foreground">
      <SearchIcon className="size-3.5 shrink-0" />
      <input
        aria-label={t('browse.facetSearch')}
        placeholder={placeholder}
        className="h-7 min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};
