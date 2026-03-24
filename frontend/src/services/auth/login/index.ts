import { axiosInstance } from '../../../axios';
import { LoginRequest, LoginResponse } from './types';

export async function login(request: LoginRequest): Promise<LoginResponse> {
    const { data } = await axiosInstance.post<LoginResponse>('/api/auth/login', request);
    return data;
}
