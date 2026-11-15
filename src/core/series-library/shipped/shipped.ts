// The shipped championships, one per file, and the list of them.
//
// One file each because a championship is a document rather than a row: they
// run to a hundred lines apiece and are edited one at a time. Adding one is
// adding a file and a line here.
//
// Authored as TypeScript rather than JSON, unlike the user's own, and that
// asymmetry is the point: CarSpec.GT3_2010S and Discipline.SPORTSCAR are real
// references here, so a renamed spec is a compile error rather than a
// load-time report. Every value is still a JSON primitive, array or plain
// object, so writeSeries of any of these is a valid series file - which is
// what forking one produces.
//
// A calendar races its real venues from whatever source built them, but every
// championship needing only the base game keeps enough rounds on layouts Kunos
// ship, and together they climb each discipline from tier 5 without a gap - the
// rule the shipped ladder is held to, and what the library's tests check. DLC and
// mods extend it sideways and upwards rather than filling a hole in it; where
// the base game has no real series for a rung, a filler repeats the rung below.
// Formula 1 2023 is the first of those extensions - Assetto Corsa ships no
// Formula 1 car at all.
//
// A championship of a real season before 2006 starts switched off; that is the
// whole of what `active` says, and ROADMAP.md holds the rule.

import { ACCR_F4_2022 } from './accr-f4-2022.ts';
import { ADAC_GT_MASTERS } from './adac-gt-masters.ts';
import { ALMS_2001 } from './alms-2001.ts';
import { ALMS_2013_GT } from './alms-2013-gt.ts';
import { AUDI_TT_CUP_2016 } from './audi-tt-cup-2016.ts';
import { BLANCPAIN_ENDURANCE_2013 } from './blancpain-endurance-2013.ts';
import { BMW_M2_CS_RACING_CUP_ITALY_FSR } from './bmw-m2-cs-racing-cup-italy-fsr.ts';
import { BMW_M2_CS_RACING_CUP_ITALY } from './bmw-m2-cs-racing-cup-italy.ts';
import { BOSS_GP_OPEN } from './boss-gp-open.ts';
import { BPR_GLOBAL_GT_1996 } from './bpr-global-gt-1996.ts';
import { BRASILEIRO_DE_MARCAS_2014_FSR } from './brasileiro-de-marcas-2014-fsr.ts';
import { BRITISH_F4_2019 } from './british-f4-2019.ts';
import { BRITISH_F4_2024 } from './british-f4-2024.ts';
import { BTCC_1996_FSR } from './btcc-1996-fsr.ts';
import { BTCC_1998 } from './btcc-1998.ts';
import { BTCC_2014_FSR } from './btcc-2014-fsr.ts';
import { BTCC_2019_FSR } from './btcc-2019-fsr.ts';
import { CAN_AM_1973 } from './can-am-1973.ts';
import { CLASSIC_ENDURANCE_RACING_2 } from './classic-endurance-racing-2.ts';
import { CLASSIC_GT_INVITATIONAL_FSR } from './classic-gt-invitational-fsr.ts';
import { CLIO_CUP_EUROPE_2023_FSR } from './clio-cup-europe-2023-fsr.ts';
import { COPA_TRUCK_2024_FSR } from './copa-truck-2024-fsr.ts';
import { DTM_1993 } from './dtm-1993.ts';
import { DTM_1995_FSR } from './dtm-1995-fsr.ts';
import { DTM_2013 } from './dtm-2013.ts';
import { DTM_2015 } from './dtm-2015.ts';
import { DTM_2018 } from './dtm-2018.ts';
import { DTM_2021 } from './dtm-2021.ts';
import { DTM_2025_LFM } from './dtm-2025-lfm.ts';
import { DTM_2025_RSS } from './dtm-2025-rss.ts';
import { EGT_CHAMPIONSHIP } from './egt-championship.ts';
import { ELMS_2017_FSR } from './elms-2017-fsr.ts';
import { ELMS_2025_RSS } from './elms-2025-rss.ts';
import { ELMS_2025_URD } from './elms-2025-urd.ts';
import { ELMS_2025 } from './elms-2025.ts';
import { F4_CEZ_2025 } from './f4-cez-2025.ts';
import { FIA_GT_1997 } from './fia-gt-1997.ts';
import { FIA_GT_2004 } from './fia-gt-2004.ts';
import { FIA_GT1_2010 } from './fia-gt1-2010.ts';
import { FORMULA_1_1954 } from './formula-1-1954.ts';
import { FORMULA_1_1957 } from './formula-1-1957.ts';
import { FORMULA_1_1962 } from './formula-1-1962.ts';
import { FORMULA_1_1967 } from './formula-1-1967.ts';
import { FORMULA_1_1970 } from './formula-1-1970.ts';
import { FORMULA_1_1971 } from './formula-1-1971.ts';
import { FORMULA_1_1975 } from './formula-1-1975.ts';
import { FORMULA_1_1979 } from './formula-1-1979.ts';
import { FORMULA_1_1986 } from './formula-1-1986.ts';
import { FORMULA_1_1988 } from './formula-1-1988.ts';
import { FORMULA_1_1990 } from './formula-1-1990.ts';
import { FORMULA_1_1991 } from './formula-1-1991.ts';
import { FORMULA_1_1997 } from './formula-1-1997.ts';
import { FORMULA_1_2000 } from './formula-1-2000.ts';
import { FORMULA_1_2004 } from './formula-1-2004.ts';
import { FORMULA_1_2005 } from './formula-1-2005.ts';
import { FORMULA_1_2007 } from './formula-1-2007.ts';
import { FORMULA_1_2009 } from './formula-1-2009.ts';
import { FORMULA_1_2010 } from './formula-1-2010.ts';
import { FORMULA_1_2013 } from './formula-1-2013.ts';
import { FORMULA_1_2015 } from './formula-1-2015.ts';
import { FORMULA_1_2017 } from './formula-1-2017.ts';
import { FORMULA_1_2018 } from './formula-1-2018.ts';
import { FORMULA_1_2019 } from './formula-1-2019.ts';
import { FORMULA_1_2020 } from './formula-1-2020.ts';
import { FORMULA_1_2021 } from './formula-1-2021.ts';
import { FORMULA_1_2022_RSS } from './formula-1-2022-rss.ts';
import { FORMULA_1_2022_VRC } from './formula-1-2022-vrc.ts';
import { FORMULA_1_2023_RSS } from './formula-1-2023-rss.ts';
import { FORMULA_1_2023 } from './formula-1-2023.ts';
import { FORMULA_1_2024_RSS } from './formula-1-2024-rss.ts';
import { FORMULA_1_2024_VRC } from './formula-1-2024-vrc.ts';
import { FORMULA_1_2025_RSS } from './formula-1-2025-rss.ts';
import { FORMULA_1_2025_VRC } from './formula-1-2025-vrc.ts';
import { FORMULA_1_2026_RSS } from './formula-1-2026-rss.ts';
import { FORMULA_1_2026_VRC } from './formula-1-2026-vrc.ts';
import { FORMULA_2_2017 } from './formula-2-2017.ts';
import { FORMULA_2_2020 } from './formula-2-2020.ts';
import { FORMULA_2_2024_RSS } from './formula-2-2024-rss.ts';
import { FORMULA_2_2024_VRC } from './formula-2-2024-vrc.ts';
import { FORMULA_3_2019_FSR } from './formula-3-2019-fsr.ts';
import { FORMULA_3_2024 } from './formula-3-2024.ts';
import { FORMULA_3_2026 } from './formula-3-2026.ts';
import { FORMULA_ABARTH_PLUS, FORMULA_ABARTH_PLUS_PLUS } from './formula-abarth-plus.ts';
import { FORMULA_ABARTH } from './formula-abarth.ts';
import { FORMULA_E_2020_21 } from './formula-e-2020-21.ts';
import { FORMULA_E_2023_24 } from './formula-e-2023-24.ts';
import { FORMULA_E_2026_27 } from './formula-e-2026-27.ts';
import { FORMULA_UK } from './formula-uk.ts';
import { GINETTA_GT4_SUPERCUP_FSR } from './ginetta-gt4-supercup-fsr.ts';
import { GINETTA_GT4_SUPERCUP } from './ginetta-gt4-supercup.ts';
import { GINETTA_JUNIOR_2019_FSR } from './ginetta-junior-2019-fsr.ts';
import { GROUP_A_1987_FSR } from './group-a-1987-fsr.ts';
import { GROUP_A_1987 } from './group-a-1987.ts';
import { GT_MANUFACTURERS_1962 } from './gt-manufacturers-1962.ts';
import { GT_WORLD_CHALLENGE_ENDURANCE_2024_FSR } from './gt-world-challenge-endurance-2024-fsr.ts';
import { GT_WORLD_CHALLENGE_ENDURANCE_2024_RSS } from './gt-world-challenge-endurance-2024-rss.ts';
import { GT_WORLD_CHALLENGE_ENDURANCE_2024_URD } from './gt-world-challenge-endurance-2024-urd.ts';
import { GT_WORLD_CHALLENGE_ENDURANCE_2024 } from './gt-world-challenge-endurance-2024.ts';
import { GT_WORLD_CHALLENGE_SPRINT_RSS } from './gt-world-challenge-sprint-rss.ts';
import { GT_WORLD_CHALLENGE_SPRINT_URD } from './gt-world-challenge-sprint-urd.ts';
import { GT_WORLD_CHALLENGE_SPRINT } from './gt-world-challenge-sprint.ts';
import { GT2_EUROPEAN_SERIES_FSR } from './gt2-european-series-fsr.ts';
import { GT2_EUROPEAN_SERIES } from './gt2-european-series.ts';
import { GT3_SPRINT_SERIES } from './gt3-sprint-series.ts';
import { GT4_EUROPEAN_CUP_2010 } from './gt4-european-cup-2010.ts';
import { GT4_EUROPEAN_SERIES_FSR } from './gt4-european-series-fsr.ts';
import { GT4_EUROPEAN_SERIES } from './gt4-european-series.ts';
import { GT86_CUP } from './gt86-cup.ts';
import { HOT_HATCH_TROPHY } from './hot-hatch-trophy.ts';
import { HYPERCAR_INVITATIONAL } from './hypercar-invitational.ts';
import { ILMC_2011_GTE } from './ilmc-2011-gte.ts';
import { IMSA_2017_FSR } from './imsa-2017-fsr.ts';
import { IMSA_2017 } from './imsa-2017.ts';
import { IMSA_2023_FSR } from './imsa-2023-fsr.ts';
import { IMSA_2025_RSS } from './imsa-2025-rss.ts';
import { IMSA_2025_URD } from './imsa-2025-urd.ts';
import { IMSA_2025_VRC } from './imsa-2025-vrc.ts';
import { IMSA_2025 } from './imsa-2025.ts';
import { INDY_LIGHTS_2016 } from './indy-lights-2016.ts';
import { INDYCAR_2012 } from './indycar-2012.ts';
import { INDYCAR_2016 } from './indycar-2016.ts';
import { INDYCAR_2018 } from './indycar-2018.ts';
import { INDYCAR_2020 } from './indycar-2020.ts';
import { INDYCAR_2021 } from './indycar-2021.ts';
import { INTERCONTINENTAL_GT_CHALLENGE } from './intercontinental-gt-challenge.ts';
import { IROC_1974 } from './iroc-1974.ts';
import { ITALIAN_F4_2019 } from './italian-f4-2019.ts';
import { ITALIAN_F4_2024 } from './italian-f4-2024.ts';
import { JDM_PRODUCTION } from './jdm-production.ts';
import { LAMBORGHINI_SUPER_TROFEO_2016 } from './lamborghini-super-trofeo-2016.ts';
import { LAMBORGHINI_SUPER_TROFEO_EUROPE_2023_FSR } from './lamborghini-super-trofeo-europe-2023-fsr.ts';
import { LE_MANS_CUP_2021_FSR } from './le-mans-cup-2021-fsr.ts';
import { LE_MANS_CUP_2023 } from './le-mans-cup-2023.ts';
import { LIANA_GT_CUP } from './liana-gt-cup.ts';
import { LOTUS_CUP } from './lotus-cup.ts';
import { MX5_CUP } from './mx5-cup.ts';
import { MX5_MK1_CHAMPIONSHIP } from './mx5-mk1-championship.ts';
import { NASCAR_BRASIL_2023_FSR } from './nascar-brasil-2023-fsr.ts';
import { NASCAR_CUP_2023_FSR } from './nascar-cup-2023-fsr.ts';
import { NASCAR_CUP_2024_FSR } from './nascar-cup-2024-fsr.ts';
import { NLS_FSR } from './nls-fsr.ts';
import { NURBURGRING_LANGSTRECKEN_SERIE } from './nurburgring-langstrecken-serie.ts';
import { PORSCHE_CLUB_RACE } from './porsche-club-race.ts';
import { PORSCHE_RS60_SPYDER_CUP } from './porsche-rs60-spyder-cup.ts';
import { PORSCHE_SUPERCUP_2017 } from './porsche-supercup-2017.ts';
import { PORSCHE_SUPERCUP_2021 } from './porsche-supercup-2021.ts';
import { PORSCHE_SUPERCUP_2023 } from './porsche-supercup-2023.ts';
import { PORSCHE_SUPERCUP_2024_FSR } from './porsche-supercup-2024-fsr.ts';
import { PORSCHE_SUPERCUP_2025 } from './porsche-supercup-2025.ts';
import { PRAGA_CUP_2022_FSR } from './praga-cup-2022-fsr.ts';
import { PRAGA_CUP_2022 } from './praga-cup-2022.ts';
import { PRODUCTION_CAR_ENDURANCE } from './production-car-endurance.ts';
import { RADICAL_CUP_UK } from './radical-cup-uk.ts';
import { ROADSTER_PARTY_RACE } from './roadster-party-race.ts';
import { S_FR_CUP } from './s-fr-cup.ts';
import { STOCK_CAR_PRO_2023_FSR } from './stock-car-pro-2023-fsr.ts';
import { SUPER_FORMULA_2019 } from './super-formula-2019.ts';
import { SUPER_FORMULA_2023 } from './super-formula-2023.ts';
import { SUPER_GT_2021 } from './super-gt-2021.ts';
import { SUPERCAR_CLASSIC } from './supercar-classic.ts';
import { SUPERCAR_SERIES } from './supercar-series.ts';
import { TCR_EUROPE_FSR } from './tcr-europe-fsr.ts';
import { TCR_EUROPE } from './tcr-europe.ts';
import { TOUR_AUTO } from './tour-auto.ts';
import { TRANS_AM_TA2 } from './trans-am-ta2.ts';
import { TROFEO_ABARTH_500_2009 } from './trofeo-abarth-500-2009.ts';
import { TUNER_INVITATIONAL } from './tuner-invitational.ts';
import { TURISMO_NACIONAL_2023_FSR } from './turismo-nacional-2023-fsr.ts';
import { UNLIMITED_INVITATIONAL } from './unlimited-invitational.ts';
import { US_F4_2019 } from './us-f4-2019.ts';
import { US_F4_2024 } from './us-f4-2024.ts';
import { V8_SUPERCARS_2011_FSR } from './v8-supercars-2011-fsr.ts';
import { VLN_2004 } from './vln-2004.ts';
import { WEC_2012 } from './wec-2012.ts';
import { WEC_2014 } from './wec-2014.ts';
import { WEC_2015 } from './wec-2015.ts';
import { WEC_2016 } from './wec-2016.ts';
import { WEC_2017 } from './wec-2017.ts';
import { WEC_2021 } from './wec-2021.ts';
import { WEC_2023 } from './wec-2023.ts';
import { WEC_2025_LFM } from './wec-2025-lfm.ts';
import { WEC_2025_RSS } from './wec-2025-rss.ts';
import { WEC_2025_URD } from './wec-2025-urd.ts';
import { WEC_2025_VRC } from './wec-2025-vrc.ts';
import { WORLD_CHAMPIONSHIP_MAKES_1978 } from './world-championship-makes-1978.ts';
import { WORLD_SPORTSCAR_1969 } from './world-sportscar-1969.ts';
import { WORLD_SPORTSCAR_1990_FSR } from './world-sportscar-1990-fsr.ts';
import { WORLD_SPORTSCAR_1990 } from './world-sportscar-1990.ts';
import { XX_PROGRAMME } from './xx-programme.ts';
import { YOUNGTIMER_TROPHY } from './youngtimer-trophy.ts';
import type { Championship } from '../../../shared/types/index.ts';
import type { ShippedSeries } from '../types.ts';

/**
 * Every championship the app ships, and how each starts out.
 *
 * Listed easiest first for readability alone: the order a career climbs them in
 * is derived from their tiers by loadSeriesLibrary, so adding one here never
 * means renumbering anything. Which ones start switched off is decided here
 * rather than written on the championship, because it is a choice about our
 * library and not something the document says about itself - a fork of one
 * arrives switched on like anything else the user owns.
 */
export const SHIPPED: readonly ShippedSeries[] = [
  // Single-seater
  { series: FORMULA_ABARTH, active: true },
  { series: FORMULA_ABARTH_PLUS, active: true, filler: true },
  { series: FORMULA_ABARTH_PLUS_PLUS, active: true, filler: true },
  { series: ITALIAN_F4_2019, active: true },
  { series: ITALIAN_F4_2024, active: true },
  { series: BRITISH_F4_2019, active: true },
  { series: BRITISH_F4_2024, active: true },
  { series: US_F4_2019, active: true },
  { series: US_F4_2024, active: true },
  { series: ACCR_F4_2022, active: true },
  { series: F4_CEZ_2025, active: true },
  { series: FORMULA_3_2019_FSR, active: true },
  { series: FORMULA_3_2024, active: true },
  { series: FORMULA_3_2026, active: true },
  { series: FORMULA_2_2017, active: true },
  { series: FORMULA_2_2020, active: true },
  { series: FORMULA_2_2024_RSS, active: true },
  { series: FORMULA_2_2024_VRC, active: true },
  { series: FORMULA_E_2020_21, active: true },
  { series: FORMULA_E_2023_24, active: true },
  { series: FORMULA_E_2026_27, active: true },
  { series: INDY_LIGHTS_2016, active: true },
  { series: INDYCAR_2012, active: true },
  { series: INDYCAR_2016, active: true },
  { series: INDYCAR_2018, active: true },
  { series: INDYCAR_2021, active: true },
  { series: SUPER_FORMULA_2019, active: true },
  { series: SUPER_FORMULA_2023, active: true },
  { series: INDYCAR_2020, active: true },
  { series: BOSS_GP_OPEN, active: true },
  { series: FORMULA_1_2023, active: true },
  { series: FORMULA_UK, active: true },
  { series: FORMULA_1_2013, active: true },
  { series: FORMULA_1_2015, active: true },
  { series: FORMULA_1_2017, active: true },
  { series: FORMULA_1_2010, active: true },
  { series: FORMULA_1_2018, active: true },
  { series: FORMULA_1_2019, active: true },
  { series: FORMULA_1_2020, active: true },
  { series: FORMULA_1_2021, active: true },
  { series: FORMULA_1_2022_RSS, active: true },
  { series: FORMULA_1_2023_RSS, active: true },
  { series: FORMULA_1_2024_RSS, active: true },
  { series: FORMULA_1_2025_RSS, active: true },
  { series: FORMULA_1_2026_RSS, active: true },
  { series: FORMULA_1_2007, active: true },
  { series: FORMULA_1_2009, active: true },
  { series: FORMULA_1_2022_VRC, active: true },
  { series: FORMULA_1_2024_VRC, active: true },
  { series: FORMULA_1_2025_VRC, active: true },
  { series: FORMULA_1_2026_VRC, active: true },
  // Sportscar
  { series: GT4_EUROPEAN_CUP_2010, active: true },
  { series: LAMBORGHINI_SUPER_TROFEO_2016, active: true },
  { series: LAMBORGHINI_SUPER_TROFEO_EUROPE_2023_FSR, active: true },
  { series: GT3_SPRINT_SERIES, active: true },
  { series: BLANCPAIN_ENDURANCE_2013, active: true },
  { series: ILMC_2011_GTE, active: true },
  { series: PORSCHE_SUPERCUP_2017, active: true },
  { series: NURBURGRING_LANGSTRECKEN_SERIE, active: true },
  { series: NLS_FSR, active: true },
  { series: WEC_2014, active: true },
  { series: WEC_2015, active: true },
  { series: WEC_2016, active: true },
  { series: WEC_2012, active: true },
  { series: WEC_2017, active: true },
  { series: WEC_2021, active: true },
  { series: WEC_2023, active: true },
  { series: IMSA_2017, active: true },
  { series: IMSA_2017_FSR, active: true },
  { series: IMSA_2023_FSR, active: true },
  { series: IMSA_2025, active: true },
  { series: IMSA_2025_RSS, active: true },
  { series: IMSA_2025_URD, active: true },
  { series: IMSA_2025_VRC, active: true },
  { series: ALMS_2013_GT, active: true },
  { series: LE_MANS_CUP_2021_FSR, active: true },
  { series: LE_MANS_CUP_2023, active: true },
  { series: ELMS_2017_FSR, active: true },
  { series: ELMS_2025, active: true },
  { series: ELMS_2025_RSS, active: true },
  { series: ELMS_2025_URD, active: true },
  { series: FIA_GT1_2010, active: true },
  { series: WEC_2025_LFM, active: true },
  { series: WEC_2025_RSS, active: true },
  { series: WEC_2025_URD, active: true },
  { series: WEC_2025_VRC, active: true },
  { series: GT_WORLD_CHALLENGE_SPRINT, active: true },
  { series: GT_WORLD_CHALLENGE_SPRINT_RSS, active: true },
  { series: GT_WORLD_CHALLENGE_SPRINT_URD, active: true },
  { series: GT_WORLD_CHALLENGE_ENDURANCE_2024, active: true },
  { series: GT_WORLD_CHALLENGE_ENDURANCE_2024_FSR, active: true },
  { series: GT_WORLD_CHALLENGE_ENDURANCE_2024_RSS, active: true },
  { series: GT_WORLD_CHALLENGE_ENDURANCE_2024_URD, active: true },
  { series: INTERCONTINENTAL_GT_CHALLENGE, active: true },
  { series: ADAC_GT_MASTERS, active: true },
  { series: PORSCHE_SUPERCUP_2025, active: true },
  { series: PORSCHE_SUPERCUP_2021, active: true },
  { series: EGT_CHAMPIONSHIP, active: true },
  { series: RADICAL_CUP_UK, active: true },
  { series: PRAGA_CUP_2022, active: true },
  { series: PRAGA_CUP_2022_FSR, active: true },
  { series: GT4_EUROPEAN_SERIES, active: true },
  { series: GT4_EUROPEAN_SERIES_FSR, active: true },
  { series: GT2_EUROPEAN_SERIES, active: true },
  { series: GT2_EUROPEAN_SERIES_FSR, active: true },
  { series: PORSCHE_SUPERCUP_2023, active: true },
  { series: PORSCHE_SUPERCUP_2024_FSR, active: true },
  { series: BMW_M2_CS_RACING_CUP_ITALY, active: true },
  { series: BMW_M2_CS_RACING_CUP_ITALY_FSR, active: true },
  { series: GINETTA_GT4_SUPERCUP, active: true },
  { series: GINETTA_GT4_SUPERCUP_FSR, active: true },
  { series: GINETTA_JUNIOR_2019_FSR, active: true },
  { series: S_FR_CUP, active: true },
  { series: LIANA_GT_CUP, active: true },
  { series: UNLIMITED_INVITATIONAL, active: true },
  { series: CLASSIC_GT_INVITATIONAL_FSR, active: true },
  // Touring
  { series: TROFEO_ABARTH_500_2009, active: true },
  { series: AUDI_TT_CUP_2016, active: true },
  { series: CLIO_CUP_EUROPE_2023_FSR, active: true },
  { series: MX5_CUP, active: true },
  { series: DTM_2013, active: true },
  { series: DTM_2015, active: true },
  { series: DTM_2018, active: true },
  { series: DTM_2021, active: true },
  { series: NASCAR_CUP_2023_FSR, active: true },
  { series: NASCAR_CUP_2024_FSR, active: true },
  { series: STOCK_CAR_PRO_2023_FSR, active: true },
  { series: NASCAR_BRASIL_2023_FSR, active: true },
  { series: BRASILEIRO_DE_MARCAS_2014_FSR, active: true },
  { series: TURISMO_NACIONAL_2023_FSR, active: true },
  { series: COPA_TRUCK_2024_FSR, active: true },
  { series: DTM_2025_RSS, active: true },
  { series: TRANS_AM_TA2, active: true },
  { series: DTM_2025_LFM, active: true },
  { series: SUPER_GT_2021, active: true },
  { series: TCR_EUROPE, active: true },
  { series: TCR_EUROPE_FSR, active: true },
  { series: BTCC_2014_FSR, active: true },
  { series: BTCC_2019_FSR, active: true },
  { series: V8_SUPERCARS_2011_FSR, active: true },
  // Road
  { series: HOT_HATCH_TROPHY, active: true },
  { series: MX5_MK1_CHAMPIONSHIP, active: true },
  { series: GT86_CUP, active: true },
  { series: LOTUS_CUP, active: true },
  { series: PRODUCTION_CAR_ENDURANCE, active: true },
  { series: SUPERCAR_SERIES, active: true },
  { series: HYPERCAR_INVITATIONAL, active: true },
  { series: ROADSTER_PARTY_RACE, active: true },
  { series: JDM_PRODUCTION, active: true },
  { series: TUNER_INVITATIONAL, active: true },
  { series: PORSCHE_CLUB_RACE, active: true },
  { series: XX_PROGRAMME, active: true },
  // Seasons before 2006, and the historic series for their cars: switched off
  // until the player wants them.
  { series: FORMULA_1_1962, active: false },
  { series: FORMULA_1_1967, active: false },
  { series: FORMULA_1_1971, active: false },
  { series: FORMULA_1_1975, active: false },
  { series: FORMULA_1_1986, active: false },
  { series: WORLD_SPORTSCAR_1969, active: false },
  { series: WORLD_SPORTSCAR_1990, active: false },
  { series: WORLD_SPORTSCAR_1990_FSR, active: false },
  { series: DTM_1993, active: false },
  { series: DTM_1995_FSR, active: false },
  { series: GROUP_A_1987, active: false },
  { series: GROUP_A_1987_FSR, active: false },
  { series: YOUNGTIMER_TROPHY, active: false },
  { series: SUPERCAR_CLASSIC, active: false },
  { series: FORMULA_1_1954, active: false },
  { series: FORMULA_1_1957, active: false },
  { series: FORMULA_1_2004, active: false },
  { series: GT_MANUFACTURERS_1962, active: false },
  { series: PORSCHE_RS60_SPYDER_CUP, active: false },
  { series: CAN_AM_1973, active: false },
  { series: WORLD_CHAMPIONSHIP_MAKES_1978, active: false },
  { series: CLASSIC_ENDURANCE_RACING_2, active: false },
  { series: BPR_GLOBAL_GT_1996, active: false },
  { series: FIA_GT_1997, active: false },
  { series: IROC_1974, active: false },
  { series: TOUR_AUTO, active: false },
  { series: FORMULA_1_1970, active: false },
  { series: FORMULA_1_1979, active: false },
  { series: FORMULA_1_1990, active: false },
  { series: FORMULA_1_2000, active: false },
  { series: FIA_GT_2004, active: false },
  { series: FORMULA_1_1988, active: false },
  { series: FORMULA_1_1991, active: false },
  { series: FORMULA_1_1997, active: false },
  { series: FORMULA_1_2005, active: false },
  { series: BTCC_1998, active: false },
  { series: BTCC_1996_FSR, active: false },
  { series: ALMS_2001, active: false },
  { series: VLN_2004, active: false },
];

/**
 * Every championship the app ships, without how it starts out.
 */
export const SHIPPED_SERIES: readonly Championship[] = SHIPPED.map((shipped) => shipped.series);
