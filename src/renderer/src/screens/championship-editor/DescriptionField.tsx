import { LanguagesIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';

import type { Language, LocalizedText } from '../../../../shared/types';
import {
  missingLanguages, textLanguages, withLanguage, withoutLanguage, withText,
} from '../../../../shared/utils/localized-text';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { useKindTranslation, useLanguage } from '@/i18n';

interface DescriptionFieldProps {
  /**
   * The control's id, which ties the label to the text box.
   */
  id: string;
  /**
   * The description as the document holds it.
   */
  value: LocalizedText | undefined;
  /**
   * Whether nothing may change.
   */
  disabled: boolean;
  /**
   * Called with the description whenever it changes.
   * @param next The description to apply, or undefined for none
   */
  onChange: (next: LocalizedText | undefined) => void;
}

export const DescriptionField = ({
  id, value, disabled, onChange,
}: DescriptionFieldProps) => {
  const { t } = useKindTranslation();
  // A plain string was most likely written in the language the app is in.
  const base = useLanguage();
  const languages = textLanguages(value);
  const missing = missingLanguages(value, base);
  const [picked, setPicked] = useState<Language | null>(null);
  // Falls back to the first tab when the one picked was removed.
  const open = picked !== null && languages.includes(picked) ? picked : languages[0] ?? null;
  const shown = typeof value === 'object' ? (open !== null && value[open]) || '' : value ?? '';

  /**
   * Adds an empty translation and opens it, since it is about to be written.
   * @param language The language to add
   */
  const add = (language: Language): void => {
    onChange(withLanguage(value, base, language));
    setPicked(language);
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">{t('editor.details.description')}</label>

        <div className="flex items-center gap-1">
          {/* Neutral on purpose: the tabs pick which text is being edited
              rather than naming a value. */}
          {languages.length > 0 ? (
            <Tabs value={open ?? undefined} onValueChange={(next) => setPicked(next as Language)}>
              <TabsList className="h-8">
                {languages.map((language) => (
                  <TabsTrigger key={language} value={language} className="px-2.5">
                    {t(`language.${language}`)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : null}

          {missing.length > 0 ? (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-0.5 px-2 text-muted-foreground hover:text-foreground"
                      aria-label={t('editor.details.addTranslation')}
                      disabled={disabled}
                    >
                      <PlusIcon className="size-3.5" />
                      <LanguagesIcon />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{t('editor.details.addTranslation')}</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                {missing.map((language) => (
                  <DropdownMenuItem key={language} onSelect={() => add(language)}>
                    {t(`language.${language}`)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      <Textarea
        id={id}
        className="min-h-28"
        value={shown}
        disabled={disabled}
        onChange={(event) => onChange(withText(value, open, event.target.value))}
      />

      {open === null ? null : (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            disabled={disabled}
            onClick={() => onChange(withoutLanguage(value, open))}
          >
            <Trash2Icon />
            {t('editor.details.removeTranslation')}
          </Button>
        </div>
      )}
    </div>
  );
};
