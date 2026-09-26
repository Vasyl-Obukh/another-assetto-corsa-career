// The nations a driver or a team may race under, which are exactly the flags
// Assetto Corsa ships in content/gui/NationFlags. A code AC has no flag for
// races flagless with nothing said, so the list is AC's rather than any
// standard's: ISO 3166-1 alpha-3, plus the four home nations of the UK.

/**
 * Every ISO nation AC has a flag for, by its alpha-3 code, with the alpha-2
 * code Intl names regions by.
 */
export const NATION_REGIONS: Readonly<Record<string, string>> = {
  ABW: 'AW', AFG: 'AF', AGO: 'AO', AIA: 'AI', ALB: 'AL', AND: 'AD', ARE: 'AE', ARG: 'AR', ARM: 'AM',
  ASM: 'AS', ATA: 'AQ', ATG: 'AG', AUS: 'AU', AUT: 'AT', AZE: 'AZ', BDI: 'BI', BEL: 'BE', BEN: 'BJ',
  BFA: 'BF', BGD: 'BD', BGR: 'BG', BHR: 'BH', BHS: 'BS', BIH: 'BA', BLR: 'BY', BLZ: 'BZ', BMU: 'BM',
  BOL: 'BO', BRA: 'BR', BRB: 'BB', BRN: 'BN', BTN: 'BT', BWA: 'BW', CAF: 'CF', CAN: 'CA', CCK: 'CC',
  CHE: 'CH', CHL: 'CL', CHN: 'CN', CIV: 'CI', CMR: 'CM', COD: 'CD', COG: 'CG', COK: 'CK', COL: 'CO',
  COM: 'KM', CPV: 'CV', CRI: 'CR', CUB: 'CU', CYM: 'KY', CYP: 'CY', CZE: 'CZ', DEU: 'DE', DJI: 'DJ',
  DMA: 'DM', DNK: 'DK', DOM: 'DO', DZA: 'DZ', ECU: 'EC', EGY: 'EG', ERI: 'ER', ESH: 'EH', ESP: 'ES',
  EST: 'EE', ETH: 'ET', FIN: 'FI', FJI: 'FJ', FRA: 'FR', FRO: 'FO', FSM: 'FM', GAB: 'GA', GBR: 'GB',
  GEO: 'GE', GGY: 'GG', GHA: 'GH', GIB: 'GI', GIN: 'GN', GMB: 'GM', GNB: 'GW', GNQ: 'GQ', GRC: 'GR',
  GRD: 'GD', GRL: 'GL', GTM: 'GT', GUM: 'GU', GUY: 'GY', HKG: 'HK', HND: 'HN', HRV: 'HR', HTI: 'HT',
  HUN: 'HU', IDN: 'ID', IMN: 'IM', IND: 'IN', IRL: 'IE', IRN: 'IR', IRQ: 'IQ', ISL: 'IS', ISR: 'IL',
  ITA: 'IT', JAM: 'JM', JEY: 'JE', JOR: 'JO', JPN: 'JP', KAZ: 'KZ', KEN: 'KE', KGZ: 'KG', KHM: 'KH',
  KIR: 'KI', KNA: 'KN', KOR: 'KR', KWT: 'KW', LAO: 'LA', LBN: 'LB', LBR: 'LR', LCA: 'LC', LIE: 'LI',
  LKA: 'LK', LSO: 'LS', LTU: 'LT', LUX: 'LU', LVA: 'LV', MAC: 'MO', MAR: 'MA', MCO: 'MC', MDA: 'MD',
  MDG: 'MG', MDV: 'MV', MEX: 'MX', MHL: 'MH', MKD: 'MK', MLI: 'ML', MLT: 'MT', MMR: 'MM', MNE: 'ME',
  MNG: 'MN', MOZ: 'MZ', MRT: 'MR', MSR: 'MS', MTQ: 'MQ', MUS: 'MU', MWI: 'MW', MYS: 'MY', NAM: 'NA',
  NCL: 'NC', NER: 'NE', NGA: 'NG', NIC: 'NI', NLD: 'NL', NOR: 'NO', NPL: 'NP', NRU: 'NR', NZL: 'NZ',
  OMN: 'OM', PAK: 'PK', PAN: 'PA', PER: 'PE', PHL: 'PH', PLW: 'PW', PNG: 'PG', POL: 'PL', PRI: 'PR',
  PRT: 'PT', PRY: 'PY', PYF: 'PF', QAT: 'QA', ROU: 'RO', RUS: 'RU', RWA: 'RW', SAU: 'SA', SDN: 'SD',
  SEN: 'SN', SGP: 'SG', SLB: 'SB', SLE: 'SL', SLV: 'SV', SMR: 'SM', SOM: 'SO', SRB: 'RS', STP: 'ST',
  SUR: 'SR', SVK: 'SK', SVN: 'SI', SWE: 'SE', SWZ: 'SZ', SYC: 'SC', SYR: 'SY', TCA: 'TC', TCD: 'TD',
  TGO: 'TG', THA: 'TH', TJK: 'TJ', TKM: 'TM', TLS: 'TL', TON: 'TO', TTO: 'TT', TUN: 'TN', TUR: 'TR',
  TUV: 'TV', TWN: 'TW', TZA: 'TZ', UGA: 'UG', UKR: 'UA', URY: 'UY', USA: 'US', UZB: 'UZ', VCT: 'VC',
  VEN: 'VE', VGB: 'VG', VIR: 'VI', VNM: 'VN', VUT: 'VU', WSM: 'WS', YEM: 'YE', ZAF: 'ZA', ZMB: 'ZM',
  ZWE: 'ZW',
};

/**
 * The four home nations AC flags separately from the United Kingdom, by their
 * English names. Intl names regions and not subdivisions, so nothing can
 * translate these but us.
 */
export const HOME_NATIONS: Readonly<Record<string, string>> = {
  ENG: 'England',
  NIR: 'Northern Ireland',
  SCT: 'Scotland',
  WLS: 'Wales',
};

/**
 * Every code a driver or a team may carry.
 */
export const NATION_CODES: readonly string[] = [
  ...Object.keys(NATION_REGIONS),
  ...Object.keys(HOME_NATIONS),
].sort();

/**
 * What mods write for a country that is not its English name, keyed lowercase.
 *
 * A car's or a track's country is free text, so the common abbreviations and
 * older names are read here rather than shown as nations of their own. A value
 * naming two countries at once - "Italy /USA" - is read as its first.
 */
export const COUNTRY_ALIASES: Readonly<Record<string, string>> = {
  usa: 'USA',
  'u.s.a.': 'USA',
  us: 'USA',
  'u.s.': 'USA',
  america: 'USA',
  'united states of america': 'USA',
  uk: 'GBR',
  'u.k.': 'GBR',
  'great britain': 'GBR',
  britain: 'GBR',
  holland: 'NLD',
  'the netherlands': 'NLD',
  'czech republic': 'CZE',
  'south korea': 'KOR',
  korea: 'KOR',
  russia: 'RUS',
  turkey: 'TUR',
  uae: 'ARE',
  'west germany': 'DEU',
  'east germany': 'DEU',
};
