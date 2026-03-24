import { create } from 'zustand';
import { authService } from '../services/auth';
import { isEmail } from '../utils';

export type VerifyState = 'verifying' | 'success' | 'failed' | 'resend';

interface VerifyAccountState {
    verifyState: VerifyState;
    email: string;
    emailError: string;
    resendLoading: boolean;
    resendSent: boolean;
    setVerifyState: (state: VerifyState) => void;
    setEmail: (email: string) => void;
    setEmailFromUrl: (email: string) => void;
    clearEmailError: () => void;
    resend: () => void;
    reset: () => void;
}

const initialState = {
    verifyState: 'verifying' as VerifyState,
    email: '',
    emailError: '',
    resendLoading: false,
    resendSent: false,
};

export const useVerifyAccountStore = create<VerifyAccountState>((set, get) => ({
    ...initialState,

    setVerifyState: (verifyState) => set({ verifyState }),
    setEmail: (email) => set({ email, emailError: '' }),
    setEmailFromUrl: (email) => set({ email, verifyState: 'resend' }),
    clearEmailError: () => set({ emailError: '' }),
    reset: () => set(initialState),

    resend: () => {
        const { email } = get();

        if (!email.trim()) {
            set({ emailError: 'Email is required.' });
            return;
        }
        if (!isEmail(email)) {
            set({ emailError: 'Enter a valid email address.' });
            return;
        }

        set({ emailError: '', resendLoading: true });

        authService.verifyResend({ email })
            .then(() => {
                set({ resendLoading: false, resendSent: true });
            })
            .catch(() => {
                set({ resendLoading: false, emailError: 'Failed to resend verification email. Please try again.' });
            });
    },
}));
