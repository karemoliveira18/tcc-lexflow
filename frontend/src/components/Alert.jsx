export default function Alert({ type = "success", title, message, onClose }) {
  const colorStyles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
  };

  return (
    <div
      className={`rounded-3xl border p-4 shadow-sm ${colorStyles[type] || colorStyles.success}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {title && <p className="font-semibold">{title}</p>}
          <p className="mt-1 text-sm leading-6">{message}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/90 px-2.5 py-1 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  );
}
