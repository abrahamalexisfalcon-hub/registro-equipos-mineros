const formateadorHoras = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formateadorFecha = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatearHoras = (valor) => formateadorHoras.format(Number(valor ?? 0));

export const formatearFecha = (iso) => {
  if (!iso) return '—';
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? '—' : formateadorFecha.format(fecha);
};

/**
 * Calcula un prefijo limpio de 3 a 4 letras a partir del nombre del tipo de equipo.
 * Ej: "CAMIÓN" -> "CAM", "EXCAVADORA" -> "EXC", "PERFORADORA" -> "PERF", "TRACTOR ORUGA" -> "TRA".
 */
export function calcularPrefijoTipo(nombreTipo = '') {
  const limpio = nombreTipo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .trim();

  if (!limpio) return 'EQP';
  if (limpio.startsWith('PERFOR')) return 'PERF';

  const primeraPalabra = limpio.split(/\s+/)[0];
  return primeraPalabra.slice(0, 3).padEnd(3, 'X');
}

/**
 * Genera el siguiente código correlativo disponible para un tipo de equipo
 * analizando los equipos ya registrados (ej. si existen CAM-01 y CAM-02 -> CAM-03).
 */
export function generarSiguienteCodigo(nombreTipo, equipos = []) {
  const prefijo = calcularPrefijoTipo(nombreTipo);
  const patron = new RegExp(`^${prefijo}-(\\d+)$`, 'i');
  const codigosExistentes = new Set(equipos.map((e) => (e.codigo || '').trim().toUpperCase()));

  let maxNumero = 0;
  for (const equipo of equipos) {
    const match = (equipo.codigo || '').trim().match(patron);
    if (match) {
      const numero = parseInt(match[1], 10);
      if (!Number.isNaN(numero) && numero > maxNumero) {
        maxNumero = numero;
      }
    }
  }

  let siguiente = maxNumero + 1;
  let candidato = `${prefijo}-${String(siguiente).padStart(2, '0')}`;
  while (codigosExistentes.has(candidato)) {
    siguiente += 1;
    candidato = `${prefijo}-${String(siguiente).padStart(2, '0')}`;
  }

  return candidato;
}
