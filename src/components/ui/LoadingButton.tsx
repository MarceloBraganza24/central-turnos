type Props = {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export default function LoadingButton({
  loading = false,
  children,
  className = "",
  type = "button",
  disabled,
  onClick,
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center rounded-xl px-5 py-3 font-medium transition active:scale-[0.98] disabled:opacity-60 ${className}`}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}

      {children}
    </button>
  );
}