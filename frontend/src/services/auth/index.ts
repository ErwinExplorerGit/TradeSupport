import { login } from './login';
import { register } from './register';
import { verify } from './verify';
import { verifyResend } from './verify_resend';
import { forgotPassword } from './forgot_password';
import { verifyResetPasswordToken } from './verify_reset_password_token';
import { resetPassword } from './reset_password';

export const authService = {
  login,
  register,
  verify,
  verifyResend,
  forgotPassword,
  verifyResetPasswordToken,
  resetPassword,
};

