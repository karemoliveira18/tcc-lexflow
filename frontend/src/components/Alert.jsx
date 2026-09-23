export default function Alert({ type = "success", title, message, onClose }) {
  const colorStyles = {
    success: "border border-[#d4af37]/25 bg-[#111111] text-[#f5f1e8]",
    error: "border border-[#ffb4b4]/25 bg-[#181818] text-[#ffe1e1]",
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
            className="rounded-full px-2.5 py-1 text-sm font-semibold shadow-sm transition"
            style={{ background: '#0a0a0a', color: '#d4af37' }}
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  );
}
