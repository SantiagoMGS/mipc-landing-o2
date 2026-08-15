import type { empresa } from '../data/empresa';

const DIAS_ES: Record<string, string> = {
  Monday: 'Lun', Tuesday: 'Mar', Wednesday: 'Mié', Thursday: 'Jue',
  Friday: 'Vie', Saturday: 'Sáb', Sunday: 'Dom',
};

const ORDEN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type Franja = { dias: readonly string[]; abre: string; cierra: string };

/**
 * Rotula «Lun a Vie» SOLO si los días son consecutivos. Con días sueltos
 * los enumera. Un rango inventado sobre días no contiguos anunciaría un
 * horario falso — alguien se presentaría un día que está cerrado.
 */
export function franja(h: Franja): string {
  const idx = h.dias.map((d) => ORDEN.indexOf(d));
  const consecutivos = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  const etiqueta =
    h.dias.length === 1
      ? DIAS_ES[h.dias[0]]
      : consecutivos
        ? `${DIAS_ES[h.dias[0]]} a ${DIAS_ES[h.dias[h.dias.length - 1]]}`
        : h.dias.map((d) => DIAS_ES[d]).join(', ');
  return `${etiqueta}: ${h.abre} a ${h.cierra}`;
}

export type { Franja };
export type EmpresaHorario = (typeof empresa.horario)[number];
