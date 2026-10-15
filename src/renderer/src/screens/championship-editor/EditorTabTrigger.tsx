
import type { EditorTab } from './types.ts';
import { Shimmer } from '@/components';
import { TabsTrigger } from '@/components/ui/tabs.tsx';
import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { UNDERLINE_TAB } from '@/screens/championships';

interface EditorTabTriggerProps {
  /**
   * Which tab it opens.
   */
  value: EditorTab;
  /**
   * The tab's name, already translated.
   */
  label: string;
  /**
   * How many things the tab lists, null while the championship is read, or
   * undefined for a tab of plain fields.
   */
  count?: number | null;
  /**
   * Whether anything on the tab differs from what is written.
   */
  changed: boolean;
  /**
   * Whether anything on the tab is wrong.
   */
  problem: boolean;
  /**
   * Whether the tab may not be switched to, which it may not while a row's
   * form is open anywhere: leaving would throw the form's typing away.
   */
  disabled: boolean;
}

/**
 * One tab of the editor, underlined when open, with its count and a dot for
 * each thing worth noticing on it - amber for unsaved, red for a problem.
 */
export const EditorTabTrigger = ({
  value, label, count, changed, problem, disabled,
}: EditorTabTriggerProps) => {
  const { t } = useKindTranslation();

  return (
    <TabsTrigger
      value={value}
      disabled={disabled}
      className={cn(UNDERLINE_TAB, 'px-4 py-2.5')}
    >
      {label}
      {count === null ? <Shimmer className="h-4 w-5 rounded-full" /> : null}
      {/* Neutral on purpose: a count, not one of a closed set. */}
      {count === undefined || count === null ? null : (
        <span className="rounded-full bg-muted px-1.5 text-xs font-normal tabular-nums">{count}</span>
      )}
      {changed ? (
        <span role="img" aria-label={t('editor.tabs.changed')} title={t('editor.tabs.changed')} className="size-1.5 rounded-full bg-warning" />
      ) : null}
      {problem ? (
        <span role="img" aria-label={t('editor.tabs.problem')} title={t('editor.tabs.problem')} className="size-1.5 rounded-full bg-destructive" />
      ) : null}
    </TabsTrigger>
  );
};
