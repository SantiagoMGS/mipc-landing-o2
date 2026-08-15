import { describe, it, expect } from 'vitest';
import { localBusiness, service, breadcrumb } from '../src/lib/jsonld';

describe('localBusiness', () => {
  const ld = localBusiness() as any;

  it('declara el tipo y la dirección postal completa', () => {
    expect(ld['@type']).toBe('LocalBusiness');
    expect(ld.address['@type']).toBe('PostalAddress');
    expect(ld.address.addressLocality).toBe('Medellín');
    expect(ld.address.streetAddress).toContain('Carrera 66A');
  });

  it('usa el teléfono en E.164', () => {
    expect(ld.telephone).toBe('+573148889078');
  });

  it('incluye el horario como openingHoursSpecification', () => {
    expect(ld.openingHoursSpecification).toHaveLength(2);
    expect(ld.openingHoursSpecification[0].opens).toBe('08:00');
  });

  it('lista la zona de servicio', () => {
    expect(ld.areaServed.map((a: any) => a.name)).toContain('Envigado');
  });

  it('emite dayOfWeek con valores canónicos de schema.org, nunca abreviaturas', () => {
    const validDayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    ld.openingHoursSpecification.forEach((spec: any) => {
      spec.dayOfWeek.forEach((day: string) => {
        expect(validDayOfWeek).toContain(day);
        // Rechaza abreviaturas como 'Mo', 'Tu', etc., que Google no reconoce.
        expect(day).not.toMatch(/^[A-Z][a-z]$/);
      });
    });
  });
});

describe('service', () => {
  it('enlaza el servicio con el proveedor', () => {
    const ld = service({
      nombre: 'Soporte TI Empresarial',
      descripcion: 'Mesa de ayuda para empresas.',
      url: 'https://mipc.com.co/servicios/soporte-ti-empresarial/',
    }) as any;
    expect(ld['@type']).toBe('Service');
    expect(ld.provider.name).toBe('MiPC Tecnología');
    expect(ld.areaServed[0].name).toBe('Medellín');
  });
});

describe('breadcrumb', () => {
  it('numera las posiciones desde 1', () => {
    const ld = breadcrumb([
      { nombre: 'Inicio', url: 'https://mipc.com.co/' },
      { nombre: 'Servicios', url: 'https://mipc.com.co/servicios/' },
    ]) as any;
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement[1].position).toBe(2);
  });
});
