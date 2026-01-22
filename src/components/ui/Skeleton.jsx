export function Skeleton({ className = '' }) {
  return (
    <div 
      className={`bg-slate-700/50 rounded-xl animate-pulse ${className}`}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function SkeletonGrid({ count = 20 }) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-square" />
      ))}
    </div>
  )
}
