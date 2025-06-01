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

export type Vehicle = {
    id: string;
    plateNumber: string;
    type: string;
    ecoCertified: boolean;
    insuranceStatus: boolean;
    inspectionDate: string;
    driverName: string;
    carryingCapacity: number;
    active: boolean;
    documents: string[];
    carrierId: string;
    createdAt?: string;
    updatedAt?: string;
};

export type VehicleRequest = {
    plateNumber: string;
    type: string;
    ecoCertified: boolean;
    insuranceStatus: boolean;
    inspectionDate: string;
    driverName: string;
    carryingCapacity: number;
    carrierId: string;
    documents?: string[];
    active?: boolean;
};

export type VehicleUpdateRequest = {
    type?: string;
    ecoCertified?: boolean;
    insuranceStatus?: boolean;
    inspectionDate?: string;
    driverName?: string;
    carryingCapacity?: number;
    active?: boolean;
    documents?: string[];
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
    // Carrier Profile CRUD Operations

    /**
     * Tüm taşıyıcı profillerini getirir
     */
    getAllCarrierProfiles: async (): Promise<CarrierProfile[]> => {
        try {
            return await apiService.get<CarrierProfile[]>('/carrier-profiles');
        } catch (error) {
            console.error('Get all carrier profiles error:', error);
            throw error;
        }
    },

    /**
     * Belirli bir taşıyıcı profilini ID'ye göre getirir
     */
    getCarrierProfileById: async (id: string): Promise<CarrierProfile> => {
        try {
            return await apiService.get<CarrierProfile>(`/carrier-profiles/${id}`);
        } catch (error) {
            console.error(`Get carrier profile by ID (${id}) error:`, error);
            throw error;
        }
    },

    /**
     * Kullanıcı ID'sine göre taşıyıcı profilini getirir
     */
    getCarrierProfileByUserId: async (userId: string): Promise<CarrierProfile> => {
        try {
            return await apiService.get<CarrierProfile>(`/carrier-profiles/user/${userId}`);
        } catch (error) {
            console.error(`Get carrier profile by user ID (${userId}) error:`, error);
            throw error;
        }
    },

    /**
     * Yeni taşıyıcı profili oluşturur
     */
    createCarrierProfile: async (profileData: CarrierProfileRequest): Promise<CarrierProfile> => {
        try {
            return await apiService.post<CarrierProfile, CarrierProfileRequest>('/carrier-profiles', profileData);
        } catch (error) {
            console.error('Create carrier profile error:', error);
            throw error;
        }
    },

    /**
     * Taşıyıcı profilini günceller
     */
    updateCarrierProfile: async (id: string, profileData: CarrierProfileUpdateRequest): Promise<CarrierProfile> => {
        try {
            return await apiService.put<CarrierProfile, CarrierProfileUpdateRequest>(`/carrier-profiles/${id}`, profileData);
        } catch (error) {
            console.error(`Update carrier profile (ID: ${id}) error:`, error);
            throw error;
        }
    },

    /**
     * Taşıyıcı profilini siler
     */
    deleteCarrierProfile: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/carrier-profiles/${id}`);
        } catch (error) {
            console.error(`Delete carrier profile (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Vehicle CRUD Operations

    /**
     * Yeni araç oluşturur
     */
    createVehicle: async (vehicleData: VehicleRequest): Promise<Vehicle> => {
        try {
            return await apiService.post<Vehicle, VehicleRequest>('/vehicles', vehicleData);
        } catch (error) {
            console.error('Create vehicle error:', error);
            throw error;
        }
    },

    /**
     * Belirli bir aracı ID'ye göre getirir
     */
    getVehicleById: async (id: string): Promise<Vehicle> => {
        try {
            return await apiService.get<Vehicle>(`/vehicles/${id}`);
        } catch (error) {
            console.error(`Get vehicle by ID (${id}) error:`, error);
            throw error;
        }
    },

    /**
     * Taşıyıcı ID'sine göre araçları getirir
     */
    getVehiclesByCarrier: async (carrierId: string): Promise<Vehicle[]> => {
        try {
            return await apiService.get<Vehicle[]>(`/vehicles/carrier/${carrierId}`);
        } catch (error) {
            console.error(`Get vehicles by carrier (${carrierId}) error:`, error);
            throw error;
        }
    },

    /**
     * Araç bilgilerini günceller
     */
    updateVehicle: async (id: string, vehicleData: VehicleUpdateRequest): Promise<Vehicle> => {
        try {
            return await apiService.put<Vehicle, VehicleUpdateRequest>(`/vehicles/${id}`, vehicleData);
        } catch (error) {
            console.error(`Update vehicle (ID: ${id}) error:`, error);
            throw error;
        }
    },

    /**
     * Aracı siler
     */
    deleteVehicle: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/vehicles/${id}`);
        } catch (error) {
            console.error(`Delete vehicle (ID: ${id}) error:`, error);
            throw error;
        }
    },

    /**
     * Plaka numarasının sistemde kayıtlı olup olmadığını kontrol eder
     */
    isPlateNumberExists: async (plateNumber: string): Promise<boolean> => {
        try {
            return await apiService.get<boolean>(`/vehicles/check-plate/${plateNumber}`);
        } catch (error) {
            console.error(`Check plate number exists (${plateNumber}) error:`, error);
            throw error;
        }
    },

    /**
     * Mevcut kullanıcının (taşıyıcı) araçlarını getirir
     */
    getCurrentUserVehicles: async (): Promise<Vehicle[]> => {
        try {
            return await apiService.get<Vehicle[]>('/vehicles/my-vehicles');
        } catch (error) {
            console.error('Get current user vehicles error:', error);
            throw error;
        }
    },

    /**
     * Araç tiplerini getirir (static list)
     */
    getVehicleTypes: (): string[] => {
        return [
            'Tır',
            'Kamyon',
            'Kamyonet',
            'Açık Kasa',
            'Kapalı Kasa',
            'Tenten',
            'Termoking',
            'Soğutucu',
            'Tanker',
            'Konteyner Taşıyıcı',
            'Lowbed',
            'Çekici',
            'Dorse'
        ];
    },

    /**
     * Taşıyıcı istatistiklerini getirir
     */
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

    /**
     * Taşıyıcının derecelendirmesini günceller
     */
    updateCarrierRating: async (carrierId: string, rating: number): Promise<void> => {
        try {
            await apiService.post(`/carrier-profiles/${carrierId}/ratings`, { rating });
        } catch (error) {
            console.error(`Update carrier rating (ID: ${carrierId}) error:`, error);
            throw error;
        }
    },

    /**
     * Belirli kriterlere göre taşıyıcı arama
     */
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