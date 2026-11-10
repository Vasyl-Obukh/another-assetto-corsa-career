/// <reference types="vite/client" />
// A file of its own, and outside constants.ts, because import.meta.glob is
// Vite's alone: Jest compiles to CommonJS and cannot parse it, and constants.ts
// is reached by the tests of utils.ts beside it.

/**
 * The URL of every sponsor logo the app ships, by the name of its file without
 * its extension - which is what a sponsor's `logo` names.
 */
export const SPONSOR_LOGOS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(import.meta.glob<string>('../../assets/sponsors/*.{svg,png}', {
    eager: true, query: '?url', import: 'default',
  })).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.')), url]),
);
