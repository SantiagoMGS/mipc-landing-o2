import { z } from 'astro/zod';

/** Imagen con alt obligatorio y descriptivo. Corrige SEO-07. */
const imagen = z.object({
  src: z.string(),
  alt: z.string().min(10, 'El alt debe describir la escena, no ser el nombre del archivo'),
});

/** Campos de SEO que toda página de contenido debe traer. */
const seo = {
  metaTitle: z
    .string()
    .min(20)
    .max(65)
    .refine((t) => t.endsWith('| MiPC Tecnología'), {
      message: 'El title debe terminar en "| MiPC Tecnología", nunca en el dominio',
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
  resumen: z.string().min(20),
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

export const esquemaCaso = z.object({
  cliente: z.string(),
  sector: z.string(),
  reto: z.string(),
  solucion: z.string(),
  resultado: z.string(),
  imagen: imagen.optional(),
  orden: z.number().int().default(99),
});

export const esquemaEntrada = z.object({
  titulo: z.string(),
  ...seo,
  fecha: z.coerce.date(),
  resumen: z.string().min(20),
  imagen: imagen.optional(),
});

export const esquemaPagina = z.object({
  titulo: z.string(),
  h1: z.string(),
  ...seo,
});
