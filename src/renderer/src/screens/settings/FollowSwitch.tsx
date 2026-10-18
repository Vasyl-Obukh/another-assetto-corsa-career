import { useTranslation } from 'react-i18next';

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

  return (
    <div className="max-w-xl">
      <SwitchTile
        label={t(own ? 'settings.follow.own' : 'settings.follow.following')}
        hint={t(own ? 'settings.follow.ownHint' : 'settings.follow.followingHint')}
        checked={own}
        onChange={onChange}
      />
    </div>
  );
};
