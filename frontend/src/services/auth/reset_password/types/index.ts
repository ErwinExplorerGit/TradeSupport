export interface ResetPasswordRequest {
    token: string;
    password: string;
}

export interface ResetPasswordResponse {
    message: string;
}
