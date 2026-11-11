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

// Un ciclo que supera el intervalo en más de este factor se muestra como alerta crítica (solo presentación).
const FACTOR_CRITICO = 1.1;

const nivelAlerta = (equipo) => {
  if (!equipo.requiereMantenimiento) return 'ok';
  const intervalo = Number(equipo.tipoEquipo?.intervaloHorasMantenimiento);
  const ciclo = Number(equipo.horasDesdeUltimoMantenimiento);
  return intervalo > 0 && ciclo >= intervalo * FACTOR_CRITICO ? 'critico' : 'requerido';
};

const ESTILOS_NIVEL = {
  ok: {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    barra: 'bg-emerald-500',
    texto: 'text-slate-900',
    accion: '',
  },
  requerido: {
    badge: 'border-amber-200 bg-amber-50 text-amber-800',
    barra: 'bg-amber-500',
    texto: 'font-semibold text-amber-800',
    accion: 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
  },
  critico: {
    badge: 'border-rose-200 bg-rose-50 text-rose-800',
    barra: 'bg-rose-500',
    texto: 'font-semibold text-rose-800',
    accion: 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100',
  },
};

function BadgeEstado({ nivel }) {
  const { badge } = ESTILOS_NIVEL[nivel];
  const Icono = nivel === 'ok' ? CheckCircle2 : AlertTriangle;
  const texto = { ok: 'Operativo', requerido: 'Requiere mantenimiento', critico: 'Mantenimiento vencido' }[nivel];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${badge}`}>
      <Icono className="h-3.5 w-3.5" />
      {texto}
    </span>
  );
}

function BarraCiclo({ horas, intervalo, nivel }) {
  const porcentaje = intervalo > 0 ? Math.min((Number(horas) / Number(intervalo)) * 100, 100) : 0;
  // Un equipo operativo se resalta en ámbar al acercarse al umbral (>= 80 %).
  const colorBarra = nivel === 'ok' && porcentaje >= 80 ? 'bg-amber-500' : ESTILOS_NIVEL[nivel].barra;
  return (
    <div className="min-w-[8rem]">
      <span className={`tabular-nums ${ESTILOS_NIVEL[nivel].texto}`}>{formatearHoras(horas)} h</span>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all duration-150 ${colorBarra}`} style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}

function FilaCargando() {
  return (
    <tr>
      {COLUMNAS.map((c) => (
        <td key={c} className="px-4 py-3.5">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        </td>
      ))}
    </tr>
  );
}

export default function TablaEquipos({ equipos, loading, onHorometro, onMantenimiento, onHistorial, onEliminar }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">Flota registrada</h2>
        {!loading && <span className="text-xs text-slate-500">{equipos.length} equipo(s)</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/70 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <tr>
              {COLUMNAS.map((c) => (
                <th key={c} scope="col" className={`whitespace-nowrap px-4 py-3 ${c === 'Acciones' ? 'text-right' : ''}`}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && [0, 1, 2].map((i) => <FilaCargando key={i} />)}

            {!loading && equipos.length === 0 && (
              <tr>
                <td colSpan={COLUMNAS.length} className="px-4 py-16 text-center">
                  <Truck className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-700">No hay maquinaria registrada.</p>
                  <p className="text-xs text-slate-500">Use “Registrar Maquinaria” para agregar el primer equipo.</p>
                </td>
              </tr>
            )}

            {!loading &&
              equipos.map((equipo) => {
                const nivel = nivelAlerta(equipo);
                const alerta = nivel !== 'ok';
                return (
                  <tr key={equipo.idEquipo} className="transition-colors duration-150 hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[13px] font-semibold text-slate-900">
                      {equipo.codigo}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{equipo.tipoEquipo?.nombre}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-medium tabular-nums text-slate-900">
                      {formatearHoras(equipo.horometro)} h
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-slate-500">
                      {formatearHoras(equipo.horasUltimoMantenimiento)} h
                    </td>
                    <td className="px-4 py-3.5">
                      <BarraCiclo
                        horas={equipo.horasDesdeUltimoMantenimiento}
                        intervalo={equipo.tipoEquipo?.intervaloHorasMantenimiento}
                        nivel={nivel}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-slate-500">
                      {formatearHoras(equipo.tipoEquipo?.intervaloHorasMantenimiento)} h
                    </td>
                    <td className="px-4 py-3.5">
                      <BadgeEstado nivel={nivel} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
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
                            className={`inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-xs font-semibold transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${ESTILOS_NIVEL[nivel].accion}`}
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
                          className="btn-icon hover:bg-rose-50 hover:text-rose-700"
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
