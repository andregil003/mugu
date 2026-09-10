# AGENTS.md — reto-5-brujos (MultaClara)

Guía para agentes de IA y humanos que trabajan en este repo.

## Stack

- Vite + React (JavaScript, no TypeScript)
- Tailwind CSS v4 (plugin `@tailwindcss/vite`, sin tailwind.config)
- shadcn/ui (componentes en `src/components/ui/`, alias `@/` → `src/`)
- Font Awesome (`@fortawesome/react-fontawesome` + `free-solid-svg-icons`) — iconos, NO emojis
- react-router-dom (HashRouter)
- PWA: Service Worker (`public/sw.js`) + manifest (`public/manifest.json`) + iconos PNG
- Deploy: Cloudflare Pages

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo
npm run build      # build de producción (dist/)
npm run preview    # previsualizar el build
```

## Estructura

```
src/
├── main.jsx              Bootstrap
├── App.jsx               Router (HashRouter) — agrega rutas aquí
├── index.css             Tailwind v4 (@import "tailwindcss")
├── lib/
│   ├── constantes.js     Plazos legales (15/60/120) — UNA fuente de verdad
│   ├── core.js           Lógica pura (semáforo, fechas, validación) — sin React
│   ├── data.js           Carga de infracciones.json + entidades.json
│   ├── utils.js          cn() de shadcn
│   └── i18n/
│       ├── index.js      Contexto React (useI18n, t())
│       ├── es.json       Traducciones español
│       ├── kiche.json    Traducciones K'iche'
│       └── kawchiquel.json Traducciones Kawchiquel
├── hooks/
│   └── useLocalStorage.js  Persistencia local
├── components/
│   ├── ui/               shadcn (NO editar a mano; usar npx shadcn add)
│   └── IdiomaSelector.jsx
└── screens/
    ├── Entrada.jsx       Punto de entrada (QR/URL) → redirige a idioma/bienvenida
    ├── Idioma.jsx        Selección de idioma (es / k'iche' / kaqchikel)
    ├── Bienvenida.jsx    Landing "¿HAS SIDO MULTADO?" + ¿Qué procede?
    ├── Menu.jsx          Menú principal (3 flujos)
    ├── Buscar.jsx        Flujo A: ingreso de placa
    ├── Municipios.jsx    Flujo A: resultados por municipalidad (gris/color)
    ├── FormFisica.jsx    Flujo B: formulario de multa física
    ├── Info.jsx          Flujo C: tabla informativa (tipos de multas)
    ├── Detalle.jsx       Detalle: razón + stepper semáforo + apelar/pagar
    ├── Apelacion.jsx     Info de apelación
    └── Pago.jsx          Info de pago
public/
├── infracciones.json     Catálogo (fuente: LosBrujos/data/infracciones.json)
├── entidades.json        Placeholder — Diego completa
└── favicon.svg
data/
└── plantilla-impugnacion.md
```

## Reglas (ver ARQUITECTURA-DATOS.md en repo LosBrujos)

1. **Una sola fuente de verdad**: plazos en `constantes.js`, montos en `infracciones.json`, textos en i18n. NUNCA hardcodear en componentes.
2. **camelCase** para variables/funciones, **PascalCase** para componentes, **UPPER_SNAKE_CASE** para constantes, **kebab-case** para IDs/archivos JSON.
3. **i18n**: la UI nunca tiene texto directo — siempre `t('clave')`. Al agregar una clave, agregarla en los 3 JSON.
4. **core.js** es lógica pura (sin React, sin JSX) — testeable.
5. **Git**: cada uno trabaja en SU rama (`kevin-frontend`, `lemus-logica`, `diego-investigador`, `uriel-disenador`). NUNCA push directo a main — main solo lo toca André.

## Rutas (arquitectura de Lemus — ver `arquitectura_de_flujo_de_multas.json`)

```
/ → /idioma → /bienvenida → /menu
  ├── /buscar → /resultados?placa=X → /detalle?placa=X&entidad=Y
  ├── /multa-fisica → /detalle?placa=X&fecha=Y&entidad=Z
  └── /info
/detalle → /apelacion | /pago
```

## TODO pendientes (por rol)

- **Kevin**: pulir screens, responsive mobile-first, tema oscuro, botones "?" en todo
- **Lemus**: conectar `core.js` con screens reales, cargar `infracciones.json` en Form/Explicador, PDF con jsPDF, Google Sheets + Apps Script
- **Diego**: completar `public/entidades.json` (11 entidades), copy de infracciones
- **Uriel**: traducciones reales K'iche' + Kawchiquel, paleta, iconos SVG, QA visual
- **André**: deploy Cloudflare Pages