import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  const esError = toast.tipo === 'error';

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[calc(100%-2rem)] max-w-sm" role="status" aria-live="polite">
      <div
        className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-xl backdrop-blur ${
          esError
            ? 'border-rose-500/30 bg-rose-950/90 text-rose-200'
            : 'border-emerald-500/30 bg-emerald-950/90 text-emerald-200'
        }`}
      >
        {esError ? (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
        )}
        <p className="flex-1 text-sm">{toast.mensaje}</p>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-100" aria-label="Cerrar">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
