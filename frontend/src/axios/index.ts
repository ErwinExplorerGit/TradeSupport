import axios, { AxiosRequestConfig } from 'axios';
import { authRoutes } from '@/services/auth/routes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Routes that do not need token refresh on 401
const AUTH_ROUTES = Object.values(authRoutes).filter((route) => route !== authRoutes.changePassword);

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processPendingQueue(error: unknown, token: string | null) {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error || !token) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    pendingQueue = [];
}

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

// Normalise error responses + refresh access token on 401 for private routes
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Check if the error is due to an unauthorized access and if the request is not for an auth route
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        // Determine if the request URL matches any of the auth routes
        const isAuthRoute = AUTH_ROUTES.some((route) => originalRequest.url?.includes(route));
        // If we get a 401 on a non-auth route, try to refresh the token
        if (error.response?.status === 401 && !isAuthRoute && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue the request until the ongoing refresh finishes
                return new Promise((resolve, reject) => {
                    pendingQueue.push({ resolve, reject });
                }).then((newToken) => {
                    originalRequest.headers = {
                        ...originalRequest.headers,
                        Authorization: `Bearer ${newToken}`,
                    };
                    return axiosInstance(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Refresh token is stored as an HTTP-only cookie — no body needed
                const { data } = await axiosInstance.post<{ access_token: string }>(authRoutes.refresh);

                const { useAuthStore } = await import('@/stores/authStore');
                const { user } = useAuthStore.getState();
                if (user) {
                    useAuthStore.getState().setAuth(user, data.access_token);
                }

                processPendingQueue(null, data.access_token);

                originalRequest.headers = {
                    ...originalRequest.headers,
                    Authorization: `Bearer ${data.access_token}`,
                };
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processPendingQueue(refreshError, null);
                const { useAuthStore } = await import('@/stores/authStore');
                useAuthStore.getState().clearAuth();
                return Promise.reject(new Error('Session expired. Please log in again.'));
            } finally {
                isRefreshing = false;
            }
        }

        const message =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            'Unknown error';
        return Promise.reject(new Error(message));
    },
);
