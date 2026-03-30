import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({
    api: {
        changePassword: vi.fn(),
    },
}));

import { useAccountStore } from '@/stores/accountStore';
import { api } from '@/services/api';

const initialState = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
    error: '',
    success: '',
    nameLoading: false,
    nameError: '',
    nameSuccess: '',
};

beforeEach(() => {
    useAccountStore.setState(initialState);
    vi.clearAllMocks();
});

describe('accountStore', () => {
    describe('setCurrentPassword', () => {
        it('updates currentPassword and clears error and success messages', () => {
            useAccountStore.setState({ error: 'err', success: 'ok' });
            useAccountStore.getState().setCurrentPassword('current123');
            const { currentPassword, error, success } = useAccountStore.getState();
            expect(currentPassword).toBe('current123');
            expect(error).toBe('');
            expect(success).toBe('');
        });
    });

    describe('setNewPassword', () => {
        it('updates newPassword and clears messages', () => {
            useAccountStore.setState({ error: 'err', success: 'ok' });
            useAccountStore.getState().setNewPassword('newpass99');
            expect(useAccountStore.getState().newPassword).toBe('newpass99');
            expect(useAccountStore.getState().error).toBe('');
            expect(useAccountStore.getState().success).toBe('');
        });
    });

    describe('setConfirmPassword', () => {
        it('updates confirmPassword and clears messages', () => {
            useAccountStore.setState({ error: 'err' });
            useAccountStore.getState().setConfirmPassword('confirmpass');
            expect(useAccountStore.getState().confirmPassword).toBe('confirmpass');
            expect(useAccountStore.getState().error).toBe('');
        });
    });

    describe('clearMessages', () => {
        it('clears both error and success messages', () => {
            useAccountStore.setState({ error: 'Something went wrong', success: 'Done' });
            useAccountStore.getState().clearMessages();
            expect(useAccountStore.getState().error).toBe('');
            expect(useAccountStore.getState().success).toBe('');
        });
    });

    describe('reset', () => {
        it('resets the store to initial state', () => {
            useAccountStore.setState({ currentPassword: 'pass', loading: true, error: 'err' });
            useAccountStore.getState().reset();
            expect(useAccountStore.getState()).toMatchObject(initialState);
        });
    });

    describe('submitChangePassword', () => {
        it('sets error when all fields are empty', async () => {
            await useAccountStore.getState().submitChangePassword();
            expect(useAccountStore.getState().error).toBe('All fields are required.');
            expect(api.changePassword).not.toHaveBeenCalled();
        });

        it('sets error when any field is missing', async () => {
            useAccountStore.setState({ currentPassword: 'old1234', newPassword: '' });
            await useAccountStore.getState().submitChangePassword();
            expect(useAccountStore.getState().error).toBe('All fields are required.');
        });

        it('sets error when new password is fewer than 8 characters', async () => {
            useAccountStore.setState({ currentPassword: 'old1234', newPassword: 'short', confirmPassword: 'short' });
            await useAccountStore.getState().submitChangePassword();
            expect(useAccountStore.getState().error).toBe('New password must be at least 8 characters.');
        });

        it('sets error when new passwords do not match', async () => {
            useAccountStore.setState({ currentPassword: 'old1234', newPassword: 'newpass1', confirmPassword: 'newpass2' });
            await useAccountStore.getState().submitChangePassword();
            expect(useAccountStore.getState().error).toBe('New passwords do not match.');
        });

        it('sets error when new password equals the current password', async () => {
            useAccountStore.setState({ currentPassword: 'pass1234', newPassword: 'pass1234', confirmPassword: 'pass1234' });
            await useAccountStore.getState().submitChangePassword();
            expect(useAccountStore.getState().error).toBe('New password must be different from the current password.');
        });

        it('calls api.changePassword and sets success message on valid input', async () => {
            vi.mocked(api.changePassword).mockResolvedValue({ message: 'changed' });
            useAccountStore.setState({ currentPassword: 'old1234', newPassword: 'new1234!', confirmPassword: 'new1234!' });

            await useAccountStore.getState().submitChangePassword();

            expect(api.changePassword).toHaveBeenCalledWith({ current_password: 'old1234', new_password: 'new1234!' });
            expect(useAccountStore.getState().success).toBe('Password changed successfully.');
            expect(useAccountStore.getState().loading).toBe(false);
        });

        it('sets an error message on API failure', async () => {
            vi.mocked(api.changePassword).mockRejectedValue(new Error('Wrong current password'));
            useAccountStore.setState({ currentPassword: 'old1234', newPassword: 'new1234!', confirmPassword: 'new1234!' });

            await useAccountStore.getState().submitChangePassword();

            expect(useAccountStore.getState().error).toBe('Wrong current password');
            expect(useAccountStore.getState().loading).toBe(false);
        });
    });
});
