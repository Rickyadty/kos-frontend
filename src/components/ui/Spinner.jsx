export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-4',
    xl: 'w-16 h-16 border-4',
  };
  return (
    <div
      className={`${sizes[size]} border-navy-800 border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Memuat..."
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 font-medium">Memuat data...</p>
      </div>
    </div>
  );
}
