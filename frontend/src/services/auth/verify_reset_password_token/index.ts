import { axiosInstance } from '../../../axios';
import { VerifyResetPasswordTokenRequest, VerifyResetPasswordTokenResponse } from './types';

export async function verifyResetPasswordToken(request: VerifyResetPasswordTokenRequest): Promise<VerifyResetPasswordTokenResponse> {
    const { data } = await axiosInstance.post<VerifyResetPasswordTokenResponse>('/api/auth/verify_reset_password_token', request);
    return data;
}
