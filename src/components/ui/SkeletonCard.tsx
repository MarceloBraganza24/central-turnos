export default function SkeletonCard() {
  return (
    <div className="premium-card animate-pulse rounded-3xl p-5">
      <div className="h-4 w-24 rounded-full bg-neutral-800" />

      <div className="mt-4 h-10 w-20 rounded-xl bg-neutral-800" />

      <div className="mt-4 h-3 w-32 rounded-full bg-neutral-800" />
    </div>
  );
}