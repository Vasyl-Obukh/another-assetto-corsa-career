/**
 * Where Windows keeps the country or region the user lives in - Settings, Time
 * and language, Country or region - apart from the regional format, which may
 * well be another country's.
 */
export const REG_GEO = 'HKEY_CURRENT_USER\\Control Panel\\International\\Geo';

/**
 * The value under `REG_GEO` holding the region as an ISO 3166 code.
 */
export const REG_GEO_NAME = 'Name';
