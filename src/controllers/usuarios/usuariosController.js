import { listarUsuarios } from '../../api/usuarios.js';
import { crearGrid } from '../../utils/gridFactory.js';

export function initUsuarios() {
  cargarUsuarios();
}

async function cargarUsuarios() {
  const container = document.getElementById('tabla-usuarios');
  if (!container) return;

  try {
    const response = await listarUsuarios();
    const usuarios = response.data;

    if (!usuarios || usuarios.length === 0) {
      container.innerHTML = '<p class="text-muted text-center py-4 mb-0"><i class="bi bi-inbox me-1"></i> No hay usuarios registrados.</p>';
      return;
    }

    const columnas = [
      'Nombre',
      'Apellido',
      { name: 'Correo', sort: false },
      {
        name: 'Rol',
        formatter: (cell) => gridjs.html(`<span class="badge bg-primary bg-opacity-10 text-primary">${cell}</span>`),
      },
      {
        name: 'Estado',
        formatter: (cell) => gridjs.html(
          cell === 'activo'
            ? '<span class="badge bg-success bg-opacity-10 text-success">Activo</span>'
            : '<span class="badge bg-secondary bg-opacity-10 text-secondary">Inactivo</span>'
        ),
      },
      {
        name: 'Acciones',
        width: '100px',
        sort: false,
        formatter: () => gridjs.html(`
          <div class="d-flex gap-1 justify-content-center">
            <button class="btn btn-outline-secondary btn-sm" title="Editar"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-outline-danger btn-sm" title="Eliminar"><i class="bi bi-trash"></i></button>
          </div>
        `),
      },
    ];

    const datos = usuarios.map(u => [u.nombre || '-', u.apellido || '-', u.correo, u.nombre_rol, u.estado, '']);

    crearGrid(container, columnas, datos);
  } catch (error) {
    container.innerHTML = `<p class="text-danger text-center py-4 mb-0"><i class="bi bi-exclamation-triangle me-1"></i> Error al cargar: ${error.message}</p>`;
  }
}
