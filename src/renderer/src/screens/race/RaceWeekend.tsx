import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PathParam } from 'react-router';
import { useLocation, useParams } from 'react-router';

import { CarCard } from './CarCard.tsx';
import { ClassesCard } from './ClassesCard.tsx';
import { QuickSession } from './QuickSession.tsx';
import { RaceLaunch } from './RaceLaunch.tsx';
import { RaceSection } from './RaceSection.tsx';
import { RaceWeekendHead } from './RaceWeekendHead.tsx';
import { RaceWeekendHeadSkeleton } from './RaceWeekendHeadSkeleton.tsx';
import { RaceWeekendSkeleton } from './RaceWeekendSkeleton.tsx';
import { SessionsCard } from './SessionsCard.tsx';
import { TrackCard } from './TrackCard.tsx';
import { phaseOf } from './utils.ts';
import { WeekendResults } from './WeekendResults.tsx';
import { ErrorCard, ScreenBody, ScreenHeader } from '@/components';
import { Card, CardContent } from '@/components/ui/card.tsx';
import {
  usePageName, useQuickRace, useRaceContent,
} from '@/hooks';
import { usePlayerName } from '@/hooks';
import { path } from '@/lib/routes';
import type { ROUTE } from '@/lib/routes';
import { RulesCard } from '@/screens/championship-editor';
import { defaultSession, SUMMARY, WeekendList } from '@/screens/event';

export const RaceWeekend = () => {
  const { t } = useTranslation();
  const { id = '' } = useParams<PathParam<typeof ROUTE.raceWeekend>>();
  const quick = useQuickRace(id);
  // The card that opened the page knows whether the weekend has started; the
  // page does not until it is read, and its skeleton takes that shape.
  const expectPhase = phaseOf(useLocation().state);
  // Null until the player picks one, so the page follows the weekend on its own
  // - the next session, and the results once it is over.
  const [picked, setPicked] = useState<number | null>(null);

  const { view } = quick;
  const race = view?.race ?? null;
  const content = useRaceContent(race?.track ?? null, race?.car?.model ?? null);
  usePageName(view ? view.title || t('race.untitled') : null);

  const playerName = usePlayerName();
  const started = view !== null && view.phase !== 'setup';
  const raced = view?.sessions.some((one) => one.record !== null) ?? false;
  const summary = raced && view ? {
    points: null, complete: view.phase === 'finished', title: t('race.results.title'),
  } : null;
  const selected = picked ?? (view?.phase === 'finished' && raced ? SUMMARY : defaultSession(view?.sessions ?? []));
  const session = view?.sessions.find((one) => one.index === selected) ?? view?.sessions[0];

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader back={{ to: path.race(), label: t('back.race') }}>
        {view ? (
          <RaceWeekendHead
            view={view}
            launch={(
              <RaceLaunch
                view={view}
                busy={quick.busy}
                onLaunch={() => { setPicked(null); void quick.launch(); }}
                onCancel={() => { void quick.cancel(); }}
                onRestart={() => { setPicked(null); void quick.restart(); }}
              />
            )}
          />
        ) : <RaceWeekendHeadSkeleton phase={expectPhase} />}
      </ScreenHeader>

      {quick.error ? <ErrorCard error={quick.error} onDismiss={quick.dismissError} /> : null}
      {quick.loading ? <RaceWeekendSkeleton phase={expectPhase} /> : null}

      {view && race ? (
        <div className="grid items-start gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          {/* The two pickers stay in view while the page scrolls under them. */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-40">
            <TrackCard
              track={content.track}
              gridSize={race.classes.reduce((sum, one) => sum + one.cars, 0)}
              locked={started}
              onPick={(layout) => quick.edit({
                ...race, track: { id: layout.id, ...(layout.layout ? { layout: layout.layout } : {}) },
              })}
            />
            <CarCard race={race} car={content.car} locked={started} onChange={quick.edit} />
            {started ? (
              <WeekendList
                sessions={view.sessions}
                selected={selected}
                summary={summary}
                substituted={false}
                undated
                onSelect={setPicked}
              />
            ) : null}
          </aside>

          <main className="flex min-w-0 flex-col gap-4">
            {started && selected === SUMMARY && summary ? (
              <Card className="py-4">
                <CardContent className="flex flex-col gap-4 px-4">
                  <h2 className="text-lg font-semibold">{t('race.results.title')}</h2>
                  <WeekendResults view={view} playerName={playerName} />
                </CardContent>
              </Card>
            ) : null}
            {started && selected !== SUMMARY && session ? <QuickSession view={view} session={session} /> : null}

            {started ? null : (
              <>
                <RaceSection title={t('race.classes.title')} hint={t('race.classes.hint')}>
                  <ClassesCard race={race} track={content.track} locked={started} onChange={quick.edit} />
                </RaceSection>
                <RaceSection title={t('race.weekend.title')} hint={t('race.weekend.hint')}>
                  <SessionsCard race={race} championship={view.championship} locked={started} onChange={quick.edit} />
                </RaceSection>
                <RaceSection title={t('race.rules.title')} hint={t('race.rules.hint')}>
                  <RulesCard
                    grid={race.grid ?? {}}
                    own={t('race.ai.race')}
                    regulations={race.regulations ?? {}}
                    locked={started}
                    onGrid={(grid) => quick.edit({ ...race, grid })}
                    onRegulations={(regulations) => quick.edit({ ...race, regulations })}
                  />
                </RaceSection>
              </>
            )}
          </main>
        </div>
      ) : null}
    </ScreenBody>
  );
};
