// Minimal INI reader/writer for AC's flat, unquoted flavour of the format.

/** Parse INI text into { SECTION: { KEY: value } }. Duplicate keys keep the last. */
export function parseIni(text) {
  const out = {};
  let section = '';
  for (let line of text.replace(/^﻿/, '').split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith(';') || line.startsWith('//') || line.startsWith('#')) continue;

    const header = /^\[(.+?)\]/.exec(line);
    if (header) {
      section = header[1].trim();
      out[section] ??= {};
      continue;
    }

    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    // Only strip a ';' preceded by whitespace -- some values contain semicolons.
    const value = line.slice(eq + 1).replace(/\s+;.*$/, '').trim();
    out[section] ??= {};
    out[section][key] = value;
  }
  return out;
}

/** Serialise back to INI text. Insertion order is preserved so output stays diffable against CM's. */
export function writeIni(data) {
  const chunks = [];
  for (const [section, values] of Object.entries(data)) {
    if (values == null) continue;
    const lines = [`[${section}]`];
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null) continue;
      lines.push(`${key}=${formatValue(value)}`);
    }
    chunks.push(lines.join('\r\n'));
  }
  return chunks.join('\r\n\r\n') + '\r\n';
}

function formatValue(value) {
  if (typeof value === 'boolean') return value ? '1' : '0';
  return String(value);
}
