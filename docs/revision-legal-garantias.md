# Revisión legal pendiente: `/garantias/`

> **Estado: no revisada por un abogado.** Este documento no es asesoría legal.
> Lo escribe quien hizo la migración técnica del sitio para que un abogado
> colombiano pueda resolver la página en una sola pasada, con las cláusulas ya
> localizadas.

## De dónde viene el problema

El texto de `/garantias/` (1.723 palabras) es el activo de contenido más
valioso que tenía el sitio de WordPress, y por eso se migró íntegro. Pero es
**una adaptación de una política mexicana**, no un texto redactado para
Colombia.

La evidencia de origen estaba en el sitio viejo, en dos enlaces que el texto
visible disfrazaba:

| Texto que se leía | A dónde enlazaba de verdad |
|---|---|
| «mipc.com.co y/o mipctecnologia.com» | `http://www.mipc.com.mx/` |
| «soporte@ mipc.com.co» | `mailto:contacto@mipc.com.mx` |

**Esos dos enlaces ya no existen en el sitio nuevo** — la migración los eliminó
y corrigió la razón social a MI PC TECNOLOGÍA S.A.S. Lo que **sí sobrevivió**
es la sustancia: el articulado sigue siendo el mexicano, con su terminología y
sus plazos.

## Lo que hay que revisar, cláusula por cláusula

El marco aplicable es la **Ley 1480 de 2011 (Estatuto del Consumidor)**. Las
referencias de artículo son orientativas, para ubicar al abogado, no un
dictamen.

| Cláusula | Qué dice hoy | Por qué hay que mirarla |
|---|---|---|
| **1.3** | Si el fabricante no indica plazo, se estiman **90 días naturales** | El Estatuto fija un plazo supletorio propio cuando el término no se indica (art. 7-8). Si el legal es mayor, una política que ofrece menos no reduce la obligación: la cláusula simplemente no vincula al consumidor, y publicarla expone a la empresa sin protegerla |
| **1.7** y **4.4.1** | Exigen «**ticket o factura original e identificación oficial vigente**» para tramitar garantía | Condicionar la garantía a que el consumidor conserve la factura original es una de las restricciones que la Superintendencia de Industria y Comercio revisa con más frecuencia. Revisar contra el régimen de cláusulas abusivas (art. 42-43) |
| **3.4** | A los **30 días naturales** el producto se considera abandonado y la empresa «dispone de él sin responsabilidad alguna»; más 90 días de almacenaje a **$25.000 + IVA al mes** | Disposición unilateral de un bien ajeno y cobro unilateral por depósito. Es la cláusula de mayor exposición de toda la página |
| **Nota de crédito** | La empresa la aplica cuando el producto está descontinuado o en desabasto | Para los casos en que procede, el Estatuto define quién elige entre reparación, cambio o devolución del dinero (art. 11). Un remedio impuesto por el proveedor cambia esa elección |
| **DOA** | Reembolso solo en los primeros **7 días naturales**; excluye consumibles, software, liquidación y el propio servicio técnico | Revisar la lista de exclusiones y su plazo frente al art. 11 |
| **Toda la página** | No aparecen el **derecho de retracto** (art. 47) ni la **reversión del pago** (art. 51) | Son obligatorios en ventas no presenciales. La empresa vende en línea desde `mipctecnologia.com/shop`, así que la omisión es relevante aunque la tienda viva en otro dominio |
| **Terminología** | «días naturales» (5 veces), «ticket», «identificación oficial vigente», «nota de crédito» | No es el vocabulario legal colombiano — en Colombia se cuenta en días **calendario** o **hábiles**, y la diferencia cambia el plazo real. En un contrato de adhesión, la ambigüedad se interpreta en contra de quien redactó |

## Qué se hizo y qué no

**Se hizo** en la migración: eliminar los dos enlaces al dominio mexicano,
corregir la razón social, y arreglar las erratas de redacción del original.

**No se hizo**, deliberadamente: tocar el articulado. Reescribir cláusulas de
garantía sin abogado cambiaría obligaciones legales de la empresa basándose en
el criterio de quien migra un sitio web. El riesgo de una corrección mal hecha
es mayor que el de dejar el texto tal como lleva años publicado, que es la
situación actual y no un empeoramiento.

## Decisión que corresponde al cliente

Tres caminos, en orden de coste:

1. **Publicar tal cual y revisar después.** Es exactamente lo que hay hoy en
   producción: el texto lleva años en línea con estas mismas cláusulas. Migrar
   no añade riesgo, pero tampoco lo quita.
2. **Despublicar la página hasta la revisión.** Elimina la exposición, pero
   pierde 1.723 palabras de contenido indexable y deja a la empresa sin
   política de garantías publicada, que para vender a clientes corporativos es
   peor que tener una imperfecta.
3. **Revisión de un abogado antes del corte de dominio.** Con esta tabla, es
   una consulta acotada: siete puntos concretos sobre un texto existente, no
   una redacción desde cero.

**Recomendado: el 3.** El corte de dominio todavía no ha ocurrido, así que hay
ventana. Y de los tres, es el único que deja el activo de contenido intacto y
además elimina la exposición.
