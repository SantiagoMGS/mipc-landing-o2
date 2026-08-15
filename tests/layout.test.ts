import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('pie de página (CRIT-04)', () => {
  const html = readFileSync('dist/index.html', 'utf-8');

  it('publica la dirección completa, no solo la ciudad', () => {
    expect(html).toContain('Carrera 66A # 34-48');
    // El barrio no aparece en el JSON-LD (PostalAddress no lo modela), así
    // que esta es la única aserción de esta prueba que solo el pie puede
    // satisfacer.
    expect(html).toContain('Laureles');
  });

  // OJO: no verificar aquí un simple `toContain('08:00')` — el JSON-LD ya
  // emite `"opens":"08:00"` y `"gerencia@mipc.com.co"` como `email`, así que
  // esas cadenas sobreviven aunque se borre el pie entero. Las franjas en
  // español (Lun a Vie, Sáb) no existen en ninguna otra parte del HTML
  // porque el JSON-LD guarda los días en inglés — solo el pie puede
  // producirlas, así que son las que de verdad prueban que el pie renderiza.
  it('publica correo y horario en español, no solo en el schema', () => {
    expect(html).toContain('Lun a Vie: 08:00 a 18:00');
    expect(html).toContain('Sáb: 08:00 a 12:00');
    expect(html).toContain(`mailto:${'gerencia@mipc.com.co'}`);
  });
});
