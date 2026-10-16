# Catálogo real de Love Raíz

Aquí va el contenido de la tienda de verdad, para reemplazar las galletas de ejemplo
que están hoy en `src/lib/mockData.js`.

## Fotos

Ponlas en `catalog/photos/`. Una foto por galleta.

- **Nombre del archivo**: el nombre de la galleta en minúsculas y con guiones.
  Ejemplo: `guayaba-queso-crema.jpg`. Así puedo emparejar cada foto con su precio
  sin que me digas cuál es cuál.
- **Formato**: `.jpg`, `.png` o `.webp`.
- **Forma**: cuadradas si se puede. El catálogo las recorta a cuadrado, así que
  una foto muy vertical pierde los bordes.
- **Tamaño**: 1200 × 1200 px es de sobra. Si vienen directo del teléfono no
  importa que pesen, yo las optimizo antes de subirlas.

Sirven las mismas fotos del Instagram: descárgalas y déjalas aquí.

## Sobre el logo

El logo ya está puesto en la barra de navegación y como icono de pestaña, pero tuve
que reconstruirlo. El archivo que me pasaste está dibujado en #0D0301 sobre un fondo
negro sólido y sin canal de transparencia, así que no se podía usar tal cual: en la web
se habría visto un cuadrado negro.

Lo que hice fue separar el trazo del fondo y recolorearlo al café de la marca. Dos
consecuencias que conviene que sepas:

- **"HOMEMADE SWEETS" se perdió.** En el archivo original ese texto es tan tenue que
  no se distingue del ruido de compresión, así que no había nada que rescatar. El logo
  quedó como "Love ♥ RAÍZ".
- El trazo tiene bordes un poco más duros de lo ideal, porque se reconstruyó a partir
  de una imagen muy comprimida.

Si consigues el **logo original** (un SVG, o un PNG con fondo transparente de verdad),
mándalo y lo cambio en un minuto: se vería perfecto y recuperaríamos el subtítulo. Si
lo hiciste con una IA, pídele "PNG con fondo transparente" o "SVG vectorial".

## Precios y datos

Esto me lo puedes escribir en el chat. Por cada galleta necesito:

| dato | ejemplo | para qué |
|---|---|---|
| nombre | Guayaba y queso crema | lo que ve el cliente |
| precio | 5.75 | en dólares, por galleta |
| descripción | Rellena de guayaba y queso crema, masa de mantequilla dorada | la tarjeta del producto |
| stock | 24 | cuántas puedes hacer al día |

Y aparte, tres cosas del negocio:

- El número de WhatsApp real (hoy hay uno de relleno).
- Los precios de las cajas de 6 y de 12: ¿tienen descuento o cuestan la suma de las galletas?
- Las ventanas de entrega, si no son las que están puestas ahora
  (10:00 AM – 2:00 PM y 2:00 PM – 6:00 PM).

Con eso genero el catálogo real, subo las fotos a Firebase Storage y borro los
productos de ejemplo.
