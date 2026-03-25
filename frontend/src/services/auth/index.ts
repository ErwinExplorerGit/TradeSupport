import { axiosInstance } from '../../axios';
import { authRoutes } from './routes';

// ─── Login ───────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  access_token: string;
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>(authRoutes.login, request);
  return data;
}

// ─── Register ────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
  email: string;
}

export async function register(request: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await axiosInstance.post<RegisterResponse>(authRoutes.register, request);
  return data;
}

// ─── Verify ──────────────────────────────────────────────────────────────────

export interface VerifyRequest {
  token: string;
}

export interface VerifyResponse {
  message: string;
}

export async function verify(request: VerifyRequest): Promise<VerifyResponse> {
  const { data } = await axiosInstance.post<VerifyResponse>(authRoutes.verifyEmail, request);
  return data;
}

// ─── Verify Resend ───────────────────────────────────────────────────────────

export interface VerifyResendRequest {
  email: string;
}

export interface VerifyResendResponse {
  message: string;
}

export async function verifyResend(request: VerifyResendRequest): Promise<VerifyResendResponse> {
  const { data } = await axiosInstance.post<VerifyResendResponse>(authRoutes.resendVerifyEmail, request);
  return data;
}

// ─── Forgot Password ─────────────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email?: string;
  token?: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export async function forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  const { data } = await axiosInstance.post<ForgotPasswordResponse>(authRoutes.forgotPassword, request);
  return data;
}

// ─── Verify Reset Password Token ─────────────────────────────────────────────

export interface VerifyResetPasswordTokenRequest {
  token: string;
}

export interface VerifyResetPasswordTokenResponse {
  message: string;
}

export async function verifyResetPasswordToken(request: VerifyResetPasswordTokenRequest): Promise<VerifyResetPasswordTokenResponse> {
  const { data } = await axiosInstance.post<VerifyResetPasswordTokenResponse>(authRoutes.verifyResetPasswordToken, request);
  return data;
}

// ─── Reset Password ──────────────────────────────────────────────────────────

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export async function resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const { data } = await axiosInstance.post<ResetPasswordResponse>(authRoutes.resetPassword, request);
  return data;
}

// ─── Change Password ──────────────────────────────────────────────────────────

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export async function changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const { data } = await axiosInstance.post<ChangePasswordResponse>(authRoutes.changePassword, request);
  return data;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  login,
  register,
  verify,
  verifyResend,
  forgotPassword,
  verifyResetPasswordToken,
  resetPassword,
  changePassword,
};

