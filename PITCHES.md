# Diez presentaciones privadas

La biblioteca privada es `/pitch-library/index.html`. Cada presentación usa `/pitches/index.html?client=<id>&lang=nl` o `lang=en`. Hay dos variantes dentro de cada una de las cinco familias existentes. El archivo `pitch-businesses.js` contiene únicamente negocios asignados y verificados; una asignación ausente no genera tarjeta ni cliente. Las páginas y la biblioteca llevan `noindex,nofollow`.

| Slot de desarrollo | Variante visual | Estado hasta la selección del lead |
| --- | --- | --- |
| salon-a | Verde salvia, serif, fotografía en arco | Trend Hairstyling & Beautycenter |
| salon-b | Ciruela, sans, composición inversa | Las Banderas Kapsalon |
| restaurants-a | Cobre, portada completa, cabecera oscura | Café De Oude Mol |
| restaurants-b | Oliva, foto enmarcada, cabecera apilada | De Happertjes |
| dentists-a | Turquesa, composición de práctica, esquinas suaves | Sin asignar |
| dentists-b | Azul, titular centrado, fotografía panorámica | Sin asignar |
| accountants-a | Azul tinta, serif, reglas y filas | Sin asignar |
| accountants-b | Verde, cabecera sólida, composición inversa | Sin asignar |
| movers-a | Azul y ocre, foto amplia, planificador horizontal | Sin asignar |
| movers-b | Violeta y lima, fotografía alta, planificador en columna | Sin asignar |

Esta tabla documenta slots; no se muestra en la biblioteca. Estado al 4 de octubre de 2026: cuatro negocios asignados de diez. Las seis asignaciones restantes necesitan leads que superen la revisión; la biblioteca muestra sólo los negocios del registro. Actualizar esta tabla al incorporar nuevas asignaciones contrastadas.

## Contrato de asignación

Cada objeto en el array de `pitch-businesses.js` necesita estos datos públicos:

| Campo | Uso |
| --- | --- |
| `slot` | Uno de los diez identificadores anteriores; no repetir |
| `id` | Slug estable y exclusivo para rutas, cachés y secretos del cliente |
| `name`, `address`, `city`, `mapsUrl` | Identidad contrastada del negocio |
| `placeId` | Place ID confirmado, cuando se dispone de él |
| `coordinates: {lat,lng}` | Coordenadas contrastadas; obligatorias si no hay Place ID |
| `cid` | CID decimal de Maps como string; sólo referencia, nunca sustituto del Place ID |
| `phone`, `phoneDisplay`, `shortName` | Opcionales, sólo datos públicos verificados |
| `verification.checked` | Fecha real del contraste, `YYYY-MM-DD` |
| `verification.websiteStatus` | `none-confirmed` para ausencia, o `broken-confirmed` para un dominio caído o aparcado comprobado en navegador normal |
| `verification.normalBrowserVerified` | Obligatorio `true` para `broken-confirmed`, con resultado y URL documentados en las fuentes |
| `verification.commercialAlternativesNegative` | Obligatorio `true` para `broken-confirmed`, tras comprobar alternativas de reserva o venta |
| `verification.sources` | Array de `{label,url}` con evidencias de identidad y del contraste de web |

`copy`, `services`, `hours`, `image` y `imageAlt` permiten ajustar una presentación con información contrastada. No se infieren horarios, servicios, tarifas, puntuaciones o reseñas de otro negocio. El texto por defecto ofrece temas para una consulta, sin prometer tratamientos o servicios concretos. Las imágenes llevan texto alternativo descriptivo y no muestran leyendas explicando su origen en la interfaz. `imageType:'business'` sólo debe usarse con una fotografía identificada y autorizada del negocio; `heroType:'concept'` es metadato interno para el resto. Un `snapshot` opcional requiere `clientId` idéntico y fecha válida; su contenido debe proceder del negocio asignado.

`calendar` acepta únicamente `tableReservation` (booleano), `workingDays` (días únicos entre 0 y 6) y `exampleSlots` (preferencias únicas `HH:MM`). No activa integraciones: los días y horas del proceso demo no acreditan horarios ni plazas reales. La reserva de mesa requiere `tableReservation:true` explícito; por defecto un restaurante o snackbar ofrece una consulta sobre la carta o un próximo contacto. Si no hay evidencia de reserva de mesas, mantener `false` y ajustar los temas a visita o recogida contrastada, sin pago.

`faqContent` (o `faq`) acepta exactamente tres objetos `{q:{nl,en},a:{nl,en}}`, siguiendo el contrato compartido de FAQ. Sólo usar información contrastada o respuestas prácticas que remitan al contacto directo. En ausencia de contenido específico se muestran contacto, fecha preferida y dirección. La presentación incluye las tres respuestas y su `FAQPage` en el idioma seleccionado.

`ui` permite etiquetas bilingües `{nl,en}` para `book`, `plan`, `bookingTitle`, `home`, `demoResult`, `brandLabel` y `brandDescriptor`. Por ejemplo, un snackbar puede usar «Plan je bezoek» y describir una consulta sobre recogida, sin presentar una reserva de mesa.

El constructor rechaza duplicados de slot, ID e identidad de Maps, identificadores reservados, CID usado como Place ID, evidencia incompleta o snapshots ajenos. Un error de lector no acredita `broken-confirmed`: hace falta navegación normal documentada y alternativas comerciales negativas. La asignación no acepta claves ni configura envíos.

## Google y aislamiento de integraciones

`business-registry.js` incorpora el mismo registro que carga el navegador. `/api/place` y `/api/google-reviews` reciben `client` y `lang`; el backend selecciona la ficha autorizada. No se introduce un Place ID libre en la URL del navegador.

Places API requiere un Place ID; el CID de Maps queda como referencia. Cuando sólo se conocen coordenadas contrastadas, el resolutor existente busca nombre y dirección y verifica coordenadas y teléfono antes de aceptar el resultado. [Documentación de Place IDs](https://developers.google.com/maps/documentation/places/web-service/place-id) y [Place Details](https://developers.google.com/maps/documentation/places/web-service/place-details).

El adaptador existente limita la respuesta a cinco reseñas y hasta ocho fotos; cada pitch pide seis fotos. Los autores y atribuciones se conservan. La ficha en vivo actualiza dirección, teléfono y horarios sin recrear el formulario ni bloquear el primer render. Si Google no está disponible se conservan los datos contrastados; nunca se fabrican reseñas.

Calendar y Resend conservan el aislamiento existente por ID (`__ID_EN_MAYÚSCULAS`, sustituyendo guiones por `_`). Las asignaciones arrancan con `calendar.mode:'demo'`, `calendar.confirmed:false`, `contact.mode:'demo'` y `contact.confirmed:false`. Activar una integración exige configuración del negocio y autorización independiente; no ocurre al añadir un lead. No modificar `ACTIVE_CALENDAR_CLIENT_ID` ni reutilizar secretos de otro cliente.

El selector de idioma mantiene `client` y usa el bootstrap existente antes del render. El calendario y la confirmación cargan el mismo registro; los enlaces de regreso conservan el negocio. `build:pitch` incluye estas fuentes; `build-showcase` retira los scripts del registro privado de sus páginas compartidas.

## Verificación y disco

`node --test tests/pitches.test.js tests/sectors.test.js tests/locale.test.js tests/server.test.js` comprueba configuración, rutas y aislamiento sin crear un build. No copiar `node_modules`, fotos ni el repositorio por presentación. Antes de ejecutar `build:pitch` o un render, aplicar el control obligatorio de disco del usuario y medir el tamaño acumulado de temporales de la tarea.
