import type { ReactNode } from 'react';
import { Container } from './Container';

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Breadcrumb trail, rendered above the title. */
  breadcrumb?: ReactNode;
  /** The page's primary action. */
  action?: ReactNode;
}

/**
 * The title block at the top of an inner page. Establishes the visual
 * hierarchy the brief asks for: page title, supporting text, primary action.
 */
export function PageHeader({
  title,
  description,
  breadcrumb,
  action,
}: PageHeaderProps) {
  return (
    <div className="border-b border-beige-200 bg-surface py-6 sm:py-8">
      <Container>
        {breadcrumb ? <div className="mb-3">{breadcrumb}</div> : null}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-ink-800 sm:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-base text-ink-500">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </Container>
    </div>
  );
}
