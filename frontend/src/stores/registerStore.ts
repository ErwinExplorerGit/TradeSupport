import { create } from 'zustand';
import { isEmail } from '../utils';
import { authService } from '../services/auth';

interface RegisterErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

interface RegisterState {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    loading: boolean;
    errors: RegisterErrors;
    setFirstName: (firstName: string) => void;
    setLastName: (lastName: string) => void;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    setConfirmPassword: (confirmPassword: string) => void;
    reset: () => void;
    submit: (onSuccess: () => void) => Promise<void>;
}

const initialState = {
    firstName: 'erwin',
    lastName: 'alapide',
    email: 'erwinalapide.ca@gmail.com',
    password: '12345678',
    confirmPassword: '12345678',
    loading: false,
    errors: {},
};

export const useRegisterStore = create<RegisterState>((set, get) => ({
    ...initialState,

    setFirstName: (firstName) => set((s) => ({ firstName, errors: { ...s.errors, firstName: '' } })),
    setLastName: (lastName) => set((s) => ({ lastName, errors: { ...s.errors, lastName: '' } })),
    setEmail: (email) => set((s) => ({ email, errors: { ...s.errors, email: '' } })),
    setPassword: (password) => set((s) => ({ password, errors: { ...s.errors, password: '' } })),
    setConfirmPassword: (confirmPassword) => set((s) => ({ confirmPassword, errors: { ...s.errors, confirmPassword: '' } })),

    reset: () => set(initialState),

    submit: async (onSuccess) => {
        const { firstName, lastName, email, password, confirmPassword } = get();
        const errors: RegisterErrors = {};

        if (!firstName.trim()) errors.firstName = 'First name is required.';
        if (!lastName.trim()) errors.lastName = 'Last name is required.';
        if (!email.trim()) {
            errors.email = 'Email is required.';
        } else if (!isEmail(email)) {
            errors.email = 'Enter a valid email address.';
        }
        if (!password) {
            errors.password = 'Password is required.';
        } else if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters.';
        }
        if (!confirmPassword) {
            errors.confirmPassword = 'Please confirm your password.';
        } else if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match.';
        }

        if (Object.keys(errors).length > 0) {
            set({ errors });
            return;
        }

        set({ loading: true, errors: {} });

        try {
            await authService.register({
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                email: email.trim(),
                password,
            });
            set(initialState);
            onSuccess();
        } catch (err) {
            set({
                loading: false,
                errors: { email: err instanceof Error ? err.message : 'Registration failed. Please try again.' },
            });
        }
    },
}));

