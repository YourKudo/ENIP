// Shown instantly while a page that depends on the URL is loading.
export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-4 px-4 py-12" aria-busy>
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="h-8 w-3/4 rounded bg-slate-200" />
      <div className="h-4 w-1/2 rounded bg-slate-200" />
      <div className="h-32 rounded-xl bg-slate-100" />
    </div>
  );
}
