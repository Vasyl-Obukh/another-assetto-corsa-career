// Where Content Manager keeps the file, and how we write it.

/**
 * Content Manager's data folder under %LOCALAPPDATA%.
 */
export const CM_DATA_DIR = 'AcTools Content Manager';

/**
 * The file Content Manager reads its extra startup arguments from.
 */
export const ARGUMENTS_FILE = 'Arguments.txt';

/**
 * Line ending used when the file has none of its own to follow.
 *
 * Content Manager is Windows-only and writes this itself, so a file we create
 * from nothing gets CRLF rather than whatever the platform would pick.
 */
export const DEFAULT_EOL = '\r\n';
