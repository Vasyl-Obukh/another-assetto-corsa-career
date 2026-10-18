/**
 * One file in a zip.
 */
export interface ZipEntry {
  /**
   * Its path inside the archive, with forward slashes.
   */
  name: string;
  /**
   * What it holds.
   */
  data: Buffer;
}
