// src/services/accountTypeChangeService.ts
import apiService from '@/services/apiService';

export enum RequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface AccountTypeChangeRequest {
    id: string;
    userId: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    currentRole: string;
    requestedRole: string;
    reason: string;
    status: RequestStatus;
    reviewedBy?: string;
    reviewedByName?: string;
    reviewedAt?: string;
    adminNote?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRequestDto {
    requestedRole: string;
    reason: string;
}

export interface ReviewRequestDto {
    approved: boolean;
    adminNote?: string;
}

const accountTypeChangeService = {
    // Kullanıcı yeni istek oluşturur
    createRequest: async (data: CreateRequestDto): Promise<AccountTypeChangeRequest> => {
        try {
            return await apiService.post<AccountTypeChangeRequest>('/account-type-change-requests', data);
        } catch (error) {
            console.error('Create account type change request error:', error);
            throw error;
        }
    },

    // Kullanıcının isteklerini listele
    getMyRequests: async (): Promise<AccountTypeChangeRequest[]> => {
        try {
            return await apiService.get<AccountTypeChangeRequest[]>('/account-type-change-requests/my-requests');
        } catch (error) {
            console.error('Get my requests error:', error);
            throw error;
        }
    },

    // Kullanıcının bekleyen isteği var mı
    hasPendingRequest: async (): Promise<boolean> => {
        try {
            return await apiService.get<boolean>('/account-type-change-requests/has-pending');
        } catch (error) {
            console.error('Check pending request error:', error);
            throw error;
        }
    },

    // Admin - Tüm bekleyen istekler
    getAllPendingRequests: async (): Promise<AccountTypeChangeRequest[]> => {
        try {
            return await apiService.get<AccountTypeChangeRequest[]>('/account-type-change-requests/pending');
        } catch (error) {
            console.error('Get all pending requests error:', error);
            throw error;
        }
    },

    // İstek detayı
    getRequestById: async (requestId: string): Promise<AccountTypeChangeRequest> => {
        try {
            return await apiService.get<AccountTypeChangeRequest>(`/account-type-change-requests/${requestId}`);
        } catch (error) {
            console.error('Get request by id error:', error);
            throw error;
        }
    },

    // Admin - İsteği onayla/reddet
    reviewRequest: async (requestId: string, data: ReviewRequestDto): Promise<AccountTypeChangeRequest> => {
        try {
            return await apiService.post<AccountTypeChangeRequest>(`/account-type-change-requests/${requestId}/review`, data);
        } catch (error) {
            console.error('Review request error:', error);
            throw error;
        }
    },
};

export default accountTypeChangeService;
