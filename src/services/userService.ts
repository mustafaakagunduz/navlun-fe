// src/services/userService.ts
import apiService from '@/services/apiService';

// Tip tanımlamaları
export type User = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: string;
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
    role: string;
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

    /**
     * Sayfalandırılmış kullanıcıları getirir
     * @param page Sayfa numarası
     * @param size Sayfa boyutu
     * @param sortBy Sıralama alanı
     * @param sortDirection Sıralama yönü
     */
    getAllUsersPaginated: async (
        page: number = 0,
        size: number = 20,
        sortBy?: string,
        sortDirection?: 'asc' | 'desc'
    ): Promise<PageResponse<User>> => {
        try {
            const params: Record<string, any> = { page, size };
            if (sortBy) params.sortBy = sortBy;
            if (sortDirection) params.sortDirection = sortDirection;

            return await apiService.get<PageResponse<User>>('/users/paginated', params);
        } catch (error) {
            console.error('Get paginated users error:', error);
            throw error;
        }
    },

    /**
     * Rol bazlı kullanıcıları getirir
     * @param role Kullanıcı rolü
     */
    getUsersByRole: async (role: string): Promise<User[]> => {
        try {
            return await apiService.get<User[]>(`/users/role/${role}`);
        } catch (error) {
            console.error(`Get users by role (${role}) error:`, error);
            throw error;
        }
    },

    /**
     * Rol bazlı kullanıcıları sayfalandırılmış olarak getirir
     * @param role Kullanıcı rolü
     * @param page Sayfa numarası
     * @param size Sayfa boyutu
     */
    getUsersByRolePaginated: async (
        role: string,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<User>> => {
        try {
            return await apiService.get<PageResponse<User>>(`/users/role/${role}/paginated`, { page, size });
        } catch (error) {
            console.error(`Get paginated users by role (${role}) error:`, error);
            throw error;
        }
    },

    /**
     * İsme göre kullanıcıları getirir
     * @param name Kullanıcı adı (ad veya soyad)
     */
    getUsersByName: async (name: string): Promise<User[]> => {
        try {
            return await apiService.get<User[]>('/users/search/name', { name });
        } catch (error) {
            console.error(`Get users by name (${name}) error:`, error);
            throw error;
        }
    },

    /**
     * İsme göre kullanıcıları sayfalandırılmış olarak getirir
     * @param name Kullanıcı adı (ad veya soyad)
     * @param page Sayfa numarası
     * @param size Sayfa boyutu
     */
    getUsersByNamePaginated: async (
        name: string,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<User>> => {
        try {
            return await apiService.get<PageResponse<User>>('/users/search/name/paginated', { name, page, size });
        } catch (error) {
            console.error(`Get paginated users by name (${name}) error:`, error);
            throw error;
        }
    },

    /**
     * Gönderici profili olan kullanıcıları getirir
     */
    getUsersWithSenderProfile: async (): Promise<User[]> => {
        try {
            return await apiService.get<User[]>('/users/with-sender-profile');
        } catch (error) {
            console.error('Get users with sender profile error:', error);
            throw error;
        }
    },

    /**
     * Gönderici profili olan kullanıcıları sayfalandırılmış olarak getirir
     * @param page Sayfa numarası
     * @param size Sayfa boyutu
     */
    getUsersWithSenderProfilePaginated: async (
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<User>> => {
        try {
            return await apiService.get<PageResponse<User>>('/users/with-sender-profile/paginated', { page, size });
        } catch (error) {
            console.error('Get paginated users with sender profile error:', error);
            throw error;
        }
    },

    /**
     * Taşıyıcı profili olan kullanıcıları getirir
     */
    getUsersWithCarrierProfile: async (): Promise<User[]> => {
        try {
            return await apiService.get<User[]>('/users/with-carrier-profile');
        } catch (error) {
            console.error('Get users with carrier profile error:', error);
            throw error;
        }
    },

    /**
     * Taşıyıcı profili olan kullanıcıları sayfalandırılmış olarak getirir
     * @param page Sayfa numarası
     * @param size Sayfa boyutu
     */
    getUsersWithCarrierProfilePaginated: async (
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<User>> => {
        try {
            return await apiService.get<PageResponse<User>>('/users/with-carrier-profile/paginated', { page, size });
        } catch (error) {
            console.error('Get paginated users with carrier profile error:', error);
            throw error;
        }
    },

    /**
     * Belirli bir tarih aralığında oluşturulan kullanıcıları getirir
     * @param startDate Başlangıç tarihi
     * @param endDate Bitiş tarihi
     */
    getUsersByCreationDateRange: async (
        startDate: string,
        endDate: string
    ): Promise<User[]> => {
        try {
            return await apiService.get<User[]>('/users/created-between', { startDate, endDate });
        } catch (error) {
            console.error(`Get users by creation date range error:`, error);
            throw error;
        }
    },

    /**
     * Belirli bir tarih aralığında oluşturulan kullanıcıları sayfalandırılmış olarak getirir
     * @param startDate Başlangıç tarihi
     * @param endDate Bitiş tarihi
     * @param page Sayfa numarası
     * @param size Sayfa boyutu
     */
    getUsersByCreationDateRangePaginated: async (
        startDate: string,
        endDate: string,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<User>> => {
        try {
            return await apiService.get<PageResponse<User>>('/users/created-between/paginated',
                { startDate, endDate, page, size });
        } catch (error) {
            console.error(`Get paginated users by creation date range error:`, error);
            throw error;
        }
    },

    /**
     * Gelişmiş kullanıcı araması yapar
     * @param params Arama parametreleri
     */
    advancedSearch: async (params: {
        email?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
        role?: string;
        hasSenderProfile?: boolean;
        hasCarrierProfile?: boolean;
        page?: number;
        size?: number;
    }): Promise<PageResponse<User>> => {
        try {
            return await apiService.get<PageResponse<User>>('/users/search', params);
        } catch (error) {
            console.error('Advanced user search error:', error);
            throw error;
        }
    },

    /**
     * Belirli bir role sahip kullanıcı sayısını getirir
     * @param role Kullanıcı rolü
     */
    countUsersByRole: async (role: string): Promise<number> => {
        try {
            const response = await apiService.get<number>(`/users/count/role/${role}`);
            return response;
        } catch (error) {
            console.error(`Count users by role (${role}) error:`, error);
            throw error;
        }
    },

    /**
     * Gönderici profili olan kullanıcı sayısını getirir
     */
    countUsersWithSenderProfile: async (): Promise<number> => {
        try {
            const response = await apiService.get<number>('/users/count/with-sender-profile');
            return response;
        } catch (error) {
            console.error('Count users with sender profile error:', error);
            throw error;
        }
    },

    /**
     * Taşıyıcı profili olan kullanıcı sayısını getirir
     */
    countUsersWithCarrierProfile: async (): Promise<number> => {
        try {
            const response = await apiService.get<number>('/users/count/with-carrier-profile');
            return response;
        } catch (error) {
            console.error('Count users with carrier profile error:', error);
            throw error;
        }
    },

    /**
     * E-posta adresinin sistemde kayıtlı olup olmadığını kontrol eder
     * @param email E-posta adresi
     */
    isEmailExists: async (email: string): Promise<boolean> => {
        try {
            const response = await apiService.get<boolean>(`/users/check-email/${email}`);
            return response;
        } catch (error) {
            console.error(`Check email exists (${email}) error:`, error);
            throw error;
        }
    },

    /**
     * Kullanıcı bilgilerini günceller
     * @param id Kullanıcı ID
     * @param userData Güncellenecek kullanıcı bilgileri
     */
    updateUser: async (id: string, userData: UserUpdateRequest): Promise<User> => {
        try {
            return await apiService.put<User, UserUpdateRequest>(`/users/${id}`, userData);
        } catch (error) {
            console.error(`Update user (ID: ${id}) error:`, error);
            throw error;
        }
    },

    /**
     * Kullanıcı rolünü günceller (Yalnızca admin)
     * @param id Kullanıcı ID
     * @param role Yeni rol
     */
    updateUserRole: async (id: string, role: string): Promise<void> => {
        try {
            await apiService.patch(`/users/${id}/role`, { role });
        } catch (error) {
            console.error(`Update user role (ID: ${id}) error:`, error);
            throw error;
        }
    },

    /**
     * Kullanıcı şifresini günceller
     * @param id Kullanıcı ID
     * @param newPassword Yeni şifre
     */
    updateUserPassword: async (id: string, newPassword: string): Promise<void> => {
        try {
            await apiService.patch(`/users/${id}/password`, { newPassword });
        } catch (error) {
            console.error(`Update user password (ID: ${id}) error:`, error);
            throw error;
        }
    },

    /**
     * Kullanıcıyı siler
     * @param id Kullanıcı ID
     */
    deleteUser: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/users/${id}`);
        } catch (error) {
            console.error(`Delete user (ID: ${id}) error:`, error);
            throw error;
        }
    },

    /**
     * Mevcut kullanıcının profilini getirir
     */
    getCurrentUserProfile: async (): Promise<User> => {
        try {
            return await apiService.get<User>('/users/me');
        } catch (error) {
            console.error('Get current user profile error:', error);
            throw error;
        }
    },

    /**
     * Mevcut kullanıcının profilini günceller
     * @param userData Güncellenecek kullanıcı bilgileri
     */
    updateCurrentUserProfile: async (userData: UserUpdateRequest): Promise<User> => {
        try {
            return await apiService.put<User, UserUpdateRequest>('/users/me', userData);
        } catch (error) {
            console.error('Update current user profile error:', error);
            throw error;
        }
    },

    /**
     * Mevcut kullanıcının şifresini günceller
     * @param currentPassword Mevcut şifre
     * @param newPassword Yeni şifre
     */
    updateCurrentUserPassword: async (currentPassword: string, newPassword: string): Promise<void> => {
        try {
            await apiService.patch('/users/me/password', { currentPassword, newPassword });
        } catch (error) {
            console.error('Update current user password error:', error);
            throw error;
        }
    }
};

export default userService;