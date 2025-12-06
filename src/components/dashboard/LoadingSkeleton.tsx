export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="loading-skeleton mb-2 h-10 w-96" />
        <div className="loading-skeleton h-4 w-64" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="kpi-card">
            <div className="loading-skeleton mb-2 h-4 w-24" />
            <div className="loading-skeleton h-8 w-32" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="chart-container mb-8">
        <div className="loading-skeleton mb-4 h-6 w-48" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="loading-skeleton h-12 w-full" />
          ))}
        </div>
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="chart-container">
            <div className="loading-skeleton mb-4 h-6 w-48" />
            <div className="loading-skeleton h-64 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
