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
}
