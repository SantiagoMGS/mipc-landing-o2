/**
 * `timeZone: 'UTC'` no es opcional: la fecha se parsea como medianoche UTC y,
 * sin fijar la zona, se convierte a la local. En Colombia (UTC-5) eso resta un
 * día a TODAS las entradas, de forma silenciosa y permanente.
 */
export function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}
