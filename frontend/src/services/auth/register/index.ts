import { axiosInstance } from '../../../axios';
import { RegisterRequest, RegisterResponse } from './types';

export async function register(request: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await axiosInstance.post<RegisterResponse>('/api/auth/register', request);
    return data;
}
