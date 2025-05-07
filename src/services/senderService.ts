// src/services/senderService.ts
import apiService from '@/services/apiService';

// Tip tanımlamaları
export type SenderProfile = {
    id: string;
    userId: string;
    company: boolean;
    companyName: string;
    productionTypes: string[];
    certificates: string[];
    billingInfo?: string;
    totalShipments: number;
    ecoFriendlyShipments: number;
    createdAt?: string;
    updatedAt?: string;
};

export type SenderProfileRequest = {
    userId: string;
    company: boolean;
    companyName: string;
    productionTypes: string[];
    certificates: string[];
    billingInfo?: string;
};

export type SenderProfileUpdateRequest = {
    company?: boolean;
    companyName?: string;
    productionTypes?: string[];
    certificates?: string[];
    billingInfo?: string;
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

export type SenderStatistics = {
    totalShipments: number;
    ecoFriendlyShipments: number;
    ecoFriendlyRatio: number;
    completedShipments: number;
    pendingShipments: number;
    totalWeight: number;
    averageShipmentWeight: number;
};

const senderService = {
    // Yeni gönderici profili oluşturur
    createSenderProfile: async (profileData: SenderProfileRequest): Promise<SenderProfile> => {
        try {
            return await apiService.post<SenderProfile, SenderProfileRequest>('/sender-profiles', profileData);
        } catch (error) {
            console.error('Create sender profile error:', error);
            throw error;
        }
    },

    // Belirli bir gönderici profilini ID'ye göre getirir
    getSenderProfileById: async (id: string): Promise<SenderProfile> => {
        try {
            return await apiService.get<SenderProfile>(`/sender-profiles/${id}`);
        } catch (error) {
            console.error(`Get sender profile by ID (${id}) error:`, error);
            throw error;
        }
    },

    // Kullanıcı ID'sine göre gönderici profilini getirir
    getSenderProfileByUserId: async (userId: string): Promise<SenderProfile> => {
        try {
            return await apiService.get<SenderProfile>(`/sender-profiles/user/${userId}`);
        } catch (error) {
            console.error(`Get sender profile by user ID (${userId}) error:`, error);
            throw error;
        }
    },

    // Tüm gönderici profillerini getirir
    getAllSenderProfiles: async (): Promise<SenderProfile[]> => {
        try {
            return await apiService.get<SenderProfile[]>('/sender-profiles');
        } catch (error) {
            console.error('Get all sender profiles error:', error);
            throw error;
        }
    },

    // Sayfalandırılmış gönderici profillerini getirir
    getAllSenderProfilesPaginated: async (
        page: number = 0,
        size: number = 20,
        sortBy?: string,
        sortDirection?: 'asc' | 'desc'
    ): Promise<PageResponse<SenderProfile>> => {
        try {
            const params: Record<string, any> = { page, size };
            if (sortBy) params.sortBy = sortBy;
            if (sortDirection) params.sortDirection = sortDirection;

            return await apiService.get<PageResponse<SenderProfile>>('/sender-profiles/paginated', params);
        } catch (error) {
            console.error('Get paginated sender profiles error:', error);
            throw error;
        }
    },

    // Şirket durumuna göre gönderici profillerini getirir (şirket veya bireysel)
    getSenderProfilesByCompanyStatus: async (isCompany: boolean): Promise<SenderProfile[]> => {
        try {
            return await apiService.get<SenderProfile[]>('/sender-profiles/company-status', { isCompany });
        } catch (error) {
            console.error(`Get sender profiles by company status (${isCompany}) error:`, error);
            throw error;
        }
    },

    // Şirket durumuna göre sayfalandırılmış gönderici profillerini getirir
    getSenderProfilesByCompanyStatusPaginated: async (
        isCompany: boolean,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<SenderProfile>> => {
        try {
            return await apiService.get<PageResponse<SenderProfile>>('/sender-profiles/company-status/paginated',
                { isCompany, page, size });
        } catch (error) {
            console.error(`Get paginated sender profiles by company status (${isCompany}) error:`, error);
            throw error;
        }
    },

    // Şirket adına göre gönderici profillerini getirir
    getSenderProfilesByCompanyName: async (companyName: string): Promise<SenderProfile[]> => {
        try {
            return await apiService.get<SenderProfile[]>('/sender-profiles/company-name', { companyName });
        } catch (error) {
            console.error(`Get sender profiles by company name (${companyName}) error:`, error);
            throw error;
        }
    },

    // Şirket adına göre sayfalandırılmış gönderici profillerini getirir
    getSenderProfilesByCompanyNamePaginated: async (
        companyName: string,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<SenderProfile>> => {
        try {
            return await apiService.get<PageResponse<SenderProfile>>('/sender-profiles/company-name/paginated',
                { companyName, page, size });
        } catch (error) {
            console.error(`Get paginated sender profiles by company name (${companyName}) error:`, error);
            throw error;
        }
    },

    // Üretim tipine göre gönderici profillerini getirir
    getSenderProfilesByProductionType: async (productionType: string): Promise<SenderProfile[]> => {
        try {
            return await apiService.get<SenderProfile[]>('/sender-profiles/production-type', { productionType });
        } catch (error) {
            console.error(`Get sender profiles by production type (${productionType}) error:`, error);
            throw error;
        }
    },

    // Üretim tipine göre sayfalandırılmış gönderici profillerini getirir
    getSenderProfilesByProductionTypePaginated: async (
        productionType: string,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<SenderProfile>> => {
        try {
            return await apiService.get<PageResponse<SenderProfile>>('/sender-profiles/production-type/paginated',
                { productionType, page, size });
        } catch (error) {
            console.error(`Get paginated sender profiles by production type (${productionType}) error:`, error);
            throw error;
        }
    },

    // Sertifikaya göre gönderici profillerini getirir
    getSenderProfilesByCertificate: async (certificate: string): Promise<SenderProfile[]> => {
        try {
            return await apiService.get<SenderProfile[]>('/sender-profiles/certificate', { certificate });
        } catch (error) {
            console.error(`Get sender profiles by certificate (${certificate}) error:`, error);
            throw error;
        }
    },

    // Sertifikaya göre sayfalandırılmış gönderici profillerini getirir
    getSenderProfilesByCertificatePaginated: async (
        certificate: string,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<SenderProfile>> => {
        try {
            return await apiService.get<PageResponse<SenderProfile>>('/sender-profiles/certificate/paginated',
                { certificate, page, size });
        } catch (error) {
            console.error(`Get paginated sender profiles by certificate (${certificate}) error:`, error);
            throw error;
        }
    },

    // Toplam sevkiyat sayısına göre en çok sevkiyat yapan göndericileri getirir
    getTopSendersByTotalShipments: async (limit: number = 10): Promise<SenderProfile[]> => {
        try {
            return await apiService.get<SenderProfile[]>('/sender-profiles/top-by-shipments', { limit });
        } catch (error) {
            console.error(`Get top senders by total shipments (limit: ${limit}) error:`, error);
            throw error;
        }
    },

    // Çevre dostu sevkiyat sayısına göre en çok çevre dostu sevkiyat yapan göndericileri getirir
    getTopSendersByEcoFriendlyShipments: async (limit: number = 10): Promise<SenderProfile[]> => {
        try {
            return await apiService.get<SenderProfile[]>('/sender-profiles/top-by-eco-shipments', { limit });
        } catch (error) {
            console.error(`Get top senders by eco-friendly shipments (limit: ${limit}) error:`, error);
            throw error;
        }
    },

    // Çevre dostu sevkiyat oranına göre en iyi göndericileri getirir
    getTopSendersByEcoFriendlyRatio: async (limit: number = 10): Promise<SenderProfile[]> => {
        try {
            return await apiService.get<SenderProfile[]>('/sender-profiles/top-by-eco-ratio', { limit });
        } catch (error) {
            console.error(`Get top senders by eco-friendly ratio (limit: ${limit}) error:`, error);
            throw error;
        }
    },

    // Aktif göndericileri getirir (sistemde yükleri olan)
    getActiveSenders: async (): Promise<SenderProfile[]> => {
        try {
            return await apiService.get<SenderProfile[]>('/sender-profiles/active');
        } catch (error) {
            console.error('Get active senders error:', error);
            throw error;
        }
    },

    // Aktif göndericileri sayfalandırılmış olarak getirir
    getActiveSendersPaginated: async (
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<SenderProfile>> => {
        try {
            return await apiService.get<PageResponse<SenderProfile>>('/sender-profiles/active/paginated', { page, size });
        } catch (error) {
            console.error('Get paginated active senders error:', error);
            throw error;
        }
    },

    // Hiç yükü olmayan göndericileri getirir
    getSendersWithNoLoads: async (): Promise<SenderProfile[]> => {
        try {
            return await apiService.get<SenderProfile[]>('/sender-profiles/no-loads');
        } catch (error) {
            console.error('Get senders with no loads error:', error);
            throw error;
        }
    },

    // Belirli bir mal türüne sahip yükleri olan göndericileri getirir
    getSendersWithGoodsType: async (goodsType: string): Promise<SenderProfile[]> => {
        try {
            return await apiService.get<SenderProfile[]>('/sender-profiles/goods-type', { goodsType });
        } catch (error) {
            console.error(`Get senders with goods type (${goodsType}) error:`, error);
            throw error;
        }
    },

    // Belirli bir mal türüne sahip yükleri olan göndericileri sayfalandırılmış olarak getirir
    getSendersWithGoodsTypePaginated: async (
        goodsType: string,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<SenderProfile>> => {
        try {
            return await apiService.get<PageResponse<SenderProfile>>('/sender-profiles/goods-type/paginated',
                { goodsType, page, size });
        } catch (error) {
            console.error(`Get paginated senders with goods type (${goodsType}) error:`, error);
            throw error;
        }
    },

    // Gelişmiş arama
    advancedSearch: async (params: {
        companyName?: string;
        isCompany?: boolean;
        minShipments?: number;
        hasLoads?: boolean;
        page?: number;
        size?: number;
    }): Promise<PageResponse<SenderProfile>> => {
        try {
            return await apiService.get<PageResponse<SenderProfile>>('/sender-profiles/search', params);
        } catch (error) {
            console.error('Advanced sender search error:', error);
            throw error;
        }
    },

    // Şirket durumuna göre gönderici sayısını getirir
    countByCompanyStatus: async (isCompany: boolean): Promise<number> => {
        try {
            return await apiService.get<number>('/sender-profiles/count-by-company-status', { isCompany });
        } catch (error) {
            console.error(`Count senders by company status (${isCompany}) error:`, error);
            throw error;
        }
    },

    // Gönderici profilini günceller
    updateSenderProfile: async (id: string, profileData: SenderProfileUpdateRequest): Promise<SenderProfile> => {
        try {
            return await apiService.put<SenderProfile, SenderProfileUpdateRequest>(`/sender-profiles/${id}`, profileData);
        } catch (error) {
            console.error(`Update sender profile (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Gönderici profilini siler
    deleteSenderProfile: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/sender-profiles/${id}`);
        } catch (error) {
            console.error(`Delete sender profile (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Toplam sevkiyat sayısını artırır
    incrementTotalShipments: async (id: string): Promise<void> => {
        try {
            await apiService.post(`/sender-profiles/${id}/increment-shipment`, {});
        } catch (error) {
            console.error(`Increment total shipments (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Çevre dostu sevkiyat sayısını artırır
    incrementEcoFriendlyShipments: async (id: string): Promise<void> => {
        try {
            await apiService.post(`/sender-profiles/${id}/increment-eco-shipment`, {});
        } catch (error) {
            console.error(`Increment eco-friendly shipments (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Gönderici istatistiklerini getirir
    getSenderStatistics: async (id: string): Promise<SenderStatistics> => {
        try {
            return await apiService.get<SenderStatistics>(`/sender-profiles/${id}/statistics`);
        } catch (error) {
            console.error(`Get sender statistics (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Mevcut kullanıcının gönderici profilini getirir
    getCurrentSenderProfile: async (): Promise<SenderProfile> => {
        try {
            return await apiService.get<SenderProfile>('/sender-profiles/me');
        } catch (error) {
            console.error('Get current sender profile error:', error);
            throw error;
        }
    },

    // Kullanılabilir üretim tiplerini getirir
    getAvailableProductionTypes: async (): Promise<string[]> => {
        try {
            return await apiService.get<string[]>('/sender-profiles/production-types');
        } catch (error) {
            console.error('Get available production types error:', error);
            throw error;
        }
    },

    // Kullanılabilir sertifikaları getirir
    getAvailableCertificates: async (): Promise<string[]> => {
        try {
            return await apiService.get<string[]>('/sender-profiles/certificates');
        } catch (error) {
            console.error('Get available certificates error:', error);
            throw error;
        }
    }
};

export default senderService;