const defaultConfig = {
  search: true,
  sort: true,
  pagination: { limit: 10 },
  resizable: false,
  language: {
    search: { placeholder: 'Buscar...' },
    sort: { sortAsc: 'Ascendente', sortDesc: 'Descendente' },
    pagination: {
      previous: 'Anterior',
      next: 'Siguiente',
      showing: 'Mostrando',
      to: 'a',
      of: 'de',
      results: 'registros',
    },
    loading: 'Cargando...',
    noRecordsFound: 'No se encontraron registros',
    error: 'Ocurrió un error',
  },
  className: {
    container: 'gridjs-container-custom',
    table: 'gridjs-table-custom',
  },
};

export function crearGrid(container, columnas, datos, opciones = {}) {
  const grid = new gridjs.Grid({
    ...defaultConfig,
    columns: columnas,
    data: datos,
    ...opciones,
  });

  grid.render(container);
  return grid;
}
