# CHANGELOG — MultaClara (MUGU)

Todos los cambios notables del proyecto. Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y versionado semver.

## [0.8.3] — 2026-09-11

### Header, nav e idiomas

- Header + bottom-nav de vuelta a **blanco** (antes se habían cambiado a verde).
- Bottom-nav móvil: **solo iconos grandes** (`h-7 w-7`, antes `h-6 w-6` con texto debajo). Sin labels de sección.
- Pantalla de idiomas (`/idioma`): **logo h-20** centrado + texto MUGU grande (`text-3xl`) + tagline. Grid de idiomas en **2 columnas**.

### UI/UX ronda André

**Header + Nav**
- Header con gradiente verde institucional (antes gris claro). Logo "MUGU" + tagline en blanco.
- Bottom-nav móvil verde con iconos más grandes (`h-6 w-6`, antes `h-4 w-4`). Texto y fondo en blanco semitransparente.
- Logo + MUGU aparecen en `/idioma` (alineados a la derecha en móvil).

**Scroll**
- `ScrollToTop` en `App.jsx`: al navegar a cualquier ruta, la página carga desde arriba (no forzar al usuario a subir manualmente).

**Alineación / centrado**
- Botón "¿Qué procede?" de Bienvenida centrado con `mx-auto`.
- Apelación: tarjeta de gradiente verde institucional (antes naranja/amber).

**Paginación Info**
- Nueva paginación numérica `<< < 1 2 3 … N > >>` sin texto (antes "Página X de Y" con botones "Anterior/Siguiente").
- Scroll al tope al cambiar de página.
- Keys i18n: `infoPrimera`, `infoUltima` (4 idiomas).

**Labels Buscar / FormFisica**
- Quitar texto de ayuda "Idioma: escribí la placa tal como aparece en el vehículo." en Buscar.
- Label del select de sigla cambiado de "Número de placa" a "Tipo de placa" en Buscar y FormFisica.

### Fondo global GradientDots

- Nuevo componente `src/components/ui/gradient-dots.tsx`: fondo de puntos con gradiente cónico verde animado (rotación 20s), máscara de puntos 22px y viñeta.
- Adaptado a la paleta institucional: gradiente `#4ade80` + `#34d399` (sin rojo), fondo `bg-background` + viñeta `var(--background)` para mantener legible el texto oscuro de la app (el `#09090b` original haría ilegible el tema claro).
- Integrado UNA vez en `AppShell` (layout global, cubre todas las rutas) con wrapper `relative isolate` — el fondo queda en `-z-10` y todo el contenido (header z-40, main, footer, bottom-nav) por encima.
- QA: build OK + 2/2 tests Playwright + verificación DOM (fondo presente, contenido visible, header por encima).

### Animación corregida (onda ascendente, no reloj)

- Se eliminó el gradiente cónico giratorio (se veía como reloj y dejaba puntos apagados).
- Ahora: TODOS los puntos visibles (tenues, emerald-500 al 35%) + una onda de luz verde (green-400) que sube de abajo hacia arriba (`translateY 110% → -250%`, 7s, loop) e ilumina los puntos a su paso (misma máscara de puntos 22px).
- `prefers-reduced-motion`: la onda se detiene (accesibilidad).
- QA: build OK + 2/2 tests Playwright + verificación DOM (onda presente, animación corriendo, transform cambia en el tiempo).

### Fondo estático (decisión de André)

- Se quitó la animación por completo: sin onda, sin rotación.
- Quedan solo los puntos decorativos estáticos (emerald-500 al 35%, 22px) + viñeta. El prop `duration` se eliminó del componente.

## [0.8.0] — 2026-09-11

### Ronda UX — 14 cambios de André (PUCK main)

**Flujo de entrada**
- Elegir idioma ahora lleva directo a `/tamano`; "Continuar" va al menú (se salta Bienvenida).
- `/idioma` sin navbar/header/footer (`RUTAS_SIN_NAV`); botones de idioma en verde institucional.

**Buscar / placas recientes**
- Contenedor más ancho (`max-w-2xl`), select de sigla alineado (`!h-12` — el `data-[size=default]:h-8` de shadcn pisaba el alto).
- Placas recientes con scrollbar visible y padding superior (la "X" ya no se corta).

**Navegación atrás**
- Todos los botones "←" textuales → icono `faChevronLeft` (Buscar, Municipios, Multas, Tamano).
- `Detalle` propaga `noMulta` (+`fechaNotif` a Pago) a `/pago` y `/apelacion`; ambas gestiones vuelven a `/detalle` con el número.
- Fix bug en `Multas.jsx`: `aliasesEntidad` se construye SOLO con la entidad del query param (antes listaba multas de cualquier municipalidad).

**Detalle / monto**
- Imagen de la municipalidad a la derecha del header verde (con `pr-24` cuando hay imagen).
- Timeline con `pt-2` (el borde superior ya no se corta).
- Recargo anual +20% compuesto (`calcularMontoConRecargo` en core.js): se muestra monto original tachado + monto actual + nota, solo cuando pasaron 365+ días desde la notificación. Aplicado en Detalle y Pago (no en el listado, no hay fecha ahí).

**Info / descuento**
- Eliminadas categorías Leve/Grave/Muy grave del filtro y de las tarjetas; "Tipo de multa" ahora es etiqueta + chips.
- "Curso vial" renombrado a "pago anticipado (15 días)" en i18n y en los `consejo` de `infracciones.json` (era un descuento de un evento pasado).

**Apelación / contacto**
- Tarjetas de gestión en monocromo gris (antes verde/ámbar/rojo).
- Nuevo componente `ContactoEntidad`: teléfono(s), dirección, pago en línea (con "No confirmado" ≠ "No disponible") y pago presencial.
- `entidades.json` completado con los datos de los MDs (contactos SAT + tabla de pagos por municipalidad): teléfonos, direcciones, portales de pago y notas de confirmación para las 11 entidades.

**QA**
- Tests Playwright actualizados al flujo nuevo (idioma → tamano → menú) y al select de tipo de placa (se llena solo el número); `webServer` en playwright.config.js.
- Build OK + 2/2 tests E2E verdes.

**Repasadita (auditoría de datos)**
- `entidades.json`: eliminados campos legacy `contacto` y `dondePagar` (info vieja contradictoria: EMETRA→Banrural vs MD→MuniGuate); portal de Villa Nueva actualizado a `consultas-pmt` (era constancias-y-solvencias); campo `confirmado` en `pagoPresencial`.
- `ContactoEntidad`: label "Dónde consultar el pago presencial" para entidades no confirmadas (instrucción del MD: no "Pagá aquí"); teléfono "Pendiente de verificar" para Jutiapa.
- Keys i18n nuevas verificadas en los 4 idiomas (es/en/k'iche'/kaqchikel).
- Limpieza de dead keys: 46 keys sin uso eliminadas de los 4 JSON de i18n (pantallas viejas, semáforo anterior, steppers, `cursoVialNota`, `catLeve/Grave/MuyGrave`, `infoCategoria`, `montoActual`, etc.). Quedan 206 keys por idioma, todas referenciadas en código.

## [0.7.0] — 2026-09-10

### BIG 2 — 30 cambios en 10 módulos (PUCK main + Bat Puck)

**M0 — Portada / idioma / bienvenida (PUCK main)**
- Fondo verde institucional MultaClara (sin gradientes rosados — decisión de André).
- `Idioma.jsx` reescrito: sin tarjeta MUGU previa, sin "Selecciona tu idioma", bienvenida por idioma con degradado verde + animación izquierda→derecha.
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