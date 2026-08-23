// The shipped class catalogue: which spec every car we can name races in.
//
// Authored data, and only data. Read against the installed content's own
// ui_car.json figures rather than folder names - AC's `class` field calls the
// Evora GTE, the X-Bow R and the P1 GTR "street", and says nothing at all for
// most mods, so it is a hint while authoring and never an authority.
//
// Only IDs the provenance catalogue already names get a spec. Anything else is
// a mod we cannot identify, and leaving it unclassified is the honest answer.
//
// Deliberately not part of the content cache: unlike provenance, nothing here is
// baked into a scanned Car, so correcting a row takes effect on next launch with
// no version to bump.

import { CarClass, CarSpec } from '../../types/index.ts';

/**
 * What each class is called.
 *
 * Keyed by every CarClass, so a class with no name fails to compile.
 */
export const CLASS_NAMES: Readonly<Record<CarClass, string>> = {
  [CarClass.FORMULA_1]: 'Formula 1',
  [CarClass.SUPER_FORMULA]: 'Super Formula',
  [CarClass.FORMULA_2]: 'Formula 2',
  [CarClass.FORMULA_3]: 'Formula 3',
  [CarClass.FORMULA_4]: 'Formula 4',
  [CarClass.FORMULA_E]: 'Formula E',
  [CarClass.INDYCAR]: 'IndyCar',
  [CarClass.LMH]: 'Le Mans Hypercar',
  [CarClass.LMP1]: 'LMP1',
  [CarClass.LMP2]: 'LMP2',
  [CarClass.GROUP_C]: 'Group C',
  [CarClass.SPORTS_PROTOTYPE]: 'Sports Prototype',
  [CarClass.GT1]: 'GT1',
  [CarClass.GT2]: 'GT2',
  [CarClass.GT3]: 'GT3',
  [CarClass.GT4]: 'GT4',
  [CarClass.GTE]: 'GTE',
  [CarClass.N_GT]: 'N-GT',
  [CarClass.DTM]: 'DTM',
  [CarClass.TCR]: 'TCR',
  [CarClass.PORSCHE_CUP]: 'Porsche Cup',
};

/**
 * What each spec is, and which class it belongs to.
 *
 * Keyed by every CarSpec, so a spec with no class or no name fails to compile.
 * Names are the display text: technical labels that read the same in any
 * language, which is why they are data here rather than i18n keys.
 */
export const SPECS: Readonly<Record<CarSpec, { class: CarClass; name: string }>> = {
  [CarSpec.FORMULA_1_1954]: { class: CarClass.FORMULA_1, name: 'Formula 1 1954' },
  [CarSpec.FORMULA_1_1957]: { class: CarClass.FORMULA_1, name: 'Formula 1 1957' },
  [CarSpec.FORMULA_1_1962]: { class: CarClass.FORMULA_1, name: 'Formula 1 1962' },
  [CarSpec.FORMULA_1_1967]: { class: CarClass.FORMULA_1, name: 'Formula 1 1967' },
  [CarSpec.FORMULA_1_1970]: { class: CarClass.FORMULA_1, name: 'Formula 1 1970' },
  [CarSpec.FORMULA_1_1971]: { class: CarClass.FORMULA_1, name: 'Formula 1 1971' },
  [CarSpec.FORMULA_1_1975]: { class: CarClass.FORMULA_1, name: 'Formula 1 1975' },
  [CarSpec.FORMULA_1_1979]: { class: CarClass.FORMULA_1, name: 'Formula 1 1979' },
  [CarSpec.FORMULA_1_1986]: { class: CarClass.FORMULA_1, name: 'Formula 1 1986' },
  [CarSpec.FORMULA_1_1988]: { class: CarClass.FORMULA_1, name: 'Formula 1 1988' },
  [CarSpec.FORMULA_1_1990]: { class: CarClass.FORMULA_1, name: 'Formula 1 1990' },
  [CarSpec.FORMULA_1_1991]: { class: CarClass.FORMULA_1, name: 'Formula 1 1991' },
  [CarSpec.FORMULA_1_1997]: { class: CarClass.FORMULA_1, name: 'Formula 1 1997' },
  [CarSpec.FORMULA_1_2000]: { class: CarClass.FORMULA_1, name: 'Formula 1 2000' },
  [CarSpec.FORMULA_1_2004]: { class: CarClass.FORMULA_1, name: 'Formula 1 2004' },
  [CarSpec.FORMULA_1_2005]: { class: CarClass.FORMULA_1, name: 'Formula 1 2005' },
  [CarSpec.FORMULA_1_2007]: { class: CarClass.FORMULA_1, name: 'Formula 1 2007' },
  [CarSpec.FORMULA_1_2009]: { class: CarClass.FORMULA_1, name: 'Formula 1 2009' },
  [CarSpec.FORMULA_1_2010]: { class: CarClass.FORMULA_1, name: 'Formula 1 2010' },
  [CarSpec.FORMULA_1_2013]: { class: CarClass.FORMULA_1, name: 'Formula 1 2013' },
  [CarSpec.FORMULA_1_2015]: { class: CarClass.FORMULA_1, name: 'Formula 1 2015' },
  [CarSpec.FORMULA_1_2017]: { class: CarClass.FORMULA_1, name: 'Formula 1 2017' },
  [CarSpec.FORMULA_1_2018]: { class: CarClass.FORMULA_1, name: 'Formula 1 2018' },
  [CarSpec.FORMULA_1_2019]: { class: CarClass.FORMULA_1, name: 'Formula 1 2019' },
  [CarSpec.FORMULA_1_2020]: { class: CarClass.FORMULA_1, name: 'Formula 1 2020' },
  [CarSpec.FORMULA_1_2021]: { class: CarClass.FORMULA_1, name: 'Formula 1 2021' },
  [CarSpec.FORMULA_1_2022_RSS]: { class: CarClass.FORMULA_1, name: 'Formula 1 2022 (RSS)' },
  [CarSpec.FORMULA_1_2022_VRC]: { class: CarClass.FORMULA_1, name: 'Formula 1 2022 (VRC)' },
  [CarSpec.FORMULA_1_2023]: { class: CarClass.FORMULA_1, name: 'Formula 1 2023' },
  [CarSpec.FORMULA_1_2024_RSS]: { class: CarClass.FORMULA_1, name: 'Formula 1 2024 (RSS)' },
  [CarSpec.FORMULA_1_2024_VRC]: { class: CarClass.FORMULA_1, name: 'Formula 1 2024 (VRC)' },
  [CarSpec.FORMULA_1_2025_RSS]: { class: CarClass.FORMULA_1, name: 'Formula 1 2025 (RSS)' },
  [CarSpec.FORMULA_1_2025_VRC]: { class: CarClass.FORMULA_1, name: 'Formula 1 2025 (VRC)' },
  [CarSpec.FORMULA_1_2026]: { class: CarClass.FORMULA_1, name: 'Formula 1 2026' },
  [CarSpec.SUPER_FORMULA_2019]: { class: CarClass.SUPER_FORMULA, name: 'Super Formula 2019' },
  [CarSpec.SUPER_FORMULA_2023]: { class: CarClass.SUPER_FORMULA, name: 'Super Formula 2023' },
  [CarSpec.FORMULA_2_2017]: { class: CarClass.FORMULA_2, name: 'Formula 2 2017' },
  [CarSpec.FORMULA_2_2020]: { class: CarClass.FORMULA_2, name: 'Formula 2 2020' },
  [CarSpec.FORMULA_2_2024]: { class: CarClass.FORMULA_2, name: 'Formula 2 2024' },
  [CarSpec.FORMULA_2_2024_VRC]: { class: CarClass.FORMULA_2, name: 'Formula 2 2024 (VRC)' },
  [CarSpec.FORMULA_3]: { class: CarClass.FORMULA_3, name: 'Formula 3' },
  [CarSpec.FORMULA_4]: { class: CarClass.FORMULA_4, name: 'Formula 4' },
  [CarSpec.FORMULA_E_GEN_2]: { class: CarClass.FORMULA_E, name: 'Formula E Gen 2' },
  [CarSpec.FORMULA_E_GEN_3]: { class: CarClass.FORMULA_E, name: 'Formula E Gen 3' },
  [CarSpec.INDYCAR_2012_ROAD]: { class: CarClass.INDYCAR, name: 'IndyCar 2012 (road kit)' },
  [CarSpec.INDYCAR_2012_OVAL]: { class: CarClass.INDYCAR, name: 'IndyCar 2012 (oval kit)' },
  [CarSpec.INDYCAR_2018_ROAD]: { class: CarClass.INDYCAR, name: 'IndyCar 2018 (road kit)' },
  [CarSpec.INDYCAR_2018_SHORT]: { class: CarClass.INDYCAR, name: 'IndyCar 2018 (short oval kit)' },
  [CarSpec.INDYCAR_2018_OVAL]: { class: CarClass.INDYCAR, name: 'IndyCar 2018 (oval kit)' },
  [CarSpec.INDYCAR_2020_ROAD]: { class: CarClass.INDYCAR, name: 'IndyCar 2020 (road)' },
  [CarSpec.INDYCAR_2020_OVAL]: { class: CarClass.INDYCAR, name: 'IndyCar 2020 (oval)' },
  [CarSpec.LMH_LFM]: { class: CarClass.LMH, name: 'Hypercar (LFM)' },
  [CarSpec.LMH_VRC]: { class: CarClass.LMH, name: 'Hypercar (VRC)' },
  [CarSpec.LMH_RSS]: { class: CarClass.LMH, name: 'Hypercar (RSS)' },
  [CarSpec.LMH_YZD]: { class: CarClass.LMH, name: 'Hypercar (Yezhrod)' },
  [CarSpec.LMP1_2012]: { class: CarClass.LMP1, name: 'LMP1 Hybrid 2012' },
  [CarSpec.LMP1_2014]: { class: CarClass.LMP1, name: 'LMP1 Hybrid 2014' },
  [CarSpec.LMP1_2016]: { class: CarClass.LMP1, name: 'LMP1 Hybrid 2016' },
  [CarSpec.LMP2_2017]: { class: CarClass.LMP2, name: 'LMP2 (2017)' },
  [CarSpec.LMP2_2021]: { class: CarClass.LMP2, name: 'LMP2 (2021)' },
  [CarSpec.GROUP_C]: { class: CarClass.GROUP_C, name: 'Group C' },
  [CarSpec.SPORTS_PROTOTYPE_60S]: { class: CarClass.SPORTS_PROTOTYPE, name: 'Sports Prototype (60s)' },
  [CarSpec.GT1_1990S]: { class: CarClass.GT1, name: 'GT1 (1990s)' },
  [CarSpec.GT1_2000S]: { class: CarClass.GT1, name: 'GT1 (2000s)' },
  [CarSpec.GT2]: { class: CarClass.GT2, name: 'GT2' },
  [CarSpec.GT3_2010S]: { class: CarClass.GT3, name: 'GT3 (2010s)' },
  [CarSpec.GT3_2010S_PLUS]: { class: CarClass.GT3, name: 'GT3 (2010s, unrestricted)' },
  [CarSpec.GT3_LFM]: { class: CarClass.GT3, name: 'GT3 (LFM)' },
  [CarSpec.GT3_RSS]: { class: CarClass.GT3, name: 'GT3 (RSS)' },
  [CarSpec.E1_XP2]: { class: CarClass.GT3, name: 'E1-XP2' },
  [CarSpec.SPX]: { class: CarClass.GT3, name: 'SPX' },
  [CarSpec.GT4]: { class: CarClass.GT4, name: 'GT4' },
  [CarSpec.GTE_2011]: { class: CarClass.GTE, name: 'GTE (2011)' },
  [CarSpec.GTE_2017]: { class: CarClass.GTE, name: 'GTE (2017)' },
  [CarSpec.GTE_2020S]: { class: CarClass.GTE, name: 'GTE (2020s)' },
  [CarSpec.GTE_LOTUS]: { class: CarClass.GTE, name: 'Lotus Evora GTE' },
  [CarSpec.N_GT]: { class: CarClass.N_GT, name: 'N-GT' },
  [CarSpec.PORSCHE_CUP_991]: { class: CarClass.PORSCHE_CUP, name: 'Porsche Cup 991' },
  [CarSpec.PORSCHE_CUP_992_LFM]: { class: CarClass.PORSCHE_CUP, name: 'Porsche Cup 992 (LFM)' },
  [CarSpec.PORSCHE_CUP_992_URD]: { class: CarClass.PORSCHE_CUP, name: 'Porsche Cup 992 (URD)' },
  [CarSpec.PORSCHE_CUP_992_GUERILLA]: { class: CarClass.PORSCHE_CUP, name: 'Porsche Cup 992 (GUERILLA)' },
  [CarSpec.DTM_1992]: { class: CarClass.DTM, name: 'DTM 1992' },
  [CarSpec.DTM_2021_RSS]: { class: CarClass.DTM, name: 'DTM 2021 (RSS)' },
  [CarSpec.DTM_2025_LFM]: { class: CarClass.DTM, name: 'DTM 2025 (LFM)' },
  [CarSpec.DTM_2025_RSS]: { class: CarClass.DTM, name: 'DTM 2025 (RSS)' },
  [CarSpec.TCR_2024]: { class: CarClass.TCR, name: 'TCR' },
};

/**
 * Which cars race in each spec, by folder ID.
 *
 * Grouped by spec because that is how it is reviewed: read one grid at a time and
 * the car that does not belong stands out. A car with more than one grid to race
 * on appears in each, and a car that exists only for one-make racing appears in
 * none - a championship names it directly instead.
 */
export const SPEC_CARS: Readonly<Record<CarSpec, readonly string[]>> = {
  [CarSpec.FORMULA_1_1954]: [
    'ks_maserati_250f_6cyl',
  ],
  [CarSpec.FORMULA_1_1957]: [
    'ks_maserati_250f_12cyl',
  ],
  [CarSpec.FORMULA_1_1962]: [
    'ks_lotus_25',
  ],
  [CarSpec.FORMULA_1_1967]: [
    'lotus_49',
    'ks_ferrari_312_67',
  ],
  [CarSpec.FORMULA_1_1970]: [
    'rss_formula_70',
    'rss_formula_70_s',
  ],
  [CarSpec.FORMULA_1_1971]: [
    'ks_lotus_72d',
  ],
  [CarSpec.FORMULA_1_1975]: [
    'ferrari_312t',
  ],
  [CarSpec.FORMULA_1_1979]: [
    'rss_formula_79',
  ],
  [CarSpec.FORMULA_1_1986]: [
    'lotus_98t',
    'rss_formula_1986',
  ],
  [CarSpec.FORMULA_1_1988]: [
    'vrc_1988_mclaren_mp4-4_r02',
    'vrc_1988_mclaren_mp4-4_r04',
    'vrc_1988_mclaren_mp4-4_r09',
    'vrc_1988_mclaren_mp4-4_r10',
  ],
  [CarSpec.FORMULA_1_1990]: [
    'rss_formula_1990',
    'rss_formula_1990_v10',
  ],
  [CarSpec.FORMULA_1_1991]: [
    'vrc_1991_jordan_191',
  ],
  [CarSpec.FORMULA_1_1997]: [
    'vrc_1997_ferrari_f310b',
    'vrc_1997_williams_fw19',
  ],
  [CarSpec.FORMULA_1_2000]: [
    'rss_formula_2000',
  ],
  [CarSpec.FORMULA_1_2004]: [
    'ks_ferrari_f2004',
  ],
  [CarSpec.FORMULA_1_2005]: [
    'vrc_2005_mclaren_mp420',
    'vrc_2005_renault_r25',
  ],
  [CarSpec.FORMULA_1_2007]: [
    'vrc_formula_alpha_2007_f07',
    'vrc_formula_alpha_2007_mc22',
  ],
  [CarSpec.FORMULA_1_2009]: [
    'vrc_2009_williams_fw31',
    'vrc_2009_williams_fw31_s1',
  ],
  [CarSpec.FORMULA_1_2010]: [
    'rss_formula_2010',
  ],
  [CarSpec.FORMULA_1_2013]: [
    'ks_ferrari_f138',
    'rss_formula_2013',
  ],
  [CarSpec.FORMULA_1_2015]: [
    'ks_ferrari_sf15t',
    'vrc_2015_williams_fw37',
  ],
  [CarSpec.FORMULA_1_2017]: [
    'rss_formula_hybrid_2017',
    'ks_ferrari_sf70h',
  ],
  [CarSpec.FORMULA_1_2018]: [
    'rss_formula_hybrid_2018',
    'rss_formula_hybrid_2018_s1',
  ],
  [CarSpec.FORMULA_1_2019]: [
    'rss_formula_hybrid_2019',
  ],
  [CarSpec.FORMULA_1_2020]: [
    'rss_formula_hybrid_2020',
  ],
  [CarSpec.FORMULA_1_2021]: [
    'rss_formula_hybrid_2021',
  ],
  [CarSpec.FORMULA_1_2022_RSS]: [
    'rss_formula_hybrid_2022',
    'rss_formula_hybrid_2022_s',
  ],
  [CarSpec.FORMULA_1_2022_VRC]: [
    'vrc_formula_alpha_2022',
  ],
  [CarSpec.FORMULA_1_2023]: [
    'rss_formula_hybrid_2023',
  ],
  [CarSpec.FORMULA_1_2024_RSS]: [
    'rss_formula_hybrid_2024',
  ],
  [CarSpec.FORMULA_1_2024_VRC]: [
    'vrc_formula_alpha_2024',
    'vrc_formula_alpha_2024_csp',
  ],
  [CarSpec.FORMULA_1_2025_RSS]: [
    'rss_formula_hybrid_2025_alpine',
  ],
  [CarSpec.FORMULA_1_2025_VRC]: [
    'vrc_formula_alpha_2025',
    'vrc_formula_alpha_2025_csp',
  ],
  [CarSpec.FORMULA_1_2026]: [
    'rss_formula_hybrid_x_2026',
  ],
  [CarSpec.SUPER_FORMULA_2019]: [
    'rss_formula_rss_supreme',
  ],
  [CarSpec.SUPER_FORMULA_2023]: [
    'rss_formula_rss_supreme_25',
  ],
  [CarSpec.FORMULA_2_2017]: [
    'rss_formula_rss_2_v8',
  ],
  [CarSpec.FORMULA_2_2020]: [
    'rss_formula_rss_2_v6_2020',
  ],
  [CarSpec.FORMULA_2_2024]: [
    'rss_formula_rss_2_v6_2024',
  ],
  [CarSpec.FORMULA_2_2024_VRC]: [
    'vrc_formula_beta_2024',
    'vrc_formula_beta_2024_csp',
  ],
  [CarSpec.FORMULA_3]: [
    'rss_formula_rss_3_v6',
    'rss_formula_rss_3_v6_2026',
  ],
  [CarSpec.FORMULA_4]: [
    'rss_formula_rss_4',
    'rss_formula_rss_4_2024',
  ],
  [CarSpec.FORMULA_E_GEN_2]: [
    'vrc_2019_formula_lithium',
  ],
  [CarSpec.FORMULA_E_GEN_3]: [
    'vrc_formula_lithium_2023',
    'vrc_formula_lithium_2023_csp',
  ],
  [CarSpec.INDYCAR_2012_ROAD]: [
    'vrc_formula_na_2012_road',
  ],
  [CarSpec.INDYCAR_2012_OVAL]: [
    'vrc_formula_na_2012_oval',
  ],
  [CarSpec.INDYCAR_2018_ROAD]: [
    'vrc_formula_na_2018_road',
  ],
  [CarSpec.INDYCAR_2018_SHORT]: [
    'vrc_formula_na_2018_short',
  ],
  [CarSpec.INDYCAR_2018_OVAL]: [
    'vrc_formula_na_2018_oval',
  ],
  [CarSpec.INDYCAR_2020_ROAD]: [
    'rss_formula_americas_2020',
  ],
  [CarSpec.INDYCAR_2020_OVAL]: [
    'rss_formula_americas_2020_oval',
  ],
  [CarSpec.LMH_LFM]: [
    'alpine_a424',
    'bmw_m_hybrid_v8_2023',
    'cadillac_v_series_r_2023',
    'ferrari_499p_2023',
    'lamborghini_sc63',
    'peugeot_9x8',
    'porsche_963_2023',
    'toyota_gr010',
  ],
  [CarSpec.LMH_VRC]: [
    'vrc_pt_2023_pageau_98',
    'vrc_pt_2023_pageau_98_csp',
    'vrc_pt_2024_arden',
    'vrc_pt_2024_arden_csp',
    'vrc_pt_2024_cadenza',
    'vrc_pt_2024_cadenza_csp',
    'vrc_pt_2024_ferrenzo',
    'vrc_pt_2024_ferrenzo_csp',
    'vrc_pt_2024_isola',
    'vrc_pt_2024_isola_csp',
  ],
  [CarSpec.LMH_RSS]: [
    'rss_mph_bayer_hybrid_v8',
    'rss_mph_callahan_v8',
    'rss_mph_lanzo_v8_evo',
    'rss_mph_protech_p96_v8',
  ],
  [CarSpec.LMH_YZD]: [
    'yzd_cadillac_v_lmdh',
    'yzd_vanwall_vandervell_680',
  ],
  [CarSpec.LMP1_2012]: [
    'yzd_audi_r18_etron_2012',
  ],
  [CarSpec.LMP1_2014]: [
    'ks_audi_r18_etron_quattro',
    'ks_toyota_ts040',
  ],
  [CarSpec.LMP1_2016]: [
    'ks_porsche_919_hybrid_2015',
    'ks_porsche_919_hybrid_2016',
  ],
  [CarSpec.LMP2_2017]: [
    'lmp2_ligier_jsp217',
    'yzd_oreca_07_2017',
    'yzd_oreca_07_imsa',
  ],
  [CarSpec.LMP2_2021]: [
    'acf_oreca_07',
    'urd_loire07_21',
    'yzd_oreca_07_2021',
    'yzd_oreca_07_2022',
  ],
  [CarSpec.GROUP_C]: [
    'ks_mercedes_c9',
    'ks_mazda_787b',
    'ks_porsche_962c_longtail',
    'ks_porsche_962c_shorttail',
  ],
  [CarSpec.SPORTS_PROTOTYPE_60S]: [
    'ks_ford_gt40',
    'ks_ferrari_330_p4',
    'ks_porsche_908_lh',
  ],
  [CarSpec.GT1_1990S]: [
    'ks_porsche_911_gt1',
    'ks_mclaren_f1_gtr',
    'rss_lmgt_nisumo_r39_v8',
    'rss_lmgt_toyama_2zero_v8',
    'urd_mercedes_clr_lm',
  ],
  [CarSpec.GT1_2000S]: [
    'ks_maserati_mc12_gt1',
    'rss_gt_adonis_d9_v12',
    'rss_gt_ferruccio_55',
    'rss_gt_ferruccio_57',
    'rss_gt_lanzo_v12',
    'rss_gt_shadow_v8',
    'rss_gt_tornado_v12',
    'rss_gt_vortex_v10',
  ],
  [CarSpec.GT2]: [
    'gue_audi_r8_lms_gt2',
    'gue_bmw_m2_gt2',
    'gue_gt2_rs_clubsport',
    'gue_ferrari_488_challange_gt2',
    'gue_brabham_bt63_gt2',
    'gue_ktm_xbow_gt2',
    'gue_liana_gt2',
    'gue_935_gt2',
    'gue_maserati_mc20_gt2',
    'gue_lamborghini_huracan_st_evo2',
    'gue_amg_gt2',
  ],
  [CarSpec.GT3_2010S]: [
    'ks_audi_r8_lms_2016',
    'ks_ferrari_488_gt3',
    'ks_porsche_911_gt3_r_2016',
    'mclaren_mp412c_gt3',
    'ks_mclaren_650_gt3',
    'ks_mercedes_amg_gt3',
    'mercedes_sls_gt3',
    'bmw_z4_gt3',
  ],
  [CarSpec.GT3_2010S_PLUS]: [
    'ks_audi_r8_lms',
    'ks_nissan_gtr_gt3',
    'ks_lamborghini_huracan_gt3',
  ],
  [CarSpec.GT3_LFM]: [
    'ac_friends_honda_nsx_gt3_evo',
    'acf_aston_martin_vantage_gt3_evo',
    'bentley_continental_gt3_18',
    'bm_amg_evo_2020_gt3',
    'bm_nissan_gtr_gt3',
    'corvette_z06_gt3_2024',
    'ford_mustang_gt3_2024',
    'fsr_audi_lms_evo_2_gt3',
    'ks_bmw_m4_gt3_2022',
    'ks_ferrari_296_gt3_2023',
    'lamborghini_huracan_evo2_gt3',
    'mclaren_720s_gt3_evo',
    'ng_lexus_r_cf_gt3',
    'porsche_992_gt3_r_2023',
  ],
  [CarSpec.GT3_RSS]: [
    'rss_gtm_adonis_v8_evo',
    'rss_gtm_aero_v10_evo2',
    'rss_gtm_akuro_v6_evo2',
    'rss_gtm_bayer_i6_evo',
    'rss_gtm_bayer_v8',
    'rss_gtm_cortex_v8',
    'rss_gtm_furiano_96_v6',
    'rss_gtm_hyperion_v8',
    'rss_gtm_lanzo_v10',
    'rss_gtm_lanzo_v10_evo2',
    'rss_gtm_lanzo_v8',
    'rss_gtm_lux_v8',
    'rss_gtm_lux_v8_evo',
    'rss_gtm_macca_72_evo_v8',
    'rss_gtm_mercer_v8',
    'rss_gtm_protech_p92_f6',
  ],
  [CarSpec.E1_XP2]: [
    'p4-5_2011',
  ],
  [CarSpec.SPX]: [
    'ks_glickenhaus_scg003',
  ],
  [CarSpec.GT4]: [
    'gt4_alpine_a110',
    'gt4_aston_martin_vantage',
    'gt4_audi_r8',
    'gt4_bmw_m4',
    'gt4_bmw_m4_g82',
    'gt4_camaro',
    'gt4_ford_mustang',
    'gt4_ginetta_g55',
    'gt4_ktm_xbow',
    'gt4_mclaren_570s',
    'gt4_mercedes_amg',
    'gt4_mercedes_amg_evo',
    'gt4_panoz_avezzano',
    'gt4_porsche_cayman_718',
    'gt4_saleen_s1',
    'gt4_sin_r1',
    'gt4_toyota_supra',
    'ks_maserati_gt_mc_gt4',
    'toyota_supra_gt4_cup_2019',
  ],
  [CarSpec.GTE_2011]: [
    'bmw_m3_gt2',
    'ferrari_458_gt2',
  ],
  [CarSpec.GTE_2017]: [
    'ks_corvette_c7r',
    'ks_porsche_911_rsr_2017',
    'yzd_porsche_911_rsr_gte_2018',
    'yzd_ferrari_488_gte',
    'yzd_ferrari_488_gte_lm',
    'yzd_ferrari_488_gte_evo',
    'yzd_ferrari_488_gte_evo_lm',
    'Yzd_Aston_Martin_V8_Vantage_GTE',
  ],
  [CarSpec.GTE_2020S]: [
    'urd_amr_egt_2019_v2',
    'urd_bayro_egt_2018',
    'urd_darche_egt_2020',
    'urd_darche_egt_2020_sprint',
    'urd_darche_egt_2021',
    'urd_darche_egt_2021_sprint',
    'urd_detroit_egt_2019',
    'urd_ferrucci_448t_egt',
    'urd_michigan_egt',
  ],
  [CarSpec.GTE_LOTUS]: [
    'lotus_evora_gte',
    'lotus_evora_gte_carbon',
  ],
  [CarSpec.N_GT]: [
    'rss_gtn_ferruccio_36',
    'rss_gtn_furiano_36',
    'rss_gtn_protech_96',
  ],
  [CarSpec.PORSCHE_CUP_991]: [
    'ks_porsche_911_gt3_cup_2017',
  ],
  [CarSpec.PORSCHE_CUP_992_LFM]: [
    'lrs_porsche_911_992_gt3_cup',
  ],
  [CarSpec.PORSCHE_CUP_992_URD]: [
    'urd_darche_cup_2021',
  ],
  [CarSpec.PORSCHE_CUP_992_GUERILLA]: [
    'gue_porsche_911_gt3_cup_992',
  ],
  [CarSpec.DTM_1992]: [
    'bmw_m3_e30_dtm',
    'ks_alfa_romeo_155_v6',
    'ks_mercedes_190_evo2',
  ],
  [CarSpec.DTM_2021_RSS]: [
    'rss_gtm_bayer_v8',
    'rss_gtm_lanzo_v10',
    'rss_gtm_mercer_v8',
  ],
  [CarSpec.DTM_2025_LFM]: [
    'acf_aston_martin_vantage_gt3_evo',
    'fsr_audi_lms_evo_2_gt3',
    'ks_bmw_m4_gt3_2022',
    'ks_ferrari_296_gt3_2023',
    'ford_mustang_gt3_2024',
    'lamborghini_huracan_evo2_gt3',
    'mclaren_720s_gt3_evo',
    'bm_amg_evo_2020_gt3',
    'porsche_992_gt3_r_2023',
  ],
  [CarSpec.DTM_2025_RSS]: [
    'rss_gtm_adonis_v8_evo',
    'rss_gtm_aero_v10_evo2',
    'rss_gtm_bayer_i6_evo',
    'rss_gtm_furiano_96_v6',
    'rss_gtm_hyperion_v8',
    'rss_gtm_lanzo_v10_evo2',
    'rss_gtm_macca_72_evo_v8',
    'rss_gtm_mercer_v8',
    'rss_gtm_protech_p92_f6',
  ],
  [CarSpec.TCR_2024]: [
    'fw_audi_rs3_tcr_2024',
    'fw_cupra_tcr_2024',
    'fw_elantra_tcr_2024',
  ],
};
