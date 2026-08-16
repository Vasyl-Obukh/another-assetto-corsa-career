// Minimal INI reader/writer for AC's flat, unquoted flavour of the format.

import type { IniData, IniWritable } from './types.ts';
import { formatValue } from './utils.ts';

export type {
  IniData, IniSection, IniValue, IniWritable,
} from './types.ts';

/**
 * Parses INI text into { SECTION: { KEY: value } }.
 *
 * Duplicate keys keep the last one, matching how AC itself reads these files.
 * @param text The raw file contents
 * @returns The parsed sections
 */
export const parseIni = (text: string): IniData => {
  const out: IniData = {};
  let section = '';

  for (const raw of text.replace(/^﻿/, '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith(';') || line.startsWith('//') || line.startsWith('#')) continue;

    const header = /^\[(.+?)\]/.exec(line);
    if (header?.[1] !== undefined) {
      section = header[1].trim();
      out[section] ??= {};
      continue;
    }

    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    // Only strip a ';' preceded by whitespace - some values contain semicolons.
    const value = line.slice(eq + 1).replace(/\s+;.*$/, '').trim();
    const target = (out[section] ??= {});
    target[key] = value;
  }

  return out;
};

/**
 * Serialises sections back to INI text.
 *
 * Insertion order is preserved so output stays diffable against Content
 * Manager's own.
 * @param data The sections to write
 * @returns INI text with CRLF line endings
 */
export const writeIni = (data: IniWritable): string => {
  const chunks: string[] = [];

  for (const [section, values] of Object.entries(data)) {
    if (values == null) continue;
    const lines = [`[${section}]`];
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null) continue;
      lines.push(`${key}=${formatValue(value)}`);
    }
    chunks.push(lines.join('\r\n'));
  }

  return `${chunks.join('\r\n\r\n')}\r\n`;
};
