import { listarUsuarios } from '../../api/usuarios.js';
import { CevAlert } from '../../utils/cev-alerts.js';

export function initUsuarios() {
  cargarUsuarios();
}

async function cargarUsuarios() {
  const tableEl = document.getElementById('usuarios-datatable');
  if (!tableEl) return;

  if (typeof window.$ === 'undefined' || typeof window.$.fn.DataTable === 'undefined') return;

  const $ = window.$;

  try {
    const response = await listarUsuarios();
    const usuarios = response.data;

    const tableData = (usuarios || []).map(u => ({
      nombre: u.nombre || '-',
      apellido: u.apellido || '-',
      correo: u.correo || '-',
      rol: u.nombre_rol || '-',
      estado: u.estado || 'inactivo',
      id: u.id
    }));

    // Destruir instancia previa si existe (al regresar a la página)
    if ($.fn.DataTable.isDataTable('#usuarios-datatable')) {
      $('#usuarios-datatable').DataTable().destroy();
    }

    // Cargar traducción desde el archivo JSON externo
    let idioma = {};
    try {
      const langResp = await fetch('/assets/plugins/datatables/es-ES.json');
      if (langResp.ok) idioma = await langResp.json();
    } catch (_) { /* usa inglés por defecto si falla */ }

    // Inicializar DataTable
    $('#usuarios-datatable').DataTable({
      data: tableData,
      columns: [
        { data: 'nombre' },
        { data: 'apellido' },
        { data: 'correo', orderable: false },
        {
          data: 'rol',
          render: function (data) {
            return `<span class="badge badge-premium bg-primary bg-opacity-10 text-primary">${data}</span>`;
          }
        },
        {
          data: 'estado',
          render: function (data) {
            const isActivo = data === 'activo';
            const bgClass = isActivo ? 'bg-success' : 'bg-secondary';
            const textClass = isActivo ? 'text-success' : 'text-secondary';
            const label = isActivo ? 'Activo' : 'Inactivo';
            return `<span class="badge badge-premium ${bgClass} bg-opacity-10 ${textClass}">${label}</span>`;
          }
        },
        {
          data: null,
          orderable: false,
          className: 'text-center',
          render: function (data, type, row) {
            return `
              <div class="d-flex gap-2 justify-content-center">
                <button class="btn btn-sm btn-secondary rounded-2 py-1 px-2 d-flex align-items-center btn-editar"
                        data-id="${row.id}" title="Editar">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-danger rounded-2 py-1 px-2 d-flex align-items-center btn-eliminar"
                        data-id="${row.id}" title="Eliminar">
                  <i class="bi bi-trash3-fill"></i>
                </button>
              </div>
            `;
          }
        }
      ],
      responsive: true,
      autoWidth: false,
      pageLength: 10,
      lengthMenu: [5, 10, 25, 50, 100],
      language: idioma,
      dom: "<'row mb-3 align-items-center'" +
        "<'col-12 col-md-auto'B>" +
        "<'col-12 col-md d-flex justify-content-md-end mt-2 mt-md-0'f>" +
        ">" +
        "<'row'<'col-12'tr>>" +
        "<'row mt-2 align-items-center'" +
        "<'col-12 col-md-5'i>" +
        "<'col-12 col-md-7 d-flex justify-content-md-end'p>" +
        ">",
      buttons: [
        {
          extend: 'excel',
          text: '<i class="bi bi-file-earmark-excel me-1"></i> Excel',
          className: 'btn btn-success',
          init: function (api, node, config) {
            $(node).removeClass('btn-secondary');
          }
        },
        {
          extend: 'pdf',
          text: '<i class="bi bi-file-earmark-pdf me-1"></i> PDF',
          className: 'btn btn-danger',
          init: function (api, node, config) {
            $(node).removeClass('btn-secondary');
          }
        }
      ]
    });

  } catch (error) {
    CevAlert.error({
      title: 'Error al cargar usuarios',
      text: error.message || 'No se pudo conectar con el servidor.'
    });
  }
}
