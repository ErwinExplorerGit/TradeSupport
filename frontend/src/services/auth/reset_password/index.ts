import { axiosInstance } from '../../../axios';
import { ResetPasswordRequest, ResetPasswordResponse } from './types';

export async function resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const { data } = await axiosInstance.post<ResetPasswordResponse>('/api/auth/reset-password', request);
    return data;
}
