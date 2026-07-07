export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      <div className="skeleton h-8 w-56 rounded-md" />
      <div className="skeleton h-4 w-80 rounded-md" />
      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <div className="skeleton h-64 rounded-[var(--radius-card)]" />
        <div className="skeleton h-64 rounded-[var(--radius-card)]" />
      </div>
    </div>
  );
}
