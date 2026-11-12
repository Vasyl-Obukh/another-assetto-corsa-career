import type { TFunction } from 'i18next';

import type {
  Debrief, DebriefSession, Mail, Paddocker,
} from '../../../../shared/types';
import { formatGap } from '../../../../shared/utils/lap-time';
import {
  CONTRACT_ACCENT, DEBRIEF_ACCENT, RESULTS_ACCENT,
} from '@/lib/accents';
import { sessionName } from '@/lib/session-labels';
import { disciplineKey, tierAccent } from '@/screens/championships';

/**
 * Whether a person wrote a mail - an engineer or a team's boss - rather than a
 * body: the organisers, the categorisation panel or the paddock's news.
 * @param from Who wrote it
 * @returns True for a person
 */
export const isPerson = (from: Paddocker): boolean => (
  from.role === 'engineer' || from.role === 'principal' || from.role === 'manager' || from.role === 'owner'
);

/**
 * The colour a mail of the paddock's wears, by its kind: a debrief's teal, a
 * result's laurel, a rung's metal, and team and market news in the contract's
 * violet.
 * @param mail The mail
 * @returns The accent, or null for mail of another kind
 */
export const newsAccent = (mail: Mail): string | null => {
  if (mail.debrief) return DEBRIEF_ACCENT;
  if (mail.results) return RESULTS_ACCENT;
  if (mail.rung) return tierAccent(mail.rung.tier);
  if (mail.market || mail.notice) return CONTRACT_ACCENT;

  return null;
};

/**
 * Who wrote a mail, by name: a person's own, the organisers' championship, or
 * what the panel and the paddock's news are called.
 * @param from Who wrote it
 * @param t The translator
 * @returns The name
 */
export const paddockName = (from: Paddocker, t: TFunction): string => {
  if (from.name) return from.name;
  if (from.role === 'categorisation' || from.role === 'paddock') return t(`inbox.news.from.${from.role}`);

  return t('inbox.organisers');
};

/**
 * A person's initials, as the round well beside their name shows them.
 * @param name Their name
 * @returns At most two letters
 */
export const initials = (name: string): string => name
  .split(/\s+/)
  .filter(Boolean)
  .map((word) => word[0])
  .filter((letter) => letter.toUpperCase() !== letter.toLowerCase())
  .slice(0, 2)
  .join('')
  .toUpperCase();

/**
 * A gap to the best lap as a debrief writes it: a timing screen's form, with
 * no leading zero under ten seconds.
 * @param ms The gap, in milliseconds
 * @returns "0.336", "12.345" or "1:02.003"
 */
export const gapText = (ms: number): string => formatGap(ms).replace(/^0(?=\d\.)/, '');

/**
 * A place as a mail writes it.
 * @param place The place, or null for none
 * @param t The translator
 * @returns "P3", or that it was not classified
 */
export const placeText = (place: number | null, t: TFunction): string => (
  place === null ? t('inbox.news.debrief.unclassified') : t('inbox.news.place', { place })
);

/**
 * Several things said in a row: "A and B", "A, B and C".
 * @param parts The things
 * @param t The translator
 * @returns The line
 */
export const listOf = (parts: readonly string[], t: TFunction): string => (
  parts.length <= 1
    ? parts[0] ?? ''
    : t('inbox.news.and', { first: parts.slice(0, -1).join(', '), last: parts[parts.length - 1] })
);

/**
 * What a debrief is titled: the round, and where each race finished - or
 * where the player qualified, for a round they drove no race of.
 * @param debrief The debrief
 * @param t The translator
 * @returns The subject
 */
export const debriefSubject = (debrief: Debrief, t: TFunction): string => {
  const races = debrief.sessions.filter((one) => one.type === 'race');
  if (races.length > 0) {
    return t('inbox.news.debrief.subject', {
      round: debrief.roundName, places: listOf(races.map((race) => placeText(race.place, t)), t),
    });
  }

  return t('inbox.news.debrief.subjectQualifying', {
    round: debrief.roundName, place: placeText(debrief.sessions[0]?.place ?? null, t),
  });
};

/**
 * What a mail of the paddock's is titled.
 * @param mail The mail
 * @param run What the run it is about is called - its year, for market news
 * @param t The translator
 * @returns The subject, or null for a mail of another kind
 */
export const newsSubject = (mail: Mail, run: string, t: TFunction): string | null => {
  if (mail.debrief) return debriefSubject(mail.debrief, t);
  if (mail.results) {
    const { results } = mail;
    if (results.place === 1) return t('inbox.news.results.subjectChampion', { series: results.seriesName, edition: run });
    if (results.place === null) return t('inbox.news.results.subjectNone', { series: results.seriesName, edition: run });

    return t('inbox.news.results.subject', {
      series: results.seriesName, edition: run, place: results.place, entry: results.entryName,
    });
  }
  if (mail.rung) {
    return t(mail.rung.dir === 'up' ? 'home.rating.promoted' : 'home.rating.dropped', {
      tier: mail.rung.tier, discipline: t(disciplineKey(mail.rung.discipline)),
    });
  }
  if (mail.market) return t('inbox.news.market.subject', { year: run });
  const notice = mail.notice?.kind ? mail.notice : null;
  if (notice?.kind === 'welcome') {
    return t(notice.renewal ? 'inbox.news.welcome.subjectBack' : 'inbox.news.welcome.subject', { team: notice.teamName });
  }
  if (notice?.kind === 'halfway') return t('inbox.news.halfway.subject', { series: notice.seriesName, edition: run });
  if (notice?.kind === 'missed') return t('inbox.news.missed.subject', { round: notice.round?.name ?? '' });

  return null;
};

/**
 * What one session of a debrief says, a sentence.
 * @param session The session
 * @param named Whether to call it by its kind alone - a round with one of each
 * @param t The translator
 * @returns The sentence
 */
const sessionLine = (session: DebriefSession, named: boolean, t: TFunction): string => {
  const name = sessionName(named ? { name: session.name, type: session.type } : { type: session.type }, t);
  const { place, grid } = session;
  if (session.type === 'qualify') {
    if (place === null) return t('inbox.news.debrief.qualify.out', { session: name });
    if (place === 1) return t('inbox.news.debrief.qualify.pole', { session: name });
    if (session.gap !== null && session.gap > 0) {
      return t('inbox.news.debrief.qualify.gap', { session: name, place, gap: gapText(session.gap) });
    }

    return t('inbox.news.debrief.qualify.at', { session: name, place });
  }

  if (place === null) return t('inbox.news.debrief.race.out', { session: name });
  if (place === 1) {
    return grid === 1
      ? t('inbox.news.debrief.race.winPole', { session: name })
      : t(grid === null ? 'inbox.news.debrief.race.at' : 'inbox.news.debrief.race.win', { session: name, place, grid });
  }
  if (grid === null) return t('inbox.news.debrief.race.at', { session: name, place });
  if (place < grid) return t('inbox.news.debrief.race.up', { session: name, place, grid });
  if (place > grid) return t('inbox.news.debrief.race.down', { session: name, place, grid });

  return t('inbox.news.debrief.race.held', { session: name, place });
};

/**
 * What the engineer writes: how the round went, a sentence a session, how the
 * player fared against their teammate, and where the championship stands.
 * Worded off the facts the debrief holds, so it says what happened and never
 * why.
 * @param debrief The debrief
 * @param t The translator
 * @param formatDay Formats a day
 * @returns Its paragraphs
 */
export const debriefLines = (
  debrief: Debrief,
  t: TFunction,
  formatDay: (value: string) => string,
): string[] => {
  const { sessions, standing } = debrief;
  const races = sessions.filter((one) => one.type === 'race');
  const best = Math.min(...races.map((race) => race.place ?? Number.POSITIVE_INFINITY));
  let lede: 'win' | 'podium' | 'points' | 'none' = 'none';
  if (best === 1) lede = 'win';
  else if (best <= 3) lede = 'podium';
  else if (races.some((race) => (race.points ?? 0) > 0)) lede = 'points';
  // A session goes by its own name only where its kind runs more than once.
  const many = (type: DebriefSession['type']): boolean => sessions.filter((one) => one.type === type).length > 1;

  const lines = [
    [t(`inbox.news.debrief.lede.${lede}`, { round: debrief.roundName }), ...sessions.map((one) => sessionLine(one, many(one.type), t))].join(' '),
  ];

  const { mate } = debrief;
  const compared = sessions.filter((one) => one.place !== null && one.mate !== null);
  if (mate && compared.length > 0) {
    const ahead = compared.filter((one) => (one.place ?? 0) < (one.mate ?? 0)).length;
    let key: 'all' | 'none' | 'some' = 'some';
    if (ahead === compared.length) key = 'all';
    else if (ahead === 0) key = 'none';
    lines.push(t(`inbox.news.debrief.mate.${key}`, { name: mate.name, count: ahead, of: compared.length }));
  }

  if (!debrief.historic && standing.place !== null) {
    const { place, was } = standing;
    let said = t('inbox.news.debrief.standing.at', { place });
    if (was !== null && was > place) said = t('inbox.news.debrief.standing.up', { place, count: was - place });
    else if (was !== null && was < place) said = t('inbox.news.debrief.standing.down', { place, count: place - was });
    else if (was === place) said = t('inbox.news.debrief.standing.held', { place });
    const next = debrief.next
      ? t('inbox.news.debrief.next', { round: debrief.next.name, day: formatDay(debrief.next.date) })
      : t('inbox.news.debrief.last');
    lines.push(`${said} ${next}`);
  }

  return lines;
};
