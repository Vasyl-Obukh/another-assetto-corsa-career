import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AID_MODES, AID_TILES, MAX_STABILITY_CONTROL } from './constants.ts';
import { ModeSegments } from './ModeSegments.tsx';
import { SubHeading } from './SubHeading.tsx';
import type { AssistMode } from './types.ts';
import { DEFAULT_ASSISTS, DRIVING_AID_FLAGS } from '../../../../shared/constants';
import type { DrivingAids } from '../../../../shared/types';
import { SwitchTile } from '@/components';
import { Slider } from '@/components/ui/slider.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface DrivingAidsFieldsProps {
  /**
   * The aids shown.
   */
  value: DrivingAids;
  /**
   * The app's own, for a career's aids to say where they part from it.
   */
  app?: DrivingAids;
  /**
   * Whether they cannot be changed, because a career is following the app's.
   */
  disabled?: boolean;
  /**
   * Changes one of them.
   * @param next Every aid as it now stands
   */
  onChange(next: DrivingAids): void;
}

/**
 * The driving aids, the electronics as modes and the helpers as switches - the
 * app's, or a career's own.
 */
export const DrivingAidsFields = ({
  value, app, disabled = false, onChange,
}: DrivingAidsFieldsProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  // Held while dragging and written once the thumb is let go, so a drag is one
  // write rather than one per step.
  const [dragged, setDragged] = useState<number | null>(null);

  const set = (change: DrivingAids) => onChange({ ...value, ...change });
  const stability = dragged ?? value.stabilityControl ?? DEFAULT_ASSISTS.stabilityControl;

  /**
   * What the app has for an aid, where it parts from what is shown.
   * @param key The aid
   * @returns The app's setting, or null when there is none to compare or the
   * two agree
   */
  const appsWhereDifferent = <K extends keyof DrivingAids>(key: K): NonNullable<DrivingAids[K]> | null => {
    if (!app) return null;
    const theirs = app[key] ?? DEFAULT_ASSISTS[key];

    return theirs === (value[key] ?? DEFAULT_ASSISTS[key]) ? null : theirs;
  };
  const appsStability = appsWhereDifferent('stabilityControl');

  return (
    // Following the app's, the aids are shown but offered to neither the mouse
    // nor the keyboard.
    <div className={cn(disabled && 'opacity-55')} inert={disabled}>
      <SubHeading>{t('settings.aidsElectronics')}</SubHeading>
      <div className={AID_TILES}>
        {AID_MODES.map((key) => {
          const theirs = appsWhereDifferent(key);

          return (
            <div key={key} className="flex flex-col gap-2 rounded-lg border p-3">
              <span className="flex items-baseline justify-between gap-2 text-sm font-medium">
                {t(`assist.${key}`)}
                {theirs === null ? null : (
                  <span className="text-xs font-normal text-muted-foreground">
                    {t('settings.follow.app', { value: t(`assistMode.${theirs as AssistMode}`) })}
                  </span>
                )}
              </span>
              <ModeSegments
                label={t(`assist.${key}`)}
                value={value[key] ?? DEFAULT_ASSISTS[key]}
                onChange={(mode) => set({ [key]: mode })}
              />
            </div>
          );
        })}

        <div className="flex flex-col gap-2 rounded-lg border p-3">
          <span className="flex items-baseline justify-between gap-2 text-sm font-medium">
            {t('assist.stabilityControl')}
            <span className="text-xs font-normal text-muted-foreground">
              {appsStability === null
                ? t('settings.stabilityOff')
                : t('settings.follow.app', { value: t('settings.percent', { value: formatNumber(appsStability) }) })}
            </span>
          </span>
          <div className="flex h-8 items-center gap-3">
            <Slider
              min={0}
              max={MAX_STABILITY_CONTROL}
              step={1}
              value={[stability]}
              disabled={disabled}
              aria-label={t('assist.stabilityControl')}
              onValueChange={([next]) => setDragged(next)}
              onValueCommit={([next]) => {
                setDragged(null);
                set({ stabilityControl: next });
              }}
            />
            <span className="w-11 shrink-0 text-right text-sm font-semibold tabular-nums">
              {t('settings.percent', { value: formatNumber(stability) })}
            </span>
          </div>
        </div>
      </div>

      <SubHeading className="mt-5">{t('settings.aidsHelpers')}</SubHeading>
      <div className={AID_TILES}>
        {DRIVING_AID_FLAGS.map((key) => {
          const theirs = appsWhereDifferent(key);

          return (
            <SwitchTile
              key={key}
              label={t(`assist.${key}`)}
              hint={theirs === null
                ? undefined
                : t('settings.follow.app', { value: t(theirs ? 'settings.follow.on' : 'settings.follow.off') })}
              checked={value[key] ?? DEFAULT_ASSISTS[key]}
              disabled={disabled}
              tinted
              onChange={(next) => set({ [key]: next })}
            />
          );
        })}
      </div>
    </div>
  );
};
