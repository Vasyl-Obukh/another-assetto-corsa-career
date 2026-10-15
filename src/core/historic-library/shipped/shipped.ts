// The historic events the app ships, one per file, and the list of them.
//
// A historic event is a single event of racing's past - one round with its own
// classes, teams, track, format and prizes - which a career draws onto its
// calendar a few times a year. Each is a document of its own: none of them
// points at a championship, whatever it may share with one, so keeping or
// dropping one here touches nothing else.
//
// Every one starts switched on; `active` is here so the library can ship one
// switched off, the way the championships do.

import { A1_RING_1997 } from './a1-ring-1997.ts';
import { AUSTRIAN_GP_1970 } from './austrian-gp-1970.ts';
import { AUSTRIAN_GP_1997 } from './austrian-gp-1997.ts';
import { BATHURST_1000_1987 } from './bathurst-1000-1987.ts';
import { BRANDS_HATCH_1998 } from './brands-hatch-1998.ts';
import { BRAZILIAN_GP_1975 } from './brazilian-gp-1975.ts';
import { BRAZILIAN_GP_1991 } from './brazilian-gp-1991.ts';
import { BRAZILIAN_GP_2004 } from './brazilian-gp-2004.ts';
import { BRITISH_GP_1954 } from './british-gp-1954.ts';
import { BRITISH_GP_1967 } from './british-gp-1967.ts';
import { BRITISH_GP_1970 } from './british-gp-1970.ts';
import { BRITISH_GP_1979 } from './british-gp-1979.ts';
import { DAYTONA_24_1978 } from './daytona-24-1978.ts';
import { DUTCH_GP_1962 } from './dutch-gp-1962.ts';
import { DUTCH_GP_1979 } from './dutch-gp-1979.ts';
import { FRENCH_GP_2004 } from './french-gp-2004.ts';
import { GERMAN_GP_1957 } from './german-gp-1957.ts';
import { GERMAN_GP_1962 } from './german-gp-1962.ts';
import { GERMAN_GP_1967 } from './german-gp-1967.ts';
import { HUNGARIAN_GP_1986 } from './hungarian-gp-1986.ts';
import { IROC_DAYTONA_1974 } from './iroc-daytona-1974.ts';
import { ITALIAN_GP_1957 } from './italian-gp-1957.ts';
import { ITALIAN_GP_1967 } from './italian-gp-1967.ts';
import { ITALIAN_GP_1971 } from './italian-gp-1971.ts';
import { ITALIAN_GP_1988 } from './italian-gp-1988.ts';
import { LE_MANS_1962 } from './le-mans-1962.ts';
import { LE_MANS_1969 } from './le-mans-1969.ts';
import { LUXEMBOURG_GP_1997 } from './luxembourg-gp-1997.ts';
import { MALAYSIAN_GP_2000 } from './malaysian-gp-2000.ts';
import { MEXICAN_GP_1990 } from './mexican-gp-1990.ts';
import { MONZA_1000_1969 } from './monza-1000-1969.ts';
import { NURBURGRING_24_2004 } from './nurburgring-24-2004.ts';
import { PETIT_LE_MANS_2001 } from './petit-le-mans-2001.ts';
import { ROAD_AMERICA_1973 } from './road-america-1973.ts';
import { SAN_MARINO_GP_1986 } from './san-marino-gp-1986.ts';
import { SEBRING_1969 } from './sebring-1969.ts';
import { SILVERSTONE_480_1990 } from './silverstone-480-1990.ts';
import { SPA_1000_1969 } from './spa-1000-1969.ts';
import { SPA_24_1987 } from './spa-24-1987.ts';
import { SPA_24_2004 } from './spa-24-2004.ts';
import { SPA_4_HOURS_1996 } from './spa-4-hours-1996.ts';
import { SPA_480_1990 } from './spa-480-1990.ts';
import { SPANISH_GP_1991 } from './spanish-gp-1991.ts';
import { TURKISH_GP_2005 } from './turkish-gp-2005.ts';
import { UNITED_STATES_GP_1975 } from './united-states-gp-1975.ts';
import { ZOLDER_1993 } from './zolder-1993.ts';
import type { ShippedSeries } from '../../series-library/index.ts';

/**
 * Every historic event the app ships, and how each starts out.
 *
 * In the order of the year they come from, for reading alone: a career draws
 * from them at random.
 */
export const SHIPPED_HISTORIC: readonly ShippedSeries[] = [
{ series: BRITISH_GP_1954, active: true },
  { series: GERMAN_GP_1957, active: true },
  { series: ITALIAN_GP_1957, active: true },
  { series: DUTCH_GP_1962, active: true },
  { series: GERMAN_GP_1962, active: true },
  { series: BRITISH_GP_1967, active: true },
  { series: GERMAN_GP_1967, active: true },
  { series: ITALIAN_GP_1967, active: true },
  { series: BRITISH_GP_1970, active: true },
  { series: AUSTRIAN_GP_1970, active: true },
  { series: ITALIAN_GP_1971, active: true },
  { series: BRAZILIAN_GP_1975, active: true },
  { series: UNITED_STATES_GP_1975, active: true },
  { series: DUTCH_GP_1979, active: true },
  { series: BRITISH_GP_1979, active: true },
  { series: SAN_MARINO_GP_1986, active: true },
  { series: HUNGARIAN_GP_1986, active: true },
  { series: ITALIAN_GP_1988, active: true },
  { series: MEXICAN_GP_1990, active: true },
  { series: BRAZILIAN_GP_1991, active: true },
  { series: SPANISH_GP_1991, active: true },
  { series: AUSTRIAN_GP_1997, active: true },
  { series: LUXEMBOURG_GP_1997, active: true },
  { series: MALAYSIAN_GP_2000, active: true },
  { series: FRENCH_GP_2004, active: true },
  { series: BRAZILIAN_GP_2004, active: true },
  { series: TURKISH_GP_2005, active: true },
  { series: LE_MANS_1962, active: true },
  { series: SEBRING_1969, active: true },
  { series: MONZA_1000_1969, active: true },
  { series: SPA_1000_1969, active: true },
  { series: LE_MANS_1969, active: true },
  { series: ROAD_AMERICA_1973, active: true },
  { series: IROC_DAYTONA_1974, active: true },
  { series: DAYTONA_24_1978, active: true },
  { series: SPA_24_1987, active: true },
  { series: BATHURST_1000_1987, active: true },
  { series: SPA_480_1990, active: true },
  { series: SILVERSTONE_480_1990, active: true },
  { series: ZOLDER_1993, active: true },
  { series: SPA_4_HOURS_1996, active: true },
  { series: A1_RING_1997, active: true },
  { series: BRANDS_HATCH_1998, active: true },
  { series: PETIT_LE_MANS_2001, active: true },
  { series: NURBURGRING_24_2004, active: true },
  { series: SPA_24_2004, active: true },
];
