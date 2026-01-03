// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { For } from 'solid-js';

export interface PaginationProps {
  /** Current page (1-indexed) */
  readonly page: number;
  /** Total number of pages */
  readonly totalPages: number;
  /** Callback when page changes */
  readonly onChange?: (page: number) => void;
  /** Number of page buttons to show around current */
  readonly siblingCount?: number;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Pagination component using DaisyUI styling.
 * @param props
 */
export function Pagination(props: PaginationProps): JSX.Element {
  const siblingCount = props.siblingCount ?? 1;

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const totalPages = props.totalPages;
    const current = props.page;

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const rangeStart = Math.max(2, current - siblingCount);
    const rangeEnd = Math.min(totalPages - 1, current + siblingCount);

    // Add ellipsis before range if needed
    if (rangeStart > 2) {
      pages.push('...');
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis after range if needed
    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page: number): void => {
    if (page !== props.page && page >= 1 && page <= props.totalPages) {
      props.onChange?.(page);
    }
  };

  return (
    <div class={`join ${props.class ?? ''}`} data-testid={props.testId}>
      {/* Previous button */}
      <button
        type="button"
        class="join-item btn"
        disabled={props.page <= 1}
        onClick={() => handlePageClick(props.page - 1)}
        data-testid={`${props.testId ?? 'pagination'}-prev`}
      >
        «
      </button>

      {/* Page buttons */}
      <For each={getPageNumbers()}>
        {(pageNum) => (
          pageNum === '...' ? (
            <button type="button" class="join-item btn btn-disabled">...</button>
          ) : (
            <button
              type="button"
              class={`join-item btn ${pageNum === props.page ? 'btn-active' : ''}`}
              onClick={() => handlePageClick(pageNum)}
              data-testid={`${props.testId ?? 'pagination'}-page-${pageNum}`}
            >
              {pageNum}
            </button>
          )
        )}
      </For>

      {/* Next button */}
      <button
        type="button"
        class="join-item btn"
        disabled={props.page >= props.totalPages}
        onClick={() => handlePageClick(props.page + 1)}
        data-testid={`${props.testId ?? 'pagination'}-next`}
      >
        »
      </button>
    </div>
  );
}
