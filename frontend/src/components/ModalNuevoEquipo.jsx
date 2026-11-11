import { useState } from 'react';
import { AlertTriangle, Loader2, Plus } from 'lucide-react';
import Modal from './Modal';
import { crearEquipo } from '../api/equipoService';
import { extraerMensajeError } from '../api/axios';

// IDs según el orden de inserción del DataInitializer del backend
const TIPOS_EQUIPO = [
  { id: 1, nombre: 'CAMION', intervalo: 500 },
  { id: 2, nombre: 'EXCAVADORA', intervalo: 250 },
  { id: 3, nombre: 'PERFORADORA', intervalo: 400 },
];

export default function ModalNuevoEquipo({ onClose, onCreado }) {
  const [form, setForm] = useState({ codigo: '', tipoId: '', horometroInicial: '0' });
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const actualizar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
    setErrorServidor(null);
  };

  const validar = () => {
    const nuevos = {};
    if (!form.codigo.trim()) nuevos.codigo = 'El código es obligatorio.';
    else if (form.codigo.trim().length > 50) nuevos.codigo = 'Máximo 50 caracteres.';
    if (!form.tipoId) nuevos.tipoId = 'Seleccione un tipo de equipo.';
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
        codigo: form.codigo.trim().toUpperCase(),
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
          <label htmlFor="tipoId" className="label">Tipo de equipo</label>
          <select id="tipoId" value={form.tipoId} onChange={actualizar('tipoId')} className="input" disabled={enviando}>
            <option value="">Seleccione…</option>
            {TIPOS_EQUIPO.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} ({t.intervalo}h)
              </option>
            ))}
          </select>
          {errores.tipoId && <p className="field-error">{errores.tipoId}</p>}
        </div>

        <div>
          <label htmlFor="codigo" className="label">Código</label>
          <input
            id="codigo"
            type="text"
            value={form.codigo}
            onChange={actualizar('codigo')}
            placeholder="Ej. CAM-02"
            className="input font-mono uppercase"
            maxLength={50}
            disabled={enviando}
            autoFocus
          />
          {errores.codigo && <p className="field-error">{errores.codigo}</p>}
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
          <button type="submit" className="btn-primary" disabled={enviando}>
            {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
            Registrar
          </button>
        </div>
      </form>
    </Modal>
  );
}
