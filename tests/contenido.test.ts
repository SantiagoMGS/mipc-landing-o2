import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { esquemaServicio } from '../src/schemas';

describe('esquema de servicio', () => {
  const valido = {
    titulo: 'Soporte TI Empresarial',
    h1: 'Soporte TI empresarial en Medellín',
    metaTitle: 'Soporte TI Empresarial en Medellín | MiPC Tecnología',
    metaDescription: 'Mesa de ayuda, soporte remoto y en sitio para empresas en Medellín con más de 15 años de experiencia.',
    resumen: 'Mesa de ayuda y soporte para empresas.',
    publico: 'empresa',
    orden: 1,
  };

  it('acepta un servicio completo', () => {
    expect(() => esquemaServicio.parse(valido)).not.toThrow();
  });

  it('rechaza un servicio sin metaDescription', () => {
    const { metaDescription, ...sinMeta } = valido;
    expect(() => esquemaServicio.parse(sinMeta)).toThrow();
  });

  it('rechaza una metaDescription demasiado corta para ser útil', () => {
    expect(() => esquemaServicio.parse({ ...valido, metaDescription: 'Corta.' })).toThrow();
  });

  it('rechaza un metaTitle que termine en el dominio', () => {
    expect(() =>
      esquemaServicio.parse({ ...valido, metaTitle: 'Servicios – mipc.com.co' })
    ).toThrow();
  });

  it('rechaza una imagen sin alt', () => {
    expect(() =>
      esquemaServicio.parse({ ...valido, imagen: { src: './foto.jpg' } })
    ).toThrow();
  });

  it('rechaza un metaTitle que contiene el dominio aunque termine correctamente', () => {
    expect(() =>
      esquemaServicio.parse({ ...valido, metaTitle: 'Servicios de mipc.com.co en Medellín | MiPC Tecnología' })
    ).toThrow();
  });

  it('rechaza un alt que es un nombre de archivo largo', () => {
    expect(() =>
      esquemaServicio.parse({ ...valido, imagen: { src: './foto.jpg', alt: 'foto-tecnico-instalando-servidor.jpg' } })
    ).toThrow();
  });
});

describe('fotosPorServicio (src/data/fotos-servicios.ts)', () => {
  // No se importa el módulo directamente: sus imports de ../assets/fotos/*.jpg
  // dependen del pipeline de assets de Astro (ImageMetadata), que no está
  // disponible bajo vitest en Node puro. Se lee el archivo fuente como texto
  // y se extraen sus claves de nivel superior con una expresión regular —
  // suficiente para esta comprobación de sincronía de nombres.
  const fuente = readFileSync('src/data/fotos-servicios.ts', 'utf-8');
  const claves = [...fuente.matchAll(/^\s{2}'([\w-]+)':\s*\[/gm)].map((m) => m[1]);

  const idsReales = readdirSync('src/content/servicios')
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));

  it('encontró al menos una clave (si esto falla, la regex dejó de coincidir con el archivo)', () => {
    expect(claves.length).toBeGreaterThan(0);
  });

  it('cada clave coincide con un id real de la colección servicios', () => {
    // Un slug de servicio renombrado sin actualizar este mapa degrada en
    // silencio a "cero fotos" para esa página: fotosPorServicio[id] ?? []
    // no lanza ni avisa. Este test convierte ese renombrado en un fallo.
    for (const clave of claves) {
      expect(idsReales).toContain(clave);
    }
  });
});
