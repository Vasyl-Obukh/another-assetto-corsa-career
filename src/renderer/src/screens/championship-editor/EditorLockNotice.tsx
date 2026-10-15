import { LockIcon } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button.tsx';
import { useKindTranslation } from '@/i18n';
import { path } from '@/lib/routes';

export const EditorLockNotice = () => {
  const { t } = useKindTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-warning/50 p-3">
      <LockIcon className="size-4 shrink-0 text-warning" />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-medium">{t('editor.locked.title')}</span>
        <span className="text-xs text-muted-foreground">{t('editor.locked.body')}</span>
      </div>

      <Button asChild size="sm" variant="outline">
        <Link to={path.race()}>{t('editor.locked.race')}</Link>
      </Button>
    </div>
  );
};
