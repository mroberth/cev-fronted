export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(hotmail|yahoo|gmail|outlook)\.(com|es|net|org)$/i;
  if (!email) return 'El correo electrónico es obligatorio';
  if (!emailRegex.test(email)) return 'Formato de correo inválido';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < 5) return 'La contraseña debe tener al menos 5 caracteres';
  return '';
};

export const validateLogin = (data) => {
  const emailError = validateEmail(data.email);
  const passwordError = validatePassword(data.password);

  const errors = {};
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    message: emailError || passwordError || ''
  };
};