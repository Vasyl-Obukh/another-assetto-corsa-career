import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils.ts';

interface AppWordmarkProps {
  /**
   * Anything the caller adds, a text size above all: every part is sized in
   * em, so the font size scales the whole logo.
   */
  className?: string;
}

// "Another" hangs left of the box, into the padding of what holds it. The line
// height is a raw property, since cn drops leading-* beside a caller's text size.
export const AppWordmark = ({ className }: AppWordmarkProps) => {
  const { t } = useTranslation();

  return (
    <span
      role="img"
      aria-label={t('app.title')}
      className={cn(
        'relative inline-flex flex-col pt-[0.76em] font-logo font-bold [line-height:0.92] tracking-[-0.01em] [font-variation-settings:"wdth"_87]',
        className,
      )}
    >
      <span className="absolute top-[-0.12em] left-[-0.65em] -rotate-7 font-logo-hand text-[0.8em] tracking-normal text-logo-red [font-variation-settings:normal]">
        {t('app.logo.another')}
      </span>
      <svg viewBox="0 0 14 10" className="absolute top-[1.38em] left-[-0.5em] h-[0.29em] w-[0.41em]">
        <path
          d="M1.5 9 L7 1.5 L12.5 9"
          fill="none"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-logo-red"
        />
      </svg>
      <span>{t('app.logo.game')}</span>
      <span className="relative self-end">
        {t('app.logo.career')}
        <svg
          viewBox="0 0 120 12"
          preserveAspectRatio="none"
          className="absolute bottom-[-0.32em] left-[-0.18em] h-[0.35em] w-[calc(100%+0.47em)] overflow-visible"
        >
          <path d="M3 8.5 C30 4 70 3.5 117 5.5" fill="none" strokeWidth="3.2" strokeLinecap="round" className="stroke-logo-red" />
          <path d="M40 9.5 C62 7.5 82 7.5 100 8.5" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-logo-red opacity-80" />
        </svg>
      </span>
    </span>
  );
};
