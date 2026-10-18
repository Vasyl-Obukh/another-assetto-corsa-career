import {
  DOS_EPOCH_YEAR, END_RECORD_SIZE, END_SIGNATURE, MAX_COMMENT,
} from './constants.ts';

/**
 * A moment as the zip format's two DOS fields hold it: local time, to the even
 * second.
 * @param at The moment
 * @returns Its time and date fields
 */
export const dosStamp = (at: Date): { time: number; date: number } => {
  const year = Math.max(at.getFullYear(), DOS_EPOCH_YEAR);

  // Bit fields, written as the sums they come to: hours in the top five bits,
  // minutes in the next six and seconds halved in the last five; years since
  // 1980 in the top seven, the month in the next four and the day in the last
  // five.
  return {
    time: at.getHours() * 2048 + at.getMinutes() * 32 + Math.floor(at.getSeconds() / 2),
    date: (year - DOS_EPOCH_YEAR) * 512 + (at.getMonth() + 1) * 32 + at.getDate(),
  };
};

/**
 * Finds where the end of central directory record starts, looking back from
 * the end of the archive past any comment it carries.
 * @param buffer The whole archive
 * @returns Its offset, or -1 when there is none
 */
export const findEndRecord = (buffer: Buffer): number => {
  const last = buffer.length - END_RECORD_SIZE;
  const first = Math.max(0, last - MAX_COMMENT);
  for (let at = last; at >= first; at -= 1) {
    // The record says how long its comment is, which is how it is told from a
    // comment holding the same four bytes.
    const length = END_RECORD_SIZE + buffer.readUInt16LE(at + 20);
    if (buffer.readUInt32LE(at) === END_SIGNATURE && at + length === buffer.length) return at;
  }

  return -1;
};
