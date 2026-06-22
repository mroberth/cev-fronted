import { apiLogin } from '../api/auth.js';
import { validateLogin } from '../utils/validator.js';
import { CevAlert } from '../utils/cev-alerts.js';

export const initLogin = () => {
  const form = document.getElementById('form-login');
  const btn = document.getElementById('btn-login');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    //1. Obtener datos:
    const formData = {
      email: form.email.value.trim(),
      password: form.password.value.trim()
    };

    //2. Validacion local antes de tocar la API
    const validation = validateLogin(formData);
    if (!validation.isValid) {
      CevAlert.toast({ type: 'warning', title: validation.message });
      return;
    }

    //3. Estado de carga (UX)
    const originalBtnText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Validando...`

    try {
      //Llamar a la API
      const response = await apiLogin(formData);

      // 4. Guardar el token
      localStorage.setItem('token', response.token);

      //5. Saludo de Bienvenida
      CevAlert.success({
        title: '¡Bienvenido!',
        text: 'Redirigiendo al CEV...',
        timer: 1500,
        showConfirmButton: false
      });

      setTimeout(() => {
        window.navigate('/inicio');
      }, 1500)
    } catch (error) {
      // 6. Error de autenticación
      btn.disabled = false;
      btn.innerHTML = originalBtnText;

      CevAlert.error({
        title: 'Error de acceso',
        text: error.message || 'Credenciales incorrectas'
      });
    }
  })
};