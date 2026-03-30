import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, type User } from '@/stores/authStore';

const mockUser: User = { id: '1', email: 'user@example.com', username: 'Test User' };
const mockToken = 'mock-access-token-123';

beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
});

describe('authStore', () => {
    describe('initial state', () => {
        it('starts unauthenticated with no user or token', () => {
            const { user, token, isAuthenticated } = useAuthStore.getState();
            expect(user).toBeNull();
            expect(token).toBeNull();
            expect(isAuthenticated).toBe(false);
        });
    });

    describe('setAuth', () => {
        it('sets user, token, and marks as authenticated', () => {
            useAuthStore.getState().setAuth(mockUser, mockToken);
            const { user, token, isAuthenticated } = useAuthStore.getState();
            expect(user).toEqual(mockUser);
            expect(token).toBe(mockToken);
            expect(isAuthenticated).toBe(true);
        });

        it('overwrites a previously set user', () => {
            const otherUser: User = { id: '2', email: 'other@example.com', username: 'Other User' };
            useAuthStore.getState().setAuth(mockUser, mockToken);
            useAuthStore.getState().setAuth(otherUser, 'new-token');
            expect(useAuthStore.getState().user).toEqual(otherUser);
            expect(useAuthStore.getState().token).toBe('new-token');
        });
    });

    describe('clearAuth', () => {
        it('clears user, token, and marks as unauthenticated', () => {
            useAuthStore.getState().setAuth(mockUser, mockToken);
            useAuthStore.getState().clearAuth();
            const { user, token, isAuthenticated } = useAuthStore.getState();
            expect(user).toBeNull();
            expect(token).toBeNull();
            expect(isAuthenticated).toBe(false);
        });
    });

    describe('logout', () => {
        it('clears all auth state', () => {
            useAuthStore.getState().setAuth(mockUser, mockToken);
            useAuthStore.getState().logout();
            const { user, token, isAuthenticated } = useAuthStore.getState();
            expect(user).toBeNull();
            expect(token).toBeNull();
            expect(isAuthenticated).toBe(false);
        });
    });
});
