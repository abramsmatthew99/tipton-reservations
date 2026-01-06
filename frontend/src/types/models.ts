export interface User {
    sub: string;
    roles: string[];
}

export interface AuthResponse {
    token: string;
}