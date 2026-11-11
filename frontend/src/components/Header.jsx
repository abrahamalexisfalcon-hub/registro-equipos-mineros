import { useEffect, useState } from 'react';
import { Activity, Plus } from 'lucide-react';
import { checkHealth } from '../api/equipoService';

const INTERVALO_HEALTH_MS = 30000;

const ESTILOS_ESTADO = {
  verificando: { texto: 'Verificando…', badge: 'border-slate-700 bg-slate-800 text-slate-400', punto: 'bg-slate-500' },
  online: { texto: 'Backend Online', badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400', punto: 'bg-emerald-400 animate-pulse' },
  offline: { texto: 'Backend Offline', badge: 'border-rose-500/20 bg-rose-500/10 text-rose-400', punto: 'bg-rose-500' },
};

export default function Header({ onNuevo }) {
  const [estado, setEstado] = useState('verificando');

  useEffect(() => {
    let activo = true;
    const verificar = async () => {
      try {
        const data = await checkHealth();
        if (activo) setEstado(data?.status === 'UP' ? 'online' : 'offline');
      } catch {
        if (activo) setEstado('offline');
      }
    };
    verificar();
    const id = setInterval(verificar, INTERVALO_HEALTH_MS);
    return () => {
      activo = false;
      clearInterval(id);
    };
  }, []);

  const estilo = ESTILOS_ESTADO[estado];

  return (
    <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
          <Activity className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-100 sm:text-xl">
            Monitoreo de Horómetros - Equipos Mineros
          </h1>
          <span
            className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${estilo.badge}`}
          >
            <span className={`h-2 w-2 rounded-full ${estilo.punto}`} />
            {estilo.texto}
          </span>
        </div>
      </div>
      <button type="button" onClick={onNuevo} className="btn-primary">
        <Plus className="h-4 w-4" />
        Registrar Maquinaria
      </button>
    </header>
  );
}
