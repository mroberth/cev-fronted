export class AdminSidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <aside id="admin-sidebar" class="admin-sidebar">
        <div class="admin-sidebar-header">Navegación</div>
        <div class="nav flex-column">
          <a href="/a/dashboard" class="nav-link">
            <i class="bi bi-speedometer2"></i> Dashboard
          </a>
        </div>
        <div class="admin-sidebar-header">Académico</div>
        <div class="nav flex-column">
          <a href="/a/periodos" class="nav-link"><i class="bi bi-calendar-range"></i> Períodos</a>
          <a href="/a/trayectos" class="nav-link"><i class="bi bi-layers"></i> Trayectos</a>
          <a href="/a/unidades-curriculares" class="nav-link"><i class="bi bi-book"></i> Unidades Curriculares</a>
          <a href="/a/secciones" class="nav-link"><i class="bi bi-people"></i> Secciones</a>
        </div>
        <div class="admin-sidebar-header">Personal</div>
        <div class="nav flex-column">
          <a href="/a/estudiantes" class="nav-link"><i class="bi bi-mortarboard"></i> Estudiantes</a>
          <a href="/a/docentes" class="nav-link"><i class="bi bi-person-badge"></i> Docentes</a>
          <a href="/a/usuarios" class="nav-link"><i class="bi bi-person-gear"></i> Usuarios</a>
        </div>
        <div class="admin-sidebar-header">Operaciones</div>
        <div class="nav flex-column">
          <a href="/a/inscripciones" class="nav-link"><i class="bi bi-pencil-square"></i> Inscripciones</a>
          <a href="/a/asignaciones" class="nav-link"><i class="bi bi-diagram-3"></i> Asignaciones Docentes</a>
          <a href="/a/evaluaciones" class="nav-link"><i class="bi bi-clipboard-check"></i> Evaluaciones</a>
          <a href="/a/calificaciones" class="nav-link"><i class="bi bi-bar-chart"></i> Calificaciones</a>
        </div>
        <div class="admin-sidebar-header">Sistema</div>
        <div class="nav flex-column mb-3">
          <a href="/a/permisos" class="nav-link"><i class="bi bi-shield-lock"></i> Módulos y Permisos</a>
          <a href="/a/bitacora" class="nav-link"><i class="bi bi-journal-text"></i> Bitácora</a>
        </div>
      </aside>
    `;
  }
}
customElements.define("admin-sidebar", AdminSidebar);
