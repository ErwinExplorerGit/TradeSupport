import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('@/services/auth', () => ({
    authService: {
        forgotPassword: vi.fn(),
    },
}));

import { useForgotPasswordStore } from '@/stores/forgotPasswordStore';
import { authService } from '@/services/auth';

// The store's initialState has a pre-filled email.
const initialState = {
    email: 'erwinalapide.ca@gmail.com',
    emailError: '',
    loading: false,
    submitted: false,
};

beforeEach(() => {
    vi.useFakeTimers();
    useForgotPasswordStore.setState(initialState);
    vi.clearAllMocks();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('forgotPasswordStore', () => {
    describe('setEmail', () => {
        it('updates email and clears emailError', () => {
            useForgotPasswordStore.setState({ emailError: 'invalid email' });
            useForgotPasswordStore.getState().setEmail('new@example.com');
            expect(useForgotPasswordStore.getState().email).toBe('new@example.com');
            expect(useForgotPasswordStore.getState().emailError).toBe('');
        });
    });

    describe('clearEmailError', () => {
        it('clears the email error', () => {
            useForgotPasswordStore.setState({ emailError: 'Please enter a valid email address.' });
            useForgotPasswordStore.getState().clearEmailError();
            expect(useForgotPasswordStore.getState().emailError).toBe('');
        });
    });

    describe('reset', () => {
        it('resets the store to initial state', () => {
            useForgotPasswordStore.setState({ email: 'changed@email.com', loading: true, submitted: true });
            useForgotPasswordStore.getState().reset();
            expect(useForgotPasswordStore.getState()).toMatchObject(initialState);
        });
    });

    describe('submit', () => {
        it('sets emailError when email is empty', () => {
            useForgotPasswordStore.setState({ email: '' });
            useForgotPasswordStore.getState().submit();
            expect(useForgotPasswordStore.getState().emailError).toBe('Email is required.');
            expect(authService.forgotPassword).not.toHaveBeenCalled();
        });

        it('sets emailError when email format is invalid', () => {
            useForgotPasswordStore.setState({ email: 'not-valid' });
            useForgotPasswordStore.getState().submit();
            expect(useForgotPasswordStore.getState().emailError).toBe('Please enter a valid email address.');
            expect(authService.forgotPassword).not.toHaveBeenCalled();
        });

        it('sets loading to true when called with a valid email', () => {
            vi.mocked(authService.forgotPassword).mockResolvedValue({ message: 'ok' });
            useForgotPasswordStore.setState({ email: 'user@example.com' });
            useForgotPasswordStore.getState().submit();
            expect(useForgotPasswordStore.getState().loading).toBe(true);
        });

        it('calls authService.forgotPassword and sets submitted on success', async () => {
            vi.mocked(authService.forgotPassword).mockResolvedValue({ message: 'ok' });
            useForgotPasswordStore.setState({ email: 'user@example.com' });

            useForgotPasswordStore.getState().submit();
            await vi.runAllTimersAsync();

            expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'user@example.com' });
            expect(useForgotPasswordStore.getState().submitted).toBe(true);
            expect(useForgotPasswordStore.getState().loading).toBe(false);
        });

        it('sets submitted to true on API failure (silent failure by design)', async () => {
            vi.mocked(authService.forgotPassword).mockRejectedValue(new Error('server error'));
            useForgotPasswordStore.setState({ email: 'user@example.com' });

            useForgotPasswordStore.getState().submit();
            await vi.runAllTimersAsync();

            expect(useForgotPasswordStore.getState().submitted).toBe(true);
            expect(useForgotPasswordStore.getState().loading).toBe(false);
        });
    });
});
