
import type { EditorTab } from './types.ts';
import { problemTab } from './utils.ts';
import type { SeriesAvailability } from '../../../../shared/types';
import { useKindTranslation } from '@/i18n';
import { useAppError } from '@/i18n';

interface EditorProblemsProps {
  /**
   * What is wrong with the draft. Nothing renders when this is empty.
   */
  problems: SeriesAvailability['problems'];
  /**
   * Called to open the tab a problem is fixed on.
   * @param tab The tab
   */
  onGo: (tab: EditorTab) => void;
  /**
   * Which of the editor's own tabs holds a championship's tab, for an editor
   * that groups them differently - the same tab when left out.
   * @param tab The championship's tab
   * @returns The editor's tab
   */
  tabOf?: (tab: EditorTab) => EditorTab;
}

/**
 * What stops the draft being raced, in one tinted box under the tabs, each
 * line with a way to the tab that fixes it.
 */
export const EditorProblems = ({ problems, onGo, tabOf = (tab) => tab }: EditorProblemsProps) => {
  const { t } = useKindTranslation();
  const describeError = useAppError();

  if (problems.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2.5 text-sm">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <b className="font-semibold text-destructive">{t('editor.problems.count', { count: problems.length })}</b>
        <span className="text-xs text-muted-foreground">{t('editor.problems.hint')}</span>
      </div>
      <ul className="flex flex-col gap-1">
        {problems.map((problem) => {
          const tab = tabOf(problemTab(problem.code));

          return (
            <li key={problem.code + JSON.stringify(problem.params)} className="flex flex-wrap items-baseline gap-x-3" data-selectable>
              <span>{describeError(problem)}</span>
              <button type="button" className="text-primary hover:underline" onClick={() => onGo(tab)}>
                {t('editor.problems.go', { tab: t(`editor.tabs.${tab}`) })}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
