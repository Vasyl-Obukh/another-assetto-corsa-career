import { TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { ErrorCard, ScreenBody } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useResults } from '@/hooks';
import { useFormat } from '@/i18n';
import { path } from '@/lib/routes';

export const Results = () => {
  const { t } = useTranslation();
  const { formatDateTime } = useFormat();
  const results = useResults();

  return (
    <ScreenBody className="flex flex-col gap-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{t('results.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('results.subtitle')}</p>
      </header>

      {results.error ? (
        <ErrorCard error={results.error} onDismiss={results.dismissError} />
      ) : null}

      {results.loading ? <Skeleton className="h-20 w-full" /> : null}

      {!results.loading && results.records.length === 0 && !results.error ? (
        <p className="text-sm text-muted-foreground">{t('results.empty')}</p>
      ) : null}

      {results.records.map((record) => (
        <Link
          key={record.file}
          to={path.result({ file: record.file })}
          className="rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Card className="transition-[box-shadow,border-color] hover:border-primary">
            <CardContent className="flex flex-wrap items-center gap-3">
              <TrophyIcon className="size-5 shrink-0 text-muted-foreground" />

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">
                  {record.raceName ?? record.summary.track}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {record.summary.track}
                </span>
              </div>

              <Badge variant="outline">
                {t('results.sessions', { count: record.summary.sessions.length })}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(new Date(record.recordedAt))}
              </span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </ScreenBody>
  );
};
