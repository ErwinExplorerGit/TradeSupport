import { create } from 'zustand';

interface RegisterState {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    loading: boolean;
    setFirstName: (firstName: string) => void;
    setLastName: (lastName: string) => void;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    setConfirmPassword: (confirmPassword: string) => void;
    setLoading: (loading: boolean) => void;
    reset: () => void;
}

const initialState = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    loading: false,
};

export const useRegisterStore = create<RegisterState>((set) => ({
    ...initialState,
    setFirstName: (firstName) => set({ firstName }),
    setLastName: (lastName) => set({ lastName }),
    setEmail: (email) => set({ email }),
    setPassword: (password) => set({ password }),
    setConfirmPassword: (confirmPassword) => set({ confirmPassword }),
    setLoading: (loading) => set({ loading }),
    reset: () => set(initialState),
}));
