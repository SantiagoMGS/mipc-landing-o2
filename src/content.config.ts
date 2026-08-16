import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  esquemaServicio, esquemaCliente, esquemaProyecto, esquemaEntrada, esquemaPagina,
} from './schemas';

const dir = (n: string) => `./src/content/${n}`;
const md = '**/*.md';

export const collections = {
  servicios: defineCollection({ loader: glob({ pattern: md, base: dir('servicios') }), schema: esquemaServicio }),
  clientes: defineCollection({ loader: glob({ pattern: md, base: dir('clientes') }), schema: esquemaCliente }),
  proyectos: defineCollection({ loader: glob({ pattern: md, base: dir('proyectos') }), schema: esquemaProyecto }),
  blog: defineCollection({ loader: glob({ pattern: md, base: dir('blog') }), schema: esquemaEntrada }),
  paginas: defineCollection({ loader: glob({ pattern: md, base: dir('paginas') }), schema: esquemaPagina }),
};
