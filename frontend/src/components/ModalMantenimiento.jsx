import { useState } from 'react';
import { AlertTriangle, Info, Loader2, Wrench } from 'lucide-react';
import Modal from './Modal';
import { registrarMantenimiento } from '../api/equipoService';
import { extraerMensajeError } from '../api/axios';
import { formatearHoras } from '../utils/formato';

export default function ModalMantenimiento({ equipo, onClose, onRegistrado }) {
  const [nombreTecnico, setNombreTecnico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombreTecnico.trim()) {
      setError('El nombre del técnico responsable es obligatorio.');
      return;
    }
    setEnviando(true);
    try {
      const registro = await registrarMantenimiento(equipo.idEquipo, {
        nombreTecnico: nombreTecnico.trim(),
        observaciones: observaciones.trim() || null,
      });
      onRegistrado(registro);
    } catch (err) {
      setError(extraerMensajeError(err));
      setEnviando(false);
    }
  };

  return (
    <Modal
      titulo="Registrar Servicio Técnico"
      subtitulo={`Equipo ${equipo.codigo} · Horómetro ${formatearHoras(equipo.horometro)} h`}
      icono={Wrench}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-sm text-sky-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Al guardar, las horas de ciclo se reiniciarán a 0.00
            <span className="text-sky-400/70"> (actualmente {formatearHoras(equipo.horasDesdeUltimoMantenimiento)} h).</span>
          </span>
        </div>

        <div>
          <label htmlFor="nombreTecnico" className="label">Técnico responsable</label>
          <input
            id="nombreTecnico"
            type="text"
            value={nombreTecnico}
            onChange={(e) => {
              setNombreTecnico(e.target.value);
              setError(null);
            }}
            placeholder="Nombre y apellido"
            className="input"
            maxLength={150}
            disabled={enviando}
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="observaciones" className="label">Observaciones del trabajo</label>
          <textarea
            id="observaciones"
            rows={4}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Cambio de aceite, filtros, inspección de frenos…"
            className="input resize-none"
            disabled={enviando}
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
            Registrar Servicio
          </button>
        </div>
      </form>
    </Modal>
  );
}
