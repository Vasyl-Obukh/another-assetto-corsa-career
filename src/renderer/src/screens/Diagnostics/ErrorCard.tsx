import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';

interface ErrorCardProps {
  /**
   * What went wrong, as reported by the main process.
   */
  message: string;
  /**
   * Dismisses the card.
   */
  onDismiss(): void;
}

export const ErrorCard = ({ message, onDismiss }: ErrorCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">{t('error.title')}</CardTitle>
        <CardDescription data-selectable>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" onClick={onDismiss}>
          {t('error.dismiss')}
        </Button>
      </CardContent>
    </Card>
  );
};
