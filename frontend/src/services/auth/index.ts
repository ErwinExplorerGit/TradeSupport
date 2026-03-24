import { register } from './register';
import { verify } from './verify';
import { verifyResend } from './verify_resend';
import { forgotPassword } from './forgot_password';

export const authService = {
  register,
  verify,
  verifyResend,
  forgotPassword,
};
