import { useTranslation } from 'react-i18next';

import { useSlot } from '@/app';
import { SwitchTile } from '@/components';

interface FollowSwitchProps {
  /**
   * Whether the career sets its own rather than following the app's.
   */
  own: boolean;
  /**
   * Sets its own, or follows the app's again.
   * @param own Whether it now sets its own
   */
  onChange(own: boolean): void;
}

/**
 * Whether a career follows one of the app's settings or keeps its own, heading
 * that setting's section on the career's settings page.
 */
export const FollowSwitch = ({ own, onChange }: FollowSwitchProps) => {
  const { t } = useTranslation();
  // Said of a standalone championship as of a career.
  const championship = useSlot().mode === 'championship';
  const ownLabel = championship ? t('settings.followChampionship.own') : t('settings.follow.own');
  const followingHint = championship
    ? t('settings.followChampionship.followingHint')
    : t('settings.follow.followingHint');

  return (
    <div className="max-w-xl">
      <SwitchTile
        label={own ? ownLabel : t('settings.follow.following')}
        hint={own ? t('settings.follow.ownHint') : followingHint}
        checked={own}
        onChange={onChange}
      />
    </div>
  );
};
