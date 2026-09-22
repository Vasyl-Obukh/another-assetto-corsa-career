import { MapIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import type { PathParam } from 'react-router';

import { EnterPanel } from './EnterPanel.tsx';
import { EntryPanel } from './EntryPanel.tsx';
import { SessionDetail } from './SessionDetail.tsx';
import { defaultSession } from './utils.ts';
import { WeekendList } from './WeekendList.tsx';
import {
  ClimateBadge, ContentImage, ErrorCard, ScreenBody, ScreenHeader,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useCareerEvent } from '@/hooks';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { path, ROUTE } from '@/lib/routes';
import { disciplineKey, tierAccent } from '@/screens/championships';
import { layoutMapSources } from '@/screens/track-browser';

export const Event = () => {
  const { t } = useTranslation();
  const { formatDay, formatMoney } = useFormat();
  const { series = '', round = '' } = useParams<PathParam<typeof ROUTE.event>>();
  const event = useCareerEvent(series, round);
  // Null until the player picks one, so the page follows the weekend on its own
  // - opening on the next session, and moving on to the one after once it has
  // run - until they choose to look at something else.
  const [picked, setPicked] = useState<number | null>(null);

  const { view } = event;
  const selected = picked ?? (view ? defaultSession(view.sessions) : 0);
  const session = view?.sessions.find((one) => one.index === selected) ?? view?.sessions[0];
  const ladder = view?.entered?.ladder ?? view?.classes[0]?.ladder;

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader back={{ to: path.calendar(), label: t('event.back') }}>
        {view ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {t('event.roundOf', { number: view.number, rounds: view.rounds })}
                </span>
                {ladder ? (
                  <>
                    <Badge className={DISCIPLINE_ACCENT[ladder.discipline]}>
                      {t(disciplineKey(ladder.discipline))}
                    </Badge>
                    <Badge className={tierAccent(ladder.tier)}>
                      {t('championships.tier', { tier: ladder.tier })}
                    </Badge>
                  </>
                ) : null}
                {view.climate ? <ClimateBadge climate={view.climate} /> : null}
              </div>
              <h1 className="text-2xl font-semibold" data-selectable>{view.roundName}</h1>
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>{view.seriesName}</span>
                <span>
                  {view.firstDay === view.lastDay
                    ? formatDay(view.firstDay)
                    : t('event.dates', { from: formatDay(view.firstDay), to: formatDay(view.lastDay) })}
                </span>
                <span>{t('calendar.grid', { count: view.gridSize })}</span>
                {view.prize === null ? null : (
                  <span>{t('calendar.prize', { amount: formatMoney(view.prize) })}</span>
                )}
              </p>
            </div>

            {/* The layout's shape, as every round row draws it, and inverted the
                same way so it reads on both themes. */}
            <div className="relative aspect-[16/9] w-36 shrink-0 overflow-hidden rounded-md bg-muted">
              <ContentImage
                sources={layoutMapSources({ id: view.track.id, layout: view.track.layout ?? '' })}
                alt={view.roundName}
                className="object-contain p-1.5 [&[src*='/outline']]:invert dark:[&[src*='/outline']]:invert-0"
                fallback={(
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapIcon className="size-6 text-muted-foreground/40" />
                  </div>
                )}
              />
            </div>
          </div>
        ) : null}
      </ScreenHeader>

      {event.error ? <ErrorCard error={event.error} onDismiss={event.dismissError} /> : null}
      {event.loading ? <Skeleton className="h-96 w-full" /> : null}

      {view ? (
        <div className="grid items-start gap-4 lg:grid-cols-[300px_1fr]">
          <aside className="flex flex-col gap-4">
            {view.entered ? <EntryPanel entry={view.entered} /> : (
              <EnterPanel
                view={view}
                busy={event.busy}
                onEnter={(entry, car) => { void event.enter(entry, car); }}
              />
            )}
            <WeekendList sessions={view.sessions} selected={selected} onSelect={setPicked} />
          </aside>

          {session ? (
            <SessionDetail
              view={view}
              session={session}
              busy={event.busy}
              onLaunch={() => { setPicked(null); void event.launch(); }}
              onRestart={() => { setPicked(null); void event.restart(); }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t('event.noSessions')}</p>
          )}
        </div>
      ) : null}
    </ScreenBody>
  );
};
