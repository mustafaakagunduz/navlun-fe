// src/services/brokerService.ts
import apiService from '@/services/apiService';

// Tip tanımlamaları
export type BrokerProfile = {
    id: string;
    userId: string;
    company: boolean;
    companyName: string;
    taxNumber?: string;
    iban: string;
    specializations: string[];
    certificates: string[];
    licenseNumber?: string;
    commissionRate: number;
    facilitatedDeals: number;
    ecoFriendlyDeals: number;
    createdAt?: string;
    updatedAt?: string;
};

export enum OfferStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

export interface BrokerOfferResponse {
    id: string;
    loadId: string;
    loadTitle?: string;
    loadGoodsType?: string;
    loadWeight?: number;
    brokerProfileId: string;
    brokerName?: string;
    brokerEcoFriendlyCertified?: boolean;
    shipId: string;
    shipName?: string;
    shipType?: string;
    shipDeadweightTonnage?: number;
    shipEcoFriendly?: boolean;
    shipImoNumber?: string;
    freightRate: number;
    demurrageRate?: number;
    despatchRate?: number;
    estimatedLoadingDate: string;
    estimatedDeliveryDate: string;
    terms?: string;
    notes?: string;
    status: OfferStatus;
    insuranceAccepted: boolean;
    ecoFriendly: boolean;
    commissionRate: number;
    commissionAmount?: number;
    totalAmount?: number;
    validUntil: string;
    validOffer?: boolean;
    acceptedAt?: string;
    rejectedAt?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface BrokerOfferRequest {
    loadId: string;
    brokerProfileId: string;
    shipId: string;
    freightRate: number;
    demurrageRate?: number;
    despatchRate?: number;
    estimatedLoadingDate: string;
    estimatedDeliveryDate: string;
    terms?: string;
    notes?: string;
    insuranceAccepted: boolean;
    ecoFriendly: boolean;
    commissionRate: number;
    validUntil: string;
}

export type BrokerProfileRequest = {
    userId: string;
    company: boolean;
    companyName: string;
    taxNumber?: string;
    iban: string;
    specializations: string[];
    certificates: string[];
    licenseNumber?: string;
    commissionRate: number;
};

export type BrokerProfileUpdateRequest = {
    company?: boolean;
    companyName?: string;
    taxNumber?: string;
    iban?: string;
    specializations?: string[];
    certificates?: string[];
    licenseNumber?: string;
    commissionRate?: number;
};

export type Deal = {
    id: string;
    loadId: string;
    brokerId: string;
    senderId: string;
    carrierId: string;
    price: number;
    commission: number;
    isEcoFriendly: boolean;
    status: DealStatus;
    createdAt?: string;
    updatedAt?: string;
};

export enum DealStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export type DealRequest = {
    loadId: string;
    brokerId: string;
    senderId: string;
    carrierId: string;
    price: number;
    commission: number;
    isEcoFriendly: boolean;
};

export type DealUpdateRequest = {
    price?: number;
    commission?: number;
    status?: DealStatus;
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

const brokerService = {
    // Broker profil işlemleri
    // ----------------------

    // Yeni broker profili oluşturur
    createBrokerProfile: async (profileData: BrokerProfileRequest): Promise<BrokerProfile> => {
        try {
            return await apiService.post<BrokerProfile, BrokerProfileRequest>('/broker-profiles', profileData);
        } catch (error) {
            console.error('Create broker profile error:', error);
            throw error;
        }
    },

    // Belirli bir broker profilini ID'ye göre getirir
    getBrokerProfileById: async (id: string): Promise<BrokerProfile> => {
        try {
            return await apiService.get<BrokerProfile>(`/broker-profiles/${id}`);
        } catch (error) {
            console.error(`Get broker profile by ID (${id}) error:`, error);
            throw error;
        }
    },

    // Kullanıcı ID'sine göre broker profilini getirir
    getBrokerProfileByUserId: async (userId: string): Promise<BrokerProfile> => {
        try {
            return await apiService.get<BrokerProfile>(`/broker-profiles/user/${userId}`);
        } catch (error) {
            console.error(`Get broker profile by user ID (${userId}) error:`, error);
            throw error;
        }
    },

    // E-posta'ya göre broker profilini getirir
    getBrokerProfileByEmail: async (email: string): Promise<BrokerProfile> => {
        try {
            return await apiService.get<BrokerProfile>(`/broker-profiles/email/${email}`);
        } catch (error) {
            console.error(`Get broker profile by email (${email}) error:`, error);
            throw error;
        }
    },

    // Tüm broker profillerini getirir
    getAllBrokerProfiles: async (): Promise<BrokerProfile[]> => {
        try {
            return await apiService.get<BrokerProfile[]>('/broker-profiles');
        } catch (error) {
            console.error('Get all broker profiles error:', error);
            throw error;
        }
    },

    // Sayfalandırılmış broker profillerini getirir
    getAllBrokerProfilesPaginated: async (
        page: number = 0,
        size: number = 20,
        sortBy?: string,
        sortDirection?: 'asc' | 'desc'
    ): Promise<PageResponse<BrokerProfile>> => {
        try {
            const params: Record<string, any> = { page, size };
            if (sortBy) params.sortBy = sortBy;
            if (sortDirection) params.sortDirection = sortDirection;

            return await apiService.get<PageResponse<BrokerProfile>>('/broker-profiles/paginated', params);
        } catch (error) {
            console.error('Get paginated broker profiles error:', error);
            throw error;
        }
    },

    // Şirket durumuna göre broker profillerini getirir (şirket veya bireysel)
    getBrokerProfilesByCompanyStatus: async (isCompany: boolean): Promise<BrokerProfile[]> => {
        try {
            return await apiService.get<BrokerProfile[]>('/broker-profiles/company-status', { isCompany });
        } catch (error) {
            console.error(`Get broker profiles by company status (${isCompany}) error:`, error);
            throw error;
        }
    },

    // Uzmanlık alanına göre broker profillerini getirir
    getBrokerProfilesBySpecialization: async (specialization: string): Promise<BrokerProfile[]> => {
        try {
            return await apiService.get<BrokerProfile[]>('/broker-profiles/specialization', { specialization });
        } catch (error) {
            console.error(`Get broker profiles by specialization (${specialization}) error:`, error);
            throw error;
        }
    },

    // En çok anlaşma yapan brokerleri getirir
    getTopBrokersByFacilitatedDeals: async (limit: number = 10): Promise<BrokerProfile[]> => {
        try {
            return await apiService.get<BrokerProfile[]>('/broker-profiles/top-by-deals', { limit });
        } catch (error) {
            console.error(`Get top brokers by facilitated deals (limit: ${limit}) error:`, error);
            throw error;
        }
    },

    // En çok çevre dostu anlaşma yapan brokerleri getirir
    getTopBrokersByEcoFriendlyDeals: async (limit: number = 10): Promise<BrokerProfile[]> => {
        try {
            return await apiService.get<BrokerProfile[]>('/broker-profiles/top-by-eco-deals', { limit });
        } catch (error) {
            console.error(`Get top brokers by eco-friendly deals (limit: ${limit}) error:`, error);
            throw error;
        }
    },

    // Broker profilini günceller
    updateBrokerProfile: async (id: string, profileData: BrokerProfileUpdateRequest): Promise<BrokerProfile> => {
        try {
            return await apiService.put<BrokerProfile, BrokerProfileUpdateRequest>(`/broker-profiles/${id}`, profileData);
        } catch (error) {
            console.error(`Update broker profile (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Broker profilini siler
    deleteBrokerProfile: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/broker-profiles/${id}`);
        } catch (error) {
            console.error(`Delete broker profile (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Mevcut kullanıcının broker profilini getirir
    getCurrentBrokerProfile: async (): Promise<BrokerProfile> => {
        try {
            return await apiService.get<BrokerProfile>('/broker-profiles/me');
        } catch (error) {
            console.error('Get current broker profile error:', error);
            throw error;
        }
    },

    // Anlaşma sayısını artırır
    incrementFacilitatedDeals: async (id: string): Promise<void> => {
        try {
            await apiService.post(`/broker-profiles/${id}/increment-deal`, {});
        } catch (error) {
            console.error(`Increment facilitated deals error:`, error);
            throw error;
        }
    },

    // Çevre dostu anlaşma sayısını artırır
    incrementEcoFriendlyDeals: async (id: string): Promise<void> => {
        try {
            await apiService.post(`/broker-profiles/${id}/increment-eco-deal`, {});
        } catch (error) {
            console.error(`Increment eco-friendly deals error:`, error);
            throw error;
        }
    },

    // Anlaşma (Deal) işlemleri
    // ----------------------

    // Yeni anlaşma oluşturur
    createDeal: async (dealData: DealRequest): Promise<Deal> => {
        try {
            return await apiService.post<Deal, DealRequest>('/deals', dealData);
        } catch (error) {
            console.error('Create deal error:', error);
            throw error;
        }
    },

    // Belirli bir anlaşmayı ID'ye göre getirir
    getDealById: async (id: string): Promise<Deal> => {
        try {
            return await apiService.get<Deal>(`/deals/${id}`);
        } catch (error) {
            console.error(`Get deal by ID (${id}) error:`, error);
            throw error;
        }
    },

    // Tüm anlaşmaları getirir
    getAllDeals: async (): Promise<Deal[]> => {
        try {
            return await apiService.get<Deal[]>('/deals');
        } catch (error) {
            console.error('Get all deals error:', error);
            throw error;
        }
    },

    // Broker ID'sine göre anlaşmaları getirir
    getDealsByBroker: async (brokerId: string): Promise<Deal[]> => {
        try {
            return await apiService.get<Deal[]>(`/deals/broker/${brokerId}`);
        } catch (error) {
            console.error(`Get deals by broker (${brokerId}) error:`, error);
            throw error;
        }
    },

    // Durum filtresine göre anlaşmaları getirir
    getDealsByStatus: async (status: DealStatus): Promise<Deal[]> => {
        try {
            return await apiService.get<Deal[]>(`/deals/status/${status}`);
        } catch (error) {
            console.error(`Get deals by status (${status}) error:`, error);
            throw error;
        }
    },

    // Çevre dostu durumuna göre anlaşmaları getirir
    getEcoFriendlyDeals: async (isEcoFriendly: boolean): Promise<Deal[]> => {
        try {
            return await apiService.get<Deal[]>('/deals/eco-friendly', { isEcoFriendly });
        } catch (error) {
            console.error(`Get eco-friendly deals (${isEcoFriendly}) error:`, error);
            throw error;
        }
    },

    // Mevcut kullanıcının anlaşmalarını getirir
    getCurrentBrokerDeals: async (status?: DealStatus): Promise<Deal[]> => {
        try {
            const params: Record<string, any> = {};
            if (status) params.status = status;

            return await apiService.get<Deal[]>('/deals/my-deals', params);
        } catch (error) {
            console.error('Get current broker deals error:', error);
            throw error;
        }
    },

    // Anlaşma bilgilerini günceller
    updateDeal: async (id: string, dealData: DealUpdateRequest): Promise<Deal> => {
        try {
            return await apiService.put<Deal, DealUpdateRequest>(`/deals/${id}`, dealData);
        } catch (error) {
            console.error(`Update deal (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Anlaşma durumunu günceller
    updateDealStatus: async (id: string, status: DealStatus): Promise<Deal> => {
        try {
            return await apiService.patch<Deal>(`/deals/${id}/status`, { status });
        } catch (error) {
            console.error(`Update deal status (ID: ${id}, status: ${status}) error:`, error);
            throw error;
        }
    },

    // Anlaşmayı siler
    deleteDeal: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/deals/${id}`);
        } catch (error) {
            console.error(`Delete deal (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // İstatistikler ve rapor işlemleri
    // ----------------------

    // Broker istatistiklerini getirir
    getBrokerStatistics: async (brokerId?: string): Promise<{
        totalDeals: number;
        activeDeals: number;
        completedDeals: number;
        totalCommission: number;
        pendingCommission: number;
        ecoFriendlyDeals: number;
        ecoFriendlyRatio: number;
    }> => {
        try {
            const params: Record<string, any> = {};
            if (brokerId) params.brokerId = brokerId;

            return await apiService.get('/broker-statistics', params);
        } catch (error) {
            console.error('Get broker statistics error:', error);
            throw error;
        }
    },

    // En iyi taşıyıcıları getirir
    getTopCarriers: async (limit: number = 5): Promise<any[]> => {
        try {
            return await apiService.get('/broker-statistics/top-carriers', { limit });
        } catch (error) {
            console.error(`Get top carriers (limit: ${limit}) error:`, error);
            throw error;
        }
    },

    // En iyi göndericileri getirir
    getTopSenders: async (limit: number = 5): Promise<any[]> => {
        try {
            return await apiService.get('/broker-statistics/top-senders', { limit });
        } catch (error) {
            console.error(`Get top senders (limit: ${limit}) error:`, error);
            throw error;
        }
    },

    // Broker offers için gerekli metodlar:
    getOffersByBrokerPaginated: async (
        brokerProfileId: string,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<BrokerOfferResponse>> => {
        try {
            return await apiService.get<PageResponse<BrokerOfferResponse>>(`/broker-offers/broker/${brokerProfileId}/paginated`, { page, size });
        } catch (error) {
            console.error(`Get paginated offers by broker (${brokerProfileId}) error:`, error);
            throw error;
        }
    },

    getOffersByBrokerAndStatus: async (brokerProfileId: string, status: OfferStatus): Promise<BrokerOfferResponse[]> => {
        try {
            return await apiService.get<BrokerOfferResponse[]>(`/broker-offers/broker/${brokerProfileId}/status`, { status });
        } catch (error) {
            console.error(`Get offers by broker and status error:`, error);
            throw error;
        }
    },

    // Broker Offer işlemleri
    createBrokerOffer: async (offerData: BrokerOfferRequest): Promise<BrokerOfferResponse> => {
        try {
            return await apiService.post<BrokerOfferResponse, BrokerOfferRequest>('/broker-offers', offerData);
        } catch (error) {
            console.error('Create broker offer error:', error);
            throw error;
        }
    },

// Broker'ın tekliflerini getir
    getOffersByBroker: async (brokerProfileId: string): Promise<BrokerOfferResponse[]> => {
        try {
            return await apiService.get<BrokerOfferResponse[]>(`/broker-offers/broker/${brokerProfileId}`);
        } catch (error) {
            console.error(`Get offers by broker (${brokerProfileId}) error:`, error);
            throw error;
        }
    },

// Teklif detayını getir
    getBrokerOfferById: async (offerId: string): Promise<BrokerOfferResponse> => {
        try {
            return await apiService.get<BrokerOfferResponse>(`/broker-offers/${offerId}`);
        } catch (error) {
            console.error(`Get broker offer by ID (${offerId}) error:`, error);
            throw error;
        }
    },
};

export default brokerService;