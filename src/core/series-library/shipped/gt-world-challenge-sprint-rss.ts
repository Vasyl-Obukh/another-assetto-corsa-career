import { GT_WORLD_CHALLENGE_SPRINT } from './gt-world-challenge-sprint.ts';
import { reclassed } from './utils.ts';
import { CarSpec } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * GT World Challenge Europe Sprint Cup - on RSS's GT-M cars.
 *
 * The same championship as GT_WORLD_CHALLENGE_SPRINT, its calendar, formats,
 * points and field, on the GT3 (RSS) spec: RSS's GT-M cars, their GT3s under
 * made-up names. A copy rather than more cars in the original, because RSS's
 * GT3s never share a class with another maker's and the original keeps racing
 * LFM's.
 *
 * Source: https://en.wikipedia.org/wiki/GT_World_Challenge_Europe_Sprint_Cup
 */
export const GT_WORLD_CHALLENGE_SPRINT_RSS: Championship = {
  ...GT_WORLD_CHALLENGE_SPRINT,
  id: 'gt-world-challenge-sprint-rss',
  name: 'GT World Challenge Europe Sprint Cup (RSS)',
  description: {
    en: 'Europe\'s GT3 sprint series on RSS\'s GT-M cars: two one-hour races a round at Brands '
      + 'Hatch, Magny-Cours, Zandvoort, Valencia, Misano and Hockenheim.',
    uk: 'Європейська спринтерська серія GT3 на машинах GT-M від RSS: дві годинні гонки за етап у '
      + 'Брендс-Хетчі, Магні-Курі, Зандворті, Валенсії, Мізано та Гоккенгаймі.',
  },
  entries: reclassed(GT_WORLD_CHALLENGE_SPRINT, { kind: 'spec', spec: CarSpec.GT3_RSS }),
};
