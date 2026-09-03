export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page, last_page } = meta;

  const pages = [];
  for (let i = 1; i <= last_page; i++) {
    if (
      i === 1 ||
      i === last_page ||
      (i >= current_page - 1 && i <= current_page + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <p className="text-sm text-slate-500">
        Halaman <span className="font-medium text-slate-700">{current_page}</span> dari{' '}
        <span className="font-medium text-slate-700">{last_page}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman sebelumnya"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-sm">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                page === current_page
                  ? 'bg-navy-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              aria-label={`Halaman ${page}`}
              aria-current={page === current_page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman berikutnya"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
