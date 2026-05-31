import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/60 p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-xl">
        ✦
      </div>

      <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-200"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}