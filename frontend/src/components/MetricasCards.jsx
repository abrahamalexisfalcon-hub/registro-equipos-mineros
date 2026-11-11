import { AlertTriangle, CheckCircle2, Truck } from 'lucide-react';

function Tarjeta({ titulo, valor, icono: Icono, loading, colorValor = 'text-slate-900' }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{titulo}</p>
        {loading ? (
          <div className="mt-2 h-8 w-12 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className={`mt-1 text-3xl font-semibold tabular-nums ${colorValor}`}>{valor}</p>
        )}
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icono className="h-5 w-5" />
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
      <Tarjeta titulo="Total Maquinaria" valor={total} icono={Truck} loading={loading} />
      <Tarjeta titulo="Equipos Operativos" valor={operativos} icono={CheckCircle2} loading={loading} />
      <Tarjeta
        titulo="En Alerta de Mantenimiento"
        valor={enAlerta}
        icono={AlertTriangle}
        loading={loading}
        colorValor={enAlerta > 0 ? 'text-amber-700' : 'text-slate-900'}
      />
    </section>
  );
}
