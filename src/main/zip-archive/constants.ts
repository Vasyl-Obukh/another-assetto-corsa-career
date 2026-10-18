// The parts of the zip format this module writes and reads - PKWARE's
// APPNOTE.TXT, sections 4.3.7, 4.3.12 and 4.3.16.

/**
 * What a local file header starts with.
 */
export const LOCAL_SIGNATURE = 0x04034b50;

/**
 * What a central directory header starts with.
 */
export const CENTRAL_SIGNATURE = 0x02014b50;

/**
 * What the end of central directory record starts with.
 */
export const END_SIGNATURE = 0x06054b50;

/**
 * The fixed part of a local file header, before its name.
 */
export const LOCAL_HEADER_SIZE = 30;

/**
 * The fixed part of a central directory header, before its name.
 */
export const CENTRAL_HEADER_SIZE = 46;

/**
 * The end of central directory record, without a comment.
 */
export const END_RECORD_SIZE = 22;

/**
 * The longest comment the end record can carry, which bounds how far from the
 * end of the file it has to be looked for.
 */
export const MAX_COMMENT = 0xffff;

/**
 * The version needed to extract what is written: 2.0, for deflate.
 */
export const VERSION_NEEDED = 20;

/**
 * Bit 11 of the flags: the entry's name is UTF-8.
 */
export const UTF8_FLAG = 0x0800;

/**
 * Bit 0 of the flags: the entry is encrypted, which is not read.
 */
export const ENCRYPTED_FLAG = 0x0001;

/**
 * Compression method 0, stored as it is.
 */
export const STORED = 0;

/**
 * Compression method 8, deflated.
 */
export const DEFLATED = 8;

/**
 * The most entries a zip without the zip64 extension holds; a count of this
 * says the real one is in a zip64 record, which is not read.
 */
export const MAX_ENTRIES = 0xffff;

/**
 * The largest size or offset a zip without the zip64 extension holds.
 */
export const MAX_SIZE = 0xffffffff;

/**
 * The most an archive may unpack to in all, so a crafted one cannot fill the
 * memory it is unpacked into.
 */
export const MAX_UNPACKED = 1024 * 1024 * 1024;

/**
 * The earliest year a DOS timestamp holds.
 */
export const DOS_EPOCH_YEAR = 1980;
