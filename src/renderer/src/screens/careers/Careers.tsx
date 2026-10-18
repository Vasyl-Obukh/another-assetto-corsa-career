import {
  ArchiveIcon, ArchiveRestoreIcon, FolderOpenIcon, PlusIcon, Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { CareerHero } from './CareerHero.tsx';
import { CareerHeroSkeleton } from './CareerHeroSkeleton.tsx';
import { CareerRow } from './CareerRow.tsx';
import { CareerRowSkeleton } from './CareerRowSkeleton.tsx';
import { CAREER_ROWS, HUB_WORDING } from './constants.ts';
import { RestoreDialog } from './RestoreDialog.tsx';
import { SavesPanel } from './SavesPanel.tsx';
import { SeasonPanel } from './SeasonPanel.tsx';
import { StandaloneHero } from './StandaloneHero.tsx';
import { StandaloneRow } from './StandaloneRow.tsx';
import { UnreadablePanel } from './UnreadablePanel.tsx';
import { UnreadableRow } from './UnreadableRow.tsx';
import { continuePath, isReadable, pickOf } from './utils.ts';
import type { CareerBackup, CareerKind, CareerSummary } from '../../../../shared/types';
import { useToast } from '@/app';
import {
  ConfirmDialog, ErrorCard, Loading, ScreenBody, ScreenHeader, Shimmer,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useCareers, useLoadSave, useSaves } from '@/hooks';
import { useFormat } from '@/i18n';
import { DONE_ACCENT } from '@/lib/accents';
import { fileNameOf } from '@/lib/file-name';
import { invoke } from '@/lib/ipc';
import { homeOf, path } from '@/lib/routes';
import { slots } from '@/lib/slots.ts';
import { standaloneName } from '@/lib/standalone-wording';

interface CareersProps {
  /**
   * Which kind of career the page lists: careers, or standalone championships.
   */
  kind?: CareerKind;
}

/**
 * Every career of one kind, what Load on the start screen opens: the list down
 * the left, the one picked beside it with the way back into it, a career's
 * season and the commands on it. Arrives on the one played last.
 */
export const Careers = ({ kind = 'career' }: CareersProps) => {
  const { t } = useTranslation();
  const { formatYear } = useFormat();
  const navigate = useNavigate();
  const careers = useCareers(kind);
  const wording = HUB_WORDING[kind];
  const championship = kind === 'championship';
  const Row = championship ? StandaloneRow : CareerRow;
  const Hero = championship ? StandaloneHero : CareerHero;
  /**
   * What a career is called where it is named: its driver, or a standalone
   * championship's championship and year.
   * @param one The career
   * @returns Its name
   */
  const nameOf = (one: CareerSummary): string => (championship
    ? standaloneName(one, t, formatYear)
    : one.driver.name);
  const asked = pickOf(useLocation().state);
  const [picked, setPicked] = useState<string | null>(asked);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState<CareerBackup | null>(null);
  const { show } = useToast();

  const list = careers.careers;
  const shown = list?.find((one) => one.id === picked) ?? list?.[0] ?? null;
  const readable = shown && isReadable(shown) ? shown : null;
  const saves = useSaves(readable?.id ?? null);
  const { load, loading } = useLoadSave();

  const carryOn = async (): Promise<void> => {
    if (readable && await careers.open(readable.id)) void navigate(continuePath(readable));
  };

  const loadSave = async (save: string): Promise<void> => {
    if (readable && await load(readable.id, save)) void navigate(homeOf(kind));
  };

  const backUp = async (id: string): Promise<boolean> => {
    const written = await careers.backup(id);
    if (!written) return false;
    show({
      icon: ArchiveIcon,
      tone: DONE_ACCENT,
      title: t('careers.backup.done'),
      detail: t('careers.backup.detail', {
        file: fileNameOf(written.file),
        saves: t('careers.restore.saves', { count: written.saves }),
        results: t('careers.restore.results', { count: written.results }),
      }),
      action: {
        label: t('careers.backup.show'),
        run: () => { void invoke('career:showBackup', { file: written.file }).catch(() => undefined); },
      },
    });

    return true;
  };

  const restore = async (replace: boolean): Promise<void> => {
    if (!restoring) return;
    const id = await careers.restore(restoring.file, replace);
    if (id === null) return;
    setPicked(id);
    show({
      icon: ArchiveRestoreIcon,
      tone: DONE_ACCENT,
      title: t(wording.restored, { driver: restoring.career.driver.name, name: nameOf(restoring.career) }),
      detail: fileNameOf(restoring.file),
    });
    setRestoring(null);
  };

  const restoreButton = (
    <Button variant="outline" disabled={careers.busy} onClick={() => { void careers.openBackup().then(setRestoring); }}>
      <ArchiveRestoreIcon />
      {t('careers.restore.open')}
    </Button>
  );

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader
        back={{ to: path.start(), label: t('back.start') }}
        aside={(
          <div className="flex items-center gap-2">
            {restoreButton}
            <Button onClick={() => { void navigate(championship ? path.standaloneNew() : path.careerNew()); }}>
              <PlusIcon />
              {t(wording.create)}
            </Button>
          </div>
        )}
      >
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold">{t(wording.title)}</h1>
          {/* A count, neutral on purpose. */}
          {list === null ? <Shimmer className="h-5 w-7 rounded-md" /> : <Badge variant="secondary">{list.length}</Badge>}
        </div>
      </ScreenHeader>

      {careers.error ? <ErrorCard error={careers.error} onDismiss={careers.dismissError} /> : null}

      {list?.length === 0 ? (
        <div className="flex flex-col items-start gap-1 rounded-xl border border-dashed p-6">
          <p className="font-semibold">{t(wording.empty)}</p>
          <p className="text-sm text-muted-foreground">{t(wording.emptyHint)}</p>
          <div className="mt-2">{restoreButton}</div>
        </div>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[24rem_minmax(0,1fr)]">
          <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
            {list === null ? (
              <Loading>{slots(CAREER_ROWS).map((at) => <CareerRowSkeleton key={at} />)}</Loading>
            ) : list.map((one) => {
              const row = { picked: one.id === shown?.id, onPick: () => setPicked(one.id) };

              return isReadable(one)
                ? <Row key={one.id} career={one} {...row} />
                : <UnreadableRow key={one.id} kind={kind} career={one} {...row} />;
            })}
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            {shown && !isReadable(shown) ? <UnreadablePanel kind={kind} career={shown} /> : (
              <>
                {readable ? (
                  <Hero career={readable} busy={careers.busy || loading} onContinue={() => { void carryOn(); }} />
                ) : <Loading><CareerHeroSkeleton /></Loading>}

                <SavesPanel saves={saves} loading={loading} onLoad={(save) => { void loadSave(save); }} />

                {/* A standalone championship races one championship, which
                    its hero already names. */}
                {championship ? null : <SeasonPanel championships={readable?.championships ?? null} />}
              </>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                disabled={!shown || careers.busy}
                onClick={() => { if (shown) void careers.showFolder(shown.id); }}
              >
                <FolderOpenIcon />
                {t('careers.openFolder')}
              </Button>
              {/* A career that does not read has nothing to back up. */}
              {readable ? (
                <Button variant="ghost" disabled={careers.busy} onClick={() => { void backUp(readable.id); }}>
                  <ArchiveIcon />
                  {t('careers.backup.action')}
                </Button>
              ) : null}
              <Button
                variant="ghost"
                className="ml-auto text-destructive hover:text-destructive"
                disabled={!shown || careers.busy}
                onClick={() => setDeleting(true)}
              >
                <Trash2Icon />
                {t(wording.delete)}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleting && shown !== null}
        title={t(wording.deleteTitle, {
          driver: shown?.driver?.name ?? t(wording.unreadableName),
          name: readable ? nameOf(readable) : t(wording.unreadableName),
        })}
        description={t(wording.deleteHint)}
        confirmLabel={t(wording.delete)}
        busy={careers.busy}
        aside={readable ? (
          <Button variant="outline" disabled={careers.busy} onClick={() => { void backUp(readable.id); }}>
            <ArchiveIcon />
            {t('careers.backup.first')}
          </Button>
        ) : null}
        onConfirm={() => {
          if (shown) void careers.remove(shown.id);
          setPicked(null);
          setDeleting(false);
        }}
        onClose={() => setDeleting(false)}
      />

      <RestoreDialog
        // Remounted per backup, so each opens on keeping both.
        key={restoring?.file ?? 'none'}
        kind={kind}
        backup={restoring}
        busy={careers.busy}
        onRestore={(replace) => { void restore(replace); }}
        onClose={() => setRestoring(null)}
      />
    </ScreenBody>
  );
};
