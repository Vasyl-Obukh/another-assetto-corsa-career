// Minimal INI reader/writer for AC's flat, unquoted flavour of the format.

import type { IniData, IniValue, IniWritable } from './types.ts';
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

/**
 * Replaces named keys inside one section, leaving every other byte alone.
 *
 * `writeIni` re-emits a file from scratch and drops comments with it, which is
 * destructive for a file we are a guest in - `pureCtrl/settings.ini` documents
 * every weather value inline. A key already in the section keeps its comment
 * tail and the spacing around its `=`; an absent key is appended to the end of
 * the section, as is the whole section when the file has no such header.
 * @param text The file as it stands
 * @param section The section to edit, without its brackets
 * @param values The keys to set
 * @returns The file with those keys set
 */
export const patchIni = (
  text: string,
  section: string,
  values: Record<string, IniValue>,
): string => {
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  const remaining = new Map(Object.entries(values));

  let inSection = false;
  let sectionSeen = false;
  // After the section's last key, so a trailing blank line before the next
  // header stays where the author put it.
  let insertAt = -1;

  const patched = lines.map((line, index) => {
    const header = /^\s*\[(.+?)\]/.exec(line);
    if (header) {
      inSection = header[1].trim() === section;
      if (inSection) {
        sectionSeen = true;
        insertAt = index + 1;
      }

      return line;
    }

    if (!inSection) return line;

    // The last line that could hold a key, so an append lands inside the section
    // rather than after the blank lines following it.
    if (line.trim() !== '') insertAt = index + 1;

    const match = /^(\s*)([^=;#\s][^=]*?)(\s*=\s*)(.*)$/.exec(line);
    if (!match) return line;

    const [, indent, key, equals, rest] = match;
    if (!remaining.has(key.trim())) return line;

    const value = remaining.get(key.trim()) as IniValue;
    remaining.delete(key.trim());
    // Keep the comment tail, so the documentation those files carry survives.
    const comment = /\s+([;#].*)$/.exec(rest);

    return `${indent}${key}${equals}${formatValue(value)}${comment ? ` ${comment[1]}` : ''}`;
  });

  if (remaining.size === 0) return patched.join(eol);

  const added = [...remaining].map(([key, value]) => `${key}=${formatValue(value)}`);
  if (!sectionSeen) return [...patched, `[${section}]`, ...added, ''].join(eol);

  patched.splice(insertAt, 0, ...added);

  return patched.join(eol);
};

/**
 * Replaces one whole section, leaving the rest of the file alone.
 *
 * For a section we own outright, where a key left over from a previous write
 * would be read back as if we meant it. Sol's preset slots are the example: we
 * claim one and own all of it, while the user's slots stay untouched.
 * @param text The file as it stands
 * @param section The section to replace, without its brackets
 * @param values The keys the section should now hold, or null to remove it
 * @returns The file with that section replaced, appended or removed
 */
export const replaceIniSection = (
  text: string,
  section: string,
  values: Record<string, IniValue> | null,
): string => {
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const body = Object.entries(values ?? {}).map(([key, value]) => `${key}=${formatValue(value)}`);
  const lines = text.split(/\r?\n/);

  let start = -1;
  let end = lines.length;
  for (let index = 0; index < lines.length; index += 1) {
    const header = /^\s*\[(.+?)\]/.exec(lines[index]);
    if (!header) continue;

    if (header[1].trim() === section) start = index;
    else if (start !== -1) {
      end = index;
      break;
    }
  }

  if (start === -1) {
    return values === null ? text : [...lines, `[${section}]`, ...body, ''].join(eol);
  }

  // Anything between the last key and the next header is the author's spacing,
  // so it is put back rather than absorbed.
  const tail: string[] = [];
  for (let index = end - 1; index > start && lines[index].trim() === ''; index -= 1) {
    tail.unshift(lines[index]);
  }

  // A null section is dropped, which is what null already means to writeIni.
  const replacement = values === null ? [] : [`[${section}]`, ...body, ...tail];

  return [...lines.slice(0, start), ...replacement, ...lines.slice(end)].join(eol);
};
