import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { WEEKEND_SKELETON } from './constants.ts';
import { NewWeekendTile } from './NewWeekendTile.tsx';
import { RaceWeekendCard } from './RaceWeekendCard.tsx';
import { RaceWeekendCardSkeleton } from './RaceWeekendCardSkeleton.tsx';
import {
  ConfirmDialog, ErrorCard, Loading, ScreenBody,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useQuickRaces } from '@/hooks';
import { path } from '@/lib/routes';
import { slots } from '@/lib/slots.ts';

export const Race = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const quick = useQuickRaces();
  // The weekend being asked about deleting, by its id.
  const [deleting, setDeleting] = useState<string | null>(null);
  const target = quick.races?.find((one) => one.race.id === deleting);

  const create = async (): Promise<void> => {
    const id = await quick.create();
    if (id) void navigate(path.raceWeekend({ id }));
  };

  return (
    <ScreenBody className="flex flex-col gap-6 py-8" backToTop>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{t('race.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('race.subtitle')}</p>
        </div>
        <Button type="button" disabled={quick.busy} onClick={() => { void create(); }}>
          <PlusIcon />
          {t('race.new')}
        </Button>
      </header>

      {quick.error ? <ErrorCard error={quick.error} onDismiss={quick.dismissError} /> : null}

      <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        <NewWeekendTile busy={quick.busy} onCreate={() => { void create(); }} />
        {quick.races === null ? (
          slots(WEEKEND_SKELETON).map((at) => (
            <Loading key={at}><RaceWeekendCardSkeleton /></Loading>
          ))
        ) : quick.races.map((view) => (
          <RaceWeekendCard
            key={view.race.id}
            view={view}
            busy={quick.busy}
            onDuplicate={() => { void quick.duplicate(view.race.id); }}
            onRemove={() => setDeleting(view.race.id)}
          />
        ))}
      </div>

      <ConfirmDialog
        open={target !== undefined}
        title={t('race.deleteTitle', { name: target?.title || t('race.untitled') })}
        description={t('race.deleteHint')}
        confirmLabel={t('race.card.delete')}
        busy={quick.busy}
        onConfirm={() => {
          if (deleting) void quick.remove(deleting);
          setDeleting(null);
        }}
        onClose={() => setDeleting(null)}
      />
    </ScreenBody>
  );
};
