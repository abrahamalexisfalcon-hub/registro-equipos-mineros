import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  const esError = toast.tipo === 'error';

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[calc(100%-2rem)] max-w-sm" role="status" aria-live="polite">
      <div
        className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${
          esError
            ? 'border-rose-200 bg-rose-50 text-rose-900'
            : 'border-emerald-200 bg-emerald-50 text-emerald-900'
        }`}
      >
        {esError ? (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        )}
        <p className="flex-1 text-sm">{toast.mensaje}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded text-slate-500 transition duration-150 hover:text-slate-900"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
