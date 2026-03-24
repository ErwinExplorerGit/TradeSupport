import { create } from 'zustand';
import { authService } from '../services/auth';

export type VerifyState = 'verifying' | 'success' | 'failed';
export type ResendState = 'idle' | 'loading' | 'sent';

interface FormErrors {
    password?: string;
    confirmPassword?: string;
}

interface ResetPasswordState {
    verifyState: VerifyState;
    resendState: ResendState;
    password: string;
    confirmPassword: string;
    errors: FormErrors;
    loading: boolean;
    submitted: boolean;
    setVerifyState: (verifyState: VerifyState) => void;
    setPassword: (password: string) => void;
    setConfirmPassword: (confirmPassword: string) => void;
    resendByToken: (token: string) => void;
    submit: (token: string) => void;
    reset: () => void;
}

const initialState = {
    verifyState: 'verifying' as VerifyState,
    resendState: 'idle' as ResendState,
    password: '',
    confirmPassword: '',
    errors: {} as FormErrors,
    loading: false,
    submitted: false,
};

export const useResetPasswordStore = create<ResetPasswordState>((set, get) => ({
    ...initialState,

    setVerifyState: (verifyState) => set({ verifyState }),

    setPassword: (password) => set({ password, errors: { ...get().errors, password: undefined } }),

    setConfirmPassword: (confirmPassword) =>
        set({ confirmPassword, errors: { ...get().errors, confirmPassword: undefined } }),

    resendByToken: (token: string) => {
        set({ resendState: 'loading' });
        setTimeout(() => {
            authService.forgotPassword({ token })
                .finally(() => {
                    set({ resendState: 'sent' });
                });
        }, 3000);
    },

    submit: (token: string) => {
        const { password, confirmPassword } = get();
        const errors: FormErrors = {};

        if (!password) {
            errors.password = 'Password is required.';
        } else if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters.';
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Please confirm your password.';
        } else if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match.';
        }

        if (Object.keys(errors).length > 0) {
            set({ errors });
            return;
        }

        set({ loading: true, errors: {} });

        setTimeout(() => {
            authService.resetPassword({ token, password })
                .then(() => {
                    set({ loading: false, submitted: true });
                })
                .catch(() => {
                    set({
                        loading: false,
                        errors: { password: 'Failed to reset password. Please try again.' },
                    });
                });
        }, 3000);
    },

    reset: () => set(initialState),
}));
