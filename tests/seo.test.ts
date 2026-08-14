import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';

let doc: ReturnType<typeof parse>;
beforeAll(() => { doc = parse(readFileSync('dist/index.html', 'utf-8')); });

describe('cabecera SEO', () => {
  it('el title termina en la marca, nunca en el dominio', () => {
    const t = doc.querySelector('title')!.text;
    expect(t).toMatch(/\| MiPC Tecnología$/);
    expect(t).not.toContain('mipc.com.co');
  });

  it('tiene meta description no vacía', () => {
    const d = doc.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(d && d.length).toBeGreaterThan(50);
  });

  it('tiene canonical absoluta', () => {
    const c = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
    expect(c).toMatch(/^https:\/\/mipc\.com\.co\//);
  });

  it('tiene Open Graph con imagen, que hoy falta al compartir por WhatsApp', () => {
    expect(doc.querySelector('meta[property="og:title"]')).toBeTruthy();
    expect(doc.querySelector('meta[property="og:image"]')).toBeTruthy();
  });

  it('emite el JSON-LD de LocalBusiness', () => {
    const bloques = doc.querySelectorAll('script[type="application/ld+json"]');
    const tipos = bloques.map((b) => JSON.parse(b.text)['@type']);
    expect(tipos).toContain('LocalBusiness');
  });
});
