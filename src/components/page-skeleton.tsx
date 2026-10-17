// Shown instantly while a page that depends on the URL is loading.
export function PageSkeleton() {
  return (
    <div
      className="mx-auto max-w-3xl animate-pulse space-y-4 px-6 py-10"
      aria-busy
    >
      <div className="bg-chip h-4 w-32 rounded-full" />
      <div className="bg-chip h-8 w-3/4 rounded-full" />
      <div className="bg-chip h-4 w-1/2 rounded-full" />
      <div className="rounded-card bg-chip h-40" />
    </div>
  );
}
