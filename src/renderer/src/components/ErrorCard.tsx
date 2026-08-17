import { useTranslation } from 'react-i18next';

import type { AppErrorInfo } from '../../../shared/errors';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useAppError } from '@/i18n';

interface ErrorCardProps {
  /**
   * What went wrong, in the flattened form that crossed from main.
   */
  error: Partial<AppErrorInfo> & { message: string };
  /**
   * Dismisses the card.
   */
  onDismiss(): void;
}

export const ErrorCard = ({ error, onDismiss }: ErrorCardProps) => {
  const { t } = useTranslation();
  const describeError = useAppError();

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">{t('error.title')}</CardTitle>
        <CardDescription data-selectable>{describeError(error)}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" onClick={onDismiss}>
          {t('error.dismiss')}
        </Button>
      </CardContent>
    </Card>
  );
};
