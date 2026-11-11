import { AlertTriangle, CheckCircle2, Clock, History, Trash2, Truck, Wrench } from 'lucide-react';
import { formatearHoras } from '../utils/formato';

const COLUMNAS = [
  'Código',
  'Tipo',
  'Horómetro Actual',
  'Último Servicio',
  'Horas Ciclo',
  'Intervalo Alerta',
  'Estado',
  'Acciones',
];

function BadgeEstado({ requiereMantenimiento }) {
  if (requiereMantenimiento) {
    return (
      <span className="inline-flex animate-pulse items-center gap-1.5 whitespace-nowrap rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        Requiere Mantenimiento
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Operativo
    </span>
  );
}

function BarraCiclo({ horas, intervalo, alerta }) {
  const porcentaje = intervalo > 0 ? Math.min((Number(horas) / Number(intervalo)) * 100, 100) : 0;
  const color = alerta ? 'bg-rose-500' : porcentaje >= 80 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="min-w-[7rem]">
      <span className={`tabular-nums ${alerta ? 'font-semibold text-rose-400' : 'text-slate-200'}`}>
        {formatearHoras(horas)} h
      </span>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}

function FilaCargando() {
  return (
    <tr>
      {COLUMNAS.map((c) => (
        <td key={c} className="px-4 py-4">
          <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
        </td>
      ))}
    </tr>
  );
}

export default function TablaEquipos({ equipos, loading, onHorometro, onMantenimiento, onHistorial, onEliminar }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Flota Registrada</h2>
        {!loading && <span className="text-xs text-slate-500">{equipos.length} equipo(s)</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {COLUMNAS.map((c) => (
                <th key={c} scope="col" className={`whitespace-nowrap px-4 py-3 font-medium ${c === 'Acciones' ? 'text-right' : ''}`}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading && [0, 1, 2].map((i) => <FilaCargando key={i} />)}

            {!loading && equipos.length === 0 && (
              <tr>
                <td colSpan={COLUMNAS.length} className="px-4 py-16 text-center">
                  <Truck className="mx-auto h-10 w-10 text-slate-700" />
                  <p className="mt-3 text-sm text-slate-400">No hay maquinaria registrada.</p>
                  <p className="text-xs text-slate-500">Use “Registrar Maquinaria” para agregar el primer equipo.</p>
                </td>
              </tr>
            )}

            {!loading &&
              equipos.map((equipo) => {
                const alerta = equipo.requiereMantenimiento;
                return (
                  <tr key={equipo.idEquipo} className={`transition-colors hover:bg-slate-800/40 ${alerta ? 'bg-rose-500/[0.03]' : ''}`}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold text-slate-100">{equipo.codigo}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-300">{equipo.tipoEquipo?.nombre}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-200">
                      {formatearHoras(equipo.horometro)} h
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-400">
                      {formatearHoras(equipo.horasUltimoMantenimiento)} h
                    </td>
                    <td className="px-4 py-3">
                      <BarraCiclo
                        horas={equipo.horasDesdeUltimoMantenimiento}
                        intervalo={equipo.tipoEquipo?.intervaloHorasMantenimiento}
                        alerta={alerta}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-400">
                      {formatearHoras(equipo.tipoEquipo?.intervaloHorasMantenimiento)} h
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEstado requiereMantenimiento={alerta} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onHorometro(equipo)}
                          className="btn-icon"
                          title="Actualizar horómetro"
                          aria-label={`Actualizar horómetro de ${equipo.codigo}`}
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                        {alerta ? (
                          <button
                            type="button"
                            onClick={() => onMantenimiento(equipo)}
                            className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md bg-rose-500 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                            title="Registrar servicio técnico"
                          >
                            <Wrench className="h-3.5 w-3.5" />
                            Servicio
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onMantenimiento(equipo)}
                            className="btn-icon"
                            title="Registrar servicio técnico"
                            aria-label={`Registrar servicio técnico de ${equipo.codigo}`}
                          >
                            <Wrench className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onHistorial(equipo)}
                          className="btn-icon"
                          title="Historial de servicios"
                          aria-label={`Historial de servicios de ${equipo.codigo}`}
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEliminar(equipo)}
                          className="btn-icon hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
                          title="Eliminar equipo"
                          aria-label={`Eliminar ${equipo.codigo}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
