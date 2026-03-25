import { create } from 'zustand';
import { api } from '../services/api';
import { useAuthStore } from './authStore';

interface AccountState {
    // change password
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    loading: boolean;
    error: string;
    success: string;
    setCurrentPassword: (v: string) => void;
    setNewPassword: (v: string) => void;
    setConfirmPassword: (v: string) => void;
    clearMessages: () => void;
    reset: () => void;
    submitChangePassword: () => Promise<void>;
    // update name
    nameLoading: boolean;
    nameError: string;
    nameSuccess: string;
}

const initialState = {
    currentPassword: '12345678',
    newPassword: '123456789',
    confirmPassword: '123456789',
    loading: false,
    error: '',
    success: '',
    nameLoading: false,
    nameError: '',
    nameSuccess: '',
};

export const useAccountStore = create<AccountState>((set, get) => ({
    ...initialState,

    setCurrentPassword: (v) => set({ currentPassword: v, error: '', success: '' }),
    setNewPassword: (v) => set({ newPassword: v, error: '', success: '' }),
    setConfirmPassword: (v) => set({ confirmPassword: v, error: '', success: '' }),
    clearMessages: () => set({ error: '', success: '' }),
    reset: () => set(initialState),

    submitChangePassword: async () => {
        const { currentPassword, newPassword, confirmPassword } = get();

        if (!currentPassword || !newPassword || !confirmPassword) {
            set({ error: 'All fields are required.' });
            return;
        }

        if (newPassword.length < 8) {
            set({ error: 'New password must be at least 8 characters.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            set({ error: 'New passwords do not match.' });
            return;
        }

        if (currentPassword === newPassword) {
            set({ error: 'New password must be different from the current password.' });
            return;
        }

        set({ loading: true, error: '', success: '' });

        try {
            await api.changePassword({ current_password: currentPassword, new_password: newPassword });
            set({ ...initialState, success: 'Password changed successfully.' });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to change password. Please try again.';
            set({ loading: false, error: message });
        }
    },


}));
