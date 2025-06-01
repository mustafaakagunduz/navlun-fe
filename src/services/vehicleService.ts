// src/services/vehicleService.ts
import apiService from '@/services/apiService';

// Tip tanımlamaları
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

const vehicleService = {
    // Yeni araç oluşturur
    createVehicle: async (vehicleData: VehicleRequest): Promise<Vehicle> => {
        try {
            return await apiService.post<Vehicle, VehicleRequest>('/vehicles', vehicleData);
        } catch (error) {
            console.error('Create vehicle error:', error);
            throw error;
        }
    },

    // Belirli bir aracı ID'ye göre getirir
    getVehicleById: async (id: string): Promise<Vehicle> => {
        try {
            return await apiService.get<Vehicle>(`/vehicles/${id}`);
        } catch (error) {
            console.error(`Get vehicle by ID (${id}) error:`, error);
            throw error;
        }
    },

    // Plaka numarasına göre araç getirir
    getVehicleByPlateNumber: async (plateNumber: string): Promise<Vehicle> => {
        try {
            return await apiService.get<Vehicle>(`/vehicles/plate/${plateNumber}`);
        } catch (error) {
            console.error(`Get vehicle by plate number (${plateNumber}) error:`, error);
            throw error;
        }
    },

    // Tüm araçları getirir
    getAllVehicles: async (): Promise<Vehicle[]> => {
        try {
            return await apiService.get<Vehicle[]>('/vehicles');
        } catch (error) {
            console.error('Get all vehicles error:', error);
            throw error;
        }
    },

    // Sayfalandırılmış araçları getirir
    getAllVehiclesPaginated: async (
        page: number = 0,
        size: number = 20,
        sortBy?: string,
        sortDirection?: 'asc' | 'desc'
    ): Promise<PageResponse<Vehicle>> => {
        try {
            const params: Record<string, any> = { page, size };
            if (sortBy) params.sortBy = sortBy;
            if (sortDirection) params.sortDirection = sortDirection;

            return await apiService.get<PageResponse<Vehicle>>('/vehicles/paginated', params);
        } catch (error) {
            console.error('Get paginated vehicles error:', error);
            throw error;
        }
    },

    // Taşıyıcı ID'sine göre araçları getirir
    getVehiclesByCarrier: async (carrierId: string): Promise<Vehicle[]> => {
        try {
            return await apiService.get<Vehicle[]>(`/vehicles/carrier/${carrierId}`);
        } catch (error) {
            console.error(`Get vehicles by carrier (${carrierId}) error:`, error);
            throw error;
        }
    },

    // Taşıyıcı ID'sine göre sayfalandırılmış araçları getirir
    getVehiclesByCarrierPaginated: async (
        carrierId: string,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<Vehicle>> => {
        try {
            return await apiService.get<PageResponse<Vehicle>>(
                `/vehicles/carrier/${carrierId}/paginated`,
                { page, size }
            );
        } catch (error) {
            console.error(`Get paginated vehicles by carrier (${carrierId}) error:`, error);
            throw error;
        }
    },

    // Araç tipine göre araçları getirir
    getVehiclesByType: async (type: string): Promise<Vehicle[]> => {
        try {
            return await apiService.get<Vehicle[]>(`/vehicles/type/${type}`);
        } catch (error) {
            console.error(`Get vehicles by type (${type}) error:`, error);
            throw error;
        }
    },

    // Araç tipine göre sayfalandırılmış araçları getirir
    getVehiclesByTypePaginated: async (
        type: string,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<Vehicle>> => {
        try {
            return await apiService.get<PageResponse<Vehicle>>(
                `/vehicles/type/${type}/paginated`,
                { page, size }
            );
        } catch (error) {
            console.error(`Get paginated vehicles by type (${type}) error:`, error);
            throw error;
        }
    },

    // Çevre dostu sertifika durumuna göre araçları getirir
    getVehiclesByEcoCertified: async (ecoCertified: boolean): Promise<Vehicle[]> => {
        try {
            return await apiService.get<Vehicle[]>('/vehicles/eco-certified', { ecoCertified });
        } catch (error) {
            console.error(`Get vehicles by eco-certified (${ecoCertified}) error:`, error);
            throw error;
        }
    },

    // Çevre dostu sertifika durumuna göre sayfalandırılmış araçları getirir
    getVehiclesByEcoCertifiedPaginated: async (
        ecoCertified: boolean,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<Vehicle>> => {
        try {
            return await apiService.get<PageResponse<Vehicle>>(
                '/vehicles/eco-certified/paginated',
                { ecoCertified, page, size }
            );
        } catch (error) {
            console.error(`Get paginated vehicles by eco-certified (${ecoCertified}) error:`, error);
            throw error;
        }
    },

    // Bu metodları dosyanın sonuna, son } 'den önce ekle

    // Teklif verme için uygun araçları getirir (sadece aktif ve sigortalı)
    getVehiclesForOffers: async (): Promise<Vehicle[]> => {
        try {
            const vehicles = await vehicleService.getCurrentUserVehicles();

            // Sadece aktif, sigortalı ve muayenesi geçerli araçları filtrele
            return vehicles.filter(vehicle =>
                vehicle.active &&
                vehicle.insuranceStatus &&
                new Date(vehicle.inspectionDate) > new Date()
            );
        } catch (error) {
            console.error('Get vehicles for offers error:', error);
            throw error;
        }
    },

    // Araç için taşıma kapasitesi uygunluğunu kontrol eder
    checkVehicleCapacityForLoad: (vehicle: Vehicle, loadWeight: number): {
        suitable: boolean;
        capacityUsage: number;
        recommendation: string;
    } => {
        const capacityUsage = (loadWeight / 1000) / vehicle.carryingCapacity; // kg'ı ton'a çevir

        if (capacityUsage > 1) {
            return {
                suitable: false,
                capacityUsage: capacityUsage * 100,
                recommendation: 'Araç kapasitesi yetersiz! Daha yüksek kapasiteli araç seçin.'
            };
        } else if (capacityUsage > 0.9) {
            return {
                suitable: true,
                capacityUsage: capacityUsage * 100,
                recommendation: 'Kapasite %90\'ın üzerinde kullanılacak. Dikkatli olun.'
            };
        } else if (capacityUsage > 0.7) {
            return {
                suitable: true,
                capacityUsage: capacityUsage * 100,
                recommendation: 'Uygun kapasite kullanımı.'
            };
        } else {
            return {
                suitable: true,
                capacityUsage: capacityUsage * 100,
                recommendation: 'Kapasiteye göre hafif yük. Ek yük alabilirsiniz.'
            };
        }
    },

    // Araç için çevreci avantajları hesaplar
    calculateEcoAdvantages: (vehicle: Vehicle): {
        isEcoFriendly: boolean;
        benefits: string[];
        carbonReduction: number;
    } => {
        const benefits: string[] = [];
        let carbonReduction = 0;

        if (vehicle.ecoCertified) {
            benefits.push('Çevreci sertifikalı araç');
            benefits.push('Düşük emisyon değerleri');
            benefits.push('Yakıt tasarrufu sağlar');
            carbonReduction = 15; // %15 karbon azalımı
        }

        return {
            isEcoFriendly: vehicle.ecoCertified,
            benefits,
            carbonReduction
        };
    },

    // Araç seçimi için öneri sistemi
    recommendVehicleForLoad: (
        vehicles: Vehicle[],
        loadWeight: number,
        preferEco: boolean = false
    ): {
        recommended: Vehicle | null;
        alternatives: Vehicle[];
        reason: string;
    } => {
        // Uygun araçları filtrele
        const suitableVehicles = vehicles.filter(vehicle => {
            const capacity = vehicleService.checkVehicleCapacityForLoad(vehicle, loadWeight);
            return capacity.suitable;
        });

        if (suitableVehicles.length === 0) {
            return {
                recommended: null,
                alternatives: [],
                reason: 'Hiçbir araç bu yük için uygun değil.'
            };
        }

        let recommended: Vehicle;
        let reason: string;

        if (preferEco) {
            // Çevreci araçları öncelikle
            const ecoVehicles = suitableVehicles.filter(v => v.ecoCertified);
            if (ecoVehicles.length > 0) {
                recommended = ecoVehicles[0];
                reason = 'Çevre dostu tercih nedeniyle seçildi';
            } else {
                recommended = suitableVehicles[0];
                reason = 'Çevreci araç bulunamadı, en uygun araç seçildi';
            }
        } else {
            // En uygun kapasiteye sahip aracı seç
            recommended = suitableVehicles.reduce((best, current) => {
                const bestCapacity = vehicleService.checkVehicleCapacityForLoad(best, loadWeight);
                const currentCapacity = vehicleService.checkVehicleCapacityForLoad(current, loadWeight);

                // %70-90 arası kullanım en ideal
                const bestScore = Math.abs(bestCapacity.capacityUsage - 80);
                const currentScore = Math.abs(currentCapacity.capacityUsage - 80);

                return currentScore < bestScore ? current : best;
            });
            reason = 'Kapasite kullanımına göre en uygun araç';
        }

        const alternatives = suitableVehicles.filter(v => v.id !== recommended.id);

        return {
            recommended,
            alternatives,
            reason
        };
    },

    // Aktif durumuna göre araçları getirir
    getVehiclesByActiveStatus: async (isActive: boolean): Promise<Vehicle[]> => {
        try {
            return await apiService.get<Vehicle[]>('/vehicles/active', { isActive });
        } catch (error) {
            console.error(`Get vehicles by active status (${isActive}) error:`, error);
            throw error;
        }
    },

    // Aktif durumuna göre sayfalandırılmış araçları getirir
    getVehiclesByActiveStatusPaginated: async (
        isActive: boolean,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<Vehicle>> => {
        try {
            return await apiService.get<PageResponse<Vehicle>>(
                '/vehicles/active/paginated',
                { isActive, page, size }
            );
        } catch (error) {
            console.error(`Get paginated vehicles by active status (${isActive}) error:`, error);
            throw error;
        }
    },

    // Muayenesi geçmiş araçları getirir
    getVehiclesWithExpiredInspection: async (): Promise<Vehicle[]> => {
        try {
            return await apiService.get<Vehicle[]>('/vehicles/expired-inspection');
        } catch (error) {
            console.error('Get vehicles with expired inspection error:', error);
            throw error;
        }
    },

    // Belirli bir tarihten önce muayenesi dolacak araçları getirir
    getVehiclesWithInspectionExpiringBefore: async (date: string): Promise<Vehicle[]> => {
        try {
            return await apiService.get<Vehicle[]>('/vehicles/inspection-expires-before', { date });
        } catch (error) {
            console.error(`Get vehicles with inspection expiring before (${date}) error:`, error);
            throw error;
        }
    },

    // Sürücü adına göre araçları getirir
    getVehiclesByDriverName: async (driverName: string): Promise<Vehicle[]> => {
        try {
            return await apiService.get<Vehicle[]>('/vehicles/driver', { driverName });
        } catch (error) {
            console.error(`Get vehicles by driver name (${driverName}) error:`, error);
            throw error;
        }
    },

    // Taşıma kapasitesi aralığına göre araçları getirir
    getVehiclesByCarryingCapacityRange: async (
        minCapacity: number,
        maxCapacity: number
    ): Promise<Vehicle[]> => {
        try {
            return await apiService.get<Vehicle[]>(
                '/vehicles/capacity-range',
                { minCapacity, maxCapacity }
            );
        } catch (error) {
            console.error(`Get vehicles by carrying capacity range error:`, error);
            throw error;
        }
    },

    // Gelişmiş arama
    advancedSearch: async (params: {
        type?: string;
        ecoCertified?: boolean;
        isActive?: boolean;
        minCapacity?: number;
        maxCapacity?: number;
        driverName?: string;
        page?: number;
        size?: number;
    }): Promise<PageResponse<Vehicle>> => {
        try {
            return await apiService.get<PageResponse<Vehicle>>('/vehicles/search', params);
        } catch (error) {
            console.error('Advanced vehicle search error:', error);
            throw error;
        }
    },

    // Taşıyıcıya ait araç sayısını getirir
    countVehiclesByCarrier: async (carrierId: string): Promise<number> => {
        try {
            return await apiService.get<number>(`/vehicles/count/carrier/${carrierId}`);
        } catch (error) {
            console.error(`Count vehicles by carrier (${carrierId}) error:`, error);
            throw error;
        }
    },

    // Taşıyıcıya ait aktif ve çevre dostu araç sayısını getirir
    countActiveEcoCertifiedVehiclesByCarrier: async (carrierId: string): Promise<number> => {
        try {
            return await apiService.get<number>(`/vehicles/count/carrier/${carrierId}/eco-certified`);
        } catch (error) {
            console.error(`Count active eco-certified vehicles by carrier (${carrierId}) error:`, error);
            throw error;
        }
    },

    // Plaka numarasının sistemde kayıtlı olup olmadığını kontrol eder
    isPlateNumberExists: async (plateNumber: string): Promise<boolean> => {
        try {
            return await apiService.get<boolean>(`/vehicles/check-plate/${plateNumber}`);
        } catch (error) {
            console.error(`Check plate number exists (${plateNumber}) error:`, error);
            throw error;
        }
    },

    // Araç bilgilerini günceller
    updateVehicle: async (id: string, vehicleData: VehicleUpdateRequest): Promise<Vehicle> => {
        try {
            return await apiService.put<Vehicle, VehicleUpdateRequest>(`/vehicles/${id}`, vehicleData);
        } catch (error) {
            console.error(`Update vehicle (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Aracı deaktif eder
    deactivateVehicle: async (id: string): Promise<void> => {
        try {
            await apiService.patch(`/vehicles/${id}/deactivate`, {});
        } catch (error) {
            console.error(`Deactivate vehicle (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Aracı aktif eder
    activateVehicle: async (id: string): Promise<void> => {
        try {
            await apiService.patch(`/vehicles/${id}/activate`, {});
        } catch (error) {
            console.error(`Activate vehicle (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Aracı siler
    deleteVehicle: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/vehicles/${id}`);
        } catch (error) {
            console.error(`Delete vehicle (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Araca doküman ekler
    addDocumentToVehicle: async (id: string, documentUrl: string): Promise<void> => {
        try {
            await apiService.post(`/vehicles/${id}/documents`, { documentUrl });
        } catch (error) {
            console.error(`Add document to vehicle (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Araçtan doküman kaldırır
    removeDocumentFromVehicle: async (id: string, documentUrl: string): Promise<void> => {
        try {
            // documentUrl'i query parameter olarak gönder
            await apiService.delete(`/vehicles/${id}/documents?documentUrl=${encodeURIComponent(documentUrl)}`);
        } catch (error) {
            console.error(`Remove document from vehicle (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Mevcut kullanıcının (taşıyıcı) araçlarını getirir
    getCurrentUserVehicles: async (): Promise<Vehicle[]> => {
        try {
            return await apiService.get<Vehicle[]>('/vehicles/my-vehicles');
        } catch (error) {
            console.error('Get current user vehicles error:', error);
            throw error;
        }
    },

    // Dosya yükleme işlemi (belge, ruhsat vs.)
    uploadVehicleDocument: async (file: File): Promise<string> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiService.uploadFile<{ fileUrl: string }>('/files/upload', formData);
            return response.fileUrl;
        } catch (error) {
            console.error('Vehicle document upload error:', error);
            throw error;
        }
    }
};

export default vehicleService;