export default function AnalyticsLoading() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
        <p className="text-muted-foreground text-sm">Loading analytics…</p>
      </div>
    </div>
  );
}
