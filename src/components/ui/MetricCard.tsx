type MetricCardProps = {
  title: string;
  value: string | number;
  description?: string;
};

export default function MetricCard({
  title,
  value,
  description,
}: MetricCardProps) {
  return (
    <div className="premium-card premium-card-hover premium-gradient rounded-3xl p-5">
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">{value}</p>
      {description && (
        <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
      )}
    </div>
  );
}