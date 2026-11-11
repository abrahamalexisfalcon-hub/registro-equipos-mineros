import { useState } from 'react';
import { AlertTriangle, Clock, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { actualizarHorometro } from '../api/equipoService';
import { extraerMensajeError } from '../api/axios';
import { formatearHoras } from '../utils/formato';

export default function ModalHorometro({ equipo, onClose, onActualizado }) {
  const actual = Number(equipo.horometro);
  const [valor, setValor] = useState(String(actual));
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (valor === '' || Number.isNaN(Number(valor))) {
      setError('Ingrese un valor numérico válido.');
      return;
    }
    const nuevo = Number(valor);
    if (nuevo < actual) {
      setError(`El nuevo horómetro debe ser mayor o igual al actual (${formatearHoras(actual)} h).`);
      return;
    }
    setEnviando(true);
    try {
      const actualizado = await actualizarHorometro(equipo.idEquipo, nuevo);
      onActualizado(actualizado);
    } catch (err) {
      setError(extraerMensajeError(err));
      setEnviando(false);
    }
  };

  return (
    <Modal titulo="Actualizar Horómetro" subtitulo={`Equipo ${equipo.codigo}`} icono={Clock} onClose={onClose} ancho="max-w-sm">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Horómetro actual</p>
          <p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-100">{formatearHoras(actual)} h</p>
        </div>

        <div>
          <label htmlFor="nuevoHorometro" className="label">Nuevo valor (h)</label>
          <input
            id="nuevoHorometro"
            type="number"
            min={actual}
            step="0.01"
            value={valor}
            onChange={(e) => {
              setValor(e.target.value);
              setError(null);
            }}
            className="input tabular-nums"
            disabled={enviando}
            autoFocus
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={enviando}>
            {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
