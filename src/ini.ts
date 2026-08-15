// Minimal INI reader/writer for AC's flat, unquoted flavour of the format.

export type IniSection = Record<string, string>;
export type IniData = Record<string, IniSection>;

export type IniValue = string | number | boolean;
export type IniWritable = Record<string, Record<string, IniValue | null | undefined> | null>;

/** Parse INI text into { SECTION: { KEY: value } }. Duplicate keys keep the last. */
export function parseIni(text: string): IniData {
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
    // Only strip a ';' preceded by whitespace -- some values contain semicolons.
    const value = line.slice(eq + 1).replace(/\s+;.*$/, '').trim();
    const target = (out[section] ??= {});
    target[key] = value;
  }

  return out;
}

function formatValue(value: IniValue): string {
  if (typeof value === 'boolean') return value ? '1' : '0';
  return String(value);
}

/** Serialise back to INI text. Insertion order is preserved so output stays diffable against CM's. */
export function writeIni(data: IniWritable): string {
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
}
