// Folding and matching the text a search box holds. Shared because both the
// paged browsers, which query in main, and the livery list, which filters in
// the renderer, have to agree on what "citroen finds Citroen" means.

/**
 * Folds a string down to what a search should match on.
 *
 * Diacritics are stripped, so someone typing "citroen" finds "Citroën" - which
 * is what they meant, and the only spelling most keyboards make easy.
 * @param text The string to fold
 * @returns The folded string
 */
export const normalise = (text: string): string => (
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
);

/**
 * Splits a search box's contents into the terms that must all match.
 * @param search What the user typed, if anything
 * @returns The folded terms, empty when there is nothing to match
 */
export const searchTerms = (search: string | undefined): string[] => (
  normalise(search ?? '').split(/\s+/).filter((term) => term !== '')
);

/**
 * Checks that every term appears somewhere in an entry.
 *
 * All terms rather than any, because "ferrari gt3" means both words - matching
 * either would bury the answer under every Ferrari ever made.
 * @param terms The folded terms to look for
 * @param haystacks The entry's searchable strings, nulls allowed
 * @returns True when every term is found
 */
export const matchesTerms = (
  terms: readonly string[],
  haystacks: readonly (string | null)[],
): boolean => {
  if (terms.length === 0) return true;

  const folded = haystacks
    .filter((value): value is string => value !== null)
    .map(normalise);

  return terms.every((term) => folded.some((value) => value.includes(term)));
};
