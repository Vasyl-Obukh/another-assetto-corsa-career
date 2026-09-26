import { useTranslation } from 'react-i18next';

import { COUNTED_TABS, EDITOR_TABS } from './constants.ts';
import { EditorTabTrigger } from './EditorTabTrigger.tsx';
import { Shimmer } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { TabsList } from '@/components/ui/tabs.tsx';

/**
 * The editor's pinned header while the championship is read: its name and
 * whose it is still to come, Discard and Save held, and the tabs it will open
 * on with their counts still to come.
 */
export const EditorHeadSkeleton = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Shimmer className="my-1 h-6 w-80" />
        <Shimmer className="h-5.5 w-16" />
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="outline" disabled>{t('editor.discard')}</Button>
          <Button type="button" disabled>{t('editor.save')}</Button>
        </div>
      </div>

      <TabsList className="-mb-4 h-auto w-full flex-wrap justify-start rounded-none bg-transparent p-0">
        {EDITOR_TABS.map((one) => (
          <EditorTabTrigger
            key={one}
            value={one}
            label={t(`editor.tabs.${one}`)}
            count={COUNTED_TABS.includes(one) ? null : undefined}
            changed={false}
            problem={false}
            disabled
          />
        ))}
      </TabsList>
    </>
  );
};
