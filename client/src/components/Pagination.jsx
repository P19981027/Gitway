import { useI18n } from '../i18n';

export default function Pagination({ currentPage, totalPages, onPage }) {
  const { t } = useI18n();

  if (totalPages <= 1) return null;

  const MAX_VISIBLE = 5;

  function getPageNumbers() {
    if (totalPages <= MAX_VISIBLE) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(MAX_VISIBLE / 2);
    let start = currentPage - half;
    let end = currentPage + half;

    if (start <= 1) {
      start = 1;
      end = MAX_VISIBLE;
    } else if (end >= totalPages) {
      end = totalPages;
      start = totalPages - MAX_VISIBLE + 1;
    }

    const pages = [];

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  }

  const pages = getPageNumbers();

  const baseBtn =
    'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-200 h-8 min-w-[32px] px-2 md:h-9 md:min-w-[36px] md:px-3';

  return (
    <nav className="flex items-center gap-1.5 md:gap-2" aria-label="Pagination">
      <button
        onClick={() => onPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`${baseBtn} border border-background-200/60 bg-background-50 text-foreground-700 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 disabled:opacity-40 disabled:pointer-events-none`}
      >
        {t('common.prev')}
      </button>

      {pages.map((page, idx) =>
        page === '...' ? (
          <span
            key={`ellipsis-${idx}`}
            className={`${baseBtn} text-foreground-400 pointer-events-none select-none`}
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPage(page)}
            className={`${baseBtn} ${
              page === currentPage
                ? 'bg-primary-500 text-background-50 border border-primary-500 shadow-sm'
                : 'border border-background-200/60 bg-background-50 text-foreground-700 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`${baseBtn} border border-background-200/60 bg-background-50 text-foreground-700 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 disabled:opacity-40 disabled:pointer-events-none`}
      >
        {t('common.next')}
      </button>
    </nav>
  );
}
