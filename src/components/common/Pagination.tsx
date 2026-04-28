import { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'ellipsis')[] {
  const totalSlots = siblingCount * 2 + 5;

  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const pages: (number | 'ellipsis')[] = [];

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = 3 + 2 * siblingCount;
    for (let i = 1; i <= leftRange; i++) pages.push(i);
    pages.push('ellipsis');
    pages.push(totalPages);
  } else if (showLeftEllipsis && !showRightEllipsis) {
    pages.push(1);
    pages.push('ellipsis');
    const rightRange = 3 + 2 * siblingCount;
    for (let i = totalPages - rightRange + 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push('ellipsis');
    for (let i = leftSibling; i <= rightSibling; i++) pages.push(i);
    pages.push('ellipsis');
    pages.push(totalPages);
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const pages = useMemo(
    () => generatePageNumbers(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount]
  );

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    },
    [onPageChange, totalPages]
  );

  if (totalPages <= 1) return null;

  const buttonBase =
    'inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <button
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        className={`${buttonBase} text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700`}
        aria-label="Go to first page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${buttonBase} text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700`}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`${buttonBase} ${
              page === currentPage
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${buttonBase} text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700`}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <button
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        className={`${buttonBase} text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700`}
        aria-label="Go to last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
