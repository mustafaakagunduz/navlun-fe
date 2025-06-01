// src/services/offerService.ts
import apiService from '@/services/apiService';

// Enum tanımlamaları
export enum OfferStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

// Tip tanımlamaları
export type Offer = {
    id: string;
    loadId: string;
    carrierId: string;
    vehicleId: string;
    price: number;
    insuranceAccepted: boolean;
    isEcoFriendly: boolean;
    status: OfferStatus;
    acceptedAt?: string;
    rejectedAt?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type OfferRequest = {
    loadId: string;
    // carrierId: string; // Bu satırı kaldır veya opsiyonel yap
    vehicleId: string;
    price: number;
    insuranceAccepted: boolean;
    isEcoFriendly: boolean;
};
export type OfferUpdateRequest = {
    price?: number;
    insuranceAccepted?: boolean;
    status?: OfferStatus;
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

export type VehicleInfo = {
    id: string;
    plateNumber: string;
    type: string;
    ecoCertified: boolean;
    carryingCapacity: number;
    driverName: string;
    active: boolean;
};

export type OfferWithVehicleInfo = {
    offerId: string;
    carrierId: string;
    carrierName: string;
    vehicleId: string;
    vehiclePlateNumber: string;
    vehicleType: string;
    vehicleEcoCertified: boolean;
    price: number;
    insuranceAccepted: boolean;
    isEcoFriendly: boolean;
    status: OfferStatus;
    createdAt: string;
};

export type LoadWithOffers = {
    load: any; // Load tipini buraya import edebiliriz
    offers: OfferWithVehicleInfo[];
    pendingOffersCount: number;
    hasAcceptedOffer: boolean;
};

const offerService = {
    // Yeni teklif oluşturur
    createOffer: async (offerData: OfferRequest): Promise<Offer> => {
        try {
            return await apiService.post<Offer, OfferRequest>('/offers', offerData);
        } catch (error) {
            console.error('Create offer error:', error);
            throw error;
        }
    },

    // Belirli bir teklifi ID'ye göre getirir
    getOfferById: async (id: string): Promise<Offer> => {
        try {
            return await apiService.get<Offer>(`/offers/${id}`);
        } catch (error) {
            console.error(`Get offer by ID (${id}) error:`, error);
            throw error;
        }
    },

    // Mevcut kullanıcının araçlarını getirir (teklif verme için)
    getCurrentUserVehicles: async (): Promise<VehicleInfo[]> => {
        try {
            const vehicles = await apiService.get<VehicleInfo[]>('/offers/current-user-vehicles');
            return vehicles;
        } catch (error) {
            console.error('Get current user vehicles for offers error:', error);
            throw error;
        }
    },

    // Araç bilgisi dahil teklif verme
    createOfferWithVehicle: async (offerData: OfferRequest & {
        vehicleInfo?: VehicleInfo
    }): Promise<Offer> => {
        try {
            // Standart teklif verme metodunu kullan, vehicle validation backend'de yapılacak
            return await apiService.post<Offer, OfferRequest>('/offers', {
                loadId: offerData.loadId,

                vehicleId: offerData.vehicleId,
                price: offerData.price,
                insuranceAccepted: offerData.insuranceAccepted,
                isEcoFriendly: offerData.isEcoFriendly
            });
        } catch (error) {
            console.error('Create offer with vehicle error:', error);
            throw error;
        }
    },

    // Teklif verirken çevreci araç kontrolü
    isVehicleEcoFriendly: (vehicleInfo: VehicleInfo): boolean => {
        return vehicleInfo.ecoCertified;
    },

    // Teklif listesini sıralama utilities
    sortOffersByPrice: (offers: OfferWithVehicleInfo[], ascending: boolean = true): OfferWithVehicleInfo[] => {
        return [...offers].sort((a, b) =>
            ascending ? a.price - b.price : b.price - a.price
        );
    },

    sortOffersByEcoFriendly: (offers: OfferWithVehicleInfo[]): OfferWithVehicleInfo[] => {
        return [...offers].sort((a, b) => {
            // Çevreci araçları öne çıkar
            if (a.vehicleEcoCertified && !b.vehicleEcoCertified) return -1;
            if (!a.vehicleEcoCertified && b.vehicleEcoCertified) return 1;
            // Eğer her ikisi de çevreci veya değilse, fiyata göre sırala
            return a.price - b.price;
        });
    },

    // Çevreci teklifleri filtrele
    filterEcoFriendlyOffers: (offers: OfferWithVehicleInfo[]): OfferWithVehicleInfo[] => {
        return offers.filter(offer => offer.vehicleEcoCertified || offer.isEcoFriendly);
    },

    // Teklif detayları için karbor emisyonu hesaplama (basit)
    calculateCarbonSavings: (regularOffer: OfferWithVehicleInfo, ecoOffer: OfferWithVehicleInfo): number => {
        // Basit hesaplama: çevreci araç %15 daha az emisyon yapar
        if (ecoOffer.vehicleEcoCertified && !regularOffer.vehicleEcoCertified) {
            return 0.15; // %15 azalma
        }
        return 0;
    },

    // Tüm teklifleri getirir
    getAllOffers: async (): Promise<Offer[]> => {
        try {
            return await apiService.get<Offer[]>('/offers');
        } catch (error) {
            console.error('Get all offers error:', error);
            throw error;
        }
    },

    // Yük ID'sine göre teklifleri getirir
    getOffersByLoad: async (loadId: string): Promise<Offer[]> => {
        try {
            return await apiService.get<Offer[]>(`/offers/load/${loadId}`);
        } catch (error) {
            console.error(`Get offers by load (${loadId}) error:`, error);
            throw error;
        }
    },

    // Taşıyıcı ID'sine göre teklifleri getirir
    getOffersByCarrier: async (carrierId: string): Promise<Offer[]> => {
        try {
            return await apiService.get<Offer[]>(`/offers/carrier/${carrierId}`);
        } catch (error) {
            console.error(`Get offers by carrier (${carrierId}) error:`, error);
            throw error;
        }
    },

    // Araç ID'sine göre teklifleri getirir
    getOffersByVehicle: async (vehicleId: string): Promise<Offer[]> => {
        try {
            return await apiService.get<Offer[]>(`/offers/vehicle/${vehicleId}`);
        } catch (error) {
            console.error(`Get offers by vehicle (${vehicleId}) error:`, error);
            throw error;
        }
    },

    // Durum filtresine göre teklifleri getirir
    getOffersByStatus: async (status: OfferStatus): Promise<Offer[]> => {
        try {
            return await apiService.get<Offer[]>(`/offers/status/${status}`);
        } catch (error) {
            console.error(`Get offers by status (${status}) error:`, error);
            throw error;
        }
    },

    // Yük ID'si ve durum filtresine göre teklifleri getirir
    getOffersByLoadAndStatus: async (loadId: string, status: OfferStatus): Promise<Offer[]> => {
        try {
            return await apiService.get<Offer[]>(`/offers/load/${loadId}/status/${status}`);
        } catch (error) {
            console.error(`Get offers by load (${loadId}) and status (${status}) error:`, error);
            throw error;
        }
    },

    // Taşıyıcı ID'si ve durum filtresine göre teklifleri getirir
    getOffersByCarrierAndStatus: async (carrierId: string, status: OfferStatus): Promise<Offer[]> => {
        try {
            return await apiService.get<Offer[]>(`/offers/carrier/${carrierId}/status/${status}`);
        } catch (error) {
            console.error(`Get offers by carrier (${carrierId}) and status (${status}) error:`, error);
            throw error;
        }
    },

    // Çevre dostu durumuna göre teklifleri getirir
    getEcoFriendlyOffers: async (isEcoFriendly: boolean): Promise<Offer[]> => {
        try {
            return await apiService.get<Offer[]>('/offers/eco-friendly', { isEcoFriendly });
        } catch (error) {
            console.error(`Get eco-friendly offers (${isEcoFriendly}) error:`, error);
            throw error;
        }
    },

    // Fiyat aralığına göre teklifleri getirir
    getOffersByPriceRange: async (minPrice: number, maxPrice: number): Promise<Offer[]> => {
        try {
            return await apiService.get<Offer[]>('/offers/price-range', { minPrice, maxPrice });
        } catch (error) {
            console.error(`Get offers by price range (${minPrice}-${maxPrice}) error:`, error);
            throw error;
        }
    },

    // Oluşturma tarih aralığına göre teklifleri getirir
    getOffersByCreationDateRange: async (startDate: string, endDate: string): Promise<Offer[]> => {
        try {
            return await apiService.get<Offer[]>('/offers/date-range', { startDate, endDate });
        } catch (error) {
            console.error(`Get offers by creation date range error:`, error);
            throw error;
        }
    },

    // Sigorta kabul durumuna göre teklifleri getirir
    getOffersByInsuranceAccepted: async (insuranceAccepted: boolean): Promise<Offer[]> => {
        try {
            return await apiService.get<Offer[]>('/offers/insurance', { insuranceAccepted });
        } catch (error) {
            console.error(`Get offers by insurance accepted (${insuranceAccepted}) error:`, error);
            throw error;
        }
    },

    // Yük için en uygun fiyatlı teklifleri getirir
    getCheapestOffersForLoad: async (loadId: string): Promise<Offer[]> => {
        try {
            return await apiService.get<Offer[]>(`/offers/load/${loadId}/cheapest`);
        } catch (error) {
            console.error(`Get cheapest offers for load (${loadId}) error:`, error);
            throw error;
        }
    },

    // Yük için çevre dostu teklifleri getirir
    getEcoFriendlyOffersForLoad: async (loadId: string): Promise<Offer[]> => {
        try {
            return await apiService.get<Offer[]>(`/offers/load/${loadId}/eco-friendly`);
        } catch (error) {
            console.error(`Get eco-friendly offers for load (${loadId}) error:`, error);
            throw error;
        }
    },

    // Teklif bilgilerini günceller
    updateOffer: async (id: string, offerData: OfferUpdateRequest): Promise<Offer> => {
        try {
            return await apiService.put<Offer, OfferUpdateRequest>(`/offers/${id}`, offerData);
        } catch (error) {
            console.error(`Update offer (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Teklifi kabul eder
    acceptOffer: async (id: string): Promise<Offer> => {
        try {
            return await apiService.patch<Offer>(`/offers/${id}/accept`, {});
        } catch (error) {
            console.error(`Accept offer (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Teklifi reddeder
    rejectOffer: async (id: string): Promise<Offer> => {
        try {
            return await apiService.patch<Offer>(`/offers/${id}/reject`, {});
        } catch (error) {
            console.error(`Reject offer (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Teklifi siler
    deleteOffer: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/offers/${id}`);
        } catch (error) {
            console.error(`Delete offer (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Taşıyıcının belirli bir yük için teklif verip vermediğini kontrol eder
    hasCarrierAlreadyOfferedForLoad: async (loadId: string, carrierId: string): Promise<boolean> => {
        try {
            return await apiService.get<boolean>('/offers/check', { loadId, carrierId });
        } catch (error) {
            console.error(`Check carrier offer (load: ${loadId}, carrier: ${carrierId}) error:`, error);
            throw error;
        }
    },

    // Mevcut kullanıcının (taşıyıcı) tekliflerini getirir
    getCurrentCarrierOffers: async (status?: OfferStatus): Promise<Offer[]> => {
        try {
            const params: Record<string, any> = {};
            if (status) params.status = status;

            return await apiService.get<Offer[]>('/offers/my-offers', params);
        } catch (error) {
            console.error('Get current carrier offers error:', error);
            throw error;
        }
    },

    // Mevcut kullanıcının (gönderici) yüklerine gelen teklifleri getirir
    getCurrentSenderReceivedOffers: async (loadId?: string, status?: OfferStatus): Promise<Offer[]> => {
        try {
            const params: Record<string, any> = {};
            if (loadId) params.loadId = loadId;
            if (status) params.status = status;

            return await apiService.get<Offer[]>('/offers/my-received-offers', params);
        } catch (error) {
            console.error('Get current sender received offers error:', error);
            throw error;
        }
    },
    // Mevcut kullanıcının (taşıyıcı) kabul edilmiş yüklerini getirir
    getCurrentCarrierAcceptedLoads: async (): Promise<LoadWithOffers[]> => {
        try {
            return await apiService.get<LoadWithOffers[]>('/offers/my-accepted-loads');
        } catch (error) {
            console.error('Get current carrier accepted loads error:', error);
            throw error;
        }
    },

    // Mevcut kullanıcının (taşıyıcı) reddedilen tekliflerini getirir
    getCurrentCarrierRejectedOffers: async (): Promise<LoadWithOffers[]> => {
        try {
            return await apiService.get<LoadWithOffers[]>('/offers/my-rejected-offers');
        } catch (error) {
            console.error('Get current carrier rejected offers error:', error);
            throw error;
        }
    }
};

export default offerService;