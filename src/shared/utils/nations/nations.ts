// What a nation code is called. Shared because main writes the English name
// into race.ini and the renderer shows the name in the user's language.

import {
  COUNTRY_ALIASES, HOME_NATIONS, NATION_CODES, NATION_REGIONS,
} from '../../constants/index.ts';

/**
 * One region namer per locale, since building one is not free and a nation
 * list names two hundred at a time.
 */
const namers = new Map<string, Intl.DisplayNames>();

/**
 * Checks whether a code is one Assetto Corsa has a flag for.
 * @param code The code to check
 * @returns True when it is
 */
export const isNationCode = (code: string): boolean => NATION_CODES.includes(code);

/**
 * Names a nation in one language.
 *
 * A home nation comes back in English whatever the locale, since Intl has no
 * names for subdivisions; the renderer translates those four itself.
 * @param code The nation's code, one of NATION_CODES
 * @param locale The BCP 47 locale to name it in
 * @returns What the nation is called, or the code itself for one AC does not know
 */
export const nationName = (code: string, locale = 'en'): string => {
  const home = HOME_NATIONS[code];
  if (home !== undefined) return home;

  const region = NATION_REGIONS[code];
  if (region === undefined) return code;

  let namer = namers.get(locale);
  if (namer === undefined) {
    namer = new Intl.DisplayNames([locale], { type: 'region' });
    namers.set(locale, namer);
  }

  return namer.of(region) ?? code;
};

/**
 * Every English name a nation code goes by, lowercase, built on first use.
 */
let byName: Map<string, string> | null = null;

/**
 * Reads the nation a free-text country names.
 *
 * Mods write a country however they like - "Germany", "GERMANY", "U.S.A.",
 * "Italy /USA" - so it is matched case-blind against every nation's English
 * name and the aliases mods use, and a value naming two is read as its first.
 * The whole value is tried before it is split, since some names hold an
 * ampersand of their own: "Trinidad & Tobago".
 * @param country The country as written, or null when none was
 * @returns The nation's code, or null when the text names none
 */
export const nationOfCountry = (country: string | null): string | null => {
  if (country === null) return null;

  byName ??= new Map([
    ...NATION_CODES.map((code): [string, string] => [nationName(code).toLowerCase(), code]),
    ...Object.entries(COUNTRY_ALIASES),
  ]);

  const [first = ''] = country.split(/[/,&]/);

  return byName.get(country.trim().toLowerCase()) ?? byName.get(first.trim().toLowerCase()) ?? null;
};
