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
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative flex max-h-[90vh] w-full ${ancho} flex-col rounded-xl border border-slate-800 bg-slate-900 shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-100">
              {Icono && <Icono className="h-5 w-5 text-amber-400" />}
              {titulo}
            </h2>
            {subtitulo && <p className="mt-0.5 text-sm text-slate-400">{subtitulo}</p>}
          </div>
          <button type="button" onClick={onClose} className="btn-icon border-transparent" aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
