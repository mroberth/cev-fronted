export class AdminNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="navbar navbar-expand navbar-light bg-white border-bottom sticky-top py-2 shadow-sm admin-navbar">
        <div class="container-fluid px-3">
          <button id="btn-sidebar-toggle" class="btn-sidebar-toggle me-2" type="button">
            <i class="bi bi-list"></i>
          </button>
          <a class="navbar-brand text-primary fw-bold py-0" href="/a/dashboard">
            <i class="bi bi-laptop me-2"></i>CEV | Admin
          </a>
          <div class="d-flex align-items-center gap-3 ms-auto">
            <span class="text-muted small d-none d-md-inline">
              <i class="bi bi-person-circle me-1"></i>
              <span id="user-nombre"></span> <span id="user-apellido"></span>
            </span>
            <span class="badge bg-danger" id="user-rol">-</span>
            <button id="btn-logout" class="btn btn-outline-danger btn-sm">
              <i class="bi bi-box-arrow-left"></i> Salir
            </button>
          </div>
        </div>
      </nav>
    `;
  }
}
customElements.define("admin-navbar", AdminNavbar);
