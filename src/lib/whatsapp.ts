import { empresa } from '../data/empresa';

/** Enlace a WhatsApp con mensaje precargado según el contexto de la página. */
export function enlaceWhatsApp(mensaje?: string): string {
  const base = `https://wa.me/${empresa.whatsapp}`;
  if (!mensaje) return base;
  return `${base}?text=${encodeURIComponent(mensaje)}`;
}
