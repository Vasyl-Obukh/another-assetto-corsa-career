import { SearchIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ALL_CHAMPIONSHIPS, NO_CHAMPIONSHIP, SESSION_FILTERS } from './constants.ts';
import { ResultCard } from './ResultCard.tsx';
import { ResultsSkeleton } from './ResultsSkeleton.tsx';
import type { SessionFilter } from './types.ts';
import { filterEvents } from './utils.ts';
import {
  ErrorCard, ScreenBody, ScreenHeader, Segments,
} from '@/components';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { useCareer, useQuickArchives, useResults } from '@/hooks';
import { archiveOrigins, quickOrigins, resultEvents } from '@/lib/result-events';
import { path } from '@/lib/routes';

export const Results = () => {
  const { t } = useTranslation();
  const results = useResults();
  const { career } = useCareer();
  // Which archives each race event still lists; a list that cannot be read
  // leaves those cards unlinked.
  const quick = useQuickArchives();
  const loading = results.loading || quick.loading;
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<SessionFilter>('all');
  const [championship, setChampionship] = useState(ALL_CHAMPIONSHIPS);

  const events = useMemo(
    () => resultEvents(results.records, archiveOrigins(career), quickOrigins(quick.archives)),
    [results.records, career, quick.archives],
  );
  const championships = useMemo(() => [...new Map(events.flatMap((event) => (
    event.origin ? [[event.origin.entry.series, event.origin.entry.championship.name] as const] : []
  ))).entries()], [events]);
  const shown = filterEvents(events, { search, kind, championship });

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      {/* Reached from Home's card rather than the navigation, so it heads
          itself with the way back there. */}
      <ScreenHeader back={{ to: path.home(), label: t('back.home') }}>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{t('results.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('results.subtitle')}</p>
        </div>
      </ScreenHeader>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('results.search')}
            aria-label={t('results.search')}
            className="pl-8"
          />
        </div>
        <Segments
          label={t('results.kind')}
          items={SESSION_FILTERS.map((one) => ({ id: one, label: t(`results.kinds.${one}`) }))}
          value={kind}
          onChange={setKind}
        />
        {/* Held open, disabled, while the archives are read: nearly every
            career has a championship to pick, and the toolbar should not
            reflow when they land. */}
        {championships.length > 0 || loading ? (
          <Select value={championship} onValueChange={setChampionship} disabled={loading}>
            <SelectTrigger className="w-60" aria-label={t('results.championship')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CHAMPIONSHIPS}>{t('results.allChampionships')}</SelectItem>
              <SelectItem value={NO_CHAMPIONSHIP}>{t('results.noChampionship')}</SelectItem>
              {championships.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      {results.error ? <ErrorCard error={results.error} onDismiss={results.dismissError} /> : null}
      {loading ? <ResultsSkeleton /> : null}

      {!loading && shown.length === 0 && !results.error ? (
        <p className="text-sm text-muted-foreground">
          {events.length === 0 ? t('results.empty') : t('results.noneMatch')}
        </p>
      ) : null}

      {!loading && shown.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {shown.map((event) => (
            <ResultCard key={`${event.key}@${event.to}`} event={event} current={career?.seasons.at(-1)?.index} />
          ))}
        </div>
      ) : null}
    </ScreenBody>
  );
};
