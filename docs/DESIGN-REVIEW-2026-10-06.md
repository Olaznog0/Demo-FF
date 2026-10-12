# Revisión de las 25 variaciones

Las cinco variantes de cafés y las cinco de peluquerías se revisaron primero. Por indicación del usuario, odontología, contabilidad y mudanzas se completaron hasta cinco variantes por sector a partir de las bases públicas existentes.

La revisión incluye composición, tipografía, contraste, imágenes, servicios, reseñas, FAQ, contacto, ubicación, navegación y acciones. El índice local muestra capturas reales de cada composición: http://127.0.0.1:4174/design-review/index.html.

| Código | Dirección | Cambio principal de composición |
| --- | --- | --- |
| R1 | Warm editorial | Fotografía amplia con arco, lectura editorial y secciones cálidas. |
| R2 | City blue | Conserva la tarjeta azul sobre la foto; corrige contraste y ritmo inferior. |
| R3 | Botanic | Fotografía protagonista a la izquierda, navegación verde lateral y continuidad de secciones. |
| R4 | Helder Coral | Fotografía de fondo expuesta, texto en primer plano y degradado legible. |
| R5 | Night ink | Fotografía amplia enmarcada, navegación compacta y secciones oscuras coherentes. |
| B1 | Crème Studio | Fotografía protagonista a la izquierda y mensaje/acción equilibrados a la derecha. |
| B2 | Blush fashion | Fotografía elevada a la derecha, sin el vacío lateral anterior. |
| B3 | Navy mirror | Fotografía con arco y más presencia; navegación lateral limitada al inicio. |
| B4 | Sage studio | Inicio dividido que utiliza el ancho y adelanta la fotografía. |
| B5 | Cobalt editorial | Mantiene el azul y amplía la fotografía enmarcada; mejora contraste y acciones. |
| D1 | Lumen split | Inicio dividido, verde tranquilo y fotografía de consulta. |
| D2 | Azure panorama | Fotografía panorámica, jerarquía azul y servicios conectados. |
| D3 | Sand editorial | Imagen a la izquierda, tipografía editorial y tonos arena. |
| D4 | Teal cover | Fotografía de fondo y panel legible situado a la izquierda. |
| D5 | Lilac modern | Composición moderna, imagen con presencia y acentos lilas. |
| A1 | Ledger rail | Navegación lateral, tipografía editorial y lectura clara del asesoramiento. |
| A2 | Sage balance | Oficina a la izquierda, mensaje a la derecha y verdes suaves. |
| A3 | Cobalt cover | Oficina de fondo, panel azul y acciones de kennismaking/introducción. |
| A4 | Brass editorial | Panorama de oficina, tonos latón y tipografía editorial. |
| A5 | Ink studio | Cabecera oscura y contenido de asesoramiento en bloques claros. |
| M1 | Route panorama | Equipo trabajando en una foto panorámica, sin cortar las cabezas; ruta visible. |
| M2 | Cobalt dispatch | Inicio dividido con equipo y formulario de ruta conectado al contacto. |
| M3 | Terracotta cover | Foto de fondo con panel terracota y planificación de mudanza accesible. |
| M4 | Green neighbourhood | Fotografía con arco a la izquierda y recorrido verde hacia la solicitud. |
| M5 | Indigo editorial | Foto vertical amplia y ruta integrada con el mensaje principal. |

## Verificación

- Inspección visual de las 25 páginas completas en escritorio y móvil. Capturas conservadas en `C:/Users/Gonza/.codex/visualizations/2026/10/06/01a111f7-c1e5-7392-a21a-22f1f2bdda5a/design-qa`.
- Matriz de 150 comprobaciones: 25 variantes × NL/EN × 1440/390/320 px. Sin desbordamiento horizontal del documento y con todas las imágenes principales cargadas. Los carruseles pueden desplazarse dentro de su propio contenedor.
- Comprobación manual de menús móviles, cierre tras navegación, FAQ, cambio de idioma, selector de diseño, conservación del borrador, enlace a reserva, calendario de peluquería y formulario de ruta de mudanza.
- Confirmación de demostración de mudanzas mantiene M3, cliente e idioma en la URL y en el retorno. La cita de peluquería mantiene servicio, fecha y hora al cambiar estilo e idioma. Estas pruebas usan datos ficticios y no envían mensajes ni reservan citas reales.
- El botón de mapa monta el iframe original y conserva la fuente externa. La disponibilidad del proveedor del mapa depende de la conexión del visitante.
- 205 pruebas generales aprobadas; siete nuevas pruebas de contexto de diseño aprobadas, incluyendo aislamiento de clientes, códigos inválidos, almacenamiento bloqueado y reserva en una pestaña independiente. Las suites de empaquetado corporativo pasan 19/19.
- Los errores de acceso de esbuild bajo el sandbox se resolvieron ejecutando las pruebas autorizadas fuera del sandbox. No se instalaron dependencias ni se modificó el backend.
- Metadatos, schema y contenido sin JavaScript de mudanzas actualizados para la nueva fotografía. La descripción alternativa de odontología coincide con la consulta y silla de tratamiento.
- Los archivos de datos de negocios y reseñas de la campaña permanecen intactos. Las pruebas antiguas ahora usan los recuentos de las cohortes ya existentes.

## Imágenes y estándar futuro

Se usó el ImageGen integrado para dos imágenes conceptuales nuevas, incorporadas como WebP:

- [Café](../assets/cafe-atmosphere-concept.webp): café europeo de barrio, preparación de café, tazas de cerámica, madera y luz natural; fotografía editorial cálida, encuadre útil en escritorio/móvil, sin logos, texto legible ni identificación de un negocio real.
- [Equipo de mudanza](../assets/moving-team-concept.webp): equipo que traslada un sofá protegido desde una casa de ladrillo hacia una furgoneta sin marca; fotografía editorial con luz natural, encuadre útil en escritorio/móvil, sin logos ni texto.

Los originales generados permanecen en `C:/Users/Gonza/.codex/generated_images/01a111f7-c1e5-7392-a21a-22f1f2bdda5a`. Los dos WebP pesan conjuntamente 468.998 bytes. Las capturas de revisión ocupan aproximadamente 16 MB; las 25 miniaturas del índice, menos de 1 MB. El control de disco final muestra aproximadamente 116 GB libres, por encima de la reserva de 100 GB.

[AGENTS.md](../AGENTS.md) incorpora el requisito permanente de seguir [DESIGN-QUALITY.md](DESIGN-QUALITY.md) desde el inicio de cada template. Las capturas del índice son material de revisión local y quedan fuera del paquete público. El servidor de preview permanece activo; no se realizó publicación.
