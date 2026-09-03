export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="skeleton h-8 w-1/2 rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-slate-100">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className={`skeleton h-4 rounded flex-1 ${j === 0 ? 'max-w-[40px]' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonRoomCard() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="skeleton h-6 w-24 rounded" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-8 w-16 rounded-lg" />
        <div className="skeleton h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-7 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}
