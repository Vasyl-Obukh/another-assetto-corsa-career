// A reproducible random number generator, and the string hash that seeds it.
//
// Deliberately not Math.random. Two things a career does depend on getting the
// same answer twice: re-planning a launch it has already shown the player and
// getting the same grid back, and composing a championship round's field the
// same way every time it is looked at. Both seed from something stable about
// what they are generating - a launch's name, a round's id - so the answer is a
// function of the thing rather than of when it was asked.

import { HASH_MULTIPLIER, SEED_MODULUS, SEED_MULTIPLIER } from './constants.ts';

/**
 * Turns a label into a seed for the generator below.
 * @param text Anything stable about the thing being seeded
 * @returns A seed inside the generator's valid range
 */
export const seedFrom = (text: string): number => {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * HASH_MULTIPLIER + text.charCodeAt(index)) % SEED_MODULUS;
  }

  return (hash % (SEED_MODULUS - 1)) + 1;
};

/**
 * A Park-Miller generator, so the same seed yields the same sequence.
 * @param seed Where to start, from seedFrom
 * @returns A function yielding numbers from zero up to but not including one
 */
export const randomFrom = (seed: number): (() => number) => {
  let state = seed;

  return () => {
    state = (state * SEED_MULTIPLIER) % SEED_MODULUS;

    return state / SEED_MODULUS;
  };
};

/**
 * Shuffles a list with a supplied generator, leaving the original alone.
 *
 * Fisher-Yates over the generator rather than over Math.random, so a shuffle
 * seeded the same way comes out the same way.
 * @param items What to shuffle
 * @param random A generator from randomFrom
 * @returns A new array holding the same items in a shuffled order
 */
export const shuffle = <T>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }

  return shuffled;
};
