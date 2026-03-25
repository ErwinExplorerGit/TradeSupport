import { create } from 'zustand';
import { api } from '../services/api';
import { useAuthStore } from './authStore';

interface LoginState {
    username: string;
    password: string;
    loading: boolean;
    error: string;
    unverified: boolean;
    unverifiedEmail: string;
    resendLoading: boolean;
    resendSuccess: boolean;
    setUsername: (username: string) => void;
    setPassword: (password: string) => void;
    clearError: () => void;
    reset: () => void;
    submit: (onSuccess: () => void) => Promise<void>;
    resendVerification: () => Promise<void>;
}

const initialState = {
    username: 'erwinalapide.ca@gmail.com',
    password: '12345678',
    loading: false,
    error: '',
    unverified: false,
    unverifiedEmail: '',
    resendLoading: false,
    resendSuccess: false,
};

export const useLoginStore = create<LoginState>((set, get) => ({
    ...initialState,

    setUsername: (username) => set({ username, error: '' }),
    setPassword: (password) => set({ password, error: '' }),
    clearError: () => set({ error: '' }),
    reset: () => set(initialState),

    submit: async (onSuccess) => {
        const { username, password } = get();

        if (!username.trim() || !password) {
            set({ error: 'Please enter your username and password.' });
            return;
        }

        set({ loading: true, error: '' });

        await new Promise((resolve) => setTimeout(resolve, 3000));

        try {
            const res = await api.login({ username: username.trim(), password });
            useAuthStore.getState().setAuth(
                { id: res.user_id, email: res.email, username: res.first_name + ' ' + res.last_name },
                res.access_token,
            );
            set(initialState);
            onSuccess();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
            if (message === 'Account email is not verified') {
                set({ loading: false, error: '', unverified: true, unverifiedEmail: username.trim() });
            } else {
                set({ loading: false, error: message });
            }
        }
    },

    resendVerification: async () => {
        const { unverifiedEmail } = get();
        set({ resendLoading: true, resendSuccess: false });
        try {
            await api.verifyResend({ email: unverifiedEmail });
            set({ resendLoading: false, resendSuccess: true });
        } catch {
            set({ resendLoading: false });
        }
    },
}));
