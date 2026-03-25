export const authRoutes = {
    login: '/api/auth/login',
    register: '/api/auth/register',
    verifyEmail: '/api/auth/verify-email',
    resendVerifyEmail: '/api/auth/resend-verify-email',
    forgotPassword: '/api/auth/forgot-password',
    verifyResetPasswordToken: '/api/auth/verify-reset-password-token',
    resetPassword: '/api/auth/reset-password',
    changePassword: '/api/auth/change-password',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
} as const;
