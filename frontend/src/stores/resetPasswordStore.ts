import { create } from 'zustand';

export type VerifyState = 'verifying' | 'success' | 'failed';


interface ResetPasswordState {
    verifyState: VerifyState;
    setVerifyState: (verifyState: VerifyState) => void;
    reset: () => void;
}

const initialState = {
    verifyState: 'verifying' as VerifyState,

};

export const useResetPasswordStore = create<ResetPasswordState>((set, get) => ({
    ...initialState,

    setVerifyState: (verifyState) => set({ verifyState }),

    reset: () => set(initialState),
}));
