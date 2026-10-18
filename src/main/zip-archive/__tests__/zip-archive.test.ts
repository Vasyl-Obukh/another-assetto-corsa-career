import { describe, expect, it } from '@jest/globals';
import { crc32 } from 'node:zlib';

import { packZip, unpackZip } from '../zip-archive.ts';

/**
 * A zip of entries stored rather than deflated, as other tools write small or
 * already-compressed files - built by hand, since packZip always deflates.
 * @param entries Each entry's name and what it holds
 * @returns The archive
 */
const storedZip = (entries: readonly { name: string; data: Buffer }[]): Buffer => {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  entries.forEach(({ name, data }) => {
    const encoded = Buffer.from(name, 'utf8');
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt32LE(crc32(data), 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(encoded.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt32LE(crc32(data), 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(encoded.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, encoded, data);
    centrals.push(central, encoded);
    offset += 30 + encoded.length + data.length;
  });
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...locals, directory, end]);
};

/**
 * Where an archive's central directory starts, off its end record.
 * @param zip The archive, with no comment
 * @returns The offset
 */
const directoryOf = (zip: Buffer): number => zip.readUInt32LE(zip.length - 22 + 16);

const FILES = [
  { name: 'career.json', data: Buffer.from(JSON.stringify({ driver: 'Зоряна Квітка' })) },
  { name: 'saves/quicksave.json', data: Buffer.from('x'.repeat(5000)) },
  { name: 'results/empty.json', data: Buffer.alloc(0) },
];

describe('main/zip-archive/zip-archive', () => {
  describe('packZip', () => {
    it('packs files that unpack exactly as they went in, names in any script included', async () => {
      const back = await unpackZip(await packZip(FILES));

      expect(back.map((one) => one.name)).toEqual(FILES.map((one) => one.name));
      back.forEach((one, at) => expect(one.data.equals(FILES[at].data)).toBe(true));
    });

    it('deflates what it packs', async () => {
      const zip = await packZip([FILES[1]]);

      expect(zip.length).toBeLessThan(FILES[1].data.length);
      // Method 8, deflate, in the local header.
      expect(zip.readUInt16LE(8)).toBe(8);
    });

    it('marks every name as UTF-8', async () => {
      const zip = await packZip(FILES);

      expect(zip.readUInt16LE(6)).toBe(0x0800);
      expect(zip.readUInt16LE(directoryOf(zip) + 8)).toBe(0x0800);
    });

    it('packs nothing into an archive of no entries', async () => {
      expect(await unpackZip(await packZip([]))).toEqual([]);
    });
  });

  describe('unpackZip', () => {
    it('unpacks entries stored rather than deflated', async () => {
      const back = await unpackZip(storedZip(FILES));

      expect(back.map((one) => one.data.toString())).toEqual(FILES.map((one) => one.data.toString()));
    });

    it('leaves folders out and reads backslashes as slashes', async () => {
      const back = await unpackZip(storedZip([
        { name: 'saves/', data: Buffer.alloc(0) },
        { name: 'saves\\quicksave.json', data: Buffer.from('{}') },
      ]));

      expect(back.map((one) => one.name)).toEqual(['saves/quicksave.json']);
    });

    it('refuses what is not a zip at all', async () => {
      await expect(unpackZip(Buffer.from('not a zip, nowhere near one'))).rejects.toMatchObject({ code: 'zip.unreadable' });
      await expect(unpackZip(Buffer.alloc(4))).rejects.toMatchObject({ code: 'zip.unreadable' });
    });

    it('refuses an entry whose bytes do not match its CRC', async () => {
      const zip = storedZip([{ name: 'a.json', data: Buffer.from('{"a":1}') }]);
      zip[30 + 'a.json'.length] = 'X'.charCodeAt(0);

      await expect(unpackZip(zip)).rejects.toMatchObject({ code: 'zip.unreadable', params: { reason: 'corrupt entry a.json' } });
    });

    it('refuses an encrypted entry', async () => {
      const zip = await packZip([FILES[0]]);
      const at = directoryOf(zip);
      zip.writeUInt16LE(zip.readUInt16LE(at + 8) + 1, at + 8);

      await expect(unpackZip(zip)).rejects.toMatchObject({ params: { reason: 'encrypted' } });
    });

    it('refuses a compression method other than stored or deflated', async () => {
      const zip = await packZip([FILES[0]]);
      zip.writeUInt16LE(12, directoryOf(zip) + 10);

      await expect(unpackZip(zip)).rejects.toMatchObject({ params: { reason: 'compression method 12' } });
    });

    it('refuses an entry that unpacks larger than it says', async () => {
      const zip = await packZip([FILES[1]]);
      // The directory's own size, shrunk: inflating is bounded by it.
      zip.writeUInt32LE(10, directoryOf(zip) + 24);

      await expect(unpackZip(zip)).rejects.toMatchObject({ params: { reason: 'broken entry saves/quicksave.json' } });
    });

    it('refuses a zip64 archive', async () => {
      const zip = await packZip([FILES[0]]);
      zip.writeUInt16LE(0xffff, zip.length - 22 + 10);

      await expect(unpackZip(zip)).rejects.toMatchObject({ params: { reason: 'zip64' } });
    });

    it('refuses a directory that points at nothing', async () => {
      const zip = await packZip([FILES[0]]);
      zip.writeUInt32LE(0, directoryOf(zip) + 42);
      zip.writeUInt32LE(0xdeadbeef, 0);

      await expect(unpackZip(zip)).rejects.toMatchObject({ params: { reason: 'broken entry career.json' } });
    });
  });
});
