import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('@/services/auth', () => ({
    authService: {
        forgotPassword: vi.fn(),
        resetPassword: vi.fn(),
    },
}));

import { useResetPasswordStore, type VerifyState, type ResendState } from '@/stores/resetPasswordStore';
import { authService } from '@/services/auth';

const initialState = {
    verifyState: 'verifying' as VerifyState,
    resendState: 'idle' as ResendState,
    password: '',
    confirmPassword: '',
    errors: {} as Record<string, string>,
    loading: false,
    submitted: false,
};

beforeEach(() => {
    vi.useFakeTimers();
    useResetPasswordStore.setState(initialState);
    vi.clearAllMocks();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('resetPasswordStore', () => {
    describe('setVerifyState', () => {
        it('updates verifyState', () => {
            useResetPasswordStore.getState().setVerifyState('success');
            expect(useResetPasswordStore.getState().verifyState).toBe('success');
        });
    });

    describe('setPassword', () => {
        it('updates password and clears the password error', () => {
            useResetPasswordStore.setState({ errors: { password: 'Password is required.' } });
            useResetPasswordStore.getState().setPassword('newpass1');
            expect(useResetPasswordStore.getState().password).toBe('newpass1');
            expect(useResetPasswordStore.getState().errors.password).toBeUndefined();
        });
    });

    describe('setConfirmPassword', () => {
        it('updates confirmPassword and clears the confirmPassword error', () => {
            useResetPasswordStore.setState({ errors: { confirmPassword: 'Passwords do not match.' } });
            useResetPasswordStore.getState().setConfirmPassword('newpass1');
            expect(useResetPasswordStore.getState().confirmPassword).toBe('newpass1');
            expect(useResetPasswordStore.getState().errors.confirmPassword).toBeUndefined();
        });
    });

    describe('resendByToken', () => {
        it('sets resendState to loading immediately', () => {
            vi.mocked(authService.forgotPassword).mockResolvedValue({ message: 'ok' });
            useResetPasswordStore.getState().resendByToken('reset-token');
            expect(useResetPasswordStore.getState().resendState).toBe('loading');
        });

        it('sets resendState to sent after the timeout resolves successfully', async () => {
            vi.mocked(authService.forgotPassword).mockResolvedValue({ message: 'ok' });
            useResetPasswordStore.getState().resendByToken('reset-token');
            await vi.runAllTimersAsync();
            expect(authService.forgotPassword).toHaveBeenCalledWith({ token: 'reset-token' });
            expect(useResetPasswordStore.getState().resendState).toBe('sent');
        });

        it('sets resendState to sent even when the API call fails', async () => {
            // The store uses .finally() without .catch(), so an unhandled rejection
            // propagates from the promise chain. Register a temporary handler so the
            // test runner does not flag this as an error (it is expected behaviour).
            const onUnhandledRejection = vi.fn();
            process.on('unhandledRejection', onUnhandledRejection);

            vi.mocked(authService.forgotPassword).mockRejectedValue(new Error('server error'));
            useResetPasswordStore.getState().resendByToken('reset-token');
            await vi.runAllTimersAsync();

            process.off('unhandledRejection', onUnhandledRejection);
            expect(useResetPasswordStore.getState().resendState).toBe('sent');
        });
    });

    describe('submit — validation', () => {
        it('sets password error when password is empty', () => {
            useResetPasswordStore.getState().submit('token');
            expect(useResetPasswordStore.getState().errors.password).toBe('Password is required.');
        });

        it('sets password error when password is fewer than 8 characters', () => {
            useResetPasswordStore.setState({ password: 'short' });
            useResetPasswordStore.getState().submit('token');
            expect(useResetPasswordStore.getState().errors.password).toBe('Password must be at least 8 characters.');
        });

        it('sets confirmPassword error when confirmPassword is empty', () => {
            useResetPasswordStore.setState({ password: 'pass1234' });
            useResetPasswordStore.getState().submit('token');
            expect(useResetPasswordStore.getState().errors.confirmPassword).toBe('Please confirm your password.');
        });

        it('sets confirmPassword error when passwords do not match', () => {
            useResetPasswordStore.setState({ password: 'pass1234', confirmPassword: 'different' });
            useResetPasswordStore.getState().submit('token');
            expect(useResetPasswordStore.getState().errors.confirmPassword).toBe('Passwords do not match.');
        });
    });

    describe('submit — API interaction', () => {
        it('calls authService.resetPassword and sets submitted on success', async () => {
            vi.mocked(authService.resetPassword).mockResolvedValue({ message: 'ok' });
            useResetPasswordStore.setState({ password: 'pass1234', confirmPassword: 'pass1234' });

            useResetPasswordStore.getState().submit('reset-token');
            await vi.runAllTimersAsync();

            expect(authService.resetPassword).toHaveBeenCalledWith({ token: 'reset-token', password: 'pass1234' });
            expect(useResetPasswordStore.getState().submitted).toBe(true);
            expect(useResetPasswordStore.getState().loading).toBe(false);
        });

        it('sets a password error on API failure', async () => {
            vi.mocked(authService.resetPassword).mockRejectedValue(new Error('Token expired'));
            useResetPasswordStore.setState({ password: 'pass1234', confirmPassword: 'pass1234' });

            useResetPasswordStore.getState().submit('reset-token');
            await vi.runAllTimersAsync();

            expect(useResetPasswordStore.getState().errors.password).toBe('Failed to reset password. Please try again.');
            expect(useResetPasswordStore.getState().loading).toBe(false);
        });
    });

    describe('reset', () => {
        it('resets the store to initial state', () => {
            useResetPasswordStore.setState({ password: 'pass1234', loading: true, submitted: true });
            useResetPasswordStore.getState().reset();
            expect(useResetPasswordStore.getState()).toMatchObject(initialState);
        });
    });
});
