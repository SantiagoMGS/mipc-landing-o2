import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';

describe('contacto', () => {
  const doc = parse(readFileSync('dist/contacto/index.html', 'utf-8'));

  it('publica la dirección completa para el posicionamiento local', () => {
    const html = doc.toString();
    expect(html).toContain('Carrera 66A # 34-48');
  });

  it('el formulario redirige a /gracias/ para poder medir la conversión', () => {
    const redirect = doc.querySelector('input[name="redirect"]')?.getAttribute('value');
    expect(redirect).toContain('/gracias/');
  });

  it('tiene honeypot antispam oculto', () => {
    expect(doc.querySelector('input[name="botcheck"]')).toBeTruthy();
  });

  it('cada campo tiene su label asociada', () => {
    for (const id of ['nombre', 'email', 'telefono', 'mensaje']) {
      expect(doc.querySelector(`label[for="${id}"]`)).toBeTruthy();
      expect(doc.querySelector(`#${id}`)).toBeTruthy();
    }
  });
});
