import { AlertTriangle, CheckCircle2, Truck } from 'lucide-react';

function Tarjeta({ titulo, valor, icono: Icono, colorIcono, fondoIcono, loading, resaltar }) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border bg-slate-900 p-5 ${
        resaltar ? 'border-rose-500/30' : 'border-slate-800'
      }`}
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{titulo}</p>
        {loading ? (
          <div className="mt-2 h-8 w-12 animate-pulse rounded bg-slate-800" />
        ) : (
          <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-100">{valor}</p>
        )}
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${fondoIcono}`}>
        <Icono className={`h-6 w-6 ${colorIcono}`} />
      </div>
    </div>
  );
}

export default function MetricasCards({ equipos, loading }) {
  const total = equipos.length;
  const enAlerta = equipos.filter((e) => e.requiereMantenimiento).length;
  const operativos = total - enAlerta;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Tarjeta
        titulo="Total Maquinaria"
        valor={total}
        icono={Truck}
        colorIcono="text-slate-300"
        fondoIcono="bg-slate-800"
        loading={loading}
      />
      <Tarjeta
        titulo="Equipos Operativos"
        valor={operativos}
        icono={CheckCircle2}
        colorIcono="text-emerald-400"
        fondoIcono="bg-emerald-500/10"
        loading={loading}
      />
      <Tarjeta
        titulo="En Alerta de Mantenimiento"
        valor={enAlerta}
        icono={AlertTriangle}
        colorIcono={enAlerta > 0 ? 'text-rose-400' : 'text-slate-500'}
        fondoIcono={enAlerta > 0 ? 'bg-rose-500/10' : 'bg-slate-800'}
        loading={loading}
        resaltar={enAlerta > 0}
      />
    </section>
  );
}
