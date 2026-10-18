import { LockIcon } from 'lucide-react';
import { Link } from 'react-router';

import { useSlot } from '@/app';
import { Button } from '@/components/ui/button.tsx';
import { useKindTranslation } from '@/i18n';
import { homeOf, path } from '@/lib/routes';

export const EditorLockNotice = () => {
  const { t } = useKindTranslation();
  const { mode, career, enterQuick } = useSlot();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-warning/50 p-3">
      <LockIcon className="size-4 shrink-0 text-warning" />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-medium">{t('editor.locked.title')}</span>
        <span className="text-xs text-muted-foreground">{t('editor.locked.body')}</span>
      </div>

      <Button asChild size="sm" variant="outline">
        {/* A career's event is reached from its home; a race of the player's
            own from quick race mode, entered on the way if need be. */}
        <Link to={career ? homeOf(career.kind) : path.race()} onClick={mode === 'start' ? enterQuick : undefined}>
          {t('editor.locked.race')}
        </Link>
      </Button>
    </div>
  );
};
