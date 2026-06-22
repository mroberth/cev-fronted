//importo los submodulos de rutas
import { landingRoutes } from "./landing.js";
import { loginRoutes } from "./login.js";
import { errorRoutes } from "./error.js";

//Combinar absolutamente todas las rutas en un solo diccionario
const routes = {
  ...landingRoutes,
  ...loginRoutes,
  ...errorRoutes
};

//El motor enrutador
const handleRouting = async () => {
  const path = window.location.pathname;
  console.log("Rutas disponibles:", routes);
  const targetFile = routes[path] || routes['/404'];

  try {
    const response = await fetch(targetFile);
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
    const response = await fetch(routes['/404']);
    document.body.className = "d-flex flex-column min-vh-100 bg-white";
    document.getElementById('root').innerHTML = await response.text();
  }
};

window.addEventListener('popstate', handleRouting);
document.addEventListener('DOMContentLoaded', handleRouting);

window.navigate = (path) => {
  window.history.pushState({}, '', path);
  handleRouting();
};

window.addEventListener('page-loaded', (e) => {
  if (e.detail.path === '/login') {
    import('../controllers/loginController.js').then((module) => {
      module.initLogin();
    });
  }
});