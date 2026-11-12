import { useTranslation } from 'react-i18next';

import { RuleScale } from './RuleScale.tsx';
import { RuleSteps } from './RuleSteps.tsx';
import { DEFAULT_ASSISTS } from '../../../../shared/constants';
import type { Regulations } from '../../../../shared/types';
import { RainChip } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { useFormat, useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { JUMP_START_CHOICES, TRACK_DEFAULT, TYRES_OUT_CHOICES } from '@/screens/championship-editor';
import { REGULATIONS } from '@/screens/race';

interface RulesSheetProps {
  /**
   * The rules as the championship or the historic event states them.
   */
  regulations: Regulations;
  /**
   * Whether its rounds may race in the wet.
   */
  rain: boolean;
  /**
   * Whether `rain` is the career's own say for its season or event, rather
   * than the championship's.
   */
  rainOwn?: boolean;
  /**
   * Whether the card heads itself, which it does unless the page around it
   * already has.
   */
  titled?: boolean;
  /**
   * Anything the caller adds to the card.
   */
  className?: string;
}

/**
 * A rule in force wears the soft success green; one switched off stays neutral
 * on purpose, since a rule being off is no state worth a colour.
 */
const IN_FORCE = 'border-transparent bg-result-points text-result-points-foreground';

// Every rule a race is run under, read-only and drawn as the editor draws them.
// What is left unset is Assetto Corsa's own, and says so rather than vanishing.
export const RulesSheet = ({
  regulations, rain, rainOwn = false, titled = true, className,
}: RulesSheetProps) => {
  const { t } = useKindTranslation();
  const { t: plain } = useTranslation();
  const { formatNumber } = useFormat();
  const assists = regulations.assists ?? {};
  const blankets = assists.tyreBlankets;

  const row = 'grid grid-cols-[9.5rem_minmax(0,1fr)] items-center gap-3 border-t py-2 text-sm first:border-t-0';

  return (
    <Card className={cn('py-4', className)}>
      <CardContent className="flex flex-col gap-4 px-4">
        <div className="flex flex-col gap-1">
          {titled ? <h3 className="text-base font-semibold">{t('championships.rules.title')}</h3> : null}
          <p className="text-xs text-muted-foreground">{t('championships.rules.hint')}</p>
        </div>

        <div className="flex flex-col">
          <span className="mb-1 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {t('championships.rules.carry')}
          </span>
          {REGULATIONS.map((spec) => (
            <RuleScale key={spec.key} spec={spec} value={assists[spec.key]} real={DEFAULT_ASSISTS[spec.key]} />
          ))}
          <div className={row}>
            <span className="font-medium">{plain('race.regulations.tyreBlankets')}</span>
            <span className="flex items-center gap-2">
              {(blankets ?? DEFAULT_ASSISTS.tyreBlankets) ? (
                <Badge className={IN_FORCE}>{t('championships.rules.allowed')}</Badge>
              ) : (
                <Badge variant="outline">{t('championships.rules.notAllowed')}</Badge>
              )}
              {blankets === undefined ? (
                <span className="text-xs text-muted-foreground">{plain('race.regulations.default')}</span>
              ) : null}
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="mb-1 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {plain('editor.regulations.raceControl')}
          </span>
          <div className={row}>
            <span className="font-medium">{plain('editor.regulations.penalties')}</span>
            <span>
              {regulations.penalties ? (
                <Badge className={IN_FORCE}>{t('championships.rules.enforced')}</Badge>
              ) : (
                <Badge variant="outline">{t('championships.rules.off')}</Badge>
              )}
            </span>
          </div>
          <div className={row}>
            <span className="font-medium">{plain('editor.regulations.jumpStartPenalty')}</span>
            <RuleSteps
              options={JUMP_START_CHOICES}
              value={regulations.jumpStartPenalty ?? 0}
              unset={regulations.jumpStartPenalty === undefined}
              labelOf={(seconds) => (seconds === 0
                ? plain('editor.regulations.jumpStartNone')
                : plain('editor.regulations.seconds', { value: formatNumber(seconds) }))}
            />
          </div>
          <div className={row}>
            <span className="font-medium">{plain('editor.regulations.allowedTyresOut')}</span>
            <RuleSteps
              options={TYRES_OUT_CHOICES}
              value={regulations.allowedTyresOut ?? TRACK_DEFAULT}
              unset={regulations.allowedTyresOut === undefined}
              labelOf={(wheels) => (wheels === TRACK_DEFAULT
                ? plain('editor.regulations.tyresOutTrack')
                : formatNumber(wheels))}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <span className="mb-1 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {t('championships.rules.weather')}
          </span>
          <div className={row}>
            <span className="font-medium">{t('championships.rules.rain')}</span>
            <span className="flex items-center gap-2">
              <RainChip allowed={rain} />
              {rainOwn ? <span className="text-xs text-muted-foreground">{t('championships.rules.rainOwn')}</span> : null}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
