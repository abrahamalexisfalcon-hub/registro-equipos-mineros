import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Contenedor base para modales. Se monta solo cuando está abierto,
 * por lo que el estado de los formularios hijos se reinicia en cada apertura.
 */
export default function Modal({ titulo, subtitulo, icono: Icono, onClose, children, ancho = 'max-w-md' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative flex max-h-[90vh] w-full ${ancho} flex-col rounded-xl border border-slate-200 bg-white shadow-xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="flex items-start gap-3">
            {Icono && (
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icono className="h-5 w-5" />
              </span>
            )}
            <div>
              <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
              {subtitulo && <p className="mt-0.5 text-sm text-slate-500">{subtitulo}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
