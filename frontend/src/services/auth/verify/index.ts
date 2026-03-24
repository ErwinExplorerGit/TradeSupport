import { axiosInstance } from '../../../axios';
import { VerifyRequest, VerifyResponse } from './types';

export async function verify(request: VerifyRequest): Promise<VerifyResponse> {
    const { data } = await axiosInstance.post<VerifyResponse>('/api/auth/verify', request);
    return data;
}
