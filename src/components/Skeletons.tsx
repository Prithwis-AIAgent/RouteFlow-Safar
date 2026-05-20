export function RouteCardSkeleton() {
  return (
    <div className="route-card animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-lg w-2/3 mb-2" />
          <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
        </div>
        <div className="h-6 w-16 bg-gray-100 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded flex-1" style={{ width: `${60 + i * 10}%` }} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
        <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-24" />
        <div className="flex gap-2">
          <div className="h-9 w-16 bg-gray-100 dark:bg-slate-800 rounded-lg" />
          <div className="h-9 w-20 bg-gray-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function StopSkeleton() {
  return (
    <div className="stop-item animate-pulse">
      <div className="w-11 h-11 bg-gray-200 dark:bg-slate-700 rounded-xl flex-shrink-0" />
      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-11 bg-gray-200 dark:bg-slate-700 rounded-xl" />
        <div className="h-9 bg-gray-100 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="w-11 h-11 bg-gray-100 dark:bg-slate-800 rounded-xl flex-shrink-0" />
    </div>
  );
}
