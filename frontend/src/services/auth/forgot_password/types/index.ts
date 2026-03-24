export interface ForgotPasswordRequest {
    email?: string;
    token?: string;
}

export interface ForgotPasswordResponse {
    message: string;
}
