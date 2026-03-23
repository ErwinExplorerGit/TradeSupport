import { create } from 'zustand';
import { isEmail } from '../utils';

interface ForgotPasswordState {
    email: string;
    emailError: string;
    loading: boolean;
    submitted: boolean;
    setEmail: (email: string) => void;
    clearEmailError: () => void;
    reset: () => void;
    submit: () => void;
}

const initialState = {
    email: '',
    emailError: '',
    loading: false,
    submitted: false,
};

export const useForgotPasswordStore = create<ForgotPasswordState>((set, get) => ({
    ...initialState,

    setEmail: (email) => set({ email, emailError: '' }),
    clearEmailError: () => set({ emailError: '' }),
    reset: () => set(initialState),

    submit: () => {
        const { email } = get();

        if (!email.trim()) {
            set({ emailError: 'Email is required.' });
            return;
        }

        if (!isEmail(email)) {
            set({ emailError: 'Please enter a valid email address.' });
            return;
        }

        set({ loading: true, emailError: '' });

        // API call will go here
        setTimeout(() => {
            set({ loading: false, submitted: true });
        }, 1000);
    },
}));
