/**
 * Locale-aware formatters, bound to the language currently in force.
 */
export interface Formatters {
  /**
   * The BCP 47 locale the formatters were built for.
   */
  locale: string;
  /**
   * Formats a date without a time.
   * @param value A Date, or anything the Date constructor accepts
   * @returns The date in the active locale's medium format
   */
  formatDate(value: Date | string): string;
  /**
   * Formats a calendar date that has no time of day at all.
   *
   * Its own formatter rather than formatDate because a YYYY-MM-DD string parses
   * as UTC midnight, which renders as the day before anywhere west of
   * Greenwich. A career's dates are days rather than instants, so they are read
   * back in UTC and the day stays the day.
   * @param value An ISO YYYY-MM-DD date
   * @returns The date in the active locale's medium format
   */
  formatDay(value: string): string;
  /**
   * Formats a date and time.
   * @param value A Date, or anything the Date constructor accepts
   * @returns The date and time in the active locale's format
   */
  formatDateTime(value: Date | string): string;
  /**
   * Formats a number with the active locale's grouping and decimal separators.
   * @param value The number to format
   * @returns The formatted number
   */
  formatNumber(value: number): string;
  /**
   * Formats a year, without the thousands grouping a plain number would get.
   *
   * A year is an identifier rather than a quantity, and 2,019 reads as a
   * different thing entirely. Still goes through Intl rather than String(), so a
   * locale with its own numbering system gets its own digits.
   * @param value The year
   * @returns The year, ungrouped, in the active locale's digits
   */
  formatYear(value: number): string;
  /**
   * Formats an amount of money. Display only - there is no conversion anywhere
   * in this app.
   * @param value The amount
   * @param currency ISO 4217 currency code, defaulting to USD
   * @returns The formatted amount, with no fractional part
   */
  formatMoney(value: number, currency?: string): string;
  /**
   * Formats a duration, switching between milliseconds and seconds.
   * @param ms The duration in milliseconds
   * @returns The duration with a localised unit
   */
  formatDuration(ms: number): string;
  /**
   * Formats a distance, switching between metres and kilometres.
   *
   * Which unit reads best depends on the figure: a 400 metre drag strip is not
   * 0.4 km, and the Nordschleife is not 20,832 m. The switch is at a kilometre,
   * which is also where circuits stop being measured in metres by anyone.
   * @param metres The distance in metres
   * @returns The distance with a localised unit
   */
  formatDistance(metres: number): string;
  /**
   * Compares two display strings for sorting, in the active locale.
   *
   * Case- and accent-insensitive, and numeric, so Citroen sorts beside Citroen
   * and Formula 2 comes before Formula 10. Intended for lists the user reads
   * down, which is why it sorts rendered labels rather than raw IDs.
   * @param a The first string
   * @param b The second string
   * @returns Negative, zero or positive, as Array.prototype.sort expects
   */
  compare(a: string, b: string): number;
}
