import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach the stored auth token to every request
axiosInstance.interceptors.request.use((config) => {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
        const { state } = JSON.parse(stored) as { state: { token: string | null } };
        if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
        }
    }
    return config;
});

// Normalise error responses
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            'Unknown error';
        return Promise.reject(new Error(message));
    },
);
