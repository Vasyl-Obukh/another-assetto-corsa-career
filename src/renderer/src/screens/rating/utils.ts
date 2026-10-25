import type { TFunction } from 'i18next';

import type {
  Career, ChampionshipRun, Discipline, RatingLine,
} from '../../../../shared/types';
import {
  dropRating, openLevels, ratingFloor,
} from '../../../../shared/utils/career-eligibility';
import { editionsOf } from '../../../../shared/utils/editions';
import type { Formatters } from '@/i18n';
import { linkRun, path } from '@/lib/routes';
import { sessionName } from '@/lib/session-labels';
import { disciplineKey, tierMetalKey } from '@/screens/championships';

/**
 * What a rating line says it was for: a line naming it, and a line of detail.
 * @param line The line
 * @param t The translator
 * @param format Formats the figures it quotes
 * @returns The two lines
 */
export const describeRatingLine = (
  line: RatingLine,
  t: TFunction,
  format: Pick<Formatters, 'formatNumber'>,
): { title: string; detail: string } => {
  const { formatNumber } = format;
  const discipline = line.discipline ? t(disciplineKey(line.discipline)) : '';
  const tier = line.tier ?? 1;
  const metal = t(tierMetalKey(tier));

  switch (line.kind) {
    case 'opening':
      return {
        title: t('rating.line.opening', { tier }),
        detail: t('rating.line.openingDetail', { metal, floor: formatNumber(ratingFloor(tier)) }),
      };
    case 'promotion':
      return {
        title: t('rating.line.promotion', { tier, discipline }),
        detail: t('rating.line.promotionDetail', {
          rating: formatNumber(line.rating ?? 0), metal, floor: formatNumber(ratingFloor(tier)),
        }),
      };
    case 'drop':
      return {
        title: t('rating.line.drop', { tier, discipline }),
        detail: t('rating.line.dropDetail', {
          rating: formatNumber(line.rating ?? 0),
          under: formatNumber(dropRating(tier - 1) ?? 0),
          metal,
        }),
      };
    case 'lift':
      return {
        title: t('rating.line.lift', { tier, discipline }),
        detail: t('rating.line.liftDetail', {
          series: line.seriesName ?? '', metal, floor: formatNumber(ratingFloor(tier)),
        }),
      };
    case 'speed': {
      const speed = (value: number): string => t('finances.speed', { speed: formatNumber(value) });

      return {
        title: t('rating.line.speed', { from: speed(line.speed?.from ?? 1), to: speed(line.speed?.to ?? 1) }),
        detail: t('rating.line.speedDetail'),
      };
    }
    default: {
      const { working } = line;
      const session = sessionName({ name: line.sessionName, type: line.kind === 'race' ? 'race' : 'qualify' }, t);
      const round = line.historic
        ? line.seriesName ?? ''
        : t('finances.line.round', { number: line.number ?? 1, round: line.roundName ?? '' });
      const place = line.kind === 'race' ? 'rating.line.racePlace' : 'rating.line.qualifyingPlace';
      const parts = [
        line.historic
          ? t('rating.line.historicRung', { tier: working?.rung ?? 1 })
          : line.seriesName ?? '',
        working ? t(place, { place: working.place, of: working.of, expected: working.expected }) : '',
        line.kind === 'qualifying' ? t('rating.line.quarter') : '',
        working?.scale ? t('rating.line.shortened', { scale: working.scale }) : '',
        working && working.speed !== 1 ? t('finances.speed', { speed: formatNumber(working.speed) }) : '',
        working ? t('rating.line.field', { field: formatNumber(working.field) }) : '',
        working?.uncapped === undefined ? '' : t('rating.line.held', { from: formatNumber(working.uncapped) }),
      ];

      return {
        title: t('rating.line.session', { round, session }),
        detail: parts.filter((part) => part !== '').join(' · '),
      };
    }
  }
};

/**
 * Whether a discipline is open a rung higher than its own rating earned,
 * through the career's best.
 * @param career The career
 * @param discipline The discipline
 * @returns True when the rung below the best is what opens it
 */
export const openThrough = (career: Pick<Career, 'level'>, discipline: Discipline): boolean => (
  openLevels(career.level)[discipline] < career.level[discipline]
);

/**
 * The run a line's championship link names: its editions read off the
 * season's own copy where the career still holds it, and named outright where
 * it does not.
 * @param line The line, or a championship's total, naming its run
 * @param career The career, for its seasons
 * @returns The run, as `linkRun` would name it
 */
export const lineRun = (
  line: Pick<RatingLine, 'series' | 'season' | 'edition'>,
  career: Pick<Career, 'seasons'>,
): Partial<ChampionshipRun> => {
  const run = { season: line.season, edition: line.edition ?? 0 };
  const entry = career.seasons.find((one) => one.index === run.season)?.entries
    .find((one) => one.series === line.series && one.edition === run.edition);

  return entry ? linkRun(run, career.seasons.at(-1)?.index, editionsOf(entry.championship)) : run;
};

/**
 * The round page a session's line opens, on that session - the launch being
 * the last part of the key its session is rated under.
 * @param line The line
 * @param career The career, for its seasons
 * @returns The URL, or null for a line that is not about a session
 */
export const sessionPath = (line: RatingLine, career: Pick<Career, 'seasons'>): string | null => {
  if (line.kind !== 'race' && line.kind !== 'qualifying') return null;
  if (line.series === undefined || line.round === undefined) return null;
  const launch = Number(line.key.slice(line.key.lastIndexOf(':') + 1));
  if (!Number.isInteger(launch)) return null;

  return path.event({ series: line.series, round: line.round }, lineRun(line, career), launch);
};
