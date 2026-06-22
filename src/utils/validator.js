export const validateLogin = (data) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!data.email || !data.password) {
    return { isValid: false, message: 'Todos los campos son obligatorios' };
  }

  if (!emailRegex.test(data.email)) {
    return { isValid: false, message: 'Formato de correo inválido' };
  }

  if (data.password.length < 8) {
    return { isValid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }

  return { isValid: true };
};