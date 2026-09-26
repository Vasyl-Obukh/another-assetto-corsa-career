import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SOURCE_DOT } from './constants.ts';
import { RailOption } from './RailOption.tsx';
import type { ProvenanceLeaf as Leaf, ProvenancePicks } from './types.ts';
import { provenanceLabel, toggledIn } from './utils.ts';
import { ContentSource } from '../../../../shared/types';
import type { Facet } from '../../../../shared/types';
import { cn } from '@/lib/utils.ts';

interface SourceTreeProps {
  /**
   * The counts behind each list, or null before the first response.
   */
  facets: {
    sources: Facet[];
    packs: Facet[];
    makers: Facet[];
    distributors: Facet[];
  } | null;
  /**
   * What is picked.
   */
  picked: ProvenancePicks;
  /**
   * Replaces what is picked.
   * @param next The four lists
   */
  onChange(next: ProvenancePicks): void;
}

/**
 * Where content came from, as one tree: a pack is a kind of DLC and a maker or
 * a redistributor a kind of mod, so they sit under it rather than in filters of
 * their own. A branch and its leaves never stay picked together - the branch
 * already holds them all.
 */
export const SourceTree = ({ facets, picked, onChange }: SourceTreeProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<ReadonlySet<ContentSource>>(() => new Set([
    ...(picked.packs?.length ? [ContentSource.DLC] : []),
    ...(picked.makers?.length || picked.distributors?.length ? [ContentSource.MOD] : []),
  ]));

  const sources = picked.sources ?? [];
  const countOf = (list: Facet[] | undefined, value: string): number => (
    list?.find((facet) => facet.value === value)?.count ?? 0
  );

  const leafOf = (list: Leaf['list'], facet: Facet): Leaf => ({
    list, value: facet.value, label: provenanceLabel(t, list, facet.value), count: facet.count,
  });
  const leaves: Record<ContentSource, Leaf[]> = {
    [ContentSource.BASE]: [],
    [ContentSource.DLC]: (facets?.packs ?? []).map((facet) => leafOf('packs', facet)),
    [ContentSource.MOD]: [
      ...(facets?.makers ?? []).map((facet) => leafOf('makers', facet)),
      ...(facets?.distributors ?? []).map((facet) => leafOf('distributors', facet)),
    ],
  };

  const isPicked = (leaf: Leaf): boolean => (picked[leaf.list] as string[] | undefined)?.includes(leaf.value) ?? false;

  /**
   * Picks a branch whole, dropping its leaves, or lifts it.
   * @param source The branch
   */
  const toggleBranch = (source: ContentSource): void => {
    if (sources.includes(source)) {
      onChange({ ...picked, sources: sources.filter((one) => one !== source) });
      return;
    }

    const next: ProvenancePicks = { ...picked, sources: [...sources, source] };
    leaves[source].forEach((leaf) => {
      next[leaf.list] = (next[leaf.list] as string[] | undefined)?.filter((one) => one !== leaf.value) as never;
    });
    onChange(next);
  };

  /**
   * Picks one leaf, lifting its branch, or lifts the leaf.
   * @param source The branch it sits under
   * @param leaf The leaf
   */
  const toggleLeaf = (source: ContentSource, leaf: Leaf): void => {
    const list = (picked[leaf.list] as string[] | undefined) ?? [];
    onChange({
      ...picked,
      sources: sources.filter((one) => one !== source),
      [leaf.list]: toggledIn(list, leaf.value),
    });
  };

  return (
    <>
      {Object.values(ContentSource).map((source) => {
        // Every source while the library is read, its count still to come.
        const total = facets === null ? null : countOf(facets.sources, source);
        if (total === 0 && !sources.includes(source)) return null;

        const children = leaves[source];
        const expanded = open.has(source);

        return (
          <div key={source}>
            <RailOption
              label={provenanceLabel(t, 'sources', source)}
              count={total}
              checked={sources.includes(source)}
              partial={children.some(isPicked)}
              spacer={children.length === 0}
              lead={<i aria-hidden className={cn('size-2 shrink-0 rounded-full', SOURCE_DOT[source])} />}
              expanded={expanded}
              onExpand={children.length === 0 ? undefined : () => {
                const next = new Set(open);
                if (expanded) next.delete(source);
                else next.add(source);
                setOpen(next);
              }}
              onToggle={() => toggleBranch(source)}
            />
            {expanded ? children.map((leaf) => (
              <RailOption
                key={`${leaf.list}-${leaf.value}`}
                nested
                label={leaf.label}
                count={leaf.count}
                checked={isPicked(leaf)}
                onToggle={() => toggleLeaf(source, leaf)}
              />
            )) : null}
          </div>
        );
      })}
    </>
  );
};
