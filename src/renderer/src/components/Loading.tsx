import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface LoadingProps {
  /**
   * The skeleton: the screen's real chrome, with `Shimmer` blocks where its
   * data will be.
   */
  children: ReactNode;
  /**
   * Layout classes for the wrapper, which is otherwise a plain block.
   */
  className?: string;
}

/**
 * The root of a skeleton, announced to assistive technology as loading - the
 * blocks inside are hidden from it, since they say nothing.
 */
export const Loading = ({ children, className }: LoadingProps) => {
  const { t } = useTranslation();

  return (
    <div role="status" aria-busy aria-label={t('common.loading')} className={className}>
      {children}
    </div>
  );
};
