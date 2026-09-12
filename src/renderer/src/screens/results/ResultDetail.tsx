import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import type { PathParam } from 'react-router';

import { SessionTable } from './SessionTable.tsx';
import {
  ErrorCard, ScreenBody, ScreenHeader,
} from '@/components';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useResult } from '@/hooks';
import { useFormat } from '@/i18n';
import { path, ROUTE } from '@/lib/routes';

export const ResultDetail = () => {
  const { t } = useTranslation();
  const { formatDateTime } = useFormat();
  const { file = '' } = useParams<PathParam<typeof ROUTE.result>>();
  const detail = useResult(file);

  const { record } = detail;

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader back={{ to: path.results(), label: t('results.back') }}>
        {record ? (
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold" data-selectable>
              {record.raceName ?? record.summary.track}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(new Date(record.recordedAt))}
            </p>
          </div>
        ) : null}
      </ScreenHeader>

      {detail.error ? (
        <ErrorCard error={detail.error} onDismiss={detail.dismissError} />
      ) : null}

      {detail.loading ? <Skeleton className="h-64 w-full" /> : null}

      {!detail.loading && record === null && detail.error === null ? (
        <p className="text-sm text-muted-foreground">{t('results.notFound')}</p>
      ) : null}

      {record ? (
        <>
          {record.summary.sessions.map((session, index) => (
            <SessionTable
              // AC gives a session no identifier, and two practices in one
              // weekend can share a name, so position in the file is it.
              // eslint-disable-next-line react/no-array-index-key
              key={`${session.name}-${index}`}
              session={session}
            />
          ))}
        </>
      ) : null}
    </ScreenBody>
  );
};
