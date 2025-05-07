// src/services/carrierService.ts
import apiService from '@/services/apiService';

// Tip tanımlamaları
export type CarrierProfile = {
    id: string;
    userId: string;
    company: boolean;
    name: string;
    taxNumber?: string;
    iban: string;
    isEcoFriendly: boolean;
    driverLicense?: string;
    averageRating?: number;
    completedDeliveries: number;
    createdAt?: string;
    updatedAt?: string;
};

export type CarrierProfileRequest = {
    userId: string;
    company: boolean;
    name: string;
    taxNumber?: string;
    iban: string;
    isEcoFriendly: boolean;
    driverLicense?: string;
};

export type CarrierProfileUpdateRequest = {
    company?: boolean;
    name?: string;
    taxNumber?: string;
    iban?: string;
    isEcoFriendly?: boolean;
    driverLicense?: string;
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

const carrierService = {
    // Tüm taşıyıcı profillerini getirir
    getAllCarrierProfiles: async (): Promise<CarrierProfile[]> => {
        try {
            return await apiService.get<CarrierProfile[]>('/carrier-profiles');
        } catch (error) {
            console.error('Get all carrier profiles error:', error);
            throw error;
        }
    },

    // Belirli bir taşıyıcı profilini ID'ye göre getirir
    getCarrierProfileById: async (id: string): Promise<CarrierProfile> => {
        try {
            return await apiService.get<CarrierProfile>(`/carrier-profiles/${id}`);
        } catch (error) {
            console.error(`Get carrier profile by ID (${id}) error:`, error);
            throw error;
        }
    },

    // Kullanıcı ID'sine göre taşıyıcı profilini getirir
    getCarrierProfileByUserId: async (userId: string): Promise<CarrierProfile> => {
        try {
            return await apiService.get<CarrierProfile>(`/carrier-profiles/user/${userId}`);
        } catch (error) {
            console.error(`Get carrier profile by user ID (${userId}) error:`, error);
            throw error;
        }
    },

    // Yeni taşıyıcı profili oluşturur
    createCarrierProfile: async (profileData: CarrierProfileRequest): Promise<CarrierProfile> => {
        try {
            return await apiService.post<CarrierProfile, CarrierProfileRequest>('/carrier-profiles', profileData);
        } catch (error) {
            console.error('Create carrier profile error:', error);
            throw error;
        }
    },

    // Taşıyıcı profilini günceller
    updateCarrierProfile: async (id: string, profileData: CarrierProfileUpdateRequest): Promise<CarrierProfile> => {
        try {
            return await apiService.put<CarrierProfile, CarrierProfileUpdateRequest>(`/carrier-profiles/${id}`, profileData);
        } catch (error) {
            console.error(`Update carrier profile (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Taşıyıcı profilini siler
    deleteCarrierProfile: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/carrier-profiles/${id}`);
        } catch (error) {
            console.error(`Delete carrier profile (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Mevcut kullanıcının taşıyıcı profilini getirir
    getCurrentCarrierProfile: async (): Promise<CarrierProfile> => {
        try {
            return await apiService.get<CarrierProfile>('/carrier-profiles/me');
        } catch (error) {
            console.error('Get current carrier profile error:', error);
            throw error;
        }
    },

    // Şirket durumuna göre taşıyıcı profillerini getirir (şirket veya bireysel)
    getCarrierProfilesByCompanyStatus: async (isCompany: boolean): Promise<CarrierProfile[]> => {
        try {
            return await apiService.get<CarrierProfile[]>('/carrier-profiles/company-status', { isCompany });
        } catch (error) {
            console.error(`Get carrier profiles by company status (${isCompany}) error:`, error);
            throw error;
        }
    },

    // Çevre dostu durumuna göre taşıyıcı profillerini getirir
    getCarrierProfilesByEcoFriendlyStatus: async (isEcoFriendly: boolean): Promise<CarrierProfile[]> => {
        try {
            return await apiService.get<CarrierProfile[]>('/carrier-profiles/eco-friendly', { isEcoFriendly });
        } catch (error) {
            console.error(`Get carrier profiles by eco-friendly status (${isEcoFriendly}) error:`, error);
            throw error;
        }
    },

    // Deneyimli taşıyıcıları getirir (belirli bir teslimat sayısının üzerinde)
    getExperiencedCarriers: async (minDeliveries: number): Promise<CarrierProfile[]> => {
        try {
            return await apiService.get<CarrierProfile[]>('/carrier-profiles/experienced', { minDeliveries });
        } catch (error) {
            console.error(`Get experienced carriers (min: ${minDeliveries}) error:`, error);
            throw error;
        }
    },

    // En iyi derecelendirmeye sahip çevre dostu taşıyıcıları getirir
    getTopEcoFriendlyCarriers: async (minRating: number): Promise<CarrierProfile[]> => {
        try {
            return await apiService.get<CarrierProfile[]>('/carrier-profiles/top-eco-friendly', { minRating });
        } catch (error) {
            console.error(`Get top eco-friendly carriers (min rating: ${minRating}) error:`, error);
            throw error;
        }
    },

    // Taşıyıcı istatistiklerini getirir
    getCarrierStatistics: async (carrierId: string): Promise<{
        completedDeliveries: number;
        pendingDeliveries: number;
        averageRating: number;
        totalDistance: number;
        totalEarnings: number;
        ecoFriendlyRatio: number;
    }> => {
        try {
            return await apiService.get<{
                completedDeliveries: number;
                pendingDeliveries: number;
                averageRating: number;
                totalDistance: number;
                totalEarnings: number;
                ecoFriendlyRatio: number;
            }>(`/carrier-profiles/${carrierId}/statistics`);
        } catch (error) {
            console.error(`Get carrier statistics (ID: ${carrierId}) error:`, error);
            throw error;
        }
    },

    // Taşıyıcının derecelendirmesini günceller
    updateCarrierRating: async (carrierId: string, rating: number): Promise<void> => {
        try {
            await apiService.post(`/carrier-profiles/${carrierId}/ratings`, { rating });
        } catch (error) {
            console.error(`Update carrier rating (ID: ${carrierId}) error:`, error);
            throw error;
        }
    },

    // Belirli kriterlere göre taşıyıcı arama
    searchCarriers: async (params: {
        name?: string;
        isCompany?: boolean;
        isEcoFriendly?: boolean;
        minRating?: number;
        minDeliveries?: number;
        page?: number;
        size?: number;
    }): Promise<PageResponse<CarrierProfile>> => {
        try {
            return await apiService.get<PageResponse<CarrierProfile>>('/carrier-profiles/search', params);
        } catch (error) {
            console.error('Search carriers error:', error);
            throw error;
        }
    }
};

export default carrierService;