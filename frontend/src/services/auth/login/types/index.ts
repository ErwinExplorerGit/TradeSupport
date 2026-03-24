export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    access_token: string;
    refresh_token: string;
}
