import { z } from 'astro/zod';

/** Imagen con alt obligatorio y descriptivo. Corrige SEO-07. */
const imagen = z.object({
  src: z.string(),
  alt: z
    .string()
    .min(10, 'El alt debe describir la escena, no ser el nombre del archivo')
    .refine((a) => !/\.(jpe?g|png|gif|svg|webp|avif)$/i.test(a.trim()), {
      message: 'El alt es un nombre de archivo. Describe qué se ve en la imagen.',
    }),
});

/** Campos de SEO que toda página de contenido debe traer. */
const seo = {
  metaTitle: z
    .string()
    .min(20, 'Demasiado corto para incluir el servicio y la ciudad')
    .max(65, 'Google lo truncará en el resultado de búsqueda')
    .refine((t) => t.endsWith('| MiPC Tecnología'), {
      message: 'El título debe terminar en "| MiPC Tecnología"',
    })
    .refine((t) => !t.includes('mipc.com.co'), {
      message: 'El título no puede contener el dominio: la marca es MiPC Tecnología',
    }),
  metaDescription: z
    .string()
    .min(70, 'Demasiado corta para servir de argumento en el resultado de búsqueda')
    .max(165, 'Google la truncará'),
};

export const esquemaServicio = z.object({
  titulo: z.string(),
  h1: z.string(),
  ...seo,
  resumen: z.string().min(20, 'El resumen debe decir algo, no ser una etiqueta'),
  publico: z.enum(['empresa', 'persona', 'ambos']),
  orden: z.number().int(),
  imagen: imagen.optional(),
  beneficios: z.array(z.string()).default([]),
  faq: z.array(z.object({ pregunta: z.string(), respuesta: z.string() })).default([]),
});

export const esquemaCliente = z.object({
  nombre: z.string(),
  sector: z.string(),
  logo: z.string().optional(),
  orden: z.number().int().default(99),
});

/**
 * Proyecto ejecutado. Sustituye al antiguo `esquemaCaso`, cuyos tres casos
 * eran narrativas verosímiles pero inventadas sobre clientes reales.
 *
 * Cada campo de aquí tiene que poder señalarse en una fotografía o en un
 * registro: `lugar` y `anio` salen de la marca de agua de las fotos, y
 * `servicios` de lo que se ve instalado. Si un proyecto no da para llenar
 * esto sin adornar, no es un proyecto publicable — es relleno.
 */
export const esquemaProyecto = z.object({
  titulo: z.string(),
  h1: z.string(),
  ...seo,
  cliente: z.string(),
  sector: z.string(),
  lugar: z.string(),
  anio: z.number().int().min(2009, 'La empresa se fundó en 2009').max(2030),
  /** Slugs de `src/content/servicios/`. tests/proyectos.test.ts comprueba que existen. */
  servicios: z.array(z.string()).min(1, 'Un proyecto sin servicio asociado no se puede clasificar'),
  reto: z.string().min(40, 'El reto debe describir una situación, no una etiqueta'),
  solucion: z.string().min(40, 'La solución debe decir qué se instaló'),
  resultado: z.string().min(30, 'El resultado debe ser comprobable'),
  orden: z.number().int().default(99),
  // Las fotografías NO viven aquí: van en src/data/fotos-proyectos.ts, igual
  // que las de servicios. El motivo es astro:assets — optimizar una imagen
  // exige importarla, y una ruta en texto plano dentro del frontmatter no se
  // importa. tests/proyectos.test.ts comprueba que ningún proyecto se quede
  // sin foto, que es el fallo que esta separación hace posible.
});

export const esquemaEntrada = z.object({
  titulo: z.string(),
  ...seo,
  fecha: z.coerce.date(),
  resumen: z.string().min(20, 'El resumen debe decir algo, no ser una etiqueta'),
  imagen: imagen.optional(),
});

export const esquemaPagina = z.object({
  titulo: z.string(),
  h1: z.string(),
  ...seo,
});
