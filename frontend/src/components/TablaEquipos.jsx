import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, History, Search, SearchX, Trash2, Truck, Wrench, X } from 'lucide-react';
import { formatearHoras } from '../utils/formato';

const COLUMNAS = [
  { id: 'codigo', label: 'CÓDIGO' },
  { id: 'tipo', label: 'TIPO' },
  { id: 'horometro', label: 'HORÓMETRO ACTUAL' },
  { id: 'ultimo', label: 'ÚLTIMO SERVICIO' },
  { id: 'ciclo', label: 'HORAS CICLO' },
  { id: 'intervalo', label: 'INTERVALO ALERTA' },
  { id: 'estado', label: 'ESTADO' },
  { id: 'acciones', label: 'ACCIONES' },
];

const FILTROS_ESTADO = [
  { id: 'todos', label: 'Todos', aplica: () => true },
  { id: 'operativos', label: 'Operativos', aplica: (e) => !e.requiereMantenimiento },
  { id: 'mantenimiento', label: 'En Alerta', aplica: (e) => e.requiereMantenimiento },
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
    fila: 'hover:bg-slate-50/80',
    card: 'border-slate-200',
    marca: '',
    accion: '',
  },
  requerido: {
    badge: 'border-amber-200 bg-amber-50 text-amber-800',
    barra: 'bg-amber-500',
    texto: 'font-semibold text-amber-800',
    fila: 'bg-amber-50/30 hover:bg-amber-50/70',
    card: 'border-slate-200 border-l-4 border-l-amber-500 bg-amber-50/20',
    marca: 'shadow-[inset_3px_0_0_0_#f59e0b]',
    accion: 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
  },
  critico: {
    badge: 'border-rose-200 bg-rose-50 text-rose-800',
    barra: 'bg-rose-500',
    texto: 'font-semibold text-rose-800',
    fila: 'bg-rose-50/50 hover:bg-rose-50',
    card: 'border-slate-200 border-l-4 border-l-red-500 bg-rose-50/20',
    marca: 'shadow-[inset_3px_0_0_0_#f43f5e]',
    accion: 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100',
  },
};

const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

function BadgeEstado({ nivel }) {
  const { badge } = ESTILOS_NIVEL[nivel];
  const Icono = nivel === 'ok' ? CheckCircle2 : AlertTriangle;
  const texto = { ok: 'Operativo', requerido: 'Requiere mantenimiento', critico: 'Mantenimiento vencido' }[nivel];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${badge}`}>
      <Icono className="h-3.5 w-3.5 shrink-0" />
      {texto}
    </span>
  );
}

function BarraCiclo({ horas, intervalo, nivel }) {
  const porcentaje = intervalo > 0 ? Math.min((Number(horas) / Number(intervalo)) * 100, 100) : 0;
  // Un equipo operativo se resalta en ámbar al acercarse al umbral (>= 80 %).
  const colorBarra = nivel === 'ok' && porcentaje >= 80 ? 'bg-amber-500' : ESTILOS_NIVEL[nivel].barra;
  return (
    <div className="w-full min-w-[7rem]">
      <span className={`tabular-nums text-xs ${ESTILOS_NIVEL[nivel].texto}`}>{formatearHoras(horas)} h</span>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all duration-150 ${colorBarra}`} style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}

function FilaCargando() {
  return (
    <tr>
      {COLUMNAS.map((c) => (
        <td key={c.id} className="px-3.5 py-3.5">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        </td>
      ))}
    </tr>
  );
}

function CardCargando() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 rounded bg-slate-100" />
        <div className="h-5 w-24 rounded-full bg-slate-100" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-32 rounded bg-slate-100" />
        <div className="h-2 w-full rounded-full bg-slate-100" />
      </div>
      <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
        <div className="h-8 w-20 rounded bg-slate-100" />
        <div className="h-8 w-20 rounded bg-slate-100" />
      </div>
    </div>
  );
}

function FilaVacia({ icono: Icono, titulo, detalle, children }) {
  return (
    <tr>
      <td colSpan={COLUMNAS.length} className="px-4 py-16 text-center">
        <Icono className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-700">{titulo}</p>
        <p className="text-xs text-slate-500">{detalle}</p>
        {children}
      </td>
    </tr>
  );
}

function TarjetaEquipoMovil({ equipo, onHorometro, onMantenimiento, onHistorial, onEliminar }) {
  const nivel = nivelAlerta(equipo);
  const estilos = ESTILOS_NIVEL[nivel];
  const intervalo = equipo.tipoEquipo?.intervaloHorasMantenimiento;
  const horasCiclo = equipo.horasDesdeUltimoMantenimiento;
  const porcentaje = intervalo > 0 ? Math.min((Number(horasCiclo) / Number(intervalo)) * 100, 100) : 0;
  const colorBarra = nivel === 'ok' && porcentaje >= 80 ? 'bg-amber-500' : estilos.barra;

  return (
    <article className={`rounded-xl border bg-white p-4 shadow-sm transition duration-150 ${estilos.card}`}>
      {/* Header: Código + Tipo + Badge Estado */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-800">
            {equipo.codigo}
          </span>
          <span className="text-xs font-semibold text-slate-700">{equipo.tipoEquipo?.nombre}</span>
        </div>
        <div className="shrink-0">
          <BadgeEstado nivel={nivel} />
        </div>
      </div>

      {/* Datos Clave: Horómetro y Ciclo */}
      <div className="mt-3.5 grid grid-cols-2 gap-3 rounded-lg bg-slate-50/70 p-2.5">
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">Horómetro Actual</span>
          <span className="text-sm font-bold tabular-nums text-slate-900">{formatearHoras(equipo.horometro)} h</span>
        </div>
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">Último Servicio</span>
          <span className="text-sm font-medium tabular-nums text-slate-600">{formatearHoras(equipo.horasUltimoMantenimiento)} h</span>
        </div>
      </div>

      {/* Barra de Progreso del Ciclo */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Horas de ciclo</span>
          <span className={`font-semibold tabular-nums ${estilos.texto}`}>
            {formatearHoras(horasCiclo)} / {formatearHoras(intervalo)} h
          </span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full transition-all duration-150 ${colorBarra}`} style={{ width: `${porcentaje}%` }} />
        </div>
      </div>

      {/* Footer de Acciones Táctiles */}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-1.5 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => onHorometro(equipo)}
          className="btn-secondary h-9 touch-manipulation px-2.5 text-xs font-medium"
          title="Registrar horómetro"
          aria-label={`Registrar horómetro de ${equipo.codigo}`}
        >
          <Clock className="h-4 w-4 text-slate-500" />
          <span>Horómetro</span>
        </button>

        <button
          type="button"
          onClick={() => onMantenimiento(equipo)}
          className={`h-9 touch-manipulation inline-flex items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
            nivel === 'ok'
              ? 'border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50'
              : estilos.accion
          }`}
          title={nivel === 'ok' ? 'Registrar servicio' : 'Registrar servicio (mantenimiento pendiente)'}
          aria-label={`Registrar servicio de ${equipo.codigo}`}
        >
          <Wrench className="h-3.5 w-3.5" />
          <span>Servicio</span>
        </button>

        <button
          type="button"
          onClick={() => onHistorial(equipo)}
          className="btn-icon h-9 w-9 touch-manipulation rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
          title="Historial de servicios"
          aria-label={`Historial de servicios de ${equipo.codigo}`}
        >
          <History className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onEliminar(equipo)}
          className="btn-icon h-9 w-9 touch-manipulation rounded-lg border border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          title="Eliminar equipo"
          aria-label={`Eliminar equipo ${equipo.codigo}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

export default function TablaEquipos({ equipos, loading, onHorometro, onMantenimiento, onHistorial, onEliminar }) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Filtrado en memoria: no genera peticiones adicionales al backend.
  const equiposFiltrados = useMemo(() => {
    const termino = normalizar(busqueda);
    const { aplica } = FILTROS_ESTADO.find((f) => f.id === filtroEstado);
    return equipos.filter(
      (e) =>
        aplica(e) &&
        (!termino || normalizar(e.codigo).includes(termino) || normalizar(e.tipoEquipo?.nombre).includes(termino)),
    );
  }, [equipos, busqueda, filtroEstado]);

  const conteoPorEstado = useMemo(
    () => Object.fromEntries(FILTROS_ESTADO.map((f) => [f.id, equipos.filter(f.aplica).length])),
    [equipos],
  );

  const hayFiltros = busqueda.trim() !== '' || filtroEstado !== 'todos';
  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('todos');
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      {/* Cabecera compartida con Búsqueda y Filtros Rápidos */}
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Flota registrada</h2>
          {!loading && (
            <span className="text-xs tabular-nums text-slate-500">
              {hayFiltros ? `${equiposFiltrados.length} de ${equipos.length}` : equipos.length} equipo(s)
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por código o tipo…"
              aria-label="Buscar equipos por código o tipo"
              className="input py-1.5 pl-9 pr-8 text-xs"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 transition duration-150 hover:bg-slate-100 hover:text-slate-700"
                title="Limpiar búsqueda"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div role="group" aria-label="Filtrar por estado" className="inline-flex w-full rounded-lg border border-slate-200 bg-slate-100/70 p-0.5 sm:w-auto">
            {FILTROS_ESTADO.map((f) => {
              const activo = filtroEstado === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFiltroEstado(f.id)}
                  aria-pressed={activo}
                  className={`flex-1 whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 sm:flex-none ${
                    activo ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                  {!loading && (
                    <span className={`ml-1.5 tabular-nums ${activo ? 'text-slate-500' : 'text-slate-400'}`}>
                      {conteoPorEstado[f.id]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. Vista Móvil: Cards táctiles (block md:hidden) */}
      <div className="block p-4 md:hidden">
        {loading && (
          <div className="space-y-3.5">
            {[0, 1, 2].map((i) => (
              <CardCargando key={i} />
            ))}
          </div>
        )}

        {!loading && equipos.length === 0 && (
          <div className="py-12 text-center">
            <Truck className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">No hay maquinaria registrada.</p>
            <p className="text-xs text-slate-500">Use “Registrar Maquinaria” para agregar el primer equipo.</p>
          </div>
        )}

        {!loading && equipos.length > 0 && equiposFiltrados.length === 0 && (
          <div className="py-12 text-center">
            <SearchX className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">Ningún equipo coincide con los filtros.</p>
            <p className="text-xs text-slate-500">Ajuste la búsqueda o el estado seleccionado.</p>
            <button type="button" onClick={limpiarFiltros} className="btn-secondary mt-4 py-1.5 text-xs">
              Limpiar filtros
            </button>
          </div>
        )}

        {!loading && (
          <div className="space-y-3.5">
            {equiposFiltrados.map((equipo) => (
              <TarjetaEquipoMovil
                key={equipo.idEquipo}
                equipo={equipo}
                onHorometro={onHorometro}
                onMantenimiento={onMantenimiento}
                onHistorial={onHistorial}
                onEliminar={onEliminar}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Vista Desktop: Tabla completa (hidden md:block) */}
      <div className="hidden md:block overflow-x-auto lg:overflow-x-visible">
        <table className="w-full table-auto border-collapse text-left text-sm">
          <thead className="bg-slate-100/70 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <tr>
              {COLUMNAS.map((c) => (
                <th key={c.id} scope="col" className={`px-3.5 py-3 align-middle ${c.id === 'acciones' ? 'text-right' : ''}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && [0, 1, 2].map((i) => <FilaCargando key={i} />)}

            {!loading && equipos.length === 0 && (
              <FilaVacia
                icono={Truck}
                titulo="No hay maquinaria registrada."
                detalle="Use “Registrar Maquinaria” para agregar el primer equipo."
              />
            )}

            {!loading && equipos.length > 0 && equiposFiltrados.length === 0 && (
              <FilaVacia icono={SearchX} titulo="Ningún equipo coincide con los filtros." detalle="Ajuste la búsqueda o el estado seleccionado.">
                <button type="button" onClick={limpiarFiltros} className="btn-secondary mt-4 py-1.5 text-xs">
                  Limpiar filtros
                </button>
              </FilaVacia>
            )}

            {!loading &&
              equiposFiltrados.map((equipo) => {
                const nivel = nivelAlerta(equipo);
                const estilos = ESTILOS_NIVEL[nivel];
                return (
                  <tr key={equipo.idEquipo} className={`transition-colors duration-150 ${estilos.fila}`}>
                    <td className={`whitespace-nowrap px-3.5 py-3.5 ${estilos.marca}`}>
                      <span
                        className="inline-block rounded bg-slate-100 px-2 py-0.5 align-middle font-mono text-xs font-bold text-slate-800"
                        title={equipo.codigo}
                      >
                        {equipo.codigo}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3.5 text-slate-600 font-medium" title={equipo.tipoEquipo?.nombre}>
                      {equipo.tipoEquipo?.nombre}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3.5 font-medium tabular-nums text-slate-900">
                      {formatearHoras(equipo.horometro)} h
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3.5 tabular-nums text-slate-500">
                      {formatearHoras(equipo.horasUltimoMantenimiento)} h
                    </td>
                    <td className="px-3.5 py-3.5">
                      <BarraCiclo
                        horas={equipo.horasDesdeUltimoMantenimiento}
                        intervalo={equipo.tipoEquipo?.intervaloHorasMantenimiento}
                        nivel={nivel}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3.5 tabular-nums text-slate-500">
                      {formatearHoras(equipo.tipoEquipo?.intervaloHorasMantenimiento)} h
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3.5">
                      <BadgeEstado nivel={nivel} />
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onHorometro(equipo)}
                          className="btn-icon"
                          title="Registrar horómetro"
                          aria-label={`Registrar horómetro de ${equipo.codigo}`}
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMantenimiento(equipo)}
                          className={
                            nivel === 'ok'
                              ? 'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40'
                              : 'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40'
                          }
                          title={nivel === 'ok' ? 'Registrar servicio' : 'Registrar servicio (mantenimiento pendiente)'}
                          aria-label={`Registrar servicio de ${equipo.codigo}`}
                        >
                          <Wrench className="h-3.5 w-3.5" />
                          <span>Servicio</span>
                        </button>
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
                          aria-label={`Eliminar equipo ${equipo.codigo}`}
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
