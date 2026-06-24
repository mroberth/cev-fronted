import { crearUsuario } from '../../api/usuarios.js';
import { apiClient } from '../../api/client.js';
import { CevAlert } from '../../utils/cev-alerts.js';

export function initCrearUsuario() {
  const form = document.getElementById('form-crear-usuario');
  if (!form) return;

  const elements = {
    nombre: form.nombre,
    apellido: form.apellido,
    correo: form.correo,
    password: form.password,
    rol: form.rol,
    estado: form.estado,
  };

  const showError = (field, msg) => {
    const errorElement = document.getElementById(`${field.id}Error`);
    if (errorElement) errorElement.textContent = msg;
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
  };

  const clearError = (field) => {
    const errorElement = document.getElementById(`${field.id}Error`);
    if (errorElement) errorElement.textContent = '';
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
  };

  function validarNombre() {
    const nombre = elements.nombre.value;
    const regex = /^[A-Za-zÀ-ÿ\u00f1\u00d1\s]{2,25}$/;
    if (nombre.trim() === '') {
      showError(elements.nombre, 'El nombre es obligatorio.');
      return false;
    }
    if (!regex.test(nombre)) {
      showError(elements.nombre, 'El nombre solo debe contener letras, acentos y espacios (2 a 25 caracteres).');
      return false;
    }
    elements.nombre.value = nombre.replace(/<[^>]*>?/gm, '');
    clearError(elements.nombre);
    return true;
  }

  function validarApellido() {
    const apellido = elements.apellido.value;
    const regex = /^[A-Za-zÀ-ÿ\u00f1\u00d1\s]{2,25}$/;
    if (apellido.trim() === '') {
      showError(elements.apellido, 'El apellido es obligatorio.');
      return false;
    }
    if (!regex.test(apellido)) {
      showError(elements.apellido, 'El apellido solo debe contener letras, acentos y espacios (2 a 25 caracteres).');
      return false;
    }
    elements.apellido.value = apellido.replace(/<[^>]*>?/gm, '');
    clearError(elements.apellido);
    return true;
  }

  async function validarCorreo() {
    const correo = elements.correo.value.trim();
    const correoRegex = /^[a-zA-Z0-9._%+-]+@(hotmail|yahoo|gmail|outlook)\.(com|es|net|org)$/i;
    if (correo === '') {
      showError(elements.correo, 'El correo electrónico es obligatorio.');
      return false;
    }
    if (!correoRegex.test(correo)) {
      showError(elements.correo, 'Ingresa un correo electrónico válido.');
      return false;
    }
    try {
      const response = await apiClient.get('usuarios/check?correo=' + encodeURIComponent(correo));
      if (response.data?.existe) {
        showError(elements.correo, 'El correo electrónico ya está registrado');
        return false;
      }
      clearError(elements.correo);
      return true;
    } catch (error) {
      console.error('Error validando correo:', error);
      return false;
    }
  }

  function validarPassword() {
    const password = elements.password.value;
    if (!password) {
      showError(elements.password, 'La contraseña es obligatoria.');
      return false;
    }
    if (password.length < 6) {
      showError(elements.password, 'La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    clearError(elements.password);
    return true;
  }

  function validarRol() {
    if (!elements.rol.value) {
      showError(elements.rol, 'Selecciona un rol.');
      return false;
    }
    clearError(elements.rol);
    return true;
  }

  elements.nombre.addEventListener('input', validarNombre);
  elements.apellido.addEventListener('input', validarApellido);
  elements.correo.addEventListener('input', validarCorreo);
  elements.password.addEventListener('input', validarPassword);
  elements.rol.addEventListener('change', validarRol);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const validaciones = await Promise.all([
      validarNombre(),
      validarApellido(),
      validarCorreo(),
      validarPassword(),
      validarRol(),
    ]);

    if (validaciones.every(v => v === true)) {
      const data = {
        nombre: elements.nombre.value.trim(),
        apellido: elements.apellido.value.trim(),
        correo: elements.correo.value.trim(),
        password: elements.password.value,
        rol: elements.rol.value,
        estado: elements.estado.value,
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
    } else {
      CevAlert.error({
        title: 'Formulario incompleto',
        text: 'Corrige los campos resaltados antes de continuar.',
      });
    }
  });
}
