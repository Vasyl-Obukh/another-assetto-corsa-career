import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CLASS_TOP } from './constants.ts';
import type {
  ClassCatalogue, ClassId, Facet, SpecId,
} from '../../../../shared/types';
import { carClassName, carSpecName, classOfSpec } from '../../../../shared/utils/car-classes';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';
import { RailOption, RailSearch, toggledIn } from '@/components';
import { Button } from '@/components/ui/button.tsx';

interface ClassTreeProps {
  /**
   * The class counts, biggest first, or empty before the first response.
   */
  classes: readonly Facet[];
  /**
   * The spec counts, biggest first.
   */
  specs: readonly Facet[];
  /**
   * The classes picked whole.
   */
  pickedClasses: readonly ClassId[];
  /**
   * The specs picked one at a time.
   */
  pickedSpecs: readonly SpecId[];
  /**
   * The catalogue the names and the tree come from.
   */
  catalogue: ClassCatalogue;
  /**
   * Replaces both picks.
   * @param classes The classes picked
   * @param specs The specs picked
   */
  onChange(classes: ClassId[], specs: SpecId[]): void;
}

/**
 * Class and spec as one tree: a spec is a grid within a class, so it sits
 * under it rather than in a list of ninety of its own. A class and one of its
 * specs never stay picked together - the class already holds them all.
 */
export const ClassTree = ({
  classes, specs, pickedClasses, pickedSpecs, catalogue, onChange,
}: ClassTreeProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState<ReadonlySet<ClassId>>(
    () => new Set(pickedSpecs.map((spec) => classOfSpec(spec, catalogue)).filter((one) => one !== null)),
  );

  const terms = searchTerms(query);
  const specsOf = (carClass: ClassId): Facet[] => (
    specs.filter((spec) => classOfSpec(spec.value, catalogue) === carClass)
  );
  const holdsPick = (carClass: ClassId): boolean => (
    pickedClasses.includes(carClass) || pickedSpecs.some((spec) => classOfSpec(spec, catalogue) === carClass)
  );

  let shown: readonly Facet[];
  if (terms.length > 0) {
    shown = classes.filter((facet) => matchesTerms(terms, [carClassName(facet.value, catalogue)])
      || specsOf(facet.value).some((spec) => matchesTerms(terms, [carSpecName(spec.value, catalogue)])));
  } else if (all) {
    shown = classes;
  } else {
    // What is picked stays listed whatever its count, or it could not be lifted.
    shown = classes.filter((facet, index) => index < CLASS_TOP || holdsPick(facet.value));
  }

  /**
   * Picks a class whole, dropping its specs, or lifts it.
   * @param carClass The class
   */
  const toggleClass = (carClass: ClassId): void => {
    if (pickedClasses.includes(carClass)) {
      onChange(pickedClasses.filter((one) => one !== carClass), [...pickedSpecs]);
    } else {
      onChange(
        [...pickedClasses, carClass],
        pickedSpecs.filter((spec) => classOfSpec(spec, catalogue) !== carClass),
      );
    }
  };

  /**
   * Picks one spec, lifting its class, or lifts the spec.
   * @param spec The spec
   */
  const toggleSpec = (spec: SpecId): void => {
    const carClass = classOfSpec(spec, catalogue);
    onChange(
      pickedClasses.filter((one) => one !== carClass),
      toggledIn(pickedSpecs, spec),
    );
  };

  return (
    <>
      <RailSearch value={query} placeholder={t('cars.filter.findClass')} onChange={setQuery} />

      <div className={all && terms.length === 0 ? 'max-h-72 overflow-y-auto' : undefined}>
        {shown.map((facet) => {
          const children = specsOf(facet.value)
            .filter((spec) => terms.length === 0 || matchesTerms(terms, [carSpecName(spec.value, catalogue)]));
          // A search opens every class it found something under.
          const expanded = terms.length > 0 || open.has(facet.value);

          return (
            <div key={facet.value}>
              <RailOption
                label={carClassName(facet.value, catalogue)}
                count={facet.count}
                checked={pickedClasses.includes(facet.value)}
                partial={pickedSpecs.some((spec) => classOfSpec(spec, catalogue) === facet.value)}
                spacer={children.length === 0}
                expanded={expanded}
                onExpand={children.length === 0 ? undefined : () => {
                  const next = new Set(open);
                  if (next.has(facet.value)) next.delete(facet.value);
                  else next.add(facet.value);
                  setOpen(next);
                }}
                onToggle={() => toggleClass(facet.value)}
              />
              {expanded ? children.map((spec) => (
                <RailOption
                  key={spec.value}
                  nested
                  label={carSpecName(spec.value, catalogue)}
                  count={spec.count}
                  checked={pickedSpecs.includes(spec.value)}
                  onToggle={() => toggleSpec(spec.value)}
                />
              )) : null}
            </div>
          );
        })}
      </div>

      {terms.length === 0 && classes.length > CLASS_TOP ? (
        <Button variant="link" size="sm" className="h-auto px-1 pt-1.5 text-xs" onClick={() => setAll(!all)}>
          {all ? t('browse.showFewer') : t('browse.showAll', { count: classes.length })}
        </Button>
      ) : null}
    </>
  );
};
