import { axiosInstance } from '../../../axios';
import { VerifyResendRequest, VerifyResendResponse } from './types';

export async function verifyResend(request: VerifyResendRequest): Promise<VerifyResendResponse> {
    const { data } = await axiosInstance.post<VerifyResendResponse>('/api/auth/verify/resend', request);
    return data;
}
