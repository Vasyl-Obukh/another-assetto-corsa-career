// Vite resolves these; TypeScript needs telling they exist. No imports here on
// purpose - an ambient wildcard module declaration has to live in a script file.
declare module '*.css';
declare module '*.svg';
declare module '*.png';
