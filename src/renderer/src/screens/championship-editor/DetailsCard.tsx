import { FileTextIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CLIMATES, DEFAULT_CLIMATE, MIN_MONEY } from './constants.ts';
import { EditorSection } from './EditorSection.tsx';
import { NumberField } from './NumberField.tsx';
import { optionalText } from './utils.ts';
import type { Championship, Climate } from '../../../../shared/types';
import { FieldGrid, ToggleButton } from '@/components';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Field } from '@/screens/race';

interface DetailsCardProps {
  /**
   * The championship being edited.
   */
  series: Championship;
  /**
   * Whether a weekend of it is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the whole championship whenever any of these fields changes.
   * @param next The championship to apply
   */
  onChange: (next: Championship) => void;
}

export const DetailsCard = ({ series, locked, onChange }: DetailsCardProps) => {
  const { t } = useTranslation();

  return (
    <EditorSection
      icon={<FileTextIcon />}
      title={t('editor.details.title')}
      className="flex flex-col gap-4"
    >
      {/* No id field on purpose: it is minted, never read, and never changes. */}
      <FieldGrid>
        <Field id="editor-name" label={t('editor.details.name')}>
          <Input
            id="editor-name"
            value={series.name}
            disabled={locked}
            onChange={(event) => onChange({ ...series, name: event.target.value })}
          />
        </Field>

        <NumberField
          id="editor-entry-fee"
          label={t('editor.details.entryFee')}
          hint={t('editor.details.entryFeeHint')}
          value={series.entryFee}
          min={MIN_MONEY}
          disabled={locked}
          onChange={(entryFee) => onChange({ ...series, entryFee })}
        />

        <Field
          id="editor-generated-weather"
          label={t('editor.details.generatedWeather')}
          hint={t('editor.details.generatedWeatherHint')}
        >
          <ToggleButton
            id="editor-generated-weather"
            value={series.generatedWeather !== undefined}
            disabled={locked}
            // Switched on at the middle climate, since on means "from a climate"
            // and there is no way to say which without picking one.
            onChange={(on) => onChange({
              ...series,
              generatedWeather: on ? { climate: DEFAULT_CLIMATE } : undefined,
            })}
          />
        </Field>

        {series.generatedWeather ? (
          <Field id="editor-climate" label={t('editor.details.climate')}>
            <Select
              value={series.generatedWeather.climate}
              disabled={locked}
              onValueChange={(value) => onChange({
                ...series,
                generatedWeather: { climate: value as Climate },
              })}
            >
              <SelectTrigger id="editor-climate" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLIMATES.map((climate) => (
                  <SelectItem key={climate} value={climate}>{t(`climate.${climate}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}
      </FieldGrid>

      <Field id="editor-description" label={t('editor.details.description')}>
        <Textarea
          id="editor-description"
          className="max-w-4xl"
          value={series.description ?? ''}
          disabled={locked}
          onChange={(event) => onChange({
            ...series,
            description: optionalText(event.target.value),
          })}
        />
      </Field>
    </EditorSection>
  );
};
