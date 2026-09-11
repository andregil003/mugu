# CHANGELOG — MultaClara (MUGU)

Todos los cambios notables del proyecto. Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y versionado semver.

## [0.7.0] — 2026-09-10

### BIG 2 — 30 cambios en 10 módulos (PUCK main + Bat Puck)

**M0 — Portada / idioma / bienvenida (PUCK main)**
- Fondo dotted + gradiente violeta→fucsia→rosa (sutil, con variante `.dark`).
- `Idioma.jsx` reescrito: sin tarjeta MUGU previa, sin "Selecciona tu idioma", bienvenida por idioma con degradado + animación izquierda→derecha.
- `Bienvenida.jsx` sin escudo (solo título).
- Saludos reales: k'iche' "Saqirik!", kaqchikel "Xsaqär" (verificados).

**M1 — Identidad / tipografía / tamaño / PWA (PUCK main)**
- Fuente Noto Sans Variable (glifos completos para k'iche'/kaqchikel) + fallback en `--font-sans`.
- `Tamano.jsx` con botones "Aa" horizontales.
- manifest.json con `id`/`scope`/`display_override`; index.html con `mobile-web-app-capable`.

**M2 — AppShell / menú / back buttons (Bat Puck)**
- Nav desktop centrado (grid 1fr-auto-1fr), bottom-nav móvil con safe-area, footer visible en móvil.
- Menu con cards que rematan en acción "Comenzar".

**M3 — Buscar / municipios / multas (PUCK main)**
- Buscar: desplegable de sigla de placa (P123ABC) + placas recientes en slider horizontal con "X" en hover (límite 5, auto-elimina la más vieja).
- Municipios: loading animado (sin botón "Actualizar datos"); si la muni tiene 1 multa → va directo al detalle.
- Multas: logo de la municipalidad en el header verde.

**M4 — Detalle (Bat Puck)**
- Boleta vertical campo+valor, sección "Explicación", línea de tiempo SVG con gradiente verde→ámbar→rojo.

**M5 — DatePicker (PUCK main)**
- Calendario convertido en popup modal con blur overlay (ya no se corta por las tarjetas).

**M6 — FormFisica (Bat Puck)**
- Ajustes menores de consistencia.

**M7 — Info (Bat Puck)**
- Contenido paginado (Anterior/Siguiente), tipos de multa (Papeleta/Cepo/Fotovelocímetro).

**M8 — Pago (Bat Puck)**
- Pasarela de pago SIMULADA (prototipo educativo): formulario de tarjeta con validación, estado procesando/éxito, "Nueva simulación", y opción de redirigir al portal oficial de la entidad.

**M9 — i18n + sugerir idioma (PUCK main)**
- Popup modal "Sugerir idioma" (blur overlay, formulario con confirmación local).
- Keys nuevas de Bat Puck propagadas a k'iche'/kaqchikel (placeholder es, TODO Uriel).

## [0.6.0] — 2026-09-10

### Fase 2 — i18n completo (PUCK main)

- **`t()` con interpolación**: ahora soporta variables (`t('clave', { dias: 5 })`) para frases dinámicas.
- **Keys nuevas en los 4 idiomas** (es, en, k'iche', kaqchikel): errores de validación (`errorPlacaInvalida`, `errorNoMulta6`, `errorFechaInvalida`, `errorSeleccionaEntidad`), `cargando`, `articuloAbrev`, `multaTransitoDefault`, `razonClaraDefault`, `dia`/`dias`, placeholders (`placeholderPlaca`, `placeholderNoMulta`), `buscarAyudaPlaca`, motivos del semáforo (`semaforoMotivoPrescrito`, `semaforoMotivoPago`, `semaforoMotivoImpugnacion`), DatePicker (`dpDias`, `dpMeses`, `dpPlaceholder`, `dpMesAnterior`, `dpMesSiguiente`), `venceEl`/`prescribeEl`, `formFisicaSubtitulo`, `navAria`, y todo el bloque de pago (`pagoSubtitulo`, `pagoPasosTitulo`, `pagoBancosTitulo`, `pagoNotaDescuento`, `pagoBanrural`, `pagoBancoIndustrial`, `pagoBancosSistema`, `pagoPortalSAT`, `pagoPortalSATDesc`, `pagoPresencial`, `pagoPresencialDesc`, `pagoEnLinea`, `pagoEnLineaDesc`, `pagoNoOficial`, `pagoPaso1`–`pagoPaso5`).
- **Strings hardcodeados → `t()`** en: Buscar, FormFisica, Info, Multas, Municipios, Detalle, Apelacion.
- **DatePicker externalizado a i18n**: días de semana, meses, placeholder y aria-labels traducidos.
- **`calcularSemaforo` devuelve códigos** (`prescrito` / `plazo_pago` / `plazo_impugnacion`) en vez de strings en español (listo para traducir en pantalla).
- **Fix bug de descuento invertido** en Info.jsx: el precio tachado era el descontado; ahora el tachado es el original y el destacado es el precio con descuento.

### Fase 3 — UX (PUCK main)

- **Pago.jsx reescrito**: header con gradiente verde institucional, pasos numerados para pagar, bancos autorizados según la entidad (EMETRA → Banrural, PNC → bancos del sistema, Mixco/Santa Catarina Pinula → Banco Industrial), canales (en línea / presencial / portal SAT) y disclaimer de que la app no procesa pagos.
- **Botones "← Volver"** agregados a Buscar, Municipios, FormFisica e Info.
- **`LoadingSpinner`** nuevo componente, usado en Multas, Detalle, Apelacion e Info (reemplaza el texto "Cargando…").
- **PageHero** agregado a FormFisica (consistencia visual con el resto de flujos).
- **DatePicker unificado** en Detalle: reemplaza el `<input type="date">` nativo por el calendario custom.
- **Footer con disclaimer visible en móvil** (antes solo desktop) + aria-label de navegación traducido.

### Infra

- **`SHEETS_API_URL` → env var**: `import.meta.env.VITE_SHEETS_API_URL` con fallback a la URL actual del Apps Script.

## [0.5.0] — 2026-09-10

### Fase 1 — Limpieza (Bat Puck)

- Eliminadas 7 pantallas muertas sin ruta: Home, Form, Explicador, Semaforo, QueHago, Accion, Placas.
- Utilidades duplicadas centralizadas en `src/lib/core.js`: `normalizarEntidad` (canónica, con normalize NFD), `formatoMonto`, `TIPO_LABEL`, `PREFIJOS_PLACA`.
- Imports muertos limpiados en App.jsx.

## [0.4.0] — anterior

- Branding verde institucional MultaClara (revertido gradiente violeta/fucsia).
- Accesibilidad: portada con navbar, tamaño de texto (Normal/Grande/Extra), idioma persistente, tipo de placa + datepicker, aviso de 3 días solo en registro manual, aliases de entidad, Info con buscador/categorías, botones de apelación con scroll, cache de catálogo, placas recientes.
- Catálogo de 102 infracciones (Reglamento 273-98) + guía de apelaciones (Decreto 33-2024).
- Fix: ARTÍCULO undefined, detalle no salía (normalizar entidad param), logo en header; test E2E Playwright del flujo completo.