import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Header from './components/Header';
import MetricasCards from './components/MetricasCards';
import TablaEquipos from './components/TablaEquipos';
import ModalNuevoEquipo from './components/ModalNuevoEquipo';
import ModalHorometro from './components/ModalHorometro';
import ModalMantenimiento from './components/ModalMantenimiento';
import ModalHistorial from './components/ModalHistorial';
import Toast from './components/Toast';
import { eliminarEquipo, listarEquipos } from './api/equipoService';
import { extraerMensajeError } from './api/axios';

const DURACION_TOAST_MS = 4000;

export default function App() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  // modal: null | { tipo: 'nuevo' | 'horometro' | 'mantenimiento' | 'historial', equipo? }
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  // Refresca la lista de equipos; se invoca tras cada operación CRUD.
  const cargarDatos = useCallback(
    () =>
      listarEquipos()
        .then((data) => {
          setEquipos(data);
          setErrorCarga(null);
        })
        .catch((err) => setErrorCarga(extraerMensajeError(err)))
        .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => {
    let activo = true;
    listarEquipos()
      .then((data) => activo && setEquipos(data))
      .catch((err) => activo && setErrorCarga(extraerMensajeError(err)))
      .finally(() => activo && setLoading(false));
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), DURACION_TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  const notificar = (tipo, mensaje) => setToast({ tipo, mensaje, id: Date.now() });
  const cerrarModal = useCallback(() => setModal(null), []);
  const abrir = (tipo) => (equipo) => setModal({ tipo, equipo });

  const trasOperacion = (mensaje) => {
    setModal(null);
    notificar('exito', mensaje);
    cargarDatos();
  };

  const reintentar = () => {
    setLoading(true);
    cargarDatos();
  };

  const handleEliminar = async (equipo) => {
    const confirmado = window.confirm(
      `¿Eliminar el equipo ${equipo.codigo}? Se borrará también su historial de mantenimiento.`,
    );
    if (!confirmado) return;
    try {
      await eliminarEquipo(equipo.idEquipo);
      notificar('exito', `Equipo ${equipo.codigo} eliminado.`);
      cargarDatos();
    } catch (err) {
      notificar('error', extraerMensajeError(err));
    }
  };

  return (
    <div className="min-h-screen">
      <Header onNuevo={() => setModal({ tipo: 'nuevo' })} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {errorCarga && (
          <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {errorCarga}
            </span>
            <button type="button" onClick={reintentar} className="btn-secondary shrink-0">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          </div>
        )}

        <MetricasCards equipos={equipos} loading={loading} />

        <TablaEquipos
          equipos={equipos}
          loading={loading}
          onHorometro={abrir('horometro')}
          onMantenimiento={abrir('mantenimiento')}
          onHistorial={abrir('historial')}
          onEliminar={handleEliminar}
        />
      </main>

      {modal?.tipo === 'nuevo' && (
        <ModalNuevoEquipo
          onClose={cerrarModal}
          onCreado={(e) => trasOperacion(`Equipo ${e.codigo} registrado correctamente.`)}
        />
      )}
      {modal?.tipo === 'horometro' && (
        <ModalHorometro
          equipo={modal.equipo}
          onClose={cerrarModal}
          onActualizado={(e) =>
            trasOperacion(
              e.requiereMantenimiento
                ? `Horómetro de ${e.codigo} actualizado. ¡El equipo requiere mantenimiento!`
                : `Horómetro de ${e.codigo} actualizado.`,
            )
          }
        />
      )}
      {modal?.tipo === 'mantenimiento' && (
        <ModalMantenimiento
          equipo={modal.equipo}
          onClose={cerrarModal}
          onRegistrado={() => trasOperacion(`Servicio técnico registrado para ${modal.equipo.codigo}.`)}
        />
      )}
      {modal?.tipo === 'historial' && <ModalHistorial equipo={modal.equipo} onClose={cerrarModal} />}

      <Toast key={toast?.id} toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
