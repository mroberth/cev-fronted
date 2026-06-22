import { crearUsuario } from '../api/usuarios.js';
import { CevAlert } from '../utils/cev-alerts.js';

export function initCrearUsuario() {
  const form = document.getElementById('form-crear-usuario');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validarFormulario(form)) return;

    const data = {
      nombre: form.nombre.value.trim(),
      apellido: form.apellido.value.trim(),
      correo: form.correo.value.trim(),
      password: form.password.value,
      rol: form.rol.value,
      estado: form.estado.value,
    };

    const btn = document.getElementById('btn-guardar');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Guardando...`;

    try {
      await crearUsuario(data);
      CevAlert.success({
        title: 'Usuario creado',
        text: 'El usuario se ha registrado correctamente.',
        timer: 1500,
        showConfirmButton: false,
      });
      setTimeout(() => window.navigate('/a/usuarios'), 1500);
    } catch (error) {
      btn.disabled = false;
      btn.innerHTML = originalText;
      CevAlert.error({
        title: 'Error',
        text: error.message || 'No se pudo crear el usuario.',
      });
    }
  });
}

function validarFormulario(form) {
  let valido = true;

  const limpiarError = (id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  };

  const marcarError = (input, id, msg) => {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
    input.classList.add('is-invalid');
    valido = false;
  };

  [form.nombre, form.apellido, form.correo, form.password, form.rol].forEach(i => i.classList.remove('is-invalid'));
  ['nombreError', 'apellidoError', 'correoError', 'passwordError', 'rolError'].forEach(limpiarError);

  if (!form.nombre.value.trim()) {
    marcarError(form.nombre, 'nombreError', 'El nombre es obligatorio.');
  }
  if (!form.apellido.value.trim()) {
    marcarError(form.apellido, 'apellidoError', 'El apellido es obligatorio.');
  }
  if (!form.correo.value.trim() || !form.correo.validity.valid) {
    marcarError(form.correo, 'correoError', 'Ingresa un correo válido.');
  }
  if (!form.password.value || form.password.value.length < 6) {
    marcarError(form.password, 'passwordError', 'La contraseña debe tener al menos 6 caracteres.');
  }
  if (!form.rol.value) {
    marcarError(form.rol, 'rolError', 'Selecciona un rol.');
  }

  return valido;
}
