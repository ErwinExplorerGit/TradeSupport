export interface RegisterRequest {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    message: string;
    user_id: string;
    email: string;
}

