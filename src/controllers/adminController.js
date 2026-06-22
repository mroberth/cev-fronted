import { CevAlert } from '../utils/cev-alerts.js';

export function initAdmin() {
  const path = window.location.pathname;

  if (!path.startsWith('/a/')) return;

  loadUserInfo();
  setupSidebar();
  highlightActiveLink();
  setupLogout();
  setCurrentDate();

  if (path === '/a/dashboard') {
    initCalendar();
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
