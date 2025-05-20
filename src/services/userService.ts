// src/services/userService.ts
import apiService from '@/services/apiService';

// Tip tanımlamaları
export type User = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: 'ADMIN' | 'SENDER' | 'CARRIER' | 'BROKER'; // Role tipini union type olarak güncelledik
    emailVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type UserCreateRequest = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'ADMIN' | 'SENDER' | 'CARRIER' | 'BROKER'; // Role tipini union type olarak güncelledik
};

export type UserUpdateRequest = {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
};

export type PageResponse<T> = {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
};

const userService = {
    /**
     * Yeni kullanıcı oluşturur
     * @param userData Yeni kullanıcı bilgileri
     */
    createUser: async (userData: UserCreateRequest): Promise<User> => {
        try {
            return await apiService.post<User, UserCreateRequest>('/users', userData);
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    },

    /**
     * Belirli bir kullanıcının bilgilerini ID'ye göre getirir
     * @param id Kullanıcı ID
     */
    getUserById: async (id: string): Promise<User> => {
        try {
            return await apiService.get<User>(`/users/${id}`);
        } catch (error) {
            console.error(`Get user by ID (${id}) error:`, error);
            throw error;
        }
    },

    /**
     * E-posta adresine göre kullanıcı bilgilerini getirir
     * @param email Kullanıcı e-posta adresi
     */
    getUserByEmail: async (email: string): Promise<User> => {
        try {
            return await apiService.get<User>(`/users/email/${email}`);
        } catch (error) {
            console.error(`Get user by email (${email}) error:`, error);
            throw error;
        }
    },

    /**
     * Tüm kullanıcıları getirir
     */
    getAllUsers: async (): Promise<User[]> => {
        try {
            return await apiService.get<User[]>('/users');
        } catch (error) {
            console.error('Get all users error:', error);
            throw error;
        }
    },

    // Diğer fonksiyonlar (değişmeden kaldı)
    // ...
};

export default userService;