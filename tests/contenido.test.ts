import { describe, it, expect } from 'vitest';
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
