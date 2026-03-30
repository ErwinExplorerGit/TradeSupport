import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/services/auth', () => ({
    authService: {
        register: vi.fn(),
    },
}));

import { useRegisterStore } from '@/stores/registerStore';
import { authService } from '@/services/auth';

const initialState = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    loading: false,
    errors: {},
};

beforeEach(() => {
    useRegisterStore.setState(initialState);
    vi.clearAllMocks();
});

describe('registerStore', () => {
    describe('setters', () => {
        it('setFirstName updates firstName and clears its error', () => {
            useRegisterStore.setState({ errors: { firstName: 'required' } });
            useRegisterStore.getState().setFirstName('John');
            expect(useRegisterStore.getState().firstName).toBe('John');
            expect(useRegisterStore.getState().errors.firstName).toBe('');
        });

        it('setLastName updates lastName and clears its error', () => {
            useRegisterStore.setState({ errors: { lastName: 'required' } });
            useRegisterStore.getState().setLastName('Doe');
            expect(useRegisterStore.getState().lastName).toBe('Doe');
            expect(useRegisterStore.getState().errors.lastName).toBe('');
        });

        it('setEmail updates email and clears its error', () => {
            useRegisterStore.setState({ errors: { email: 'invalid' } });
            useRegisterStore.getState().setEmail('a@b.com');
            expect(useRegisterStore.getState().email).toBe('a@b.com');
            expect(useRegisterStore.getState().errors.email).toBe('');
        });

        it('setPassword updates password and clears its error', () => {
            useRegisterStore.setState({ errors: { password: 'required' } });
            useRegisterStore.getState().setPassword('pass1234');
            expect(useRegisterStore.getState().password).toBe('pass1234');
            expect(useRegisterStore.getState().errors.password).toBe('');
        });

        it('setConfirmPassword updates confirmPassword and clears its error', () => {
            useRegisterStore.setState({ errors: { confirmPassword: 'mismatch' } });
            useRegisterStore.getState().setConfirmPassword('pass1234');
            expect(useRegisterStore.getState().confirmPassword).toBe('pass1234');
            expect(useRegisterStore.getState().errors.confirmPassword).toBe('');
        });
    });

    describe('reset', () => {
        it('resets the store to initial state', () => {
            useRegisterStore.setState({ firstName: 'John', lastName: 'Doe', loading: true, errors: { email: 'err' } });
            useRegisterStore.getState().reset();
            expect(useRegisterStore.getState()).toMatchObject(initialState);
        });
    });

    describe('submit — validation', () => {
        it('sets firstName error when firstName is empty', async () => {
            await useRegisterStore.getState().submit(() => { });
            expect(useRegisterStore.getState().errors.firstName).toBe('First name is required.');
        });

        it('sets lastName error when lastName is empty', async () => {
            useRegisterStore.setState({ firstName: 'John' });
            await useRegisterStore.getState().submit(() => { });
            expect(useRegisterStore.getState().errors.lastName).toBe('Last name is required.');
        });

        it('sets email error when email is empty', async () => {
            useRegisterStore.setState({ firstName: 'John', lastName: 'Doe' });
            await useRegisterStore.getState().submit(() => { });
            expect(useRegisterStore.getState().errors.email).toBe('Email is required.');
        });

        it('sets email error when email format is invalid', async () => {
            useRegisterStore.setState({ firstName: 'John', lastName: 'Doe', email: 'not-an-email' });
            await useRegisterStore.getState().submit(() => { });
            expect(useRegisterStore.getState().errors.email).toBe('Enter a valid email address.');
        });

        it('sets password error when password is empty', async () => {
            useRegisterStore.setState({ firstName: 'John', lastName: 'Doe', email: 'a@b.com' });
            await useRegisterStore.getState().submit(() => { });
            expect(useRegisterStore.getState().errors.password).toBe('Password is required.');
        });

        it('sets password error when password is fewer than 8 characters', async () => {
            useRegisterStore.setState({ firstName: 'John', lastName: 'Doe', email: 'a@b.com', password: 'short' });
            await useRegisterStore.getState().submit(() => { });
            expect(useRegisterStore.getState().errors.password).toBe('Password must be at least 8 characters.');
        });

        it('sets confirmPassword error when confirmPassword is empty', async () => {
            useRegisterStore.setState({ firstName: 'John', lastName: 'Doe', email: 'a@b.com', password: 'pass1234' });
            await useRegisterStore.getState().submit(() => { });
            expect(useRegisterStore.getState().errors.confirmPassword).toBe('Please confirm your password.');
        });

        it('sets confirmPassword error when passwords do not match', async () => {
            useRegisterStore.setState({
                firstName: 'John', lastName: 'Doe', email: 'a@b.com',
                password: 'pass1234', confirmPassword: 'different',
            });
            await useRegisterStore.getState().submit(() => { });
            expect(useRegisterStore.getState().errors.confirmPassword).toBe('Passwords do not match.');
        });
    });

    describe('submit — API interaction', () => {
        it('calls authService.register with trimmed name values and invokes onSuccess', async () => {
            vi.mocked(authService.register).mockResolvedValue({ message: 'ok', user_id: '1', email: 'a@b.com' });
            useRegisterStore.setState({
                firstName: ' John ', lastName: ' Doe ', email: 'a@b.com',
                password: 'pass1234', confirmPassword: 'pass1234',
            });
            const onSuccess = vi.fn();

            await useRegisterStore.getState().submit(onSuccess);

            expect(authService.register).toHaveBeenCalledWith({
                first_name: 'John', last_name: 'Doe', email: 'a@b.com', password: 'pass1234',
            });
            expect(onSuccess).toHaveBeenCalledTimes(1);
        });

        it('sets an email error message on registration failure', async () => {
            vi.mocked(authService.register).mockRejectedValue(new Error('Email already in use'));
            useRegisterStore.setState({
                firstName: 'John', lastName: 'Doe', email: 'a@b.com',
                password: 'pass1234', confirmPassword: 'pass1234',
            });

            await useRegisterStore.getState().submit(() => { });

            expect(useRegisterStore.getState().errors.email).toBe('Email already in use');
            expect(useRegisterStore.getState().loading).toBe(false);
        });
    });
});
