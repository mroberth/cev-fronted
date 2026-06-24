import { apiLogin } from '../../api/auth.js';
import { validateEmail, validatePassword } from '../../utils/validator.js';
import { CevAlert } from '../../utils/cev-alerts.js';

const mensajesRedireccion = {
  no_auth: { title: 'Acceso denegado', text: 'Debes iniciar sesión primero para acceder a esta sección.' },
  expired: { title: 'Sesión expirada', text: 'Tu sesión ha expirado. Inicia sesión nuevamente.' },
};

export function mostrarMotivoRedireccion(reason) {
  const msg = mensajesRedireccion[reason];
  if (msg) {
    CevAlert.warning({ title: msg.title, text: msg.text });
  }
}

export const initLogin = () => {
  const form = document.getElementById('form-login');
  const btn = document.getElementById('btn-login');

  if (!form) return;

  const emailInput = form.email;
  const passwordInput = form.password;

  // Helper para validar un campo individualmente y actualizar la UI
  const validateField = (input, validationFn, errorId) => {
    const errorMessage = validationFn(input.value.trim());
    const errorEl = document.getElementById(errorId);

    if (errorMessage) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      if (errorEl) errorEl.textContent = errorMessage;
    } else {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      if (errorEl) errorEl.textContent = '';
    }

    return !errorMessage;
  };

  // Validaciones en tiempo real al escribir
  emailInput.addEventListener('input', () => {
    validateField(emailInput, validateEmail, 'emailError');
  });

  passwordInput.addEventListener('input', () => {
    validateField(passwordInput, validatePassword, 'passwordError');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Validar todos los campos antes de enviar
    const isEmailValid = validateField(emailInput, validateEmail, 'emailError');
    const isPasswordValid = validateField(passwordInput, validatePassword, 'passwordError');

    if (!isEmailValid || !isPasswordValid) {
      const firstErrorMessage = validateEmail(emailInput.value.trim()) || validatePassword(passwordInput.value.trim());
      CevAlert.warning({ title: 'Error de validación', text: firstErrorMessage });
      return;
    }

    const formData = {
      correo: emailInput.value.trim(),
      password: passwordInput.value.trim()
    };

    // 2. Estado de carga (UX)
    const originalBtnText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Validando...`

    try {
      // Llamar a la API
      const response = await apiLogin(formData);

      // 3. Guardar sesión
      const user = response.data.user;
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user_email', user.correo);
      localStorage.setItem('user_rol', user.nombre_rol || user.rol);
      localStorage.setItem('user_nombre', user.nombre || '');
      localStorage.setItem('user_apellido', user.apellido || '');

      // 4. Redirigir según el rol
      const rol = user.nombre_rol;
      const destino = rol === 'Admin' ? '/a/dashboard' : '/u/dashboard';

      CevAlert.success({
        title: '¡Bienvenido!',
        text: 'Redirigiendo...',
        timer: 1500,
        showConfirmButton: false
      });

      setTimeout(() => {
        window.navigate(destino);
      }, 1500)
    } catch (error) {
      // 5. Error de autenticación
      btn.disabled = false;
      btn.innerHTML = originalBtnText;

      CevAlert.error({
        title: 'Error de acceso',
        text: error.message || 'Credenciales incorrectas'
      });
    }
  })
};