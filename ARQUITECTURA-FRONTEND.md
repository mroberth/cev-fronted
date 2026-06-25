# Guía Completa de Arquitectura del Frontend — CEV

## Índice

1. [¿Qué es esto?](#1-qué-es-esto)
2. [Estructura general del proyecto](#2-estructura-general-del-proyecto)
3. [El archivo `index.html` — El punto de entrada](#3-el-archivo-indexhtml--el-punto-de-entrada)
4. [El Router — El corazón de la navegación](#4-el-router--el-corazón-de-la-navegación)
   - [4.1. ¿Qué es un Router?](#41-qué-es-un-router)
   - [4.2. El registro de rutas (los mapas de ruta → archivo)](#42-el-registro-de-rutas-los-mapas-de-ruta--archivo)
   - [4.3. El motor principal: `router/index.js`](#43-el-motor-principal-routerindexjs)
   - [4.4. Carga diferida de controladores (Lazy Loading)](#44-carga-diferida-de-controladores-lazy-loading)
5. [Las Páginas (HTML parcial)](#5-las-páginas-html-parcial)
6. [Los Componentes Web (Custom Elements)](#6-los-componentes-web-custom-elements)
7. [Los Controladores — La lógica de cada página](#7-los-controladores--la-lógica-de-cada-página)
8. [La Capa API — Comunicación con el backend](#8-la-capa-api--comunicación-con-el-backend)
9. [Utilidades — Helpers transversales](#9-utilidades--helpers-transversales)
10. [El Guard de Autenticación](#10-el-guard-de-autenticación)
11. [El `.htaccess` — URLs amigables en Apache](#11-el-htaccess--urls-amigables-en-apache)
12. [Flujo completo de un clic a una página](#12-flujo-completo-de-un-clic-a-una-página)
13. [¿Cómo agregar un nuevo módulo/página?](#13-cómo-agregar-un-nuevo-módulopágina)

---

## 1. ¿Qué es esto?

Este es el **frontend** del sistema **CEV (Control de Estudios Virtual)**. Está construido con JavaScript moderno (ES6+), sin usar frameworks pesados como React, Vue o Angular. En su lugar, usa:

- **JavaScript vanilla con módulos ES6** (`import` / `export`)
- **Router casero** (hecho a mano) para navegación tipo Single Page Application (SPA)
- **Custom Elements** (Componentes Web nativos del navegador)
- **Fetch API** para comunicarse con el backend
- **Bootstrap 5** para los estilos visuales

---

## 2. Estructura general del proyecto

```
cev-fronted/
├── .htaccess                  # Configuración del servidor Apache
├── index.html                 # Punto de entrada único (shell)
├── assets/                    # Recursos estáticos
│   ├── css/                   #   Estilos globales
│   │   ├── cev-admin.css      #   Estilos del panel admin
│   │   └── cev-swal.css       #   Estilos para SweetAlert2
│   ├── img/                   #   Imágenes
│   ├── js/                    #   Scripts generales
│   └── plugins/               #   Librerías externas (Bootstrap, jQuery, DataTables, etc.)
└── src/                       # Código fuente de la aplicación
    ├── api/                   #   Llamadas al backend (API REST)
    │   ├── client.js           #     Cliente HTTP genérico (con JWT y refresh)
    │   ├── auth.js             #     Endpoints de autenticación
    │   └── usuarios.js         #     Endpoints de usuarios
    ├── components/            #   Componentes Web reutilizables
    │   ├── index.js            #     Orquestador (importa todos)
    │   ├── navbar.js           #     <admin-navbar>
    │   ├── sidebar.js          #     <admin-sidebar>
    │   └── footer.js           #     <app-footer>
    ├── controllers/           #   Lógica de negocio por página
    │   ├── admin/
    │   │   └── adminController.js    # Lógica del layout admin (sidebar, navbar, inactividad)
    │   ├── auth/
    │   │   └── loginController.js    # Lógica del login
    │   └── usuarios/
    │       ├── usuariosController.js       # Listar usuarios
    │       └── crearUsuarioController.js   # Crear usuario
    ├── pages/                 #   Fragmentos HTML (vistas parciales)
    │   ├── landing/           #     Páginas públicas (landing page)
    │   ├── login/             #     Página de inicio de sesión
    │   ├── admin/             #     Panel de administración
    │   └── errors/            #     Páginas de error (404)
    ├── router/                #   Sistema de enrutamiento
    │   ├── index.js            #     Motor principal del router
    │   ├── landing.js          #     Definición de rutas públicas
    │   ├── login.js            #     Rutas de login
    │   ├── admin.js            #     Rutas del panel admin
    │   └── error.js            #     Ruta 404
    └── utils/                 #   Utilidades transversales
        ├── cev-alerts.js       #     Fábrica de alertas (SweetAlert2)
        ├── gridFactory.js      #     Fábrica de tablas (Grid.js)
        └── validator.js        #     Validaciones de formularios
```

---

## 3. El archivo `index.html` — El punto de entrada

Cuando un navegador carga `http://cev-fronted.test/`, el servidor Apache siempre sirve el archivo `index.html` (gracias al `.htaccess`). Este archivo es el **shell** o **cáscara** de la aplicación. Contiene:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <!-- Carga de CSS (Bootstrap, iconos, estilos propios) -->
  <!-- Carga de JS (jQuery, Bootstrap, SweetAlert2, DataTables) -->

  <!-- Los 3 scripts MODULE más importantes: -->
  <script type="module" src="/src/components/index.js"></script>  <!-- (1) -->
  <script type="module" src="/src/router/index.js"></script>      <!-- (2) -->
  <script type="module" src="/assets/plugins/cev-calendar/..."></script>
</head>
<body class="d-flex flex-column min-vh-100 bg-white">
  <div id="root" class="d-flex flex-column flex-grow-1"></div>
</body>
</html>
```

### ¿Qué hace cada script `type="module"`?

- **`components/index.js`**: Importa y registra los 3 Custom Elements (`<admin-navbar>`, `<admin-sidebar>`, `<app-footer>`). Esto hace que esos componentes estén disponibles en todo el HTML, incluso si ese HTML se inyecta después (como pasa con las páginas cargadas por el router).

- **`router/index.js`**: Arranca el sistema de enrutamiento. Escucha el evento `DOMContentLoaded` (cuando el DOM inicial está listo) y ejecuta `handleRouting()`. También escucha el evento `popstate` (cuando el usuario presiona atrás/adelante en el navegador).

### El `<div id="root">`

Es un contenedor **vacío**. El router va a inyectar aquí el contenido HTML de cada página. Es como un "hueco" donde se pintan las diferentes vistas.

---

## 4. El Router — El corazón de la navegación

### 4.1. ¿Qué es un Router?

Un router es un mecanismo que **observa la URL actual** (ej: `/login`, `/a/usuarios`, `/a/dashboard`) y **decide qué contenido mostrar**. En una SPA (Single Page Application), el router evita recargar la página completa. En lugar de eso:

1. Detecta el cambio de URL
2. Busca qué archivo HTML parcial debe cargar
3. Lo descarga (con `fetch`)
4. Lo inyecta en el `<div id="root">`
5. Ejecuta la lógica (controlador) correspondiente

### 4.2. El registro de rutas (los mapas de ruta → archivo)

Hay 4 archivos que definen qué URL corresponde a qué archivo HTML.

#### `router/landing.js` — Rutas públicas
```js
export const landingRoutes = {
  '/': '/src/pages/landing/landing.html',
  '/servicios': '/src/pages/landing/servicios.html',
  '/nosotros': '/src/pages/landing/nosotros.html',
  '/contacto': '/src/pages/landing/contacto.html'
};
```

#### `router/login.js` — Login
```js
export const loginRoutes = {
  '/login': '/src/pages/login/login.html'
};
```

#### `router/admin.js` — Panel de administración
```js
export const adminRoutes = {
  '/a/dashboard': '/src/pages/admin/dashboard/dashboard.html',
  '/a/usuarios': '/src/pages/admin/usuarios/usuarios.html',
  '/a/crear-usuarios': '/src/pages/admin/usuarios/crear_usuarios.html'
};
```

#### `router/error.js` — Error 404
```js
export const errorRoutes = {
  '/404': '/src/pages/errors/404.html'
};
```

**¿Por qué están separados?** Por organización. Cada "módulo" del sistema tiene su propio archivo de rutas. Luego se combinan todos en el `index.js`.

### 4.3. El motor principal: `router/index.js`

Este es el archivo más importante. Te explico cada parte:

```js
import { landingRoutes } from "./landing.js";
import { loginRoutes } from "./login.js";
import { errorRoutes } from "./error.js";
import { adminRoutes } from "./admin.js";

// Combinar TODAS las rutas en un solo objeto/diccionario
const routes = {
  ...landingRoutes,
  ...loginRoutes,
  ...errorRoutes,
  ...adminRoutes
};
```

**Las rutas protegidas**: Algunas URLs requieren que el usuario haya iniciado sesión. Se define qué rutas son protegidas:

```js
const rutasPublicas = ['/', '/login', '/servicios', '/nosotros', '/contacto', '/404'];
const patronesProtegidos = ['/a', '/u']; // Todo lo que empiece con /a/ o /u/
```

**La función `handleRouting`** — El motor principal:

```js
const handleRouting = async () => {
  // 1. Obtener la URL actual del navegador
  let path = window.location.pathname;  // ej: "/a/usuarios"

  // 2. AUTH GUARD: Si la ruta es protegida y el usuario no tiene token, redirigir al login
  if (esRutaProtegida(path) && !tieneToken()) {
    sessionStorage.setItem('redirect_reason', 'no_auth');
    window.history.replaceState({}, '', '/login');
    path = '/login';
  }

  // 3. Buscar el archivo HTML correspondiente a la ruta
  const targetFile = routes[path] || routes['/404'];

  try {
    // 4. Descargar el HTML parcial (con fetch)
    const response = await fetch(targetFile, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });

    if (!response.ok) throw new Error('Pagina no encontrada');
    const htmlContent = await response.text();

    // 5. Extraer y aplicar las clases del <body> que vienen en el HTML parcial
    const bodyClassRegex = /<body[^>]*class=["']([^"']*)["']/i;
    const match = htmlContent.match(bodyClassRegex);
    document.body.className = match ? match[1] : "d-flex flex-column min-vh-100 bg-white";

    // 6. Inyectar el HTML en el <div id="root">
    document.getElementById('root').innerHTML = htmlContent;

    // 7. Disparar un evento personalizado 'page-loaded' para que los controladores se activen
    window.dispatchEvent(new CustomEvent('page-loaded', { detail: { path } }));

  } catch (error) {
    // Si algo falla, cargar la página 404
    document.getElementById('root').innerHTML = await (await fetch(routes['/404'])).text();
  }
};
```

**Los listeners** que arrancan el router:

```js
// Cuando el usuario navega con atrás/adelante en el navegador
window.addEventListener('popstate', handleRouting);

// Cuando la página se carga por primera vez
document.addEventListener('DOMContentLoaded', handleRouting);
```

**La función global `window.navigate`** — Así se navega programáticamente:

```js
window.navigate = (path) => {
  window.history.pushState({}, '', path);  // Cambia la URL sin recargar
  handleRouting();                          // Dispara el renderizado
};
```

Desde cualquier parte de la aplicación puedes llamar a `window.navigate('/a/usuarios')` para navegar.

### 4.4. Carga diferida de controladores (Lazy Loading)

Después de cargar el HTML (evento `page-loaded`), el router carga el **controlador** (código JavaScript) que da vida a esa página:

```js
window.addEventListener('page-loaded', async (e) => {
  const path = e.detail.path;

  // Si es una ruta de admin, siempre cargar el adminController
  if (path.startsWith('/a/')) {
    const adminModule = await import('../controllers/admin/adminController.js');
    adminModule.initAdmin();
  }

  // Buscar un controlador específico para esta ruta exacta
  const routeConfig = controllerRoutes.find(r => r.path === path);
  if (routeConfig) {
    const module = await import(routeConfig.controller + '?t=' + Date.now());
    if (routeConfig.init) routeConfig.init(module);
  }
});
```

El array `controllerRoutes` mapea rutas a sus controladores:

```js
const controllerRoutes = [
  {
    path: '/login',
    controller: '../controllers/auth/loginController.js',
    init: (module) => { module.initLogin(); }
  },
  {
    path: '/a/usuarios',
    controller: '../controllers/usuarios/usuariosController.js',
    init: (module) => { module.initUsuarios(); }
  },
  {
    path: '/a/crear-usuarios',
    controller: '../controllers/usuarios/crearUsuarioController.js',
    init: (module) => { module.initCrearUsuario(); }
  }
];
```

**Nota importante**: El `+ '?t=' + Date.now()` es un "cache-busting". Cada vez que se navega a una página, se fuerza al navegador a descargar el controlador de nuevo (evita que use una versión cacheadada). Esto es importante porque no estamos usando un bundler como Webpack.

---

## 5. Las Páginas (HTML parcial)

Las páginas están en `src/pages/`. Cada archivo es un **fragmento HTML**, no una página completa. Por ejemplo, `dashboard.html`:

```html
<body class="">
  <admin-navbar></admin-navbar>     <!-- Custom Element: Navbar -->
  <div class="admin-wrapper">
    <div id="admin-sidebar-backdrop" class="admin-sidebar-backdrop"></div>
    <admin-sidebar></admin-sidebar> <!-- Custom Element: Sidebar -->
    <main class="admin-content">
      <!-- Contenido específico de la página -->
    </main>
  </div>
```

### ¿Por qué empiezan con `<body class="">` y no tienen `<html>` ni `<head>`?

Porque **no son páginas completas**. Son fragmentos que serán inyectados dentro del `<div id="root">` del `index.html`. El router extrae solo el atributo `class` del `<body>` (si existe), lo aplica al `<body>` real, y luego descarta las etiquetas `<body>` y todo lo demás, insertando solo el contenido interno en el `#root`. 

En realidad, se inserta **todo** el string HTML en el `innerHTML` del `#root`, pero como las etiquetas `<body>`, `<html>`, `<head>` son inválidas dentro de un div, el navegador las parsea y las ignora/descarta automáticamente, dejando solo el contenido visible.

### ¿Cómo se ven las páginas públicas?

La landing page (`landing.html`) SÍ tiene su propio navbar y footer en el HTML, mientras que las páginas de admin usan **Custom Elements** para el navbar y sidebar, que son inyectados por el componente.

---

## 6. Los Componentes Web (Custom Elements)

Los componentes se definen en `src/components/`. Son clases de JavaScript que extienden `HTMLElement`.

### ¿Qué es un Custom Element?

Es una característica moderna de los navegadores que permite crear etiquetas HTML personalizadas. Por ejemplo, `<admin-navbar>` no existe en HTML estándar — es un componente que nosotros creamos.

### Cómo funciona:

```js
// navbar.js
export class AdminNavbar extends HTMLElement {
  connectedCallback() {       // Se ejecuta cuando el elemento se inserta en el DOM
    this.innerHTML = `        // Define el HTML interno del componente
      <nav class="navbar ...">
        <button id="btn-sidebar-toggle">☰</button>
        <span id="user-nombre"></span>
        <button id="btn-logout">Salir</button>
      </nav>
    `;
  }
}
customElements.define("admin-navbar", AdminNavbar);
```

**`connectedCallback()`**: Se llama automáticamente cuando el navegador encuentra `<admin-navbar>` en el HTML y lo inserta en la página. Es como el "constructor" visual del componente.

**`customElements.define("nombre-etiqueta", Clase)`**: Registra la etiqueta para que el navegador la reconozca.

### Los 3 componentes existentes:

| Etiqueta | Archivo | Propósito |
|---|---|---|
| `<admin-navbar>` | `navbar.js` | Barra superior del panel admin con foto, nombre y botón de salir |
| `<admin-sidebar>` | `sidebar.js` | Menú lateral de navegación del admin |
| `<app-footer>` | `footer.js` | Pie de página genérico |

### ¿Por qué son útiles?

Porque el HTML de las páginas admin se inyecta dinámicamente (por el router), y si el navbar estuviera escrito directamente en cada página HTML, tendríamos que repetirlo en cada archivo. Con Custom Elements, simplemente escribimos `<admin-navbar></admin-navbar>` y el componente se renderiza solo. Si necesitamos cambiar el navbar, lo cambiamos en un solo lugar.

---

## 7. Los Controladores — La lógica de cada página

Mientras que las páginas HTML son solo la **vista** (estructura visual), los controladores son el **código JavaScript** que le da funcionalidad. Se encuentran en `src/controllers/`.

### Ejemplo: `loginController.js`

```js
import { apiLogin } from '../../api/auth.js';
import { validateEmail, validatePassword } from '../../utils/validator.js';
import { CevAlert } from '../../utils/cev-alerts.js';

export const initLogin = () => {
  const form = document.getElementById('form-login');
  if (!form) return;

  // Validaciones en tiempo real
  form.email.addEventListener('input', () => { /* validar email */ });
  form.password.addEventListener('input', () => { /* validar password */ });

  // Envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // 1. Validar campos
    // 2. Llamar a la API
    // 3. Guardar datos en localStorage
    // 4. Redirigir con window.navigate()
  });
};
```

### ¿Cuándo se ejecuta un controlador?

Cuando el router termina de inyectar el HTML en el `#root`, dispara el evento `page-loaded`. El sistema entonces busca si hay un controlador registrado para esa ruta exacta y lo importa dinámicamente (lazy loading).

### El `adminController.js` — Un caso especial

El `adminController` no se asocia a una ruta específica, sino a **cualquier ruta que empiece con `/a/`**:

```js
if (path.startsWith('/a/')) {
    const adminModule = await import('../controllers/admin/adminController.js');
    adminModule.initAdmin();
}
```

Hace las siguientes tareas:
- **loadUserInfo()**: Toma los datos del usuario desde `localStorage` y los muestra en el navbar
- **setupSidebar()**: Activa el botón para colapsar/expandir la sidebar
- **highlightActiveLink()**: Marca como "activo" el link de la sidebar correspondiente a la página actual
- **setupLogout()**: Configura el botón de cerrar sesión
- **setCurrentDate()**: Muestra la fecha actual en el dashboard
- **iniciarTimerInactividad()**: Inicia un contador de 14 minutos de inactividad tras los cuales muestra una alerta de sesión por expirar

---

## 8. La Capa API — Comunicación con el backend

Los archivos en `src/api/` encapsulan las llamadas HTTP al backend (`http://cev-backend.test/`).

### `api/client.js` — El cliente HTTP

```js
const API_BASE_URL = 'http://cev-backend.test/';

class ApiClient {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let response = await fetch(`${this.baseUrl}${endpoint}`, config);

    // Si recibimos 401 (no autorizado), intentamos refrescar el token
    if (response.status === 401 && endpoint !== 'refresh') {
      const renovado = await this._refrescarToken();
      if (renovado) {
        // Reintentar la petición original con el nuevo token
        headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        response = await fetch(`${this.baseUrl}${endpoint}`, config);
      } else {
        // Si no se pudo renovar, redirigir al login
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return response.json();
  }

  get(endpoint)    { return this.request(endpoint, { method: 'GET' }); }
  post(endpoint, data) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
  put(endpoint, data)  { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }); }
  delete(endpoint)     { return this.request(endpoint, { method: 'DELETE' }); }
}

export const apiClient = new ApiClient();
```

**Características clave:**
- Automáticamente añade el token JWT a todas las peticiones
- Si el backend responde con 401 (no autorizado), intenta renovar el token usando el `refresh_token`
- Si la renovación falla, limpia la sesión y redirige al login

### `api/auth.js` — Autenticación
```js
export const apiLogin = (credentials) => {
  return apiClient.post('login', credentials);
};
```

### `api/usuarios.js` — Usuarios
```js
export const listarUsuarios = () => apiClient.get('usuarios');
export const crearUsuario = (data) => apiClient.post('usuarios', data);
```

---

## 9. Utilidades — Helpers transversales

### `utils/cev-alerts.js` — Alertas bonitas

Una envoltura sobre SweetAlert2 para estandarizar las alertas en todo el sistema:

```js
CevAlert.success({ title: 'Hecho', text: 'Operación exitosa.' });
CevAlert.error({ title: 'Error', text: 'Algo salió mal.' });
CevAlert.warning({ title: 'Cuidado', text: 'Revisa los datos.' });
CevAlert.info({ title: 'Info', text: 'Novedad disponible.' });
CevAlert.question({ title: '¿Confirmar?', text: '¿Estás seguro?' });
CevAlert.toast({ type: 'success', title: 'Guardado' });
CevAlert.sessionExpiring({ title: 'Sesión por Expirar', timerDuration: 60 });
```

### `utils/validator.js` — Validaciones de formulario

Funciones reutilizables para validar campos:
```js
validateEmail('correo@ejemplo.com')   // Devuelve '' si es válido, o un mensaje de error
validatePassword('12345')              // Devuelve '' si es válido, o un mensaje de error
```

### `utils/gridFactory.js` — Tablas con Grid.js

Una fábrica para crear tablas con Grid.js (si se usa en lugar de DataTables). Centraliza la configuración de idioma español, paginación, etc.

---

## 10. El Guard de Autenticación

En `router/index.js`, antes de cargar cualquier página, el router verifica:

```js
function esRutaProtegida(path) {
  return patronesProtegidos.some(p => path === p || path.startsWith(p + '/'));
}

function tieneToken() {
  return !!localStorage.getItem('token');
}

// Dentro de handleRouting:
if (esRutaProtegida(path) && !tieneToken()) {
  sessionStorage.setItem('redirect_reason', 'no_auth');
  window.history.replaceState({}, '', '/login');
  path = '/login';
}
```

**¿Qué hace exactamente?**
1. Detecta que la URL solicitada empieza con `/a/` o `/u/` (rutas protegidas)
2. Revisa si `localStorage` tiene un `token`
3. Si no hay token, guarda en `sessionStorage` el motivo (`'no_auth'`) y cambia la URL a `/login`
4. El controlador de login (`loginController.js`) al iniciarse, lee `sessionStorage.getItem('redirect_reason')` y muestra un mensaje: *"Debes iniciar sesión primero para acceder a esta sección."*

---

## 11. El `.htaccess` — URLs amigables en Apache

```
RewriteEngine On

# Proteger los HTML de páginas: solo se sirven si traen la cabecera XMLHttpRequest
RewriteCond %{HTTP:X-Requested-With} !=XMLHttpRequest
RewriteRule ^src/pages/ - [F,L]

# Si la URL no corresponde a un archivo real, servir index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . index.html [L]
```

**¿Qué hacen estas reglas?**

1. **Regla 1 (seguridad)**: Bloquea el acceso directo a los archivos HTML dentro de `src/pages/`. Si alguien escribe `http://cev-fronted.test/src/pages/admin/dashboard.html` directamente, Apache devuelve 403 (prohibido). Solo el router puede cargarlos, porque él envía la cabecera `X-Requested-With: XMLHttpRequest`.

2. **Regla 2 (SPA)**: Si alguien navega a `/a/usuarios` o `/login`, Apache no encuentra un archivo físico llamado `usuarios` o `login`. En lugar de devolver 404, sirve `index.html`. Luego el router JS lee la URL y decide qué contenido mostrar.

---

## 12. Flujo completo de un clic a una página

Imagina que un usuario, ya autenticado, está en el Dashboard y hace clic en el link **"Usuarios"** de la barra lateral:

```
1. ⚡ USUARIO HACE CLIC en <a href="/a/usuarios">
2. 📡 El navegador lanza el evento popstate y llama a handleRouting()
3. 🔍 Lee la URL: window.location.pathname → "/a/usuarios"
4. 🛡️ Auth Guard: ¿Es protegida? Sí → ¿Tiene token? Sí (ok, continúa)
5. 📖 Busca en routes: routes['/a/usuarios'] → '/src/pages/admin/usuarios/usuarios.html'
6. 📥 Fetch a ese HTML con cabecera X-Requested-With
7. 🖼️ Extrae las clases del <body> y las aplica al <body> real
8. 🧩 Inyecta el HTML dentro de <div id="root">
9. 📢 Dispara evento 'page-loaded' con path = '/a/usuarios'
10. 🧠 page-loaded listener:
      a. ¿Empieza con /a/? Sí → import adminController.js → initAdmin()
         → Carga info del usuario, configura sidebar, logout, etc.
      b. ¿Hay controllerRoutes para '/a/usuarios'? Sí
         → import usuariosController.js + '?t=1234567890'
         → initUsuarios()
         → Llama a la API, obtiene los usuarios, llena la DataTable
11. ✅ El usuario ve la tabla de usuarios en pantalla sin recargar la página
```

---

## 13. ¿Cómo agregar un nuevo módulo/página?

Si quieres crear, por ejemplo, un módulo **"Periodos"** con ruta `/a/periodos`, sigue estos pasos:

### Paso 1: Crear el archivo HTML parcial

Crea `src/pages/admin/periodos/periodos.html`:

```html
<body class="">
  <admin-navbar></admin-navbar>
  <div class="admin-wrapper">
    <div id="admin-sidebar-backdrop" class="admin-sidebar-backdrop"></div>
    <admin-sidebar></admin-sidebar>
    <main class="admin-content">
      <h4 class="fw-bold mb-0">Gestión de Períodos</h4>
      <!-- Contenido de la página -->
    </main>
  </div>
```

### Paso 2: Registrar la ruta

En `src/router/admin.js`, añade la nueva ruta:

```js
export const adminRoutes = {
  '/a/dashboard': '/src/pages/admin/dashboard/dashboard.html',
  '/a/usuarios': '/src/pages/admin/usuarios/usuarios.html',
  '/a/crear-usuarios': '/src/pages/admin/usuarios/crear_usuarios.html',
  '/a/periodos': '/src/pages/admin/periodos/periodos.html',   // <-- NUEVO
};
```

### Paso 3: (Opcional) Crear el controlador

Si la página necesita lógica específica (ej: cargar datos de una API), crea `src/controllers/periodos/periodosController.js`:

```js
export function initPeriodos() {
  console.log('Página de períodos cargada');
  // Aquí tu lógica...
}
```

### Paso 4: Registrar el controlador

En `src/router/index.js`, dentro del array `controllerRoutes`, añade:

```js
{
  path: '/a/periodos',
  controller: '../controllers/periodos/periodosController.js',
  init: (module) => { module.initPeriodos(); }
}
```

### Paso 5: Crear la API (si necesitas llamadas al backend)

En `src/api/periodos.js`:

```js
import { apiClient } from './client.js';
export const listarPeriodos = () => apiClient.get('periodos');
export const crearPeriodo = (data) => apiClient.post('periodos', data);
```

### Paso 6: Agregar el link en la sidebar

En `src/components/sidebar.js`, dentro del HTML hay secciones como:

```html
<a href="/a/periodos" class="nav-link">
  <i class="bi bi-calendar-range"></i> Períodos
</a>
```

**¡Y ya está!** No necesitas reiniciar nada, ni compilar, ni configurar un bundler. Solo recarga el navegador y la nueva ruta funciona.

---

## Resumen visual del flujo de datos

```
index.html (shell vacío con #root)
     │
     ├── Carga components/index.js  →  Registra <admin-navbar>, <admin-sidebar>, <app-footer>
     │
     └── Carga router/index.js
              │
              ├── Escucha: DOMContentLoaded → handleRouting()
              ├── Escucha: popstate → handleRouting()
              │
              └── handleRouting()
                      │
                      ├── Auth Guard (¿hay token? ¿ruta protegida?)
                      │
                      ├── fetch(archivo_html) + injertar en #root
                      │
                      └── page-loaded event
                              │
                              ├── ¿/a/*? → adminController.js (layout admin)
                              │
                              └── ¿ruta exacta? → controlador específico
                                      │
                                      └── ¿necesita datos? → api/ → fetch → backend
```

---

## Conceptos clave para un nuevo desarrollador

| Concepto | Explicación |
|---|---|
| **SPA** | Single Page Application. El navegador carga UNA sola página (`index.html`) y todo el contenido cambia sin recargar. |
| **Router** | Código que mira la URL y decide qué HTML mostrar. Nuestro router está en `src/router/index.js`. |
| **Custom Element** | Etiqueta HTML personalizada (ej: `<admin-navbar>`). Creada con JavaScript puro. |
| **Lazy Loading** | Cargar código solo cuando se necesita. Nuestros controladores se cargan al navegar a su ruta, no antes. |
| **`localStorage`** | Almacenamiento en el navegador que persiste aunque cierres la pestaña. Aquí guardamos el token JWT. |
| **`sessionStorage`** | Similar a localStorage, pero se borra al cerrar la pestaña. Lo usamos para mensajes temporales entre páginas. |
| **Fetch API** | Función moderna de JavaScript para hacer peticiones HTTP. Reemplaza al viejo `XMLHttpRequest`. |
| **JWT** | JSON Web Token. Es como un "carnet de identidad digital" que el backend nos da al hacer login. Lo enviamos en cada petición para demostrar quiénes somos. |
| **`.htaccess`** | Archivo de configuración de Apache (servidor web) para controlar URLs, seguridad y redirecciones. |
| **Cache-busting** | Truco de añadir `?t=1234567890` a una URL para evitar que el navegador use una versión guardada en caché. |
