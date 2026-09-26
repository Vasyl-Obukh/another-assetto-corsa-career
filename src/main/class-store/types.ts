import type {
  ClassCatalogue, ClassCommandResult, ClassLayer, IpcRequest,
} from '../../shared/types/index.ts';

/**
 * The user's layer over the shipped class catalogue, and the commands that
 * write it.
 */
export interface ClassStore {
  /**
   * The layer as it stands.
   * @returns The user's layer
   */
  layer: () => ClassLayer;
  /**
   * The shipped catalogue with the layer resolved over it.
   * @returns The catalogue every class and spec question answers from
   */
  catalogue: () => ClassCatalogue;
  /**
   * Restates which specs a car races in.
   * @param car Car folder ID
   * @param specs Every spec it should race in; empty leaves it unclassified
   * @returns The layer, looking at the car
   * @throws When a spec does not resolve, two share a class, or the write fails
   */
  assignCar: (car: string, specs: readonly string[]) => Promise<ClassCommandResult>;
  /**
   * Puts a car back to whatever the app ships for it.
   * @param car Car folder ID
   * @returns The layer, looking at the car
   * @throws When the write fails
   */
  revertCar: (car: string) => Promise<ClassCommandResult>;
  /**
   * Adds a class of the user's, or renames one.
   * @param draft The class as the form left it; no id means a new one
   * @returns The layer, looking at the class
   * @throws When the name is blank or taken, the class is not the user's, or the
   * write fails
   */
  saveClass: (draft: IpcRequest<'classes:saveClass'>) => Promise<ClassCommandResult>;
  /**
   * Deletes a class of the user's, and every spec in it with it.
   * @param id The class
   * @param usersOf The names of every championship racing in a spec
   * @returns The layer, looking at nothing
   * @throws When it is not the user's, a championship races in one of its
   * specs, or the write fails
   */
  deleteClass: (id: string, usersOf: (spec: string) => readonly string[]) => Promise<ClassCommandResult>;
  /**
   * Copies a class into a new class of the user's, specs and cars included.
   * @param id The class to copy, shipped or the user's
   * @param name What to call the copy
   * @returns The layer, looking at the new class
   * @throws When the class does not resolve, the name is blank or taken, or the
   * write fails
   */
  copyClass: (id: string, name: string) => Promise<ClassCommandResult>;
  /**
   * Adds a spec of the user's, or renames or moves one.
   * @param draft The spec as the form left it; no id means a new one
   * @returns The layer, looking at the spec
   * @throws When the name is blank or taken, the class does not resolve, the
   * spec is not the user's, a move would clash, or the write fails
   */
  saveSpec: (draft: IpcRequest<'classes:saveSpec'>) => Promise<ClassCommandResult>;
  /**
   * Saves a spec and its cars as one edit.
   * @param spec The spec as the form left it; no id means a new one
   * @param cars Every car that should race in it
   * @returns The layer, and the spec's id
   */
  saveSpecCars: (
    spec: IpcRequest<'classes:saveSpecCars'>['spec'],
    cars: readonly string[],
  ) => Promise<ClassCommandResult>;
  /**
   * Deletes a spec of the user's, taking it off every car racing in it.
   * @param id The spec
   * @param users The names of every championship racing in it
   * @returns The layer, looking at nothing
   * @throws When it is not the user's, is raced by a championship, or the write
   * fails
   */
  deleteSpec: (id: string, users: readonly string[]) => Promise<ClassCommandResult>;
  /**
   * Subscribes to the layer changing.
   * @param listener Called with the layer after every command
   * @returns A function that removes the listener
   */
  onChange: (listener: (layer: ClassLayer) => void) => () => void;
}
