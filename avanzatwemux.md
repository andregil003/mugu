# RESUMEN COMPLETO — Repo "mugu" (copia de reto-5-brujos)

## 🎯 Objetivo

André pidió: clonar el repo `https://github.com/ithackathonnacionalgt/reto-5-brujos`, hacer una **copia exacta** (sin rebranding, sin cambios de contenido) bajo su cuenta de GitHub con el nombre **"mugu"**, hacerlo **público**, para después desplegarlo en Cloudflare Pages (el deploy lo hace André mismo).

## ✅ Lo que se hizo (paso a paso)

### 1. Verificación del repo original
- `git ls-remote https://github.com/ithackathonnacionalgt/reto-5-brujos.git` → confirmó que existe, rama `main` en commit `d6a045e`, y una rama extra `lemus-logica`.
- Se revisó la página del repo: es una app **Vite + React** llamada "MultaClara" (multas de tránsito de Guatemala), con MIT license.

### 2. Clonado del repo original
- `git clone https://github.com/ithackathonnacionalgt/reto-5-brujos.git /tmp/mugu-explore`
- Se exploró la estructura: Vite + React 19, Tailwind v4, shadcn/ui, react-router (HashRouter), i18n trilingüe (español/K'iche'/Kaqchikel), PWA (Service Worker + manifest), backend con Google Apps Script (`backend/apps-script.gs`), datos en `public/infracciones.json` y `public/entidades.json`, 18 pantallas en `src/screens/`.

### 3. Verificación de autenticación GitHub
- `gh auth status` → autenticado como **andregil003** (token con scopes: gist, read:org, repo, workflow).

### 4. Verificación de que no existiera el repo
- `gh repo view andregil003/mugu` → no existía (error "Could not resolve").

### 5. Creación del repo público
- `gh repo create andregil003/mugu --public --description "Copia de reto-5-brujos (MultaClara) — multas de tránsito"`
- Resultado: `https://github.com/andregil003/mugu`

### 6. Copia del contenido SIN historial git
- `mkdir -p /tmp/mugu && cp -r /tmp/mugu-explore/. /tmp/mugu/ && rm -rf /tmp/mugu/.git`
- Se eliminó el `.git` original para que el historial del hackathon no apareciera (fresh start).

### 7. Git init + commit inicial
- `cd /tmp/mugu && git init -b main`
- `git add -A`
- Commit: `git -c user.name="Jorge André Gil Leonardo" -c user.email="andregil003@users.noreply.github.com" commit -m "Copia exacta de reto-5-brujos (MultaClara) — multas de tránsito"`
- Resultado: 1 commit inicial, autoría de André.

### 8. Push a GitHub
- `git remote add origin https://github.com/andregil003/mugu.git`
- `git push -u origin main` → exitoso, rama `main` creada.

### 9. Verificación final
- `gh repo view andregil003/mugu --json name,visibility,url,defaultBranchRef` → `{"name":"mugu","visibility":"PUBLIC","url":"https://github.com/andregil003/mugu","defaultBranchRef":"main"}`
- `git ls-remote` → confirma que el repo remoto responde con `main`.

## 📦 Estado final del repo

- **URL:** `https://github.com/andregil003/mugu` (público)
- **Rama:** `main`
- **Contenido:** copia exacta del original (commit `d6a045e` del repo del hackathon)
- **Historial:** 1 commit fresco, sin historial del equipo original
- **Copia local de trabajo:** `/tmp/mugu` (en la máquina donde se ejecutó)
- **Copia de exploración:** `/tmp/mugu-explore`

## 🚨 Problema pendiente: el deploy en Cloudflare falló

André intentó el deploy en Cloudflare Pages y **falló**. El log mostró:

1. ✅ Build OK: `npm run build` → `dist/` (Vite v8.3.0, 1991 módulos, 994ms)
2. ❌ Deploy FAIL: `npx wrangler deploy` → `✘ [ERROR] Error parsing file: /opt/buildhome/repo/vite.config.js`

**Causa:** el deploy command quedó como `npx wrangler deploy`, que es para **Workers (APIs)**, no para sitios estáticos. Wrangler busca un `wrangler.toml`, no lo encuentra, intenta parsear `vite.config.js` y falla.

### Solución recomendada (en el dashboard de Cloudflare, sin tocar el repo)

- Ir a Cloudflare → proyecto Pages → Settings → Builds & deployments → Edit configurations
- Cambiar el **Deploy command** a: `npx wrangler pages deploy dist --project-name mugu`
- Retry deployment
- ⚠️ Verificar el nombre real del proyecto (si `mugu` estaba tomado, Cloudflare agrega sufijo, ej: `mugu-414.pages.dev`)

### Alternativa (agregar wrangler.toml al repo)

Agregar un `wrangler.toml` al repo con:

```toml
name = "mugu"
compatibility_date = "2026-09-10"
pages_build_output_dir = "./dist"
```

Con eso, `npx wrangler deploy` funcionaría tal cual. (Requiere push al repo con OK de André.)

## 📌 Notas para el otro opencode

- El repo ya está creado, público y con el contenido exacto — **no hay que rehacer nada de eso**.
- Lo único pendiente es **arreglar el deploy command en Cloudflare** (opción dashboard) o **agregar wrangler.toml** (opción repo).
- Si el otro opencode trabaja en la máquina de André (Windows), el repo local puede clonarse con: `git clone https://github.com/andregil003/mugu.git` en `C:\Users\andre\Documents\GitHub\mugu` (carpeta base estándar de André).
- Regla de oro: **todo push requiere confirmación de André**.