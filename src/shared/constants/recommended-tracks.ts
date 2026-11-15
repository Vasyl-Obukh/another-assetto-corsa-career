// Every circuit the shipped championships race, Kunos' own among them, each
// layout with the folders known to be it, best first. A round names its
// layout's id, and whichever of those folders is installed races it - else
// Kunos' version where there is one - so a redistributor renaming a layout is
// one more line here, nothing stored changes, and a track the player chooses
// for a layout races every round there. Lengths are the real layouts', which a
// guess is measured against.

import type { RecommendedCircuit } from '../types/index.ts';

/**
 * Every recommended circuit, by name.
 */
export const RECOMMENDED_CIRCUITS: readonly RecommendedCircuit[] = [
  {
    id: 'adelaide',
    name: 'Adelaide',
    nation: 'AUS',
    layouts: [
      {
        id: 'adelaide/street',
        name: 'Street circuit',
        length: 3219,
        folders: ['adelaide2021/lfmv1', 'adelaide2021'],
      },
    ],
  },
  {
    id: 'albert-park',
    name: 'Albert Park',
    nation: 'AUS',
    layouts: [
      {
        id: 'albert-park/gp',
        name: 'Grand Prix',
        length: 5027,
        folders: ['melbourne_2019'],
      },
    ],
  },
  {
    id: 'mexico-city',
    name: 'Autodromo Hermanos Rodriguez',
    nation: 'MEX',
    layouts: [
      {
        id: 'mexico-city/gp',
        name: 'Grand Prix',
        length: 4304,
        folders: ['acu_mexico_2021/lfm_nodrs', 'vrc_mexico/fa_layout', 'acu_mexico_2021'],
      },
      {
        id: 'mexico-city/fe',
        name: 'Formula E',
        length: 2628,
        folders: ['vrc_mexico/fl_layout'],
      },
    ],
  },
  {
    id: 'puebla',
    name: 'Autodromo Miguel E. Abed',
    nation: 'MEX',
    layouts: [
      {
        id: 'puebla/fe',
        name: 'Formula E',
        length: 2982,
        folders: ['aa_puebla_full/road'],
      },
    ],
  },
  {
    id: 'bahrain',
    name: 'Bahrain International Circuit',
    nation: 'BHR',
    layouts: [
      {
        id: 'bahrain/gp',
        name: 'Grand Prix',
        length: 5412,
        folders: ['fn_bahrain/gp', 'fn_bahrain/gp_lfm', 'fn_bahrain/gp_shortroll'],
      },
      {
        id: 'bahrain/outer',
        name: 'Outer circuit',
        length: 3543,
        folders: ['fn_bahrain/outer'],
      },
      {
        id: 'bahrain/endurance',
        name: 'Endurance',
        length: 6299,
        folders: ['fn_bahrain/endurance'],
      },
    ],
  },
  {
    id: 'baku',
    name: 'Baku City Circuit',
    nation: 'AZE',
    layouts: [
      {
        id: 'baku/gp',
        name: 'Grand Prix',
        length: 6003,
        folders: ['baku_2019/layout_f1_2026', 'baku_2022'],
      },
    ],
  },
  {
    id: 'barcelona',
    name: 'Barcelona-Catalunya',
    nation: 'ESP',
    layouts: [
      {
        id: 'barcelona/gp',
        name: 'Grand Prix, 2023 on',
        length: 4727,
        folders: ['fn_barcelona/barcelona_2023_48_pits_lfm_nodrs_v2', 'fn_barcelona/barcelona_2023', 'fn_barcelona/barcelona_gp_2023'],
        kunos: 'ks_barcelona/layout_gp',
      },
      {
        id: 'barcelona/gp-2007',
        name: 'Grand Prix, 2007-2022',
        length: 4655,
        folders: [],
        kunos: 'ks_barcelona/layout_gp',
      },
      {
        id: 'barcelona/moto',
        name: 'Moto',
        length: 4727,
        folders: [],
        kunos: 'ks_barcelona/layout_moto',
      },
    ],
  },
  {
    id: 'brands-hatch',
    name: 'Brands Hatch',
    nation: 'GBR',
    layouts: [
      {
        id: 'brands-hatch/gp',
        name: 'Grand Prix',
        length: 3908,
        folders: ['ks_brands_hatch/gp_osrw'],
        kunos: 'ks_brands_hatch/gp',
      },
      {
        id: 'brands-hatch/indy',
        name: 'Indy',
        length: 1929,
        folders: [],
        kunos: 'ks_brands_hatch/indy',
      },
    ],
  },
  {
    id: 'brasilia',
    name: 'Brasilia',
    nation: 'BRA',
    layouts: [
      {
        id: 'brasilia/full',
        name: 'Full circuit',
        length: 5476,
        folders: ['acf_brasilia/acf_brasilia_normal'],
      },
    ],
  },
  {
    id: 'cadwell',
    name: 'Cadwell Park',
    nation: 'GBR',
    layouts: [
      {
        id: 'cadwell/full',
        name: 'Full circuit',
        length: 3450,
        folders: ['cadwell/gpzfr', 'cadwell/gp'],
      },
    ],
  },
  {
    id: 'campo-grande',
    name: 'Campo Grande',
    nation: 'BRA',
    layouts: [
      {
        id: 'campo-grande/full',
        name: 'Full circuit',
        length: 3533,
        folders: ['db_campo_grande/maior'],
      },
    ],
  },
  {
    id: 'cascavel',
    name: 'Cascavel',
    nation: 'BRA',
    layouts: [
      {
        id: 'cascavel/full',
        name: 'Full circuit',
        length: 3058,
        folders: ['vhe_cascavel'],
      },
    ],
  },
  {
    id: 'charade',
    name: 'Charade',
    nation: 'FRA',
    layouts: [
      {
        id: 'charade/4km',
        name: '4 km',
        length: 3975,
        folders: ['circuit_charade2023/charade2023_4km'],
      },
      {
        id: 'charade/8km',
        name: '8 km',
        length: 8055,
        folders: ['circuit_charade2023/charade2023_8km'],
      },
    ],
  },
  {
    id: 'bugatti',
    name: 'Circuit Bugatti',
    nation: 'FRA',
    layouts: [
      {
        id: 'bugatti/gp',
        name: 'Grand Prix',
        length: 4185,
        folders: ['bugatti_GPE2023/lfm_standing', 'bugatti_GPE2023/lfm_rolling'],
      },
    ],
  },
  {
    id: 'le-mans',
    name: 'Circuit de la Sarthe',
    nation: 'FRA',
    layouts: [
      {
        id: 'le-mans/24h',
        name: '24 Hours',
        length: 13626,
        folders: ['sx_lemans_lfm/chicane', 'lemans_2017/no_lights'],
      },
      {
        id: 'le-mans/no-chicanes',
        name: 'Without chicanes',
        length: 13100,
        folders: ['sx_lemans_lfm/nochicane', 'lemans_2017/nochic_no_lights'],
      },
    ],
  },
  {
    id: 'montreal',
    name: 'Circuit Gilles Villeneuve',
    nation: 'CAN',
    layouts: [
      {
        id: 'montreal/gp',
        name: 'Grand Prix',
        length: 4361,
        folders: ['canada_2021/lfm', 'canada_2021', 'canada_2021/lfm-zfr', 'canada_2021/lfm_shortroll'],
      },
    ],
  },
  {
    id: 'cota',
    name: 'Circuit of the Americas',
    nation: 'USA',
    layouts: [
      {
        id: 'cota/gp',
        name: 'Grand Prix',
        length: 5513,
        folders: ['acu_unitedstates', 'acu_unitedstates/a', 'acu_unitedstates/a_lfm'],
      },
    ],
  },
  {
    id: 'croft',
    name: 'Croft',
    nation: 'GBR',
    layouts: [
      {
        id: 'croft/full',
        name: 'Full circuit',
        length: 3436,
        folders: ['zw_croft/full', 'zw_croft/full_lfm'],
      },
    ],
  },
  {
    id: 'curitiba',
    name: 'Curitiba',
    nation: 'BRA',
    layouts: [
      {
        id: 'curitiba/full',
        name: 'Full circuit',
        length: 3707,
        folders: ['vhe_curitiba'],
      },
    ],
  },
  {
    id: 'curvelo',
    name: 'Curvelo, Circuito dos Cristais',
    nation: 'BRA',
    layouts: [
      {
        id: 'curvelo/full',
        name: 'Full circuit',
        length: 4420,
        folders: ['trcb_curvelo'],
      },
    ],
  },
  {
    id: 'daytona',
    name: 'Daytona',
    nation: 'USA',
    layouts: [
      {
        id: 'daytona/oval',
        name: 'Tri-oval',
        length: 4023,
        folders: ['rt_daytona/tri-oval'],
      },
      {
        id: 'daytona/road',
        name: 'Road course',
        length: 5729,
        folders: ['rt_daytona/sportscar', 'rt_daytona/sportscar_m4x', 'rt_daytona/sportscar_m4x_lfm_nodrs'],
      },
    ],
  },
  {
    id: 'donington',
    name: 'Donington Park',
    nation: 'GBR',
    layouts: [
      {
        id: 'donington/gp',
        name: 'Grand Prix',
        length: 4020,
        folders: ['rj_doningtonpark2023/gphr', 'rj_doningtonpark2023/gp'],
      },
      {
        id: 'donington/national',
        name: 'National',
        length: 3185,
        folders: ['rj_doningtonpark2023/nationalhr_LFM', 'rj_doningtonpark2023/national'],
      },
    ],
  },
  {
    id: 'estoril',
    name: 'Estoril',
    nation: 'PRT',
    layouts: [
      {
        id: 'estoril/gp',
        name: 'Grand Prix',
        length: 4138,
        folders: ['estoril_2021/estoril_gp', 'estoril_2021/estoril_gp_lfm'],
      },
      {
        id: 'estoril/no-chicane',
        name: 'Without chicane',
        length: 4130,
        folders: ['estoril_2021/estoril_no_chicane', 'estoril_2021/estoril_no_chicane_lfm'],
      },
    ],
  },
  {
    id: 'fuji',
    name: 'Fuji Speedway',
    nation: 'JPN',
    layouts: [
      {
        id: 'fuji/gp',
        name: 'Grand Prix',
        length: 4549,
        folders: ['rt_fuji_speedway/layout_gp', 'rt_fuji_speedway/layout_gp_lfmv2', 'rt_fuji_speedway/layout_gp_lfm_nodrs'],
      },
      {
        id: 'fuji/gp-short',
        name: 'Grand Prix, short',
        length: 4526,
        folders: ['rt_fuji_speedway/layout_gpshort', 'rt_fuji_speedway/layout_gpshort_lfmv2'],
      },
    ],
  },
  {
    id: 'goiania',
    name: 'Goiania',
    nation: 'BRA',
    layouts: [
      {
        id: 'goiania/mixed',
        name: 'Mixed circuit',
        length: 3835,
        folders: ['vhe_goiania/layout_standard'],
      },
      {
        id: 'goiania/external',
        name: 'External circuit',
        length: 2590,
        folders: ['vhe_goiania/layout_external'],
      },
    ],
  },
  {
    id: 'hockenheim',
    name: 'Hockenheim',
    nation: 'DEU',
    layouts: [
      {
        id: 'hockenheim/gp',
        name: 'Grand Prix',
        length: 4574,
        folders: ['vhe_hockenheim/gp_mx_zfr_nodrs', 'vhe_hockenheim/gp', 'vhe_hockenheim/gp_mx'],
      },
      {
        id: 'hockenheim/national',
        name: 'National',
        length: 3692,
        folders: ['vhe_hockenheim/national'],
      },
    ],
  },
  {
    id: 'hungaroring',
    name: 'Hungaroring',
    nation: 'HUN',
    layouts: [
      {
        id: 'hungaroring/gp',
        name: 'Grand Prix',
        length: 4381,
        folders: ['rt_hungaroring', 'rt_hungaroring/lfm_nodrs'],
      },
    ],
  },
  {
    id: 'imola',
    name: 'Imola',
    nation: 'ITA',
    layouts: [
      {
        id: 'imola/gp',
        name: 'Grand Prix',
        length: 4909,
        folders: ['fn_imola/lfm', 'fn_imola'],
        kunos: 'imola',
      },
    ],
  },
  {
    id: 'indianapolis',
    name: 'Indianapolis',
    nation: 'USA',
    layouts: [
      {
        id: 'indianapolis/road',
        name: 'Road course',
        length: 4018,
        folders: ['indianapolis_sp/road'],
      },
      {
        id: 'indianapolis/oval',
        name: 'Oval',
        length: 4064,
        folders: ['indianapolis_sp'],
      },
    ],
  },
  {
    id: 'interlagos',
    name: 'Interlagos',
    nation: 'BRA',
    layouts: [
      {
        id: 'interlagos/gp',
        name: 'Grand Prix',
        length: 4309,
        folders: ['vhe_interlagos/acf_gp', 'vhe_interlagos/acf_gp_lfm', 'vhe_interlagos/gp'],
      },
    ],
  },
  {
    id: 'istanbul',
    name: 'Istanbul Park',
    nation: 'TUR',
    layouts: [
      {
        id: 'istanbul/gp-2005',
        name: 'Grand Prix, 2005',
        length: 5338,
        folders: ['rj_istanbul_park/layout_f1_2005'],
      },
      {
        id: 'istanbul/gp-2020',
        name: 'Grand Prix, 2020',
        length: 5338,
        folders: ['rj_istanbul_park/layout_f1_2020'],
      },
    ],
  },
  {
    id: 'jeddah',
    name: 'Jeddah Corniche',
    nation: 'SAU',
    layouts: [
      {
        id: 'jeddah/gp',
        name: 'Grand Prix',
        length: 6174,
        folders: ['jeddah_2021_chq/jeddah_f1_2024'],
      },
    ],
  },
  {
    id: 'jerez',
    name: 'Jerez',
    nation: 'ESP',
    layouts: [
      {
        id: 'jerez/gp',
        name: 'Grand Prix',
        length: 4428,
        folders: ['jerez_2010'],
      },
    ],
  },
  {
    id: 'knockhill',
    name: 'Knockhill',
    nation: 'SCT',
    layouts: [
      {
        id: 'knockhill/full',
        name: 'Full circuit',
        length: 2092,
        folders: ['knockhill2017/knockhill', 'knockhill2017/knockhill_lfm'],
      },
    ],
  },
  {
    id: 'kyalami',
    name: 'Kyalami',
    nation: 'ZAF',
    layouts: [
      {
        id: 'kyalami/gp',
        name: 'Grand Prix',
        length: 4522,
        folders: ['kyalami_2016/gt_challenge_lfm', 'kyalami_2016/gt_challenge'],
      },
    ],
  },
  {
    id: 'laguna-seca',
    name: 'Laguna Seca',
    nation: 'USA',
    layouts: [
      {
        id: 'laguna-seca/full',
        name: 'Full course',
        length: 3602,
        folders: ['ks_laguna_seca/laguna_seca_osrw'],
        kunos: 'ks_laguna_seca',
      },
    ],
  },
  {
    id: 'las-vegas',
    name: 'Las Vegas Strip Circuit',
    nation: 'USA',
    layouts: [
      {
        id: 'las-vegas/gp',
        name: 'Grand Prix',
        length: 6201,
        folders: ['lasvegas23/layout_f1_2025'],
      },
    ],
  },
  {
    id: 'lausitzring',
    name: 'Lausitzring',
    nation: 'DEU',
    layouts: [
      {
        id: 'lausitzring/gp',
        name: 'Grand Prix',
        length: 4255,
        folders: ['tmm_lausitzring/layout_dtm21'],
      },
    ],
  },
  {
    id: 'lime-rock',
    name: 'Lime Rock Park',
    nation: 'USA',
    layouts: [
      {
        id: 'lime-rock/full',
        name: 'Full circuit',
        length: 2414,
        folders: ['rt_lime_rock_park/no_chicane'],
      },
    ],
  },
  {
    id: 'londrina',
    name: 'Londrina',
    nation: 'BRA',
    layouts: [
      {
        id: 'londrina/full',
        name: 'Full circuit',
        length: 3145,
        folders: ['vhe_londrina/long'],
      },
      {
        id: 'londrina/short',
        name: 'Short circuit',
        length: 3055,
        folders: ['vhe_londrina/standard'],
      },
    ],
  },
  {
    id: 'long-beach',
    name: 'Long Beach',
    nation: 'USA',
    layouts: [
      {
        id: 'long-beach/street',
        name: 'Street circuit',
        length: 3167,
        folders: ['t21_long_beach_nrms'],
      },
    ],
  },
  {
    id: 'losail',
    name: 'Losail',
    nation: 'QAT',
    layouts: [
      {
        id: 'losail/gp',
        name: 'Grand Prix',
        length: 5400,
        folders: ['losail23/lfm', 'losail23'],
      },
    ],
  },
  {
    id: 'madring',
    name: 'Madring',
    nation: 'ESP',
    layouts: [
      {
        id: 'madring/gp',
        name: 'Grand Prix',
        length: 5474,
        folders: ['madrid_street_circuit_2026'],
      },
    ],
  },
  {
    id: 'magione',
    name: 'Magione',
    nation: 'ITA',
    layouts: [
      {
        id: 'magione/full',
        name: 'Full circuit',
        length: 2507,
        folders: [],
        kunos: 'magione',
      },
    ],
  },
  {
    id: 'magny-cours',
    name: 'Magny-Cours',
    nation: 'FRA',
    layouts: [
      {
        id: 'magny-cours/gp',
        name: 'Grand Prix',
        length: 4411,
        folders: ['magnycours22', 'magny_cours'],
      },
    ],
  },
  {
    id: 'marina-bay',
    name: 'Marina Bay',
    nation: 'SGP',
    layouts: [
      {
        id: 'marina-bay/gp',
        name: 'Grand Prix, 2023 on',
        length: 4094,
        folders: ['singapore_2020/er_singapore_2025'],
      },
      {
        id: 'marina-bay/gp-2008',
        name: 'Grand Prix, to 2022',
        length: 5063,
        folders: ['singapore_2020'],
      },
    ],
  },
  {
    id: 'miami',
    name: 'Miami International Autodrome',
    nation: 'USA',
    layouts: [
      {
        id: 'miami/gp',
        name: 'Grand Prix',
        length: 5412,
        folders: ['miami_f1/layout_f1_2026'],
      },
    ],
  },
  {
    id: 'mid-ohio',
    name: 'Mid-Ohio',
    nation: 'USA',
    layouts: [
      {
        id: 'mid-ohio/full',
        name: 'Full course',
        length: 3634,
        folders: ['zw_midohio/nc'],
      },
    ],
  },
  {
    id: 'misano',
    name: 'Misano',
    nation: 'ITA',
    layouts: [
      {
        id: 'misano/gp',
        name: 'Grand Prix',
        length: 4011,
        folders: ['rt_misano/lfm', 'rt_misano'],
      },
    ],
  },
  {
    id: 'monaco',
    name: 'Monaco',
    nation: 'MCO',
    layouts: [
      {
        id: 'monaco/gp',
        name: 'Grand Prix',
        length: 3340,
        // monaco_2020's season layouts have 30 boxes to the older monaco mod's 22,
        // enough for the 24- to 30-car grids.
        folders: [
          'monaco_2020/monaco_f1_2026',
          'monaco_2020/monaco_f1_2025',
          'monaco_2020/monaco_f1_2024',
          'monaco_2020/monaco_f1_2023',
          'monaco_2020/monaco_f1_2022',
          'monaco',
        ],
      },
    ],
  },
  {
    id: 'mont-tremblant',
    name: 'Mont-Tremblant',
    nation: 'CAN',
    layouts: [
      {
        id: 'mont-tremblant/no-chicane',
        name: 'Without chicane',
        length: 4260,
        folders: ['rt_mont_tremblant/no_chicane', 'rt_mont_tremblant/no_chicane-lfm'],
      },
    ],
  },
  {
    id: 'monza',
    name: 'Monza',
    nation: 'ITA',
    layouts: [
      {
        id: 'monza/gp',
        name: 'Grand Prix',
        length: 5793,
        folders: ['monza/lfm', 'monza/lfmv2'],
        kunos: 'monza',
      },
      {
        id: 'monza/1966-road',
        name: 'Road course, 1966',
        length: 5793,
        folders: [],
        kunos: 'ks_monza66/road',
      },
      {
        id: 'monza/1966-full',
        name: 'Full course, 1966',
        length: 10000,
        folders: [],
        kunos: 'ks_monza66/full',
      },
    ],
  },
  {
    id: 'bathurst',
    name: 'Mount Panorama',
    nation: 'AUS',
    layouts: [
      {
        id: 'bathurst/full',
        name: 'Full circuit',
        length: 6213,
        folders: ['rt_bathurst'],
      },
    ],
  },
  {
    id: 'mugello',
    name: 'Mugello',
    nation: 'ITA',
    layouts: [
      {
        id: 'mugello/gp',
        name: 'Grand Prix',
        length: 5245,
        folders: [],
        kunos: 'mugello',
      },
    ],
  },
  {
    id: 'nordschleife',
    name: 'Nordschleife',
    nation: 'DEU',
    layouts: [
      {
        id: 'nordschleife/full',
        name: 'Nordschleife',
        length: 20832,
        folders: [],
        kunos: 'ks_nordschleife/nordschleife',
      },
      {
        id: 'nordschleife/endurance',
        name: 'Endurance',
        length: 25378,
        folders: [],
        kunos: 'ks_nordschleife/endurance',
      },
      {
        id: 'nordschleife/endurance-cup',
        name: 'Endurance Cup',
        length: 24433,
        folders: [],
        kunos: 'ks_nordschleife/endurance_cup',
      },
    ],
  },
  {
    id: 'norisring',
    name: 'Norisring',
    nation: 'DEU',
    layouts: [
      {
        id: 'norisring/full',
        name: 'Full circuit',
        length: 2170,
        folders: ['norisring'],
      },
    ],
  },
  {
    id: 'nurburgring',
    name: 'Nurburgring',
    nation: 'DEU',
    layouts: [
      {
        id: 'nurburgring/gp',
        name: 'Grand Prix',
        length: 5148,
        folders: [],
        kunos: 'ks_nurburgring/layout_gp_a',
      },
      {
        id: 'nurburgring/gp-gt',
        name: 'Grand Prix (GT)',
        length: 5137,
        folders: ['ks_nurburgring/layout_gp_b_osrw_lfm_tracklimits', 'ks_nurburgring/layout_gp_b_osrw'],
        kunos: 'ks_nurburgring/layout_gp_b',
      },
      {
        id: 'nurburgring/sprint-gt',
        name: 'Sprint (GT)',
        length: 3618,
        folders: [],
        kunos: 'ks_nurburgring/layout_sprint_b',
      },
    ],
  },
  {
    id: 'okayama',
    name: 'Okayama',
    nation: 'JPN',
    layouts: [
      {
        id: 'okayama/gp',
        name: 'Grand Prix',
        length: 3703,
        folders: ['okayama/circuit_gp'],
      },
    ],
  },
  {
    id: 'oschersleben',
    name: 'Oschersleben',
    nation: 'DEU',
    layouts: [
      {
        id: 'oschersleben/gp',
        name: 'Grand Prix',
        length: 3696,
        folders: ['tmm_oschersleben/layout_gp'],
      },
    ],
  },
  {
    id: 'osterreichring',
    name: 'Osterreichring',
    nation: 'AUT',
    layouts: [
      {
        id: 'osterreichring/gp',
        name: 'Grand Prix, to 1995',
        length: 5942,
        folders: ['zw_spielberg1977'],
      },
    ],
  },
  {
    id: 'oulton-park',
    name: 'Oulton Park',
    nation: 'GBR',
    layouts: [
      {
        id: 'oulton-park/international',
        name: 'International',
        length: 4293,
        folders: ['rt_oulton_park/international'],
      },
      {
        id: 'oulton-park/island',
        name: 'Island',
        length: 3541,
        folders: ['rt_oulton_park/island'],
      },
    ],
  },
  {
    id: 'paul-ricard',
    name: 'Paul Ricard',
    nation: 'FRA',
    layouts: [
      {
        id: 'paul-ricard/gp',
        name: 'Grand Prix',
        length: 5752,
        folders: ['paul_ricard/lfm', 'paul_ricard/blancpain'],
      },
    ],
  },
  {
    id: 'phillip-island',
    name: 'Phillip Island',
    nation: 'AUS',
    layouts: [
      {
        id: 'phillip-island/gp',
        name: 'Grand Prix',
        length: 4450,
        folders: ['phillip_island_2013/lfm', 'phillip_island_2013'],
      },
    ],
  },
  {
    id: 'portimao',
    name: 'Portimao',
    nation: 'PRT',
    layouts: [
      {
        id: 'portimao/gp',
        name: 'Grand Prix',
        length: 4653,
        folders: ['algarve_portimao_2023/lfm_standing', 'algarve_portimao_2023/lfm_nodrs', 'algarve_portimao_2023/lfm_shortroll', 'algarve_portimao_2023'],
      },
    ],
  },
  {
    id: 'portland',
    name: 'Portland International Raceway',
    nation: 'USA',
    layouts: [
      {
        id: 'portland/fe',
        name: 'Formula E',
        length: 3155,
        folders: ['rj_portland_int/chicane'],
      },
    ],
  },
  {
    id: 'red-bull-ring',
    name: 'Red Bull Ring',
    nation: 'AUT',
    layouts: [
      {
        id: 'red-bull-ring/gp',
        name: 'Grand Prix',
        length: 4326,
        folders: [],
        kunos: 'ks_red_bull_ring/layout_gp',
      },
    ],
  },
  {
    id: 'valencia',
    name: 'Ricardo Tormo',
    nation: 'ESP',
    layouts: [
      {
        id: 'valencia/gp',
        name: 'Grand Prix',
        length: 4005,
        folders: ['fn_valencia/gp', 'fn_valencia/gp_lfm'],
      },
    ],
  },
  {
    id: 'road-america',
    name: 'Road America',
    nation: 'USA',
    layouts: [
      {
        id: 'road-america/full',
        name: 'Full course',
        length: 6515,
        folders: ['lilski_road_america', 'lilski_road_america/gp_lfm'],
      },
    ],
  },
  {
    id: 'road-atlanta',
    name: 'Road Atlanta',
    nation: 'USA',
    layouts: [
      {
        id: 'road-atlanta/gp',
        name: 'Grand Prix',
        length: 4088,
        folders: ['road_atlanta2018/grandprix'],
      },
    ],
  },
  {
    id: 'sachsenring',
    name: 'Sachsenring',
    nation: 'DEU',
    layouts: [
      {
        id: 'sachsenring/gp',
        name: 'Grand Prix',
        length: 3671,
        folders: ['g333_sachsenring_2022/lfm_event'],
      },
    ],
  },
  {
    id: 'salzburgring',
    name: 'Salzburgring',
    nation: 'AUT',
    layouts: [
      {
        id: 'salzburgring/full',
        name: 'Full circuit',
        length: 4255,
        folders: ['salzburgring/zfr', 'salzburgring'],
      },
    ],
  },
  {
    id: 'sebring',
    name: 'Sebring',
    nation: 'USA',
    layouts: [
      {
        id: 'sebring/full',
        name: 'Full course',
        length: 6004,
        folders: ['mx_sebring/raceday_standing', 'mx_sebring/lfm_rollstart'],
      },
    ],
  },
  {
    id: 'sendai',
    name: 'Sendai Hi-Land',
    nation: 'JPN',
    layouts: [
      {
        id: 'sendai/gp',
        name: 'Grand Prix',
        length: 4030,
        folders: ['sendai_hiland/gp'],
      },
    ],
  },
  {
    id: 'sepang',
    name: 'Sepang',
    nation: 'MYS',
    layouts: [
      {
        id: 'sepang/gp',
        name: 'Grand Prix',
        length: 5543,
        folders: ['acu_sepang', 'acu_sepang/46_pits_lfm'],
      },
    ],
  },
  {
    id: 'shanghai',
    name: 'Shanghai International Circuit',
    nation: 'CHN',
    layouts: [
      {
        id: 'shanghai/gp',
        name: 'Grand Prix',
        length: 5451,
        folders: ['shanghai_v2/gp', 'shanghai_v2/gp_lfm', 'shanghai_v2/gp_lfm_nodrs'],
      },
      {
        id: 'shanghai/fe',
        name: 'Formula E',
        length: 3051,
        folders: ['shanghai_v2/fe'],
      },
    ],
  },
  {
    id: 'silverstone',
    name: 'Silverstone',
    nation: 'GBR',
    layouts: [
      {
        id: 'silverstone/gp',
        name: 'Grand Prix',
        length: 5901,
        folders: [],
        kunos: 'ks_silverstone/gp',
      },
      {
        id: 'silverstone/international',
        name: 'International',
        length: 3619,
        folders: [],
        kunos: 'ks_silverstone/international',
      },
      {
        id: 'silverstone/national',
        name: 'National',
        length: 2638,
        folders: [],
        kunos: 'ks_silverstone/national',
      },
      {
        id: 'silverstone/1967',
        name: 'Grand Prix, 1967',
        length: 4710,
        folders: [],
        kunos: 'ks_silverstone1967',
      },
    ],
  },
  {
    id: 'snetterton',
    name: 'Snetterton',
    nation: 'GBR',
    layouts: [
      {
        id: 'snetterton/300',
        name: '300',
        length: 4779,
        folders: ['snetterton2011/300pitfix', 'snetterton2011/300'],
      },
      {
        id: 'snetterton/200',
        name: '200',
        length: 3220,
        folders: ['snetterton2011/200pitfix', 'snetterton2011/200'],
      },
    ],
  },
  {
    id: 'sonoma',
    name: 'Sonoma',
    nation: 'USA',
    layouts: [
      {
        id: 'sonoma/indycar',
        name: 'IndyCar',
        length: 3838,
        folders: ['rt_sonoma/indy'],
      },
      {
        id: 'sonoma/long',
        name: 'Long',
        length: 4056,
        folders: ['rt_sonoma/long', 'rt_sonoma/long_lfm'],
      },
    ],
  },
  {
    id: 'spa',
    name: 'Spa-Francorchamps',
    nation: 'BEL',
    layouts: [
      {
        id: 'spa/gp',
        name: 'Grand Prix',
        length: 7004,
        folders: ['spa/2022_lfm_standing', 'spa/2022_lfm_rolling', 'spa/2022'],
        kunos: 'spa',
      },
    ],
  },
  {
    id: 'suzuka',
    name: 'Suzuka',
    nation: 'JPN',
    layouts: [
      {
        id: 'suzuka/gp',
        name: 'Grand Prix',
        length: 5807,
        folders: ['rt_suzuka/suzukagp_lfm_nodrs', 'rt_suzuka/suzukagp'],
      },
      {
        id: 'suzuka/east',
        name: 'East',
        length: 2243,
        folders: ['rt_suzuka/suzukaeast'],
      },
    ],
  },
  {
    id: 'taruma',
    name: 'Taruma',
    nation: 'BRA',
    layouts: [
      {
        id: 'taruma/full',
        name: 'Full circuit',
        length: 3039,
        folders: ['vhe_taruma'],
      },
    ],
  },
  {
    id: 'thruxton',
    name: 'Thruxton',
    nation: 'GBR',
    layouts: [
      {
        id: 'thruxton/full',
        name: 'Full circuit',
        length: 3800,
        folders: ['js_thruxton/lfm', 'js_thruxton'],
      },
    ],
  },
  {
    id: 'tsukuba',
    name: 'Tsukuba',
    nation: 'JPN',
    layouts: [
      {
        id: 'tsukuba/full',
        name: 'Full circuit',
        length: 2045,
        folders: ['ddm_gts_tsukuba/full_lfm', 'ddm_gts_tsukuba/full'],
      },
    ],
  },
  {
    id: 'assen',
    name: 'TT Circuit Assen',
    nation: 'NLD',
    layouts: [
      {
        id: 'assen/autosport',
        name: 'Autosport',
        length: 4555,
        folders: ['ne_ttassen/autosport', 'ne_ttassen/autosport_lfm'],
      },
    ],
  },
  {
    id: 'vallelunga',
    name: 'Vallelunga',
    nation: 'ITA',
    layouts: [
      {
        id: 'vallelunga/full',
        name: 'Full circuit',
        length: 4085,
        folders: [],
        kunos: 'ks_vallelunga/extended_circuit',
      },
      {
        id: 'vallelunga/classic',
        name: 'Classic',
        length: 3222,
        folders: [],
        kunos: 'ks_vallelunga/classic_circuit',
      },
    ],
  },
  {
    id: 'velocitta',
    name: 'Velo Citta',
    nation: 'BRA',
    layouts: [
      {
        id: 'velocitta/full',
        name: 'Full circuit',
        length: 3493,
        folders: ['vhe_velocitta/full'],
      },
    ],
  },
  {
    id: 'velopark',
    name: 'Velopark',
    nation: 'BRA',
    layouts: [
      {
        id: 'velopark/full',
        name: 'Full circuit',
        length: 2278,
        folders: ['vhe_velopark/standard'],
      },
    ],
  },
  {
    id: 'vir',
    name: 'Virginia International Raceway',
    nation: 'USA',
    layouts: [
      {
        id: 'vir/full',
        name: 'Full course',
        length: 5260,
        folders: ['vir/full course'],
      },
    ],
  },
  {
    id: 'watkins-glen',
    name: 'Watkins Glen',
    nation: 'USA',
    layouts: [
      {
        id: 'watkins-glen/boot',
        name: 'Boot',
        length: 5430,
        folders: ['lilski_watkins_glen/boot', 'lilski_watkins_glen/boot_lfm'],
      },
      {
        id: 'watkins-glen/boot-classic',
        name: 'Boot, classic',
        length: 5430,
        folders: ['lilski_watkins_glen/boot_classic'],
      },
      {
        id: 'watkins-glen/short-classic',
        name: 'Short, classic',
        length: 3950,
        folders: ['lilski_watkins_glen/short_classic'],
      },
    ],
  },
  {
    id: 'yas-marina',
    name: 'Yas Marina',
    nation: 'ARE',
    layouts: [
      {
        id: 'yas-marina/gp',
        name: 'Grand Prix',
        length: 5554,
        folders: ['yas_marina_2021/gp', 'yas_marina_2021/gp_lfm_standing', 'yas_marina_2021/gp_lfm_rolling'],
      },
      {
        id: 'yas-marina/gp-2009',
        name: 'Grand Prix, 2009-2020',
        length: 5554,
        folders: ['acu_yasmarina/gp'],
      },
    ],
  },
  {
    id: 'zandvoort',
    name: 'Zandvoort',
    nation: 'NLD',
    layouts: [
      {
        id: 'zandvoort/gp',
        name: 'Grand Prix',
        length: 4259,
        folders: ['zandvoort2023/2023_lfm_v2', 'zandvoort2023/2023', 'zandvoort2023/2023_Raceday'],
        kunos: 'ks_zandvoort',
      },
      {
        id: 'zandvoort/gp-1999',
        name: 'Grand Prix, 1999-2019',
        length: 4307,
        folders: [],
        kunos: 'ks_zandvoort',
      },
    ],
  },
  {
    id: 'zolder',
    name: 'Zolder',
    nation: 'BEL',
    layouts: [
      {
        id: 'zolder/gp',
        name: 'Grand Prix',
        length: 4011,
        folders: ['rt_zolder'],
      },
    ],
  },
];
