import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('@/services/api', () => ({
    api: {
        login: vi.fn(),
        verifyResend: vi.fn(),
    },
}));

import { useLoginStore } from '@/stores/loginStore';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';

const initialState = {
    username: '',
    password: '',
    loading: false,
    error: '',
    unverified: false,
    unverifiedEmail: '',
    resendLoading: false,
    resendSuccess: false,
};

beforeEach(() => {
    vi.useFakeTimers();
    useLoginStore.setState(initialState);
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
    localStorage.clear();
    vi.clearAllMocks();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('loginStore', () => {
    describe('setUsername', () => {
        it('updates username and clears the error', () => {
            useLoginStore.setState({ error: 'some error' });
            useLoginStore.getState().setUsername('testuser');
            expect(useLoginStore.getState().username).toBe('testuser');
            expect(useLoginStore.getState().error).toBe('');
        });
    });

    describe('setPassword', () => {
        it('updates password and clears the error', () => {
            useLoginStore.setState({ error: 'some error' });
            useLoginStore.getState().setPassword('secret123');
            expect(useLoginStore.getState().password).toBe('secret123');
            expect(useLoginStore.getState().error).toBe('');
        });
    });

    describe('clearError', () => {
        it('clears the error message', () => {
            useLoginStore.setState({ error: 'Login failed' });
            useLoginStore.getState().clearError();
            expect(useLoginStore.getState().error).toBe('');
        });
    });

    describe('reset', () => {
        it('resets the store to initial state', () => {
            useLoginStore.setState({ username: 'user', password: 'pass', error: 'err', loading: true });
            useLoginStore.getState().reset();
            expect(useLoginStore.getState()).toMatchObject(initialState);
        });
    });

    describe('submit', () => {
        it('sets an error when username is empty', async () => {
            useLoginStore.setState({ username: '', password: 'secret' });
            await useLoginStore.getState().submit(() => { });
            expect(useLoginStore.getState().error).toBe('Please enter your username and password.');
            expect(api.login).not.toHaveBeenCalled();
        });

        it('sets an error when password is empty', async () => {
            useLoginStore.setState({ username: 'user', password: '' });
            await useLoginStore.getState().submit(() => { });
            expect(useLoginStore.getState().error).toBe('Please enter your username and password.');
            expect(api.login).not.toHaveBeenCalled();
        });

        it('sets loading to true while waiting for the API call', () => {
            vi.mocked(api.login).mockResolvedValue({
                user_id: '1', email: 'u@e.com', first_name: 'A', last_name: 'B',
                access_token: 'tok', message: 'ok',
            });
            useLoginStore.setState({ username: 'user', password: 'pass' });

            // Do NOT await — just fire the async action
            useLoginStore.getState().submit(() => { });

            // loading is set synchronously before the internal setTimeout fires
            expect(useLoginStore.getState().loading).toBe(true);
        });

        it('calls api.login and invokes onSuccess on valid credentials', async () => {
            vi.mocked(api.login).mockResolvedValue({
                user_id: '1', email: 'user@example.com', first_name: 'John', last_name: 'Doe',
                access_token: 'token123', message: 'success',
            });
            useLoginStore.setState({ username: 'user', password: 'pass' });
            const onSuccess = vi.fn();

            const submitPromise = useLoginStore.getState().submit(onSuccess);
            await vi.runAllTimersAsync();
            await submitPromise;

            expect(api.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
            expect(onSuccess).toHaveBeenCalledTimes(1);
            expect(useAuthStore.getState().isAuthenticated).toBe(true);
        });

        it('trims whitespace from username before calling the API', async () => {
            vi.mocked(api.login).mockResolvedValue({
                user_id: '1', email: 'u@e.com', first_name: 'A', last_name: 'B',
                access_token: 'tok', message: 'ok',
            });
            useLoginStore.setState({ username: '  user  ', password: 'pass' });

            const submitPromise = useLoginStore.getState().submit(() => { });
            await vi.runAllTimersAsync();
            await submitPromise;

            expect(api.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
        });

        it('sets unverified flag when account email is not verified', async () => {
            vi.mocked(api.login).mockRejectedValue(new Error('Account email is not verified'));
            useLoginStore.setState({ username: 'user@example.com', password: 'pass' });

            const submitPromise = useLoginStore.getState().submit(() => { });
            await vi.runAllTimersAsync();
            await submitPromise;

            const { unverified, unverifiedEmail, error } = useLoginStore.getState();
            expect(unverified).toBe(true);
            expect(unverifiedEmail).toBe('user@example.com');
            expect(error).toBe('');
        });

        it('sets error message on a generic login failure', async () => {
            vi.mocked(api.login).mockRejectedValue(new Error('Invalid credentials'));
            useLoginStore.setState({ username: 'user', password: 'wrongpass' });

            const submitPromise = useLoginStore.getState().submit(() => { });
            await vi.runAllTimersAsync();
            await submitPromise;

            expect(useLoginStore.getState().error).toBe('Invalid credentials');
            expect(useLoginStore.getState().loading).toBe(false);
        });
    });

    describe('resendVerification', () => {
        it('calls api.verifyResend and sets resendSuccess on success', async () => {
            vi.mocked(api.verifyResend).mockResolvedValue({ message: 'sent' });
            useLoginStore.setState({ unverifiedEmail: 'user@example.com' });

            await useLoginStore.getState().resendVerification();

            expect(api.verifyResend).toHaveBeenCalledWith({ email: 'user@example.com' });
            expect(useLoginStore.getState().resendSuccess).toBe(true);
            expect(useLoginStore.getState().resendLoading).toBe(false);
        });

        it('sets resendLoading to false on failure without setting resendSuccess', async () => {
            vi.mocked(api.verifyResend).mockRejectedValue(new Error('network error'));
            useLoginStore.setState({ unverifiedEmail: 'user@example.com' });

            await useLoginStore.getState().resendVerification();

            expect(useLoginStore.getState().resendLoading).toBe(false);
            expect(useLoginStore.getState().resendSuccess).toBe(false);
        });
    });
});
