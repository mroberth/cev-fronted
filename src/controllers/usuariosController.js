import { listarUsuarios } from '../api/usuarios.js';
import { CevAlert } from '../utils/cev-alerts.js';

export function initUsuarios() {
  cargarUsuarios();
  setupBuscador();
}

async function cargarUsuarios() {
  const tbody = document.getElementById('tabla-usuarios');
  if (!tbody) return;

  try {
    const response = await listarUsuarios();
    const usuarios = response.data;

    if (!usuarios || usuarios.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">
        <i class="bi bi-inbox me-1"></i> No hay usuarios registrados.
      </td></tr>`;
      return;
    }

    tbody.innerHTML = usuarios.map(u => `
      <tr>
        <td class="text-muted small">${u.id}</td>
        <td>${u.nombre || '-'}</td>
        <td>${u.apellido || '-'}</td>
        <td>${u.correo}</td>
        <td><span class="badge bg-primary bg-opacity-10 text-primary">${u.nombre_rol}</span></td>
        <td>${badgeEstado(u.estado)}</td>
        <td class="text-end">
          <button class="btn btn-outline-secondary btn-sm" title="Editar" disabled>
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm" title="Eliminar" disabled>
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');

    guardarDatos(usuarios);
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">
      <i class="bi bi-exclamation-triangle me-1"></i> Error al cargar: ${error.message}
    </td></tr>`;
  }
}

function badgeEstado(estado) {
  if (estado === 'activo') {
    return '<span class="badge bg-success bg-opacity-10 text-success">Activo</span>';
  }
  return '<span class="badge bg-secondary bg-opacity-10 text-secondary">Inactivo</span>';
}

let datosUsuarios = [];

function guardarDatos(usuarios) {
  datosUsuarios = usuarios;
}

function setupBuscador() {
  const input = document.getElementById('buscar-usuario');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    const filas = document.querySelectorAll('#tabla-usuarios tr');
    filas.forEach(fila => {
      const texto = fila.textContent.toLowerCase();
      fila.style.display = texto.includes(q) ? '' : 'none';
    });
  });
}
