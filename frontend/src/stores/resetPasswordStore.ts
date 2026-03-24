import { create } from 'zustand';
import { authService } from '../services/auth';

export type VerifyState = 'verifying' | 'success' | 'failed';
export type ResendState = 'idle' | 'loading' | 'sent';


interface ResetPasswordState {
    verifyState: VerifyState;
    resendState: ResendState;
    setVerifyState: (verifyState: VerifyState) => void;
    resendByToken: (token: string) => void;
    reset: () => void;
}

const initialState = {
    verifyState: 'verifying' as VerifyState,
    resendState: 'idle' as ResendState,
};

export const useResetPasswordStore = create<ResetPasswordState>((set) => ({
    ...initialState,

    setVerifyState: (verifyState) => set({ verifyState }),

    resendByToken: (token: string) => {
        set({ resendState: 'loading' });
        setTimeout(() => {
            authService.forgotPassword({ token })
                .finally(() => {
                    set({ resendState: 'sent' });
                });
        }, 3000);
    },

    reset: () => set(initialState),
}));
