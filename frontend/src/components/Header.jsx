import { useEffect, useState } from 'react';
import { HardHat, Plus } from 'lucide-react';
import { checkHealth } from '../api/equipoService';

const INTERVALO_HEALTH_MS = 30000;

const ESTILOS_ESTADO = {
  verificando: { texto: 'Verificando…', badge: 'border-slate-200 bg-slate-50 text-slate-600', punto: 'bg-slate-400' },
  online: { texto: 'API Conectada', badge: 'border-emerald-200 bg-emerald-50 text-emerald-800', punto: 'bg-emerald-500 animate-pulse' },
  offline: { texto: 'API Sin conexión', badge: 'border-rose-200 bg-rose-50 text-rose-800', punto: 'bg-rose-500' },
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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900 text-white">
            <HardHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight text-slate-900 sm:text-lg">
              Monitoreo de Horómetros
            </h1>
            <p className="text-xs text-slate-500">Registro de Equipos Mineros</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${estilo.badge}`}
          >
            <span className={`h-2 w-2 rounded-full ${estilo.punto}`} />
            {estilo.texto}
          </span>
          <button type="button" onClick={onNuevo} className="btn-primary">
            <Plus className="h-4 w-4" />
            Registrar Maquinaria
          </button>
        </div>
      </div>
    </header>
  );
}
