//importo los submodulos de rutas
import { landingRoutes } from "./landing.js";
import { loginRoutes } from "./login.js";
import { errorRoutes } from "./error.js";
import { adminRoutes } from "./admin.js";

//Combinar absolutamente todas las rutas en un solo diccionario
const routes = {
  ...landingRoutes,
  ...loginRoutes,
  ...errorRoutes,
  ...adminRoutes
};

// Rutas que no requieren autenticación
const rutasPublicas = ['/', '/login', '/servicios', '/nosotros', '/contacto', '/404'];
const patronesProtegidos = ['/a', '/u'];

function esRutaProtegida(path) {
  return patronesProtegidos.some(p => path === p || path.startsWith(p + '/'));
}

function tieneToken() {
  return !!localStorage.getItem('token');
}

//El motor enrutador
const handleRouting = async () => {
  let path = window.location.pathname;

  // Auth guard: redirigir al login si la ruta es protegida y no hay token
  if (esRutaProtegida(path) && !tieneToken()) {
    sessionStorage.setItem('redirect_reason', 'no_auth');
    window.history.replaceState({}, '', '/login');
    path = '/login';
  }

  const targetFile = routes[path] || routes['/404'];

  try {
    const response = await fetch(targetFile, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    if (!response.ok) throw new Error('Pagina no encontrada');

    const htmlContent = await response.text();

    // Sincronizar clases del body de la página cargada con el body del documento
    const bodyClassRegex = /<body[^>]*class=["']([^"']*)["']/i;
    const match = htmlContent.match(bodyClassRegex);
    if (match) {
      document.body.className = match[1];
    } else {
      document.body.className = "d-flex flex-column min-vh-100 bg-white";
    }

    document.getElementById('root').innerHTML = htmlContent;

    window.dispatchEvent(new CustomEvent('page-loaded', { detail: { path } }));
  } catch (error) {
    console.error('Error en enrutamiento: ', error);
    const errorResp = await fetch(routes['/404'], {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    document.body.className = "d-flex flex-column min-vh-100 bg-white";
    document.getElementById('root').innerHTML = await errorResp.text();
  }
};

window.addEventListener('popstate', handleRouting);
document.addEventListener('DOMContentLoaded', handleRouting);

window.navigate = (path) => {
  window.history.pushState({}, '', path);
  handleRouting();
};

window.addEventListener('page-loaded', (e) => {
  const path = e.detail.path;

  if (path === '/login') {
    import('../controllers/loginController.js').then((module) => {
      module.initLogin();

      const reason = sessionStorage.getItem('redirect_reason');
      if (reason) {
        sessionStorage.removeItem('redirect_reason');
        module.mostrarMotivoRedireccion(reason);
      }
    });
  }

  if (path === '/a/dashboard' || path.startsWith('/a/')) {
    import('../controllers/adminController.js').then((module) => {
      module.initAdmin();
    });
  }

  if (path === '/a/usuarios') {
    import('../controllers/usuariosController.js').then((module) => {
      module.initUsuarios();
    });
  }

  if (path === '/a/crear-usuarios') {
    import('../controllers/crearUsuarioController.js').then((module) => {
      module.initCrearUsuario();
    });
  }
});