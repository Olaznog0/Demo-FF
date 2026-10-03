# Ocimatik · conceptos de negocios y base reutilizable

Demo principal: **Kapsalon Ayden, Den Haag**, NL/EN. Concepto independiente de Ocimatik, identificado como tal y con `noindex`; no es la web oficial del negocio. La base conserva servicios, reservas, contacto, Maps, reseñas y fotos configurables. `ff` conserva la configuración original de F&F; `starter` sólo demuestra ES/EN/CA.

## Fuente funcional recuperada

`Olaznog0/Demo-FF` era una versión estática anterior. La versión funcional estaba en **`matiassaitam/Demo-FF`, main `01f01a483`**, recuperada en `FETCH_HEAD`. Se recuperaron sus funciones Netlify de Google Reviews, traducción inteligente, Google Calendar, confirmación, cancelación, recordatorios, contacto y WhatsApp, con configuración y lógica de horarios. No se sustituyó su capacidad de reservas por un simple enlace.

El frontend actual usa sus contratos originales con una interfaz configurable. Las funciones TypeScript se compilan en memoria para el servidor local; Netlify conserva las rutas. Las claves y calendarios de F&F no se transfieren a Ayden.

## Abrir y comprobar

Node 22 o superior (comprobado con Node 24):

```powershell
npm start
npm test
npm run check
```

- Ayden: http://localhost:4174/index.html?client=ayden&lang=nl
- Inglés: http://localhost:4174/index.html?client=ayden&lang=en
- Reserva demo Ayden: http://localhost:4174/booking.html?client=ayden&lang=nl
- Reserva original F&F: http://localhost:4174/booking.html?client=ff&lang=en
- Petit: http://localhost:4174/sectors/dentists/index.html?lang=nl
- Axis: http://localhost:4174/sectors/accountants/index.html?lang=nl
- Max: http://localhost:4174/sectors/movers/index.html?lang=nl
- Restaurante: http://localhost:4174/sectors/restaurants/el-fogon-latino/index.html?lang=nl
- ES/EN/CA: http://localhost:4174/index.html?client=starter&lang=ca

Dependencias recuperadas ya instaladas. En otro entorno, `npm ci` requiere antes el control obligatorio de disco del usuario. No hace falta React para ejecutar este frontend. `npm run build` ejecuta `build-public.js` → `build-showcase.js` y genera la biblioteca ficticia pública en `dist`. `npm run build:pitch` genera las presentaciones reales privadas en `dist-pitch`; son paquetes distintos. Antes de generarlos, ejecutar el control obligatorio de disco con el crecimiento esperado; no mantener copias QA innecesarias. No se ha publicado, desplegado ni enviado mensajes a terceros. El servidor sólo expone archivos autorizados, nunca `.git`, entornos, dependencias ni fuentes privadas.

## Configurar un cliente

`client-config.js` contiene la configuración de presentaciones privadas (datos públicos de los negocios, sin secretos). Duplica una entrada, cambia su `id` y usa `?client=ID`; `defaultClient` elige la demo inicial. La biblioteca pública ficticia usa exclusivamente `public-client-config.js`.

| Campo | Función |
| --- | --- |
| `name`, `shortName`, `business` | Marca, dirección, ciudad, teléfono, email, Maps y coordenadas. Datos desconocidos quedan vacíos. |
| `copy`, `services`, `faq`, `images` | Contenido y fotos; textos completos por idioma. |
| `theme` | Colores y fuentes locales legibles. |
| `sections` | Orden/presencia de servicios, proceso, mapa/reseñas, galería y contacto. |
| `servicePresentation`, `ui` | Presentación y lenguaje por sector, independientes de colores. |
| `languages`, `defaultLanguage`, `timeZone` | Los cinco negocios de Holanda usan únicamente NL/EN. El soporte interno ES/EN/CA se conserva para el desarrollo futuro de España por Matías. |
| `google` | Place ID, reseñas, fotos y actualización de datos públicos. |
| `calendar` | Agenda y servicios reservables de este cliente exclusivamente. |
| `whatsapp` | Número internacional confirmado, independiente del teléfono. |
| `contact` | Formulario `api` original o correo opcional. |
| `extensions` | Chatbot y automatizaciones posteriores. |

Interfaz, fechas, formularios y errores están traducidos en `i18n.js`; `ui` los adapta por sector. Los enlaces conservan cliente/idioma. El test comprueba cobertura completa.

## Google Maps, reseñas y fotos

El bloque Google conserva **mapa centrado en el negocio**, rating y enlace al perfil junto al panel de reseñas. El embed `maps?q=...&ll=...&output=embed` usa nombre, dirección y coordenadas verificadas, sin clave Places. No confundir embed con integración de reseñas.

`/api/google-reviews?client=ID&lang=nl` conserva `rating`, `total`, `url`, `reviews`, autor, `profilePhotoUrl`, estrellas, texto/idioma, `originalText`, `originalLanguage` y atribución. Los cinco estilos usan `carousel.js`, con avance automático cada 7,5 segundos, controles, teclado y touch. Se puede pausar; detiene el avance durante hover, foco, pestaña oculta, interacción y movimiento reducido. Avatares/estrellas vienen del feed; no se inventan autores ni testimonios.

La traducción usa el original cuando coincide con el idioma elegido. Al cambiar idioma consulta el backend original y muestra la traducción con acceso al original; no vuelve a traducir texto que ya está en el idioma de destino. La caché temporal recuperada está en memoria, distingue negocio/Place ID/idioma y no guarda reseñas en disco.

`/api/place?client=ID&lang=nl` añade fotos y datos públicos. El carrusel independiente conserva autor/enlace Google. Los nombres de fotos se obtienen de nuevo, sin guardar referencias caducadas permanentemente. Las fotos pueden cargar aunque fallen las reseñas. Google devuelve una selección limitada, no todas. Se conservan logo oficial y atribuciones.

Accesos pendientes:

1. Proyecto Google Cloud con Places API (New), facturación y clave restringida al servidor/API.
2. `GOOGLE_PLACES_API_KEY` privado; `GOOGLE_TRANSLATE_API_KEY` para el traductor original. Se admiten sufijos por cliente, como `GOOGLE_PLACES_API_KEY__AYDEN`.
3. Place ID verificado, `google.enabled: true`, `reviewsEndpoint: '/api/google-reviews'`, `endpoint: '/api/place'`, `photosEnabled: true`.
4. Reiniciar tras cambiar configuración. `node --env-file=.env server.js` admite entorno privado; `.env.example` sólo enumera nombres y `.env` se ignora.
5. Configurar origen HTTPS antes de un despliegue autorizado. El control de origen no sustituye restricciones de clave, cuotas ni presupuesto.

Ayden usa su propio Place ID. `ff` admite el original mediante `GOOGLE_PLACE_ID` privado; no se sustituye por Ayden. Los cinco conceptos muestran reseñas públicas reales comprobadas el 3 de octubre de 2026 con fecha visible, avatares, estrellas y enlaces. La conexión futura sustituye esta selección fechada por su feed; las imágenes conceptuales siguen identificadas.

Referencias: [Place Details](https://developers.google.com/maps/documentation/places/web-service/place-details), [Place Photos](https://developers.google.com/maps/documentation/places/web-service/place-photos), [atribuciones](https://developers.google.com/maps/documentation/places/web-service/policies). `assets/google-maps.svg` procede del paquete oficial sin modificar.

## Calendar, contacto y WhatsApp

**Calendar API:** `calendar.mode: 'api'` usa `GET /api/bookings` con servicio/fecha para disponibilidad real y `POST /api/bookings` con cliente, servicio, fecha, hora, nombre, email y teléfono opcional. Sólo confirma tras respuesta 2xx `{ok:true,eventId}`. Conserva eventos, confirmación por email, cancelación por enlace y recordatorios originales. Comprueba disponibilidad antes de insertar; no simula éxito al fallar. Si la respuesta es incierta, bloquea el reintento inmediato y permite contactar al negocio para evitar duplicados.

Otro cliente necesita calendario propio compartido con la cuenta de servicio y variables privadas: `GOOGLE_CALENDAR_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `RESEND_API_KEY`, `BOOKING_FROM_EMAIL`, `BOOKING_ADMIN_EMAIL`, `BOOKING_BASE_URL`. Se admiten sufijos (`__AYDEN`) y se exige `calendar.confirmed: true`, `calendar.serviceDurations` por ID y modo `api`. `ACTIVE_CALENDAR_CLIENT_ID` selecciona el cliente de recordatorios; no apuntar a otro negocio. FF conserva `apk:45`, `general:60`, `tires:45`, `oil:30`, `brakes:45`, `diagnostic:60` minutos. Ayden no tiene duraciones inventadas.

**Calendario compartido:** selección de tema, calendario mensual con días pasados/cerrados desactivados, navegación por meses y teclado, horas y resumen. En demo usa fechas futuras y horas de ejemplo, no pide datos personales y no hace peticiones. `calendar.tableReservation:true` muestra personas, fecha y hora en lugar de elegir un plato; una integración real de mesas necesitará su propio servicio/capacidad confirmado. También admite modo `google` con URL oficial independiente si el negocio prefiere ese método; abrir ese enlace no acredita una reserva.

**Contacto compartido:** `contact-widget.js` se monta en `[data-contact-widget]` y localiza NL/EN/ES/CA. Los cinco conceptos usan `contact.mode: demo`, con agradecimiento local y aviso explícito: no envían datos ni correo. El modo `api` usa `/api/contact?client=ID&lang=...` y sólo confirma tras respuesta 2xx `{ok:true,id}` del proveedor; 503 pendiente, rechazo y error nunca simulan entrega. FF conserva el contrato original Resend, independiente. No hay email público de Ayden confirmado.

**Agradecimiento:** reserva, mesa y consulta terminan en `confirmation.html`, con nombre, colores e icono del sector, resumen y enlace explícito a su propia página. La URL sólo lleva cliente, idioma y tipo. `confirmation-state.js` guarda en `sessionStorage` únicamente selección no personal (tema, fecha/hora, personas o fecha deseada de mudanza), durante un máximo de 15 minutos; nunca nombre, email, teléfono, mensaje o direcciones. El enlace de regreso borra ese resumen. No hay navegación con `history.back`. Si el almacenamiento está bloqueado, conserva un resultado local en la página original. Demo muestra una etiqueta breve “Demo · Niets verzonden / Nothing sent”; el modo API sólo llega a la confirmación tras el recibo real correspondiente.

El montaje es idempotente: una nueva inicialización conserva el mismo formulario y la entrada del usuario. Max añade fecha deseada de mudanza y ciudades/códigos postales de origen y destino, todos opcionales para consultas generales; una fecha pasada se rechaza. No solicita direcciones completas. En modo API, estas preferencias se incluyen en el mensaje del contrato compartido.

El formulario comparte una tarjeta y campos de 18 px con contraste explícito, dos columnas en escritorio y una en móvil. Fogón usa tonos terracota y arena; los selectores del widget aíslan sus campos de los estilos de las secciones de visita/contacto.

Fogón conserva la misma cabecera al cambiar NL/EN, actualiza sus textos y mantiene los borradores de reserva/contacto sólo en memoria de la página. Los cinco estilos usan fuentes e imágenes independientes del idioma y reservan las mismas dimensiones para marca, titulares y acciones. La biblioteca de Ocimatik es la web de la agencia para ambos mercados; estos conceptos no añaden plantillas españolas.

**WhatsApp:** número confirmado independiente (`whatsapp.enabled/number`). Webhook original `/api/whatsapp` preservado. Ayden no tiene WhatsApp confirmado; el ejemplo se muestra localmente sin transmitirlo.

## Datos y pendientes de Ayden

Verificado **3/10/2026** en Maps: **4,7/5 · 47 reseñas**, Van Heutszstraat 13A, 2593 PC Den Haag, +31 70 406 0102, Place ID `ChIJWQ2FSAq3xUcRmbPxHN8NGL8`, coordenadas `52.0862838, 4.3453684`. Mar/mié/vie/sáb 09–17:30; jue 09–20; lun/dom cerrado.

No se localizó web propia o miniweb funcional tras buscar nombre/dirección/teléfono/variantes; no prueba ausencia absoluta ni se publica como crítica. [Fresha](https://www.fresha.com/nl/lvp/kapsalon-ayden-van-heutszstraat-den-haag-D1xoMa) es no afiliado y remite a llamar. Sus categorías no se presentan como catálogo confirmado. Se muestra peluquería general y consulta de preferencias, sin afirmar corte femenino/infantil, locs, color, barba, staff, resultados, precios o duración. Idiomas de atención, email, WhatsApp, presupuesto y agenda sin confirmar; interfaz NL/EN no afirma idiomas del personal.

Para web comercial: aprobación del negocio, catálogo/tarifas/duración, fotos autorizadas, acceso Google Cloud/agenda propia, contacto, privacidad/condiciones y dominio. Investigación completa: `../deliverables/leads/demo-ayden.json`.

## Imágenes y verificación

Imágenes ImageGen reutilizadas como material de diseño, sin representar local/staff/clientes reales; su procedencia queda documentada aquí y no se presentan como fotos de Google:

- `assets/salon-scene.webp` (95 KB): corte en salón genérico horizontal, luz de ventana, tonos crema/verde, sin texto/logotipos.
- `assets/hair-inspiration.webp` (129 KB): mujer adulta genérica con bob, fondo cálido y luz natural; inspiración, no prueba de servicios/resultados.
- `assets/barber-concept.png`: concepto anterior conservado, no usado por Ayden.
- `assets/dental-office-cover.webp` (159 KB) y `assets/moving-cover.webp` (279 KB): interiores genéricos para recepción y mudanza; los SVG originales `dental-concept.svg` y `moving-concept.svg` se conservan.

Las páginas usan WebP para reducir la transferencia, sin modificar la composición. Fogón carga `sectors/restaurants/el-fogon-latino/assets/latin-concept-hero.webp` (251 KB). Los PNG originales permanecen conservados en el repositorio y en `C:/Users/Gonza/.codex/generated_images/01a101f0-9f66-7ae1-98b1-375e2b21d4ca/`; assets FF también conservados. Al conectar Google aparecen fotos reales con créditos.

Sintaxis JS y pruebas frontend verifican idiomas, navegación/seguridad, horario, separación FF/Ayden, mapa, traducción, avatar/estrellas/créditos y fotos independientes cuando reseñas fallan. Fixtures sólo en pruebas, nunca en página pública. Backend se prueba por separado. No se probaron reservas/envíos reales sin acceso/autorización. La revisión visual actual se coordina en el chat principal; capturas anteriores de Charisma no validan Ayden ni los nuevos estilos.

Los símbolos de marca son SVG propios por sector: tijeras, diente, libro/gráfico, casa/cajas y llama. `actions.css` mejora de forma compartida los botones y conserva los colores de cada diseño, sin cambiar tipografía o imagen al seleccionar NL/EN.

## Biblioteca pública y presentaciones privadas

`public-client-config.js` registra cinco marcas ficticias: Bloom, Brasa, Lumen, Northline y BrightMove, bajo `concepts/`. Comparten calendario, contacto y agradecimiento demo. `SiteShell` puede funcionar únicamente con `PublicClientRegistry`; sus enlaces mantienen la ruta completa y el tipo de resumen al cambiar idioma, también cuando `public-core.js` hace absolutos los enlaces. El build público excluye las configuraciones y los datos de los negocios reales. Sus reseñas de concepto no se etiquetan como Google; el mapa muestra un monumento por su propio nombre, sin inventar ubicaciones de negocios. Las presentaciones de Ayden/Petit/Axis/Max/Fogón permanecen en el entorno privado, con fuentes y reseñas verificadas. No se añaden plantillas de Barcelona.

| Paquete | Entrada y contenido |
| --- | --- |
| `npm run build` → `dist` | `/sectors/index.html`: galería ficticia y `concepts/`, con registro público. `booking.html` y `confirmation.html` excluyen los scripts de configuraciones reales. |
| `npm run build:pitch` → `dist-pitch` | `/pitch-library/index.html`: galería de Ayden/Petit/Axis/Max/Fogón y sus páginas, configuraciones, imágenes y componentes compartidos. Calendario/agradecimiento no cargan el registro ficticio ni enlaces a páginas ficticias ausentes. |

Servir cada paquete por HTTP con su carpeta de salida como raíz: los enlaces absolutos del sitio y el agradecimiento no están pensados para `file://`. Ambos builds conservan sólo frontend; no incluyen servidor, funciones, dependencias ni credenciales. Google Maps y las selecciones fechadas pueden mostrarse sin backend; las APIs futuras necesitan desplegar el backend preservado y configurar cada negocio por separado. El enlace de la galería a la agencia sigue apuntando al preview local de Ocimatik durante este desarrollo. El build público inspecciona `dist` antes de escribir y rechaza cualquier archivo/directorio fuera de su manifiesto o symlink/junction, sin seguir enlaces ni borrar archivos desconocidos. Una salida pública limpia puede reutilizarse; si contiene datos de una versión privada, el build se detiene y muestra la ruta a revisar. `dist-pitch` también debe auditarse antes de distribuirlo: su build sobreescribe su manifiesto sin eliminar archivos desconocidos.


## Proyectos por sector y demo sin credenciales

Cada carpeta `sectors` contiene su configuración, página, estilo y pequeña documentación. Petit, Axis y Max reutilizan `sector-site.js` para Maps/reseñas/fotos y `sector-compact.css` para ritmo y alineación; el estilo y la imagen de cada sector siguen separados. Los enlaces abren el calendario completo compartido `booking.html`, conservan cliente/idioma y vuelven a su propia página. Restaurante conserva su recorrido de mesa y también tiene acceso al calendario compartido. No se activan claves de Matías en esta demo.

`google.resolvePlaceId: true` permite al servidor resolver el ID de un negocio con nombre, dirección, teléfono y coordenadas; nunca se copia un ID de otro negocio. `google.snapshot`, si existe, contiene una selección real con `checked`, `clientId`, `rating`, `total`, `reviews`, autor/avatar/estrellas, enlaces Google y traducciones opcionales. Se muestra su fecha de comprobación; una traducción manual se identifica como traducción para el concepto. El feed real la sustituye cuando se activa. No añadir datos ficticios para rellenar carruseles.

Imagen nueva: `assets/accounting-office-concept.webp`, ImageGen integrado, 218 KB. Prompt: fotografía editorial arquitectónica de una oficina pequeña neerlandesa cálida y acogedora, escritorio de roble, dos sillas, laptop cerrado, carpetas lisas, planta y luz natural; tonos lino/salvia, textura realista, encuadre 3:2; sin personas, oficina identificable, títulos, marca, certificados o cifras financieras legibles. Original conservado bajo generated_images de este chat, exec-3f21af56-d26f-4837-9342-17213f0c7588.png.
