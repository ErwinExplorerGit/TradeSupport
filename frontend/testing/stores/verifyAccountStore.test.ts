import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/services/auth', () => ({
    authService: {
        verifyResend: vi.fn(),
    },
}));

import { useVerifyAccountStore, type VerifyState } from '@/stores/verifyAccountStore';
import { authService } from '@/services/auth';

const initialState = {
    verifyState: 'verifying' as VerifyState,
    email: '',
    emailError: '',
    resendLoading: false,
    resendSent: false,
};

beforeEach(() => {
    useVerifyAccountStore.setState(initialState);
    vi.clearAllMocks();
});

describe('verifyAccountStore', () => {
    describe('setVerifyState', () => {
        it('updates verifyState', () => {
            useVerifyAccountStore.getState().setVerifyState('success');
            expect(useVerifyAccountStore.getState().verifyState).toBe('success');
        });
    });

    describe('setEmail', () => {
        it('updates email and clears emailError', () => {
            useVerifyAccountStore.setState({ emailError: 'invalid email' });
            useVerifyAccountStore.getState().setEmail('user@example.com');
            expect(useVerifyAccountStore.getState().email).toBe('user@example.com');
            expect(useVerifyAccountStore.getState().emailError).toBe('');
        });
    });

    describe('setEmailFromUrl', () => {
        it('sets email and changes verifyState to "resend"', () => {
            useVerifyAccountStore.getState().setEmailFromUrl('user@example.com');
            expect(useVerifyAccountStore.getState().email).toBe('user@example.com');
            expect(useVerifyAccountStore.getState().verifyState).toBe('resend');
        });
    });

    describe('clearEmailError', () => {
        it('clears the email error', () => {
            useVerifyAccountStore.setState({ emailError: 'some error' });
            useVerifyAccountStore.getState().clearEmailError();
            expect(useVerifyAccountStore.getState().emailError).toBe('');
        });
    });

    describe('reset', () => {
        it('resets the store to initial state', () => {
            useVerifyAccountStore.setState({ email: 'user@example.com', verifyState: 'success', resendSent: true });
            useVerifyAccountStore.getState().reset();
            expect(useVerifyAccountStore.getState()).toMatchObject(initialState);
        });
    });

    describe('resend', () => {
        it('sets emailError when email is empty', () => {
            useVerifyAccountStore.setState({ email: '' });
            useVerifyAccountStore.getState().resend('login');
            expect(useVerifyAccountStore.getState().emailError).toBe('Email is required.');
            expect(authService.verifyResend).not.toHaveBeenCalled();
        });

        it('sets emailError when email format is invalid', () => {
            useVerifyAccountStore.setState({ email: 'not-valid' });
            useVerifyAccountStore.getState().resend('login');
            expect(useVerifyAccountStore.getState().emailError).toBe('Enter a valid email address.');
            expect(authService.verifyResend).not.toHaveBeenCalled();
        });

        it('calls authService.verifyResend and sets resendSent on success', async () => {
            vi.mocked(authService.verifyResend).mockResolvedValue({ message: 'sent' });
            useVerifyAccountStore.setState({ email: 'user@example.com' });

            useVerifyAccountStore.getState().resend('login');
            await vi.waitFor(() => {
                expect(useVerifyAccountStore.getState().resendSent).toBe(true);
            });

            expect(authService.verifyResend).toHaveBeenCalledWith({ email: 'user@example.com' });
            expect(useVerifyAccountStore.getState().resendLoading).toBe(false);
        });

        it('sets resendSent to true from "login" flow even on API failure', async () => {
            vi.mocked(authService.verifyResend).mockRejectedValue(new Error('server error'));
            useVerifyAccountStore.setState({ email: 'user@example.com' });

            useVerifyAccountStore.getState().resend('login');
            await vi.waitFor(() => {
                expect(useVerifyAccountStore.getState().resendSent).toBe(true);
            });
            expect(useVerifyAccountStore.getState().resendLoading).toBe(false);
        });

        it('sets emailError from "expired" flow on API failure', async () => {
            vi.mocked(authService.verifyResend).mockRejectedValue(new Error('server error'));
            useVerifyAccountStore.setState({ email: 'user@example.com' });

            useVerifyAccountStore.getState().resend('expired');
            await vi.waitFor(() => {
                expect(useVerifyAccountStore.getState().emailError).toBe(
                    'Failed to resend verification email. Please try again.',
                );
            });
            expect(useVerifyAccountStore.getState().resendSent).toBe(false);
        });
    });
});
