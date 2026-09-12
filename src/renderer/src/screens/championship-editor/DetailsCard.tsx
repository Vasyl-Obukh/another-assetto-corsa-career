import { FileTextIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { MIN_MONEY } from './constants.ts';
import { EditorSection } from './EditorSection.tsx';
import { NumberField } from './NumberField.tsx';
import { optionalText } from './utils.ts';
import type { Championship } from '../../../../shared/types';
import { FieldGrid } from '@/components';
import { Input } from '@/components/ui/input.tsx';
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
