import Link from "next/link";

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function PremiumEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: Props) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/60 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-brand/10 text-2xl text-brand">
        ✦
      </div>

      <h3 className="mt-5 text-xl font-bold text-white">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-hover"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}