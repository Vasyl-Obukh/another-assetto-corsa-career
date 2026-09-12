import { ScaleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { EditorSection } from './EditorSection.tsx';
import { NumberField } from './NumberField.tsx';
import type { RegulatedAssists, Regulations } from '../../../../shared/types';
import { FieldGrid, ToggleRow } from '@/components';
import { RegulationsInputs } from '@/screens/race';

/**
 * What -1 means for the track-limits allowance: leave AC's own answer alone.
 */
const TRACK_DEFAULT = -1;

interface EditorRegulationsCardProps {
  /**
   * The rules as the championship states them.
   */
  regulations: Regulations;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the whole set whenever any part of it changes.
   * @param regulations The rules to apply
   */
  onChange: (regulations: Regulations) => void;
}

export const EditorRegulationsCard = ({
  regulations, locked, onChange,
}: EditorRegulationsCardProps) => {
  const { t } = useTranslation();

  return (
    <EditorSection
      icon={<ScaleIcon />}
      title={t('editor.regulations.title')}
      hint={t('editor.regulations.hint')}
      className="flex flex-col gap-4"
    >
      {/* The race screen's own controls: their keys are exactly the ones
          Regulations.assists holds. */}
      <RegulationsInputs
        assists={regulations.assists ?? {}}
        locked={locked}
        onChange={(assists: RegulatedAssists) => onChange({ ...regulations, assists })}
      />

      <FieldGrid>
        <NumberField
          id="editor-jump-start"
          label={t('editor.regulations.jumpStartPenalty')}
          hint={t('editor.regulations.jumpStartPenaltyHint')}
          value={regulations.jumpStartPenalty}
          min={0}
          disabled={locked}
          onChange={(jumpStartPenalty) => onChange({ ...regulations, jumpStartPenalty })}
        />

        <NumberField
          id="editor-tyres-out"
          label={t('editor.regulations.allowedTyresOut')}
          hint={t('editor.regulations.allowedTyresOutHint')}
          value={regulations.allowedTyresOut}
          min={TRACK_DEFAULT}
          disabled={locked}
          onChange={(allowedTyresOut) => onChange({ ...regulations, allowedTyresOut })}
        />
      </FieldGrid>

      <FieldGrid>
        <ToggleRow
          label={t('editor.regulations.fixedSetup')}
          value={regulations.fixedSetup ?? false}
          disabled={locked}
          onChange={(fixedSetup) => onChange({ ...regulations, fixedSetup })}
        />

        <ToggleRow
          label={t('editor.regulations.penalties')}
          value={regulations.penalties ?? false}
          disabled={locked}
          onChange={(penalties) => onChange({ ...regulations, penalties })}
        />
      </FieldGrid>
    </EditorSection>
  );
};
