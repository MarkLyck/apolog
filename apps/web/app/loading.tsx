export default function Loading() {
  return (
    <div className="mx-auto max-w-[92rem] animate-pulse px-5 py-24 lg:px-8">
      <div className="h-4 w-40 rounded bg-[var(--surface-strong)]" />
      <div className="mt-8 h-20 max-w-3xl rounded-2xl bg-[var(--surface-strong)]" />
      <div className="mt-6 h-6 max-w-xl rounded bg-[var(--surface-strong)]" />
      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            className="h-72 rounded-[1.4rem] bg-[var(--surface-strong)]"
            key={item}
          />
        ))}
      </div>
    </div>
  );
}
