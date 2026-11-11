import { useEffect, useState } from 'react';
import { AlertTriangle, History, Loader2, User, Wrench } from 'lucide-react';
import Modal from './Modal';
import { obtenerHistorial } from '../api/equipoService';
import { extraerMensajeError } from '../api/axios';
import { formatearFecha, formatearHoras } from '../utils/formato';

export default function ModalHistorial({ equipo, onClose }) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    obtenerHistorial(equipo.idEquipo)
      .then((data) => activo && setRegistros(data))
      .catch((err) => activo && setError(extraerMensajeError(err)))
      .finally(() => activo && setLoading(false));
    return () => {
      activo = false;
    };
  }, [equipo.idEquipo]);

  return (
    <Modal
      titulo="Bitácora de Servicios"
      subtitulo={`Equipo ${equipo.codigo} · ${equipo.tipoEquipo?.nombre ?? ''}`}
      icono={History}
      onClose={onClose}
      ancho="max-w-lg"
    >
      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando historial…
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && registros.length === 0 && (
        <div className="py-10 text-center">
          <Wrench className="mx-auto h-8 w-8 text-slate-700" />
          <p className="mt-2 text-sm text-slate-400">Este equipo aún no registra servicios técnicos.</p>
        </div>
      )}

      {!loading && !error && registros.length > 0 && (
        <ol className="relative space-y-4 border-l border-slate-800 pl-6">
          {registros.map((r) => (
            <li key={r.idHistorial} className="relative">
              <span className="absolute -left-[1.85rem] top-1.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-500" />
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <time className="text-sm font-medium text-slate-200">{formatearFecha(r.fechaServicio)}</time>
                  <span className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs tabular-nums text-slate-300">
                    {formatearHoras(r.horometroServicio)} h
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                  <User className="h-3.5 w-3.5" />
                  {r.nombreTecnico}
                </p>
                {r.observaciones && (
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-300">{r.observaciones}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Modal>
  );
}
