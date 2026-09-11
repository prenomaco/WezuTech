/**
 * What a dashboard route shows while its data is in flight.
 *
 * These routes are `force-dynamic`, so navigation cannot complete until the
 * server has run its queries. Without a `loading.tsx` the router holds the
 * old page on screen for that whole time and the rail feels unresponsive —
 * the click appears to do nothing. With one, the shell swaps instantly and
 * the wait happens against the shape of the page that is arriving.
 */
function Bar({ className }: { readonly className: string }) {
  return <div className={`animate-pulse rounded-md bg-[var(--dash-subtle)] ${className}`} />;
}

/** Title block plus a table, which is the shape of three of the four routes. */
export function TableSkeleton({ rows = 6 }: { readonly rows?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Bar className="h-8 w-48" />
          <Bar className="h-4 w-72" />
        </div>
        <Bar className="h-10 w-36" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Bar className="h-10 flex-1" />
          <Bar className="h-10 w-36" />
          <Bar className="h-10 w-36" />
        </div>
        <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)]">
          {Array.from({ length: rows }).map((_, index) => (
            <div
              className="flex items-center gap-4 border-b border-[var(--dash-border)] px-4 py-4 last:border-b-0"
              key={index}
            >
              <Bar className="h-4 flex-1" />
              <Bar className="h-4 w-32" />
              <Bar className="h-4 w-20" />
              <Bar className="h-8 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Title block plus stat tiles, which is the Overview. */
export function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Bar className="h-8 w-40" />
        <Bar className="h-4 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Bar className="h-28" key={index} />
        ))}
      </div>
      <Bar className="h-72" />
    </div>
  );
}

/** Title block plus stacked cards, which is Enquiries. */
export function CardsSkeleton({ cards = 3 }: { readonly cards?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Bar className="h-8 w-44" />
        <Bar className="h-4 w-72" />
      </div>
      <div className="flex gap-2">
        <Bar className="h-10 flex-1" />
        <Bar className="h-10 w-36" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: cards }).map((_, index) => (
          <Bar className="h-44" key={index} />
        ))}
      </div>
    </div>
  );
}
