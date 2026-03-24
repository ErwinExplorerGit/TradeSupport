import { axiosInstance } from '../../../axios';
import { ForgotPasswordRequest, ForgotPasswordResponse } from './types';

export async function forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const { data } = await axiosInstance.post<ForgotPasswordResponse>('/api/auth/forgot-password', request);
    return data;
}
