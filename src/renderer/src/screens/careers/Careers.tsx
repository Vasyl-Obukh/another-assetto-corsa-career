import { FolderOpenIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { CareerHero } from './CareerHero.tsx';
import { CareerHeroSkeleton } from './CareerHeroSkeleton.tsx';
import { CareerRow } from './CareerRow.tsx';
import { CareerRowSkeleton } from './CareerRowSkeleton.tsx';
import { CAREER_ROWS } from './constants.ts';
import { SeasonPanel } from './SeasonPanel.tsx';
import { pickOf } from './utils.ts';
import {
  ConfirmDialog, ErrorCard, Loading, ScreenBody, ScreenHeader, Shimmer,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useCareers } from '@/hooks';
import { path } from '@/lib/routes';
import { slots } from '@/lib/slots.ts';

/**
 * Every career, what Load on the start screen opens: the list down the left,
 * the one picked beside it with the way back into it, its season and the
 * commands on it. Arrives on the career played last.
 */
export const Careers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const careers = useCareers();
  const asked = pickOf(useLocation().state);
  const [picked, setPicked] = useState<string | null>(asked);
  const [deleting, setDeleting] = useState(false);

  const list = careers.careers;
  const shown = list?.find((one) => one.id === picked) ?? list?.[0] ?? null;

  const carryOn = async (): Promise<void> => {
    if (shown && await careers.open(shown.id)) void navigate(path.home());
  };

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader
        back={{ to: path.start(), label: t('back.start') }}
        aside={(
          <Button onClick={() => { void navigate(path.careerNew()); }}>
            <PlusIcon />
            {t('careers.newCareer')}
          </Button>
        )}
      >
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold">{t('careers.title')}</h1>
          {/* A count, neutral on purpose. */}
          {list === null ? <Shimmer className="h-5 w-7 rounded-md" /> : <Badge variant="secondary">{list.length}</Badge>}
        </div>
      </ScreenHeader>

      {careers.error ? <ErrorCard error={careers.error} onDismiss={careers.dismissError} /> : null}

      {list?.length === 0 ? (
        <div className="flex flex-col items-start gap-1 rounded-xl border border-dashed p-6">
          <p className="font-semibold">{t('careers.empty')}</p>
          <p className="text-sm text-muted-foreground">{t('careers.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[24rem_minmax(0,1fr)]">
          <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
            {list === null ? (
              <Loading>{slots(CAREER_ROWS).map((at) => <CareerRowSkeleton key={at} />)}</Loading>
            ) : list.map((one) => (
              <CareerRow key={one.id} career={one} picked={one.id === shown?.id} onPick={() => setPicked(one.id)} />
            ))}
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            {shown ? (
              <CareerHero career={shown} busy={careers.busy} onContinue={() => { void carryOn(); }} />
            ) : <Loading><CareerHeroSkeleton /></Loading>}

            <SeasonPanel championships={shown?.championships ?? null} />

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                disabled={!shown || careers.busy}
                onClick={() => { if (shown) void careers.showFolder(shown.id); }}
              >
                <FolderOpenIcon />
                {t('careers.openFolder')}
              </Button>
              <Button
                variant="ghost"
                className="ml-auto text-destructive hover:text-destructive"
                disabled={!shown || careers.busy}
                onClick={() => setDeleting(true)}
              >
                <Trash2Icon />
                {t('careers.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleting && shown !== null}
        title={t('careers.deleteTitle', { driver: shown?.driver.name ?? '' })}
        description={t('careers.deleteHint')}
        confirmLabel={t('careers.delete')}
        busy={careers.busy}
        onConfirm={() => {
          if (shown) void careers.remove(shown.id);
          setPicked(null);
          setDeleting(false);
        }}
        onClose={() => setDeleting(false)}
      />
    </ScreenBody>
  );
};
