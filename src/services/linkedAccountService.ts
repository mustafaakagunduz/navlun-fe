// src/services/linkedAccountService.ts
import apiService from '@/services/apiService';

export interface LinkedAccount {
    id: string;
    email: string;
    displayName?: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateLinkedAccountDto {
    email: string;
    password: string;
    displayName?: string;
}

const linkedAccountService = {
    // Yeni linked account oluştur
    createLinkedAccount: async (data: CreateLinkedAccountDto): Promise<LinkedAccount> => {
        try {
            return await apiService.post<LinkedAccount>('/linked-accounts', data);
        } catch (error) {
            console.error('Create linked account error:', error);
            throw error;
        }
    },

    // Kullanıcının tüm linked account'larını getir
    getLinkedAccounts: async (): Promise<LinkedAccount[]> => {
        try {
            return await apiService.get<LinkedAccount[]>('/linked-accounts');
        } catch (error) {
            console.error('Get linked accounts error:', error);
            throw error;
        }
    },

    // Linked account sil
    deleteLinkedAccount: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/linked-accounts/${id}`);
        } catch (error) {
            console.error('Delete linked account error:', error);
            throw error;
        }
    },
};

export default linkedAccountService;
