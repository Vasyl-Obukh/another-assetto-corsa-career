// Writing and reading zip archives over node:zlib alone, which is all a
// career's backup needs: deflated entries with UTF-8 names, no zip64, no
// encryption. Small enough to own, and it keeps the main process free of a
// dependency for one file format.

import { promisify } from 'node:util';
import { crc32, deflateRaw, inflateRaw } from 'node:zlib';

import {
  CENTRAL_HEADER_SIZE,
  CENTRAL_SIGNATURE,
  DEFLATED,
  ENCRYPTED_FLAG,
  END_RECORD_SIZE,
  END_SIGNATURE,
  LOCAL_HEADER_SIZE,
  LOCAL_SIGNATURE,
  MAX_ENTRIES,
  MAX_SIZE,
  MAX_UNPACKED,
  STORED,
  UTF8_FLAG,
  VERSION_NEEDED,
} from './constants.ts';
import type { ZipEntry } from './types.ts';
import { dosStamp, findEndRecord } from './utils.ts';
import { AppError } from '../../shared/errors/index.ts';

const deflate = promisify(deflateRaw);
const inflate = promisify(inflateRaw);

/**
 * Packs files into a zip, each deflated.
 * @param entries The files, in the order they are written
 * @param at When they are stamped as written
 * @returns The archive
 * @throws When there are more files, or more bytes, than a zip without zip64
 * holds
 */
export const packZip = async (entries: readonly ZipEntry[], at = new Date()): Promise<Buffer> => {
  if (entries.length >= MAX_ENTRIES) throw new AppError('zip.tooLarge');

  const { time, date } = dosStamp(at);
  const deflated = await Promise.all(entries.map((entry) => deflate(entry.data)));
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;

  entries.forEach((entry, index) => {
    const name = Buffer.from(entry.name, 'utf8');
    const packed = deflated[index];
    const crc = crc32(entry.data);
    if (entry.data.length >= MAX_SIZE || offset >= MAX_SIZE) throw new AppError('zip.tooLarge');

    const local = Buffer.alloc(LOCAL_HEADER_SIZE);
    local.writeUInt32LE(LOCAL_SIGNATURE, 0);
    local.writeUInt16LE(VERSION_NEEDED, 4);
    local.writeUInt16LE(UTF8_FLAG, 6);
    local.writeUInt16LE(DEFLATED, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(name.length, 26);

    const central = Buffer.alloc(CENTRAL_HEADER_SIZE);
    central.writeUInt32LE(CENTRAL_SIGNATURE, 0);
    // Made by 2.0 on MS-DOS, which says the external attributes are DOS ones.
    central.writeUInt16LE(VERSION_NEEDED, 4);
    central.writeUInt16LE(VERSION_NEEDED, 6);
    central.writeUInt16LE(UTF8_FLAG, 8);
    central.writeUInt16LE(DEFLATED, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(packed.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);

    locals.push(local, name, packed);
    centrals.push(central, name);
    offset += local.length + name.length + packed.length;
  });

  const directory = Buffer.concat(centrals);
  if (offset >= MAX_SIZE || directory.length >= MAX_SIZE) throw new AppError('zip.tooLarge');
  const end = Buffer.alloc(END_RECORD_SIZE);
  end.writeUInt32LE(END_SIGNATURE, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...locals, directory, end]);
};

/**
 * Unpacks every file in a zip, folders left out.
 * @param buffer The archive
 * @returns Its files, in the order its directory lists them, each checked
 * against its CRC
 * @throws When it is not a zip, or holds what this reader does not read:
 * zip64, encryption, or a method other than stored or deflated
 */
export const unpackZip = async (buffer: Buffer): Promise<ZipEntry[]> => {
  const fail = (reason: string): never => { throw new AppError('zip.unreadable', { reason }); };

  const end = buffer.length >= END_RECORD_SIZE ? findEndRecord(buffer) : -1;
  if (end < 0) fail('no end of central directory');

  const count = buffer.readUInt16LE(end + 10);
  const start = buffer.readUInt32LE(end + 16);
  if (count === MAX_ENTRIES || start === MAX_SIZE) fail('zip64');

  // Read off the directory first, every entry checked before anything is
  // unpacked.
  const stored: { name: string; method: number; packed: Buffer; size: number; crc: number }[] = [];
  let unpacked = 0;
  let at = start;
  for (let index = 0; index < count; index += 1) {
    if (at + CENTRAL_HEADER_SIZE > buffer.length || buffer.readUInt32LE(at) !== CENTRAL_SIGNATURE) {
      fail('broken central directory');
    }
    const flags = buffer.readUInt16LE(at + 8);
    const method = buffer.readUInt16LE(at + 10);
    const crc = buffer.readUInt32LE(at + 16);
    const packedSize = buffer.readUInt32LE(at + 20);
    const size = buffer.readUInt32LE(at + 24);
    const nameLength = buffer.readUInt16LE(at + 28);
    const extraLength = buffer.readUInt16LE(at + 30);
    const commentLength = buffer.readUInt16LE(at + 32);
    const local = buffer.readUInt32LE(at + 42);
    const name = buffer.subarray(at + CENTRAL_HEADER_SIZE, at + CENTRAL_HEADER_SIZE + nameLength)
      .toString('utf8')
      .replaceAll('\\', '/');
    at += CENTRAL_HEADER_SIZE + nameLength + extraLength + commentLength;

    // A folder is only a name ending in a slash, and holds nothing.
    if (!name.endsWith('/')) {
      if (flags % 2 === ENCRYPTED_FLAG) fail('encrypted');
      if (method !== STORED && method !== DEFLATED) fail(`compression method ${method}`);
      unpacked += size;
      if (unpacked > MAX_UNPACKED) fail('too large');

      // The local header's own name and extra field may differ in length from
      // the directory's, so where the data starts is read off the local one.
      if (local + LOCAL_HEADER_SIZE > buffer.length || buffer.readUInt32LE(local) !== LOCAL_SIGNATURE) {
        fail(`broken entry ${name}`);
      }
      const dataStart = local + LOCAL_HEADER_SIZE + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
      const packed = buffer.subarray(dataStart, dataStart + packedSize);
      if (packed.length !== packedSize) fail(`truncated entry ${name}`);

      stored.push({
        name, method, packed, size, crc,
      });
    }
  }

  return Promise.all(stored.map(async ({
    name, method, packed, size, crc,
  }): Promise<ZipEntry> => {
    let data: Buffer = packed;
    if (method === DEFLATED) {
      // Bounded by what the directory says, so a crafted entry cannot unpack
      // past it.
      data = await inflate(packed, { maxOutputLength: Math.max(size, 1) }).catch(() => fail(`broken entry ${name}`));
    }
    if (data.length !== size || crc32(data) !== crc) fail(`corrupt entry ${name}`);

    return { name, data };
  }));
};
