import client from './client';

interface LoginRequest {
    email: string;
    password: string;
}

export const authApi = {
    login: async (credentials: LoginRequest) => {
        const response = await client.post<string>('/auth/login', credentials);
        return response.data; 
    },

    register: async (data: any) => {
        return client.post('/auth/register', data);
    }
};