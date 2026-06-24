import { CevAlert } from '../../utils/cev-alerts.js';

const INACTIVITY_TIMEOUT = 840;
const WARNING_DURATION = 60;
let tiempoRestante = INACTIVITY_TIMEOUT;
let timerId = null;
let modalAbierto = false;

export function initAdmin() {
  const path = window.location.pathname;

  if (!path.startsWith('/a/')) return;

  loadUserInfo();
  setupSidebar();
  highlightActiveLink();
  setupLogout();
  setCurrentDate();
  iniciarTimerInactividad();

  if (path === '/a/dashboard') {
    initCalendar();
  }
}

function iniciarTimerInactividad() {
  detenerTimerInactividad();

  const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
  eventos.forEach(e => window.removeEventListener(e, resetearInactividad));
  eventos.forEach(e => window.addEventListener(e, resetearInactividad));

  timerId = setInterval(() => {
    tiempoRestante--;
    if (tiempoRestante <= 0) {
      detenerTimerInactividad();
      mostrarAlertaExpiracion();
    }
  }, 1000);
}

function detenerTimerInactividad() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function resetearInactividad() {
  if (modalAbierto) return;
  tiempoRestante = INACTIVITY_TIMEOUT;
}

function mostrarAlertaExpiracion() {
  modalAbierto = true;

  const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
  eventos.forEach(e => window.removeEventListener(e, resetearInactividad));

  CevAlert.sessionExpiring({
    title: 'Sesión por Expirar',
    timerDuration: WARNING_DURATION,
  }).then((result) => {
    modalAbierto = false;
    if (result.isConfirmed) {
      refrescarSesion();
    } else {
      logout();
    }
  });
}

async function refrescarSesion() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    logout();
    return;
  }

  try {
    const res = await fetch('http://cev-backend.test/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) throw new Error('No se pudo renovar');

    const body = await res.json();
    const data = body.data || body;

    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
    }

    CevAlert.success({
      title: 'Sesión Renovada',
      text: 'Tu sesión se ha extendido con éxito.',
      timer: 1500,
      showConfirmButton: false,
    });

    const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    eventos.forEach(e => window.addEventListener(e, resetearInactividad));
    resetearInactividad();
    iniciarTimerInactividad();
  } catch {
    CevAlert.error({
      title: 'Error de Conexión',
      text: 'No se pudo renovar la sesión.',
      confirmButtonText: 'Entendido',
    }).then(() => logout());
  }
}

function loadUserInfo() {
  const nombre = document.getElementById('user-nombre');
  const apellido = document.getElementById('user-apellido');
  const rol = document.getElementById('user-rol');

  if (nombre) nombre.textContent = localStorage.getItem('user_nombre') || '';
  if (apellido) apellido.textContent = localStorage.getItem('user_apellido') || '';
  if (rol) rol.textContent = localStorage.getItem('user_rol') || '-';
}

function setupSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  const toggleBtn = document.getElementById('btn-sidebar-toggle');
  const backdrop = document.getElementById('admin-sidebar-backdrop');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      if (backdrop) backdrop.classList.toggle('show');
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.add('collapsed');
      backdrop.classList.remove('show');
    });
  }
}

function highlightActiveLink() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.admin-sidebar .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '#' && currentPath.startsWith(href)) {
      link.classList.add('active');
    }
  });
}

function setupLogout() {
  const btn = document.getElementById('btn-logout');
  if (!btn) return;

  btn.addEventListener('click', () => {
    CevAlert.question({
      title: '¿Cerrar Sesión?',
      text: 'Tu sesión se cerrará y tendrás que volver a ingresar.',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
    }).then((result) => {
      if (result.isConfirmed) logout();
    });
  });
}

async function logout() {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refresh_token');

  try {
    await fetch('http://cev-backend.test/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {}

  localStorage.clear();
  sessionStorage.clear();
  document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  const persisteToken = !!localStorage.getItem('token');
  const persisteCookie = document.cookie.split(';').some(c => c.trim().startsWith('access_token='));
  const sesionLimpia = !persisteToken && !persisteCookie;

  if (sesionLimpia) {
    await CevAlert.success({
      title: 'Sesión cerrada',
      text: 'Has cerrado sesión exitosamente.',
      timer: 2000,
      showConfirmButton: false,
    });
  }

  window.navigate('/login');
}

function setCurrentDate() {
  const el = document.getElementById('current-date');
  if (el) {
    el.textContent = new Date().toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }
}

function initCalendar() {
  const container = document.getElementById('cev-calendar-container');
  if (!container || typeof CevCalendar === 'undefined') return;

  new CevCalendar('#cev-calendar-container', {
    events: [
      { id: 1, date: new Date().toISOString().split('T')[0], title: 'Hoy', color: '#0d6efd' },
    ],
    onEventClick: (event) => CevAlert.info({ title: event.title, text: event.date }),
  });
}
