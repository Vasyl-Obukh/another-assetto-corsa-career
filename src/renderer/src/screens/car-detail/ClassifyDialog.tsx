import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ClassStep } from './ClassStep.tsx';
import { SpecStep } from './SpecStep.tsx';
import type { ClassPicks } from './types.ts';
import { pickedSpecs, seedPicks, togglePick } from './utils.ts';
import { useClasses } from '@/app';
import { ErrorCard } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useClassCommands } from '@/hooks';

interface ClassifyDialogProps {
  /**
   * Folder name of the car being classified.
   */
  carId: string;
  /**
   * What the car is called, for the title.
   */
  carName: string;
  /**
   * Called when the dialog closes, saved or not.
   */
  onClose: () => void;
}

/**
 * Which grids a car races on, asked as two questions: its classes, then one
 * spec of each.
 *
 * Mounted only while open, so it always starts from the car as it stands.
 */
export const ClassifyDialog = ({ carId, carName, onClose }: ClassifyDialogProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const commands = useClassCommands();

  const [picks, setPicks] = useState<ClassPicks>(() => seedPicks(carId, catalogue));
  const [step, setStep] = useState<'classes' | 'specs'>('classes');

  const specs = pickedSpecs(picks);
  const overridden = catalogue.overridden.has(carId);

  /**
   * Writes the specs and closes, or stays open showing why it could not.
   * @param next Every spec the car should race in
   */
  const save = async (next: string[]): Promise<void> => {
    if (await commands.assignCar(carId, next)) onClose();
  };

  /**
   * Puts the car back to what the app ships and closes, or stays open showing
   * why it could not.
   */
  const revert = async (): Promise<void> => {
    if (await commands.revertCar(carId)) onClose();
  };

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('cars.classify.title', { name: carName })}</DialogTitle>
          <DialogDescription>
            {step === 'classes' ? t('cars.classify.classesHint') : t('cars.classify.specsHint')}
          </DialogDescription>
        </DialogHeader>

        {commands.error !== null ? (
          <ErrorCard error={commands.error} onDismiss={commands.dismissError} />
        ) : null}

        {step === 'classes' ? (
          <ClassStep
            picks={picks}
            busy={commands.busy}
            onToggle={(carClass) => setPicks((current) => togglePick(current, carClass, catalogue))}
          />
        ) : (
          <SpecStep
            picks={picks}
            busy={commands.busy}
            onPick={(carClass, spec) => setPicks((current) => ({
              ...current, specs: { ...current.specs, [carClass]: spec },
            }))}
          />
        )}

        <DialogFooter className="sm:justify-between">
          {/* Only a car the user restated has anything to go back to. */}
          <div>
            {step === 'classes' && overridden ? (
              <Button variant="ghost" disabled={commands.busy} onClick={() => { void revert(); }}>
                {t('cars.classify.revert')}
              </Button>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {step === 'classes' ? (
              <>
                <Button variant="ghost" disabled={commands.busy} onClick={onClose}>
                  {t('cars.classify.cancel')}
                </Button>
                {/* No class is an answer too - a car deliberately on no grid -
                    and there is no second question to ask about it. */}
                {picks.classes.length === 0 ? (
                  <Button disabled={commands.busy} onClick={() => { void save([]); }}>
                    {t('cars.classify.unclassify')}
                  </Button>
                ) : (
                  <Button disabled={commands.busy} onClick={() => setStep('specs')}>
                    {t('cars.classify.next')}
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" disabled={commands.busy} onClick={() => setStep('classes')}>
                  {t('cars.classify.back')}
                </Button>
                <Button
                  disabled={commands.busy || specs === null}
                  onClick={() => { if (specs !== null) void save(specs); }}
                >
                  {t('cars.classify.save')}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
