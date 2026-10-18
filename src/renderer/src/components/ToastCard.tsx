import { XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ToastMessage } from '@/app';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';

interface ToastCardProps {
  /**
   * What the toast says.
   */
  message: ToastMessage;
  /**
   * Closes it before it goes on its own.
   */
  onClose(): void;
}

export const ToastCard = ({ message, onClose }: ToastCardProps) => {
  const { t } = useTranslation();
  const Icon = message.icon;

  return (
    <div className="pointer-events-auto flex w-96 items-center gap-3 rounded-xl border bg-card px-3.5 py-3 text-sm shadow-lg">
      <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg [&_svg]:size-4', message.tone)}>
        <Icon />
      </span>
      <div className="flex min-w-0 grow flex-col">
        <span className="font-semibold">{message.title}</span>
        {message.detail ? <span className="text-xs text-muted-foreground">{message.detail}</span> : null}
      </div>
      {message.action ? (
        <Button variant="outline" size="sm" className="shrink-0" onClick={message.action.run}>
          {message.action.label}
        </Button>
      ) : null}
      <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label={t('toast.close')} onClick={onClose}>
        <XIcon />
      </Button>
    </div>
  );
};
