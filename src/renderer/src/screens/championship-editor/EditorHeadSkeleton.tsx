
import { COUNTED_TABS, EDITOR_TABS } from './constants.ts';
import { EditorTabTrigger } from './EditorTabTrigger.tsx';
import type { EditorTab } from './types.ts';
import { Shimmer } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { TabsList } from '@/components/ui/tabs.tsx';
import { useKindTranslation } from '@/i18n';

interface EditorHeadSkeletonProps {
  /**
   * The tabs the editor will open with - a championship's unless it says
   * otherwise.
   */
  tabs?: readonly EditorTab[];
}

/**
 * The editor's pinned header while the championship is read: its name and
 * whose it is still to come, Discard and Save held, and the tabs it will open
 * on with their counts still to come.
 */
export const EditorHeadSkeleton = ({ tabs = EDITOR_TABS }: EditorHeadSkeletonProps) => {
  const { t } = useKindTranslation();

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
        {tabs.map((one) => (
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
