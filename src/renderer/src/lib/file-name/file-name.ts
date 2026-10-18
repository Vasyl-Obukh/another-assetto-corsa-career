/**
 * The name of a file, off its path.
 * @param file The path, with either kind of slash
 * @returns Its last part
 */
export const fileNameOf = (file: string): string => file.split(/[\\/]/).at(-1) ?? file;
