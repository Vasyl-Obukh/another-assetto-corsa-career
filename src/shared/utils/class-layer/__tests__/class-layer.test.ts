import { describe, expect, it } from '@jest/globals';

import {
  crowdedClass, makeLayer, shippedCar, USER_CLASS, USER_SPEC,
} from './fixtures.ts';
import { CLASS_LAYER_VERSION } from '../../../constants/index.ts';
import type { ClassLayer } from '../../../types/index.ts';
import { resolveCatalogue, SHIPPED_CATALOGUE, specCars } from '../../car-classes/index.ts';
import {
  readClassLayer,
  withCarSpecs,
  withClassCopy,
  withoutCarSpecs,
  withoutUserClass,
  withoutUserSpec,
  withSpecCars,
  withUserClass,
  withUserSpec,
} from '../class-layer.ts';

/**
 * A layer holding the user's own class and spec, and the catalogue it resolves to.
 * @param overrides Anything else the layer holds
 * @returns The layer and its catalogue
 */
const withOwn = (overrides: Partial<ClassLayer> = {}) => {
  const layer = makeLayer({ classes: [USER_CLASS], specs: [USER_SPEC], ...overrides });

  return { layer, catalogue: resolveCatalogue(layer) };
};

describe('shared/utils/class-layer', () => {
  describe('readClassLayer', () => {
    it('starts empty from anything that is not an object', () => {
      expect(readClassLayer(null)).toEqual(makeLayer());
      expect(readClassLayer('nope')).toEqual(makeLayer());
    });

    it('reads classes, specs and cars as they were written', () => {
      const raw = { classes: [USER_CLASS], specs: [USER_SPEC], cars: { my_mod: [USER_SPEC.id] } };

      expect(readClassLayer(raw)).toEqual(makeLayer(raw));
    });

    it('drops an entry lacking an id or a name, and one reusing an id', () => {
      const raw = {
        classes: [USER_CLASS, { id: USER_CLASS.id, name: 'Again' }, { id: '', name: 'Blank' }, { name: 'No id' }, 42],
      };

      expect(readClassLayer(raw).classes).toEqual([USER_CLASS]);
    });

    it('drops a spec that names no class', () => {
      expect(readClassLayer({ specs: [{ id: 'orphan', name: 'Orphan' }] }).specs).toEqual([]);
    });

    it('drops a car whose specs are not a list, and anything in a list that is not a spec', () => {
      const raw = { cars: { broken: 'gt3', listed: [USER_SPEC.id, 42, '', USER_SPEC.id] } };

      expect(readClassLayer(raw).cars).toEqual({ listed: [USER_SPEC.id] });
    });

    // Built with fromEntries so a hand-edited key cannot reach the prototype.
    it('reads a car keyed __proto__ as an ordinary key', () => {
      const layer = readClassLayer(JSON.parse('{"cars":{"__proto__":["x"]}}'));

      expect(Object.keys(layer.cars)).toEqual(['__proto__']);
      expect(Object.getPrototypeOf(layer.cars)).toBe(Object.prototype);
    });

    it('stamps the current version whatever the file said', () => {
      expect(readClassLayer({ version: 99 }).version).toBe(CLASS_LAYER_VERSION);
    });
  });

  describe('withCarSpecs', () => {
    it('restates which specs a car races in', () => {
      const { layer, catalogue } = withOwn();

      expect(withCarSpecs(layer, catalogue, 'my_mod', [USER_SPEC.id]).cars).toEqual({ my_mod: [USER_SPEC.id] });
    });

    // That is what keeps Revert honest: a car put back by hand is not an
    // adjustment that changes nothing.
    it('drops the override when the specs are what the app ships, in any order', () => {
      const { car, specs } = shippedCar();
      const layer = makeLayer({ cars: { [car]: [] } });

      expect(withCarSpecs(layer, SHIPPED_CATALOGUE, car, [...specs].reverse()).cars).toEqual({});
    });

    it('keeps an empty list over a shipped car, which leaves it unclassified', () => {
      const { car } = shippedCar();

      expect(withCarSpecs(makeLayer(), SHIPPED_CATALOGUE, car, []).cars).toEqual({ [car]: [] });
    });

    it('keeps no override for a mod put on no grid, since that is what it ships as', () => {
      const { layer, catalogue } = withOwn({ cars: { my_mod: [USER_SPEC.id] } });

      expect(withCarSpecs(layer, catalogue, 'my_mod', []).cars).toEqual({});
    });

    it('lists a spec named twice once', () => {
      const { layer, catalogue } = withOwn();

      expect(withCarSpecs(layer, catalogue, 'my_mod', [USER_SPEC.id, USER_SPEC.id]).cars.my_mod)
        .toEqual([USER_SPEC.id]);
    });

    it('refuses a spec the catalogue lacks', () => {
      expect(() => withCarSpecs(makeLayer(), SHIPPED_CATALOGUE, 'my_mod', ['ghost']))
        .toThrow(expect.objectContaining({ code: 'classes.car.specUnknown' }));
    });

    it('refuses two specs of one class, which would be two eras at once', () => {
      const { specs } = crowdedClass();

      expect(() => withCarSpecs(makeLayer(), SHIPPED_CATALOGUE, 'my_mod', specs))
        .toThrow(expect.objectContaining({ code: 'classes.car.classClash' }));
    });
  });

  describe('withoutCarSpecs', () => {
    it('drops one car\'s override and leaves the rest', () => {
      const layer = makeLayer({ cars: { one: [], two: [USER_SPEC.id] } });

      expect(withoutCarSpecs(layer, 'one').cars).toEqual({ two: [USER_SPEC.id] });
    });
  });

  describe('withSpecCars', () => {
    /**
     * A second spec of the user's class, beside USER_SPEC.
     */
    const SIBLING = { id: 'user-spec-2', name: 'Hillclimb (2010s)', class: USER_CLASS.id };

    it('puts every car named in the spec', () => {
      const { layer, catalogue } = withOwn();

      expect(withSpecCars(layer, catalogue, USER_SPEC.id, ['one', 'two']).cars)
        .toEqual({ one: [USER_SPEC.id], two: [USER_SPEC.id] });
    });

    it('takes a car left out of the spec off it, keeping its specs in other classes', () => {
      const shipped = SHIPPED_CATALOGUE.classes[0].specs[0];
      const { layer, catalogue } = withOwn({ cars: { my_mod: [USER_SPEC.id, shipped] } });

      expect(withSpecCars(layer, catalogue, USER_SPEC.id, []).cars).toEqual({ my_mod: [shipped] });
    });

    // A car races in one spec per class, so joining one is leaving its sibling.
    it('moves a car joining the spec out of the one it held in the same class', () => {
      const { layer, catalogue } = withOwn({ specs: [USER_SPEC, SIBLING], cars: { my_mod: [SIBLING.id] } });

      expect(withSpecCars(layer, catalogue, USER_SPEC.id, ['my_mod']).cars).toEqual({ my_mod: [USER_SPEC.id] });
    });

    it('leaves alone a car that stays where it was', () => {
      const { layer, catalogue } = withOwn({ cars: { kept: [USER_SPEC.id] } });

      expect(withSpecCars(layer, catalogue, USER_SPEC.id, ['kept', 'added']).cars)
        .toEqual({ kept: [USER_SPEC.id], added: [USER_SPEC.id] });
    });

    it('drops the override of a shipped car put back where the app has it', () => {
      const found = [...SHIPPED_CATALOGUE.specsByCar].find(([, specs]) => specs.length === 1);
      if (!found) throw new Error('the catalogue has no car in exactly one spec');
      const [car, [spec]] = found;
      const layer = makeLayer({ cars: { [car]: [] } });
      const catalogue = resolveCatalogue(layer);

      expect(withSpecCars(layer, catalogue, spec, [...specCars(spec, catalogue), car]).cars).toEqual({});
    });

    it('refuses a spec the catalogue lacks', () => {
      expect(() => withSpecCars(makeLayer(), SHIPPED_CATALOGUE, 'ghost', ['my_mod']))
        .toThrow(expect.objectContaining({ code: 'classes.spec.notFound' }));
    });
  });

  describe('withUserClass', () => {
    it('adds a class under the id it is given', () => {
      const result = withUserClass(makeLayer(), SHIPPED_CATALOGUE, { name: '  Hillclimb ' }, 'fresh');

      expect(result).toEqual({ layer: makeLayer({ classes: [{ id: 'fresh', name: 'Hillclimb' }] }), id: 'fresh' });
    });

    it('renames a class of the user\'s, which may keep its own name', () => {
      const { layer, catalogue } = withOwn();

      expect(withUserClass(layer, catalogue, { id: USER_CLASS.id, name: 'Hill climb' }, 'unused').layer.classes)
        .toEqual([{ id: USER_CLASS.id, name: 'Hill climb' }]);
      expect(() => withUserClass(layer, catalogue, USER_CLASS, 'unused')).not.toThrow();
    });

    it('refuses a blank name', () => {
      expect(() => withUserClass(makeLayer(), SHIPPED_CATALOGUE, { name: '   ' }, 'fresh'))
        .toThrow(expect.objectContaining({ code: 'classes.name.empty' }));
    });

    // The filter lists put every name side by side, so "GT3" and "gt3" would
    // read as one class listed twice.
    it('refuses a name already spent, whatever its case', () => {
      const name = SHIPPED_CATALOGUE.classes[0].name.toUpperCase();

      expect(() => withUserClass(makeLayer(), SHIPPED_CATALOGUE, { name }, 'fresh'))
        .toThrow(expect.objectContaining({ code: 'classes.name.taken' }));
    });

    it('refuses to rename a class the app ships', () => {
      const [shipped] = SHIPPED_CATALOGUE.classes;

      expect(() => withUserClass(makeLayer(), SHIPPED_CATALOGUE, { id: shipped.id, name: 'Mine' }, 'fresh'))
        .toThrow(expect.objectContaining({ code: 'classes.class.shipped' }));
    });

    it('refuses to rename a class nobody made', () => {
      expect(() => withUserClass(makeLayer(), SHIPPED_CATALOGUE, { id: 'ghost', name: 'Mine' }, 'fresh'))
        .toThrow(expect.objectContaining({ code: 'classes.class.notFound' }));
    });
  });

  describe('withoutUserClass', () => {
    it('deletes an empty class of the user\'s', () => {
      const layer = makeLayer({ classes: [USER_CLASS] });

      expect(withoutUserClass(layer, resolveCatalogue(layer), USER_CLASS.id, () => []).classes).toEqual([]);
    });

    it('deletes the specs in it along with the class', () => {
      const { layer, catalogue } = withOwn();
      const deleted = withoutUserClass(layer, catalogue, USER_CLASS.id, () => []);

      expect(deleted.classes).toEqual([]);
      expect(deleted.specs).toEqual([]);
    });

    it('refuses a class whose spec a championship still races in', () => {
      const { layer, catalogue } = withOwn();

      expect(() => withoutUserClass(layer, catalogue, USER_CLASS.id, () => ['Hillclimb Cup']))
        .toThrow(expect.objectContaining({ code: 'classes.spec.inUse' }));
    });

    it('refuses a class the app ships', () => {
      expect(() => withoutUserClass(makeLayer(), SHIPPED_CATALOGUE, SHIPPED_CATALOGUE.classes[0].id, () => []))
        .toThrow(expect.objectContaining({ code: 'classes.class.shipped' }));
    });

    it('refuses a class nobody made', () => {
      expect(() => withoutUserClass(makeLayer(), SHIPPED_CATALOGUE, 'ghost', () => []))
        .toThrow(expect.objectContaining({ code: 'classes.class.notFound' }));
    });
  });

  describe('withUserSpec', () => {
    it('adds a spec to a class the app ships', () => {
      const { carClass } = crowdedClass();
      const result = withUserSpec(makeLayer(), SHIPPED_CATALOGUE, { name: 'Another era', class: carClass }, 'fresh');

      expect(result.id).toBe('fresh');
      expect(result.layer.specs).toEqual([{ id: 'fresh', name: 'Another era', class: carClass }]);
    });

    it('renames a spec of the user\'s and moves it to another class', () => {
      const { layer, catalogue } = withOwn();
      const { carClass } = crowdedClass();
      const draft = { id: USER_SPEC.id, name: 'Renamed', class: carClass };

      expect(withUserSpec(layer, catalogue, draft, 'unused').layer.specs)
        .toEqual([{ id: USER_SPEC.id, name: 'Renamed', class: carClass }]);
    });

    it('refuses a class that does not resolve', () => {
      expect(() => withUserSpec(makeLayer(), SHIPPED_CATALOGUE, { name: 'Lost', class: 'ghost' }, 'fresh'))
        .toThrow(expect.objectContaining({ code: 'classes.spec.classUnknown' }));
    });

    it('refuses a name a shipped spec already has, whatever its case', () => {
      const { carClass, specs } = crowdedClass();
      const name = SHIPPED_CATALOGUE.specById.get(specs[0])?.name.toLowerCase() ?? '';

      expect(() => withUserSpec(makeLayer(), SHIPPED_CATALOGUE, { name, class: carClass }, 'fresh'))
        .toThrow(expect.objectContaining({ code: 'classes.name.taken' }));
    });

    it('refuses a move that would put a car on two specs of one class', () => {
      const { carClass, specs } = crowdedClass();
      const { layer, catalogue } = withOwn({ cars: { my_mod: [USER_SPEC.id, specs[0]] } });

      expect(() => withUserSpec(layer, catalogue, { ...USER_SPEC, class: carClass }, 'unused'))
        .toThrow(expect.objectContaining({ code: 'classes.spec.classClash' }));
    });

    it('refuses to change a spec the app ships', () => {
      const { carClass, specs } = crowdedClass();

      expect(() => withUserSpec(makeLayer(), SHIPPED_CATALOGUE, { id: specs[0], name: 'Mine', class: carClass }, 'x'))
        .toThrow(expect.objectContaining({ code: 'classes.spec.shipped' }));
    });

    it('refuses to change a spec nobody made', () => {
      const { carClass } = crowdedClass();

      expect(() => withUserSpec(makeLayer(), SHIPPED_CATALOGUE, { id: 'ghost', name: 'Mine', class: carClass }, 'x'))
        .toThrow(expect.objectContaining({ code: 'classes.spec.notFound' }));
    });
  });

  describe('withoutUserSpec', () => {
    it('deletes a spec and takes it off every car racing in it', () => {
      const { layer, catalogue } = withOwn({ cars: { my_mod: [USER_SPEC.id], other_mod: [] } });
      const next = withoutUserSpec(layer, catalogue, USER_SPEC.id, []);

      expect(next.specs).toEqual([]);
      expect(next.cars).toEqual({ other_mod: [] });
    });

    it('drops an override that is left holding what the app ships', () => {
      const { car, specs } = shippedCar();
      const { layer, catalogue } = withOwn({ cars: { [car]: [...specs, USER_SPEC.id] } });

      expect(withoutUserSpec(layer, catalogue, USER_SPEC.id, []).cars).toEqual({});
    });

    it('refuses a spec a championship still races in, naming it', () => {
      const { layer, catalogue } = withOwn();

      expect(() => withoutUserSpec(layer, catalogue, USER_SPEC.id, ['Hill Cup']))
        .toThrow(expect.objectContaining({ code: 'classes.spec.inUse', params: expect.objectContaining({ series: 'Hill Cup' }) }));
    });

    it('refuses a spec the app ships', () => {
      const { specs } = crowdedClass();

      expect(() => withoutUserSpec(makeLayer(), SHIPPED_CATALOGUE, specs[0], []))
        .toThrow(expect.objectContaining({ code: 'classes.spec.shipped' }));
    });

    it('refuses a spec nobody made', () => {
      expect(() => withoutUserSpec(makeLayer(), SHIPPED_CATALOGUE, 'ghost', []))
        .toThrow(expect.objectContaining({ code: 'classes.spec.notFound' }));
    });
  });
  describe('withClassCopy', () => {
    /**
     * Mints ids in order, so a test can say which one went where.
     * @returns The minter
     */
    const minter = (): (() => string) => {
      let n = 0;

      return () => {
        n += 1;

        return `fresh-${n}`;
      };
    };

    it('copies a class and every spec in it into classes of the user\'s', () => {
      const { layer, catalogue } = withOwn();
      const copy = withClassCopy(layer, catalogue, USER_CLASS.id, 'Sprint', minter());

      expect(copy.id).toBe('fresh-1');
      expect(copy.layer.classes).toEqual([USER_CLASS, { id: 'fresh-1', name: 'Sprint' }]);
      expect(copy.layer.specs).toEqual([USER_SPEC, { id: 'fresh-2', name: 'Sprint (2020s)', class: 'fresh-1' }]);
    });

    it('names a spec not named after its class for the copy it went into', () => {
      const { layer, catalogue } = withOwn({ specs: [{ ...USER_SPEC, name: 'Mountain' }] });

      expect(withClassCopy(layer, catalogue, USER_CLASS.id, 'Sprint', minter()).layer.specs[1].name)
        .toBe('Mountain (Sprint)');
    });

    it('numbers a spec name that is already taken', () => {
      const taken = { id: 'taken', name: 'Sprint (2020s)', class: USER_CLASS.id };
      const { layer, catalogue } = withOwn({ specs: [USER_SPEC, taken] });
      const { specs } = withClassCopy(layer, catalogue, USER_CLASS.id, 'Sprint', minter()).layer;

      expect(specs.map((spec) => spec.name)).toContain('Sprint (2020s) 2');
    });

    it('puts every car racing in the original in its copy as well', () => {
      const { car, specs } = shippedCar();
      const carClass = SHIPPED_CATALOGUE.specById.get(specs[0])?.class ?? '';
      const copy = withClassCopy(makeLayer(), SHIPPED_CATALOGUE, carClass, 'Mine', minter());
      const copied = copy.layer.specs.find((spec) => spec.class === copy.id);

      expect(copy.layer.cars[car]).toEqual(expect.arrayContaining([...specs]));
      expect(copy.layer.cars[car]).toHaveLength(specs.length + 1);
      expect(copied?.class).toBe(copy.id);
    });

    // Rebuilding a car's override from the resolved catalogue used to drop a
    // spec that did not resolve, deleting it from the user's file for good.
    it('keeps a spec a car races in that does not resolve today', () => {
      const { layer, catalogue } = withOwn({ cars: { my_mod: [USER_SPEC.id, 'from-elsewhere'] } });
      const copy = withClassCopy(layer, catalogue, USER_CLASS.id, 'Sprint', minter());

      expect(copy.layer.cars.my_mod).toEqual([USER_SPEC.id, 'from-elsewhere', 'fresh-2']);
    });

    it('refuses a name another class already has', () => {
      const { layer, catalogue } = withOwn();

      expect(() => withClassCopy(layer, catalogue, USER_CLASS.id, 'hillclimb', minter()))
        .toThrow(expect.objectContaining({ code: 'classes.name.taken' }));
    });

    it('refuses a class that does not resolve', () => {
      expect(() => withClassCopy(makeLayer(), SHIPPED_CATALOGUE, 'ghost', 'Mine', minter()))
        .toThrow(expect.objectContaining({ code: 'classes.class.notFound' }));
    });
  });
});
