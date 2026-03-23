import { create } from 'zustand';
import { api } from '../services/api';
import { useAuthStore } from './authStore';

interface LoginState {
    username: string;
    password: string;
    loading: boolean;
    error: string;
    setUsername: (username: string) => void;
    setPassword: (password: string) => void;
    clearError: () => void;
    reset: () => void;
    submit: (onSuccess: () => void) => Promise<void>;
}

const initialState = {
    username: '',
    password: '',
    loading: false,
    error: '',
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

        try {
            const res = await api.login({ username: username.trim(), password });
            useAuthStore.getState().setAuth(
                { id: res.username, email: '', username: res.username },
                '',
            );
            set(initialState);
            onSuccess();
        } catch (err) {
            set({
                loading: false,
                error: err instanceof Error ? err.message : 'Login failed. Please try again.',
            });
        }
    },
}));
