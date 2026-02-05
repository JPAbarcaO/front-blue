# BlueFront

Aplicación web (frontend) para la app Blue. Aquí tienes una guía simple para que cualquier persona pueda instalar todo y levantar el proyecto.

**Qué hace esta app**

Muestra una galería de personajes con botones de “Me Gusta” y “No Me Gusta”. También incluye un historial de las últimas interacciones y una sección con pestañas protegidas que muestran estadísticas cuando el usuario ha iniciado sesión.

**Qué necesitas antes de empezar**

1. **Node.js (LTS)**. Para Angular `20.1.x`, usa Node `^20.19.0` o `^22.12.0` o `^24.0.0`.
2. **npm** (se instala junto con Node.js).
3. **Git** (solo si vas a clonar el repositorio).

**Descargas oficiales**

```text
Node.js (LTS): https://nodejs.org/
Git: https://git-scm.com/downloads
Angular CLI (info): https://angular.dev/tools/cli
```

**Paso 1: Instalar Node.js**

1. Entra a la URL de Node.js.
2. Descarga la versión **LTS** e instálala.
3. Abre una terminal y verifica que quedó instalado:

```bash
node -v
npm -v
```

**Paso 2: (Opcional) Instalar Git**

Si ya tienes el proyecto descargado, puedes saltarte este paso.

1. Entra a la URL de Git.
2. Descarga e instala Git.
3. Verifica que quedó instalado:

```bash
git --version
```

**Paso 3: Obtener el proyecto**

Si aún no tienes el código:

```bash
git clone https://github.com/JPAbarcaO/front-blue
cd blue-front
```

Si ya lo tienes, solo entra a la carpeta del proyecto:

```bash
cd blue-front
```

**Paso 4: Instalar dependencias**

Dentro de la carpeta del proyecto, ejecuta:

```bash
npm install
```

**Paso 5: Configurar el backend (importante)**

Este frontend necesita un backend corriendo en `http://localhost:3000` con estas rutas:

```text
GET  http://localhost:3000/api/v1/characters/random
POST http://localhost:3000/api/v1/characters/vote
GET  http://localhost:3000/api/v1/characters/top-like
GET  http://localhost:3000/api/v1/characters/top-dislike
GET  http://localhost:3000/api/v1/characters/last-evaluated
POST http://localhost:3000/api/v1/auth/login
POST http://localhost:3000/api/v1/auth/register
```

Si tu backend usa otra URL, cambia estas líneas en:

```text
src/app/services/image.service.ts
```

**Endpoints protegidos con JWT**

Los endpoints `top-like`, `top-dislike`, `last-evaluated` requieren este header:

```text
Authorization: Bearer <token>
```

Este frontend guarda el token en `localStorage` después del login/registro. Si tu backend exige un JWT real, el login debe devolver un token válido.

**Paso 6: Levantar el frontend**

```bash
npm start
```

Cuando termine de iniciar, abre en el navegador:

```text
http://localhost:4200/
```

**Qué verás en pantalla (explicado simple)**

- Galería principal con la imagen actual y botones “Me Gusta” / “No Me Gusta”.
- Historial a la derecha con las últimas 5 interacciones.
- Pestañas protegidas con candado: “Más Likes”, “Más Dislikes”, “Último Evaluado”.
- Si no has iniciado sesión, las pestañas muestran un mensaje para loguearte.
- Cada pestaña consulta el backend **cada vez que haces clic**.

**Dónde están los datos y contratos (para ubicarte rápido)**

- `src/app/models/`: interfaces/contratos de datos.
- `src/app/services/`: servicios que llaman al backend.
- `src/app/components/`: pantallas y componentes visuales.

**Aliases de importación (para leer el código más fácil)**

- `@models/*` → `src/app/models/*`
- `@services/*` → `src/app/services/*`
- `@components/*` → `src/app/components/*`
- `@app/*` → `src/app/*`

**Comandos útiles**

```bash
# Desarrollo
npm start

# Build de producción
npm run build

# Tests
npm test

# Tests sin abrir navegador (Headless)
npm test -- --watch=false --browsers=ChromeHeadless
```

Las pruebas unitarias están en archivos `*.spec.ts` dentro de `src/app/`.

**Librerías usadas (principales)**

- `@angular/*` (core, common, compiler, forms, router, platform-browser): framework y tooling principal.
- `primeng`: componentes UI (botones, cards, mensajes, toast, tabs, etc.).
- `primeicons`: set de íconos usado por PrimeNG.
- `rxjs`: programación reactiva con observables.
- `zone.js`: detección de cambios en Angular.
- `tslib`: helpers de runtime para TypeScript.
- `@angular/cli`, `@angular/build`, `@angular/compiler-cli`: herramientas de build/serve/test.
- `typescript`: compilador TS.
- `karma`, `jasmine-core` y `karma-*`: runner y utilidades de testing.

**Posibles problemas por librería (y cómo se notan)**

- `@angular/*` + `@angular/cli`: si la versión de Node no es compatible, verás errores al instalar o al correr `ng`. Solución: usa Node LTS compatible con Angular 20 (ver Requisitos).
- `primeng`: si los componentes se ven sin estilos, falta un **tema** de PrimeNG. Agrega un tema en `src/styles.scss` o en `angular.json`.
- `primeicons`: si no aparecen los íconos, asegúrate de tener esta línea en `src/styles.scss`: `@import 'primeicons/primeicons.css';`.
- `rxjs` / `zone.js`: no actualices estas librerías de forma aislada; si no coinciden con la versión de Angular pueden aparecer errores de build.
- `typescript`: versión incompatible con Angular genera errores de compilación. Mantén la versión definida en `package.json`.
- `karma` + `karma-chrome-launcher`: `npm test` necesita Chrome instalado; si falla con “ChromeHeadless not found”, instala Chrome o configura otro navegador.

**Solución rápida de problemas**

- “ng: command not found”: usa `npm start`. No necesitas Angular CLI global.
- Puerto 4200 ocupado: cierra el otro proceso o usa `npm start -- --port 4201`.
- Error de backend: asegúrate de tener el backend corriendo en `http://localhost:3000`.
- Versión de Node incompatible: instala la versión LTS compatible con Angular 20.
- Tests headless fallan con “Cannot start ChromeHeadless”: instala Google Chrome o define `CHROME_BIN` con la ruta del navegador (ejemplo en Mac con Edge):

```bash
export CHROME_BIN="/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
npm test -- --watch=false --browsers=ChromeHeadless
```
