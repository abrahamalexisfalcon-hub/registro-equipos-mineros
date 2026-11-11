import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Plus, Sparkles } from 'lucide-react';
import Modal from './Modal';
import { crearEquipo, crearTipoEquipo, listarTiposEquipo } from '../api/equipoService';
import { extraerMensajeError } from '../api/axios';
import { calcularPrefijoTipo, generarSiguienteCodigo } from '../utils/formato';

// Semilla base como respaldo inmediato mientras carga la API
const TIPOS_BASE = [
  { idTipo: 1, nombre: 'CAMION', intervaloHorasMantenimiento: 500 },
  { idTipo: 2, nombre: 'EXCAVADORA', intervaloHorasMantenimiento: 250 },
  { idTipo: 3, nombre: 'PERFORADORA', intervaloHorasMantenimiento: 400 },
];

const VALOR_CREAR_TIPO = '__nuevo_tipo__';

export default function ModalNuevoEquipo({ equipos = [], onClose, onCreado }) {
  const [tipos, setTipos] = useState(TIPOS_BASE);
  const [form, setForm] = useState({ codigo: '', tipoId: '', horometroInicial: '0' });
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Estado del subformulario para crear un nuevo Tipo de Equipo
  const [mostrarNuevoTipo, setMostrarNuevoTipo] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState({ nombre: '', intervalo: '' });
  const [errorNuevoTipo, setErrorNuevoTipo] = useState(null);
  const [guardandoTipo, setGuardandoTipo] = useState(false);

  useEffect(() => {
    let activo = true;
    listarTiposEquipo()
      .then((data) => {
        if (activo && Array.isArray(data) && data.length > 0) {
          setTipos(data);
        }
      })
      .catch(() => {
        // Si el backend aún no expone la ruta, conserva TIPOS_BASE + tipos presentes en equipos
        if (!activo) return;
        const mapa = new Map(TIPOS_BASE.map((t) => [t.idTipo, t]));
        equipos.forEach((e) => {
          if (e.tipoEquipo?.idTipo) {
            mapa.set(e.tipoEquipo.idTipo, e.tipoEquipo);
          }
        });
        setTipos(Array.from(mapa.values()));
      });
    return () => {
      activo = false;
    };
  }, [equipos]);

  const tipoSeleccionado = useMemo(
    () => tipos.find((t) => String(t.idTipo) === String(form.tipoId)) || null,
    [tipos, form.tipoId],
  );

  const codigoSugerido = useMemo(
    () => (tipoSeleccionado ? generarSiguienteCodigo(tipoSeleccionado.nombre, equipos) : ''),
    [tipoSeleccionado, equipos],
  );

  const codigoNormalizado = form.codigo.trim().toUpperCase();
  const codigoDuplicado = useMemo(
    () =>
      Boolean(codigoNormalizado) &&
      equipos.some((e) => (e.codigo || '').trim().toUpperCase() === codigoNormalizado),
    [equipos, codigoNormalizado],
  );

  const handleSeleccionarTipo = (e) => {
    const valor = e.target.value;
    if (valor === VALOR_CREAR_TIPO) {
      setMostrarNuevoTipo(true);
      setErrorNuevoTipo(null);
      return;
    }

    const encontrado = tipos.find((t) => String(t.idTipo) === String(valor));
    const autogenerado = encontrado ? generarSiguienteCodigo(encontrado.nombre, equipos) : form.codigo;

    setForm((f) => ({
      ...f,
      tipoId: valor,
      codigo: autogenerado,
    }));
    setErrores((prev) => ({ ...prev, tipoId: undefined, codigo: undefined }));
    setErrorServidor(null);
  };

  const actualizar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
    setErrorServidor(null);
  };

  const handleGuardarNuevoTipo = async () => {
    const nombreLimpio = nuevoTipo.nombre.trim().toUpperCase();
    const intervaloNum = Number(nuevoTipo.intervalo);

    if (!nombreLimpio) {
      setErrorNuevoTipo('Ingrese el nombre del tipo (ej. CARGADOR FRONTAL).');
      return;
    }
    if (tipos.some((t) => t.nombre.trim().toUpperCase() === nombreLimpio)) {
      setErrorNuevoTipo(`El tipo "${nombreLimpio}" ya existe en la lista.`);
      return;
    }
    if (!nuevoTipo.intervalo || Number.isNaN(intervaloNum) || intervaloNum <= 0) {
      setErrorNuevoTipo('Ingrese un intervalo mayor a 0 horas.');
      return;
    }

    setGuardandoTipo(true);
    setErrorNuevoTipo(null);
    try {
      const creado = await crearTipoEquipo({
        nombre: nombreLimpio,
        intervaloHorasMantenimiento: intervaloNum,
      });

      setTipos((prev) => [...prev, creado]);
      const siguienteCodigo = generarSiguienteCodigo(creado.nombre, equipos);
      setForm((f) => ({
        ...f,
        tipoId: String(creado.idTipo),
        codigo: siguienteCodigo,
      }));
      setErrores((prev) => ({ ...prev, tipoId: undefined, codigo: undefined }));
      setNuevoTipo({ nombre: '', intervalo: '' });
      setMostrarNuevoTipo(false);
    } catch (err) {
      setErrorNuevoTipo(extraerMensajeError(err));
    } finally {
      setGuardandoTipo(false);
    }
  };

  const validar = () => {
    const nuevos = {};
    if (!form.tipoId) nuevos.tipoId = 'Seleccione un tipo de equipo.';
    if (!codigoNormalizado) nuevos.codigo = 'El código es obligatorio.';
    else if (codigoNormalizado.length > 50) nuevos.codigo = 'Máximo 50 caracteres.';
    else if (codigoDuplicado) nuevos.codigo = `El código ${codigoNormalizado} ya está asignado a otro equipo.`;
    if (form.horometroInicial === '') nuevos.horometroInicial = 'El horómetro inicial es obligatorio.';
    else if (Number(form.horometroInicial) < 0) nuevos.horometroInicial = 'No puede ser negativo.';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setEnviando(true);
    try {
      const creado = await crearEquipo({
        codigo: codigoNormalizado,
        tipoId: Number(form.tipoId),
        horometroInicial: Number(form.horometroInicial),
      });
      onCreado(creado);
    } catch (err) {
      setErrorServidor(extraerMensajeError(err));
      setEnviando(false);
    }
  };

  return (
    <Modal titulo="Registrar Maquinaria" subtitulo="Alta de un nuevo equipo en la flota" icono={Plus} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errorServidor && (
          <div className="alert-error">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {errorServidor}
          </div>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="tipoId" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Tipo de equipo
            </label>
            {!mostrarNuevoTipo && (
              <button
                type="button"
                onClick={() => {
                  setMostrarNuevoTipo(true);
                  setErrorNuevoTipo(null);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition duration-150 hover:text-blue-800"
                disabled={enviando}
              >
                <Plus className="h-3.5 w-3.5" />
                Crear nuevo tipo…
              </button>
            )}
          </div>

          <select
            id="tipoId"
            value={form.tipoId}
            onChange={handleSeleccionarTipo}
            className="input"
            disabled={enviando || guardandoTipo}
          >
            <option value="">Seleccione un tipo…</option>
            {tipos.map((t) => (
              <option key={t.idTipo} value={t.idTipo}>
                {t.nombre} ({Number(t.intervaloHorasMantenimiento)}h)
              </option>
            ))}
            <option value={VALOR_CREAR_TIPO}>+ Crear nuevo tipo…</option>
          </select>
          {errores.tipoId && <p className="field-error">{errores.tipoId}</p>}
        </div>

        {mostrarNuevoTipo && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Nuevo tipo de maquinaria
              </p>
              {nuevoTipo.nombre.trim() && (
                <span className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600">
                  Prefijo: {calcularPrefijoTipo(nuevoTipo.nombre)}-XX
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="nuevoTipoNombre" className="mb-1 block text-xs font-medium text-slate-600">
                  Nombre del tipo
                </label>
                <input
                  id="nuevoTipoNombre"
                  type="text"
                  value={nuevoTipo.nombre}
                  onChange={(e) => {
                    setNuevoTipo((prev) => ({ ...prev, nombre: e.target.value }));
                    setErrorNuevoTipo(null);
                  }}
                  placeholder="Ej. CARGADOR FRONTAL"
                  className="input uppercase"
                  maxLength={100}
                  disabled={guardandoTipo}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="nuevoTipoIntervalo" className="mb-1 block text-xs font-medium text-slate-600">
                  Intervalo (h)
                </label>
                <input
                  id="nuevoTipoIntervalo"
                  type="number"
                  min="1"
                  step="1"
                  value={nuevoTipo.intervalo}
                  onChange={(e) => {
                    setNuevoTipo((prev) => ({ ...prev, intervalo: e.target.value }));
                    setErrorNuevoTipo(null);
                  }}
                  placeholder="Ej. 350"
                  className="input tabular-nums"
                  disabled={guardandoTipo}
                />
              </div>
            </div>

            {errorNuevoTipo && (
              <p className="flex items-center gap-1.5 text-xs text-rose-700">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {errorNuevoTipo}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setMostrarNuevoTipo(false);
                  setErrorNuevoTipo(null);
                }}
                className="btn-secondary px-3 py-1.5 text-xs"
                disabled={guardandoTipo}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarNuevoTipo}
                className="btn-primary px-3 py-1.5 text-xs"
                disabled={guardandoTipo}
              >
                {guardandoTipo && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Guardar tipo
              </button>
            </div>
          </div>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="codigo" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Código
            </label>
            {codigoSugerido && codigoNormalizado !== codigoSugerido && (
              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, codigo: codigoSugerido }));
                  setErrores((prev) => ({ ...prev, codigo: undefined }));
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition duration-150 hover:text-blue-800"
              >
                <Sparkles className="h-3 w-3" />
                Usar sugerido ({codigoSugerido})
              </button>
            )}
          </div>
          <input
            id="codigo"
            type="text"
            value={form.codigo}
            onChange={actualizar('codigo')}
            placeholder={codigoSugerido || 'Seleccione un tipo o ingrese código (ej. CAM-01)'}
            className={`input font-mono uppercase ${
              codigoDuplicado ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500/20' : ''
            }`}
            maxLength={50}
            disabled={enviando}
          />
          {codigoDuplicado ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              El código {codigoNormalizado} ya existe en la flota.
              {codigoSugerido && ` Disponible sugerido: ${codigoSugerido}.`}
            </p>
          ) : codigoNormalizado && tipoSeleccionado ? (
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              Código disponible para registro.
            </p>
          ) : null}
          {errores.codigo && !codigoDuplicado && <p className="field-error">{errores.codigo}</p>}
        </div>

        <div>
          <label htmlFor="horometroInicial" className="label">Horómetro inicial (h)</label>
          <input
            id="horometroInicial"
            type="number"
            min="0"
            step="0.01"
            value={form.horometroInicial}
            onChange={actualizar('horometroInicial')}
            className="input tabular-nums"
            disabled={enviando}
          />
          {errores.horometroInicial && <p className="field-error">{errores.horometroInicial}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={enviando || codigoDuplicado}>
            {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
            Registrar
          </button>
        </div>
      </form>
    </Modal>
  );
}
