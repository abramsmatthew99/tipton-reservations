import client from './client';

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest { 
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
}

export const authApi = {
    login: async (credentials: LoginRequest) => {
        const response = await client.post<string>('/auth/login', credentials);
        return response.data; 
    },

    register: async (data: RegisterRequest) => {
        const response = await client.post('/users', data); 
        return response.data;
    }
};