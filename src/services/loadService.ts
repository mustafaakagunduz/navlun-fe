import apiService from '@/services/apiService';
import {BrokerOfferResponse} from "@/services/brokerService";

export enum LoadStatus {
    PENDING = 'PENDING',
    ASSIGNED = 'ASSIGNED',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    ACTIVE = 'ACTIVE',
}

export enum TransportType {
    SEA = 'SEA',
    LAND = 'LAND',
}

// Tip tanımlamaları
export type Load = {
    id: string;
    title: string;
    estimatedCarbonFootprint: number;
    senderId: string;
    sender?: {
        id: string;
        companyName: string;
        userId?: string;
        contactPerson: string;
    };
    goodsType: string;
    description?: string;
    netWeight: number;
    grossWeight: number;
    isCompleted: boolean;
    loadingAddress: string;
    deliveryAddress: string;
    loadingDate: string;
    deliveryDate: string;
    estimatedPrice?: number;
    status: LoadStatus;
    transportType: TransportType;
    insuranceRequested: boolean;
    ecoTransportRequested?: boolean;
    active: boolean;
    createdAt: string;
    updatedAt?: string;
};

export type LoadRequest = {
    title: string;
    goodsType: string;
    netWeight: number;
    loadingAddress: string;
    deliveryAddress: string;
    loadingDate: string;
    deliveryDate: string;
    description?: string;
    insuranceRequested: boolean;
    transportType: TransportType;
    senderId: string;
    selectedInsurancePolicy?: string;
    insurancePolicyDetails?: string;
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
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
};

export type LoadWithOffers = {
    load: Load;
    offers: OfferWithVehicleInfo[];
    pendingOffersCount: number;
    hasAcceptedOffer: boolean;
};

export interface LoadWithBrokerOffers extends LoadWithOffers {
    brokerOffers?: BrokerOfferResponse[];
    brokerOffersCount?: number;
    hasPendingBrokerOffers?: boolean;
}

export type LoadUpdateRequest = {
    title?: string;
    goodsType?: string;
    netWeight?: number;
    loadingAddress?: string;
    deliveryAddress?: string;
    loadingDate?: string;
    deliveryDate?: string;
    description?: string;
    insuranceRequested?: boolean;
    status?: LoadStatus;
    isCompleted?: boolean;
};

export type InsurancePolicy = {
    id: string;
    name: string;
    description: string;
    price: number;
    coverage: number;
    features: string[];
    provider: string;
    duration: string;
    recommended: boolean;
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

export type SenderStatisticsDto = {
    totalLoads: number;
    averageWeight: number;
    completedLoads: number;
    pendingLoads: number;
};

const loadService = {
    // Yeni yük oluşturur
    createLoad: async (loadData: LoadRequest): Promise<Load> => {
        try {
            return await apiService.post<Load, LoadRequest>('/loads', loadData);
        } catch (error) {
            console.error('Create load error:', error);
            throw error;
        }
    },

    // Belirli bir yükü ID'ye göre getirir
    getLoadById: async (id: string): Promise<Load> => {
        try {
            const response = await apiService.get<Load>(`/loads/${id}`);
            console.log('Load service response:', response);
            console.log('Load service response sender:', response.sender); // YENİ SATIR
            console.log('Load service response senderId:', response.senderId); // YENİ SATIR
            console.log('Response keys:', Object.keys(response)); // YENİ SATIR
            return response;
        } catch (error) {
            console.error(`Get load by ID (${id}) error:`, error);
            throw error;
        }
    },


    /**
     * Mevcut sigorta poliçelerini getirir
     */
    getInsurancePolicies: async (): Promise<InsurancePolicy[]> => {
        try {
            return await apiService.get<InsurancePolicy[]>('/loads/insurance-policies');
        } catch (error) {
            console.error('Get insurance policies error:', error);
            throw error;
        }
    },

    /**
     * Mevcut mal türlerini getirir
     */
    getGoodsTypes: async (): Promise<string[]> => {
        try {
            return await apiService.get<string[]>('/loads/goods-types');
        } catch (error) {
            console.error('Get goods types error:', error);
            throw error;
        }
    },

    /**
     * Karbon ayak izi hesaplar (basit versiyon)
     */
    calculateCarbonFootprint: async (loadData: {
        netWeight: number;
        distance?: number;
    }): Promise<number> => {
        try {
            // Basit hesaplama - gerçek API'ye dönüştürülecek
            const { netWeight, distance = 500 } = loadData;

            // Ağırlık faktörü: ton başına 0.5 CO2
            const weightFactor = (netWeight / 1000) * 0.5;

            // Mesafe faktörü: km başına 0.8 CO2
            const distanceFactor = distance * 0.8;

            // Toplam karbon ayak izi (ton CO2)
            const totalCarbon = (weightFactor + distanceFactor) / 100;

            return Math.round(totalCarbon * 100) / 100; // 2 ondalık basamak
        } catch (error) {
            console.error('Calculate carbon footprint error:', error);
            throw error;
        }
    },

    // Tüm yükleri getirir
    getAllLoads: async (): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads');
        } catch (error) {
            console.error('Get all loads error:', error);
            throw error;
        }
    },



    // Sayfalandırılmış yükleri getirir
    getAllLoadsPaginated: async (
        page: number = 0,
        size: number = 20,
        sortBy?: string,
        sortDirection?: 'asc' | 'desc'
    ): Promise<PageResponse<Load>> => {
        try {
            const params: Record<string, any> = { page, size };
            if (sortBy) params.sortBy = sortBy;
            if (sortDirection) params.sortDirection = sortDirection;

            return await apiService.get<PageResponse<Load>>('/loads/paginated', params);
        } catch (error) {
            console.error('Get paginated loads error:', error);
            throw error;
        }
    },

    // Filtreli yükleri getirir
    getLoads: async (params: {
        senderId?: string;
        status?: LoadStatus;
        goodsType?: string;
        insuranceRequested?: boolean;
        isCompleted?: boolean;
    }): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads', params);
        } catch (error) {
            console.error('Get filtered loads error:', error);
            throw error;
        }
    },

    // Gelişmiş arama ile yükleri getirir
    advancedSearch: async (params: {
        status?: LoadStatus;
        goodsType?: string;
        insuranceRequested?: boolean;
        minWeight?: number;
        maxWeight?: number;
        fromDate?: string;
        toDate?: string;
        page?: number;
        size?: number;
    }): Promise<PageResponse<Load>> => {
        try {
            return await apiService.get<PageResponse<Load>>('/loads/search', params);
        } catch (error) {
            console.error('Advanced load search error:', error);
            throw error;
        }
    },

    // Gönderici ID'sine göre yükleri getirir
    getLoadsBySender: async (senderId: string): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>(`/loads/by-sender/${senderId}`);
        } catch (error) {
            console.error(`Get loads by sender (${senderId}) error:`, error);
            throw error;
        }
    },

    // Gönderici ID'sine göre sayfalandırılmış yükleri getirir
    getLoadsBySenderPaginated: async (
        senderId: string,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<Load>> => {
        try {
            return await apiService.get<PageResponse<Load>>(`/loads/by-sender/${senderId}`, { page, size });
        } catch (error) {
            console.error(`Get paginated loads by sender (${senderId}) error:`, error);
            throw error;
        }
    },

    // Gönderici ID'sine ve duruma göre yükleri getirir
    getLoadsBySenderAndStatus: async (senderId: string, status: LoadStatus): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>(`/loads/by-sender/${senderId}/status/${status}`);
        } catch (error) {
            console.error(`Get loads by sender (${senderId}) and status (${status}) error:`, error);
            throw error;
        }
    },

    // Gönderici ID'sine ve duruma göre sayfalandırılmış yükleri getirir
    getLoadsBySenderAndStatusPaginated: async (
        senderId: string,
        status: LoadStatus,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<Load>> => {
        try {
            return await apiService.get<PageResponse<Load>>(
                `/loads/by-sender/${senderId}/status/${status}`,
                { page, size }
            );
        } catch (error) {
            console.error(`Get paginated loads by sender (${senderId}) and status (${status}) error:`, error);
            throw error;
        }
    },

    // Yükleme tarihi aralığına göre yükleri getirir
    getLoadsByLoadingDateRange: async (startDate: string, endDate: string): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/by-loading-date', { startDate, endDate });
        } catch (error) {
            console.error(`Get loads by loading date range error:`, error);
            throw error;
        }
    },

    // Yükleme tarihi aralığına göre sayfalandırılmış yükleri getirir
    getLoadsByLoadingDateRangePaginated: async (
        startDate: string,
        endDate: string,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<Load>> => {
        try {
            return await apiService.get<PageResponse<Load>>(
                '/loads/by-loading-date',
                { startDate, endDate, page, size }
            );
        } catch (error) {
            console.error(`Get paginated loads by loading date range error:`, error);
            throw error;
        }
    },

    // Teslimat tarihi aralığına göre yükleri getirir
    getLoadsByDeliveryDateRange: async (startDate: string, endDate: string): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/by-delivery-date', { startDate, endDate });
        } catch (error) {
            console.error(`Get loads by delivery date range error:`, error);
            throw error;
        }
    },

    // Teslimat tarihi aralığına göre sayfalandırılmış yükleri getirir
    getLoadsByDeliveryDateRangePaginated: async (
        startDate: string,
        endDate: string,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<Load>> => {
        try {
            return await apiService.get<PageResponse<Load>>(
                '/loads/by-delivery-date',
                { startDate, endDate, page, size }
            );
        } catch (error) {
            console.error(`Get paginated loads by delivery date range error:`, error);
            throw error;
        }
    },

    // Belirli bir tarihten daha eski bekleyen yükleri getirir
    getPendingLoadsOlderThan: async (cutoffDate: string): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/pending-older-than', { cutoffDate });
        } catch (error) {
            console.error(`Get pending loads older than (${cutoffDate}) error:`, error);
            throw error;
        }
    },

    // Yaklaşan teslimatları getirir
    getUpcomingDeliveries: async (startDate: string, endDate: string): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/upcoming-deliveries', { startDate, endDate });
        } catch (error) {
            console.error(`Get upcoming deliveries error:`, error);
            throw error;
        }
    },

    // Konuma göre yükleri arar
    searchByLocation: async (location: string): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/search-by-location', { location });
        } catch (error) {
            console.error(`Search loads by location (${location}) error:`, error);
            throw error;
        }
    },

    // Benzer ağırlıktaki yükleri getirir
    getLoadsBySimilarWeight: async (weight: number, tolerance: number = 0.5): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/by-similar-weight', { weight, tolerance });
        } catch (error) {
            console.error(`Get loads by similar weight (${weight}, tolerance: ${tolerance}) error:`, error);
            throw error;
        }
    },

    // Çevre dostu yükleri getirir
    getEcoFriendlyLoads: async (): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/eco-friendly');
        } catch (error) {
            console.error('Get eco-friendly loads error:', error);
            throw error;
        }
    },

    // Teklif almayan yükleri getirir
    getLoadsWithNoOffers: async (): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/no-offers');
        } catch (error) {
            console.error('Get loads with no offers error:', error);
            throw error;
        }
    },

    // Tekliflerle birlikte tüm yükleri getirir
    getAllLoadsWithOffers: async (): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/with-offers');
        } catch (error) {
            console.error('Get all loads with offers error:', error);
            throw error;
        }
    },

    // Mevcut kullanıcının istatistiklerini getirir (sender için)
    getCurrentUserStatistics: async (): Promise<SenderStatisticsDto> => {
        try {
            return await apiService.get<SenderStatisticsDto>('/loads/my-statistics');
        } catch (error) {
            console.error('Get current user statistics error:', error);
            throw error;
        }
    },

    // Gönderici istatistiklerini getirir (admin/diğer kullanıcılar için)
    getSenderStatistics: async (
        senderId: string,
        startDate?: string,
        endDate?: string
    ): Promise<SenderStatisticsDto> => {
        try {
            const params: Record<string, any> = { senderId };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            return await apiService.get<SenderStatisticsDto>(`/loads/sender-statistics/${senderId}`, params);
        } catch (error) {
            console.error(`Get sender statistics (ID: ${senderId}) error:`, error);
            throw error;
        }
    },

    // Belirli bir dönemde göndericinin yük sayısını getirir
    countLoadsBySenderInPeriod: async (
        senderId: string,
        startDate: string,
        endDate: string
    ): Promise<number> => {
        try {
            return await apiService.get<number>(
                `/loads/sender-statistics/${senderId}`,
                { startDate, endDate, countOnly: true }
            );
        } catch (error) {
            console.error(`Count loads by sender in period error:`, error);
            throw error;
        }
    },

    // Gönderici için ortalama ağırlık getirir
    getAverageWeightBySender: async (senderId: string): Promise<number> => {
        try {
            return await apiService.get<number>(`/loads/sender-statistics/${senderId}/avg-weight`);
        } catch (error) {
            console.error(`Get average weight by sender (${senderId}) error:`, error);
            throw error;
        }
    },

    // Yük bilgilerini günceller
    updateLoad: async (id: string, loadData: LoadUpdateRequest): Promise<Load> => {
        try {
            return await apiService.put<Load, LoadUpdateRequest>(`/loads/${id}`, loadData);
        } catch (error) {
            console.error(`Update load (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Yük durumunu günceller
    updateLoadStatus: async (id: string, status: LoadStatus): Promise<Load> => {
        try {
            return await apiService.patch<Load>(`/loads/${id}/status`, { status });
        } catch (error) {
            console.error(`Update load status (ID: ${id}, status: ${status}) error:`, error);
            throw error;
        }
    },

    // Yük tamamlanma durumunu günceller
    updateLoadCompletionStatus: async (id: string, isCompleted: boolean): Promise<Load> => {
        try {
            return await apiService.patch<Load>(`/loads/${id}/completion`, { isCompleted });
        } catch (error) {
            console.error(`Update load completion status (ID: ${id}, completed: ${isCompleted}) error:`, error);
            throw error;
        }
    },

    // Yükü siler
    deleteLoad: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/loads/${id}`);
        } catch (error) {
            console.error(`Delete load (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Kullanıcının en son oluşturduğu yükleri getirir
    getCurrentUserLoads: async (
        page: number = 0,
        size: number = 20,
        status?: LoadStatus
    ): Promise<PageResponse<Load>> => {
        try {
            const params: Record<string, any> = { page, size };
            if (status) params.status = status;

            // Mevcut kullanıcının sender ID'sini otomatik almak için backend'de özel endpoint
            return await apiService.get<PageResponse<Load>>('/loads/current-user', params);
        } catch (error) {
            console.error('Get current user loads error:', error);
            throw error;
        }
    },

    // Mevcut kullanıcının teklifli yüklerini getirir (sender için)
    getCurrentUserLoadsWithOffers: async (): Promise<LoadWithOffers[]> => {
        try {
            return await apiService.get<LoadWithOffers[]>('/loads/my-loads-with-offers');
        } catch (error) {
            console.error('Get current user loads with offers error:', error);
            throw error;
        }
    },

    // Teklif verilebilir yükleri getirir (carrier için)
    getAvailableLoadsForOffers: async (
        page: number = 0,
        size: number = 20,
        sortBy?: string,
        sortDirection?: 'asc' | 'desc'
    ): Promise<PageResponse<Load>> => {
        try {
            const params: Record<string, any> = { page, size };
            if (sortBy) params.sortBy = sortBy;
            if (sortDirection) params.sortDirection = sortDirection;

            return await apiService.get<PageResponse<Load>>('/loads/available-for-offers', params);
        } catch (error) {
            console.error('Get available loads for offers error:', error);
            throw error;
        }
    },

    // Kullanıcının aktif yüklerini getirir
    getCurrentUserActiveLoads: async (): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/my-active-loads');
        } catch (error) {
            console.error('Get current user active loads error:', error);
            throw error;
        }
    },

    // Kullanıcının tamamlanmış teslimatlarını getirir
    getCurrentUserCompletedDeliveries: async (): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/my-completed-deliveries');
        } catch (error) {
            console.error('Get current user completed deliveries error:', error);
            throw error;
        }
    },

    // Yük için çevreci teklif var mı kontrol eder
    hasEcoFriendlyOffers: (loadWithOffers: LoadWithOffers): boolean => {
        return loadWithOffers.offers.some(offer =>
            offer.vehicleEcoCertified || offer.isEcoFriendly
        );
    },

    // Yük için en iyi çevreci teklifi bulur
    getBestEcoFriendlyOffer: (loadWithOffers: LoadWithOffers): OfferWithVehicleInfo | null => {
        const ecoOffers = loadWithOffers.offers.filter(offer =>
            offer.vehicleEcoCertified || offer.isEcoFriendly
        );

        if (ecoOffers.length === 0) return null;

        // En düşük fiyatlı çevreci teklifi döndür
        return ecoOffers.reduce((best, current) =>
            current.price < best.price ? current : best
        );
    },

    // Yük için en düşük fiyatlı teklifi bulur
    getCheapestOffer: (loadWithOffers: LoadWithOffers): OfferWithVehicleInfo | null => {
        const pendingOffers = loadWithOffers.offers.filter(offer => offer.status === 'PENDING');

        if (pendingOffers.length === 0) return null;

        return pendingOffers.reduce((cheapest, current) =>
            current.price < cheapest.price ? current : cheapest
        );
    },

    // Çevreci vs normal teklifler karşılaştırması
    compareOffersByEnvironmentalImpact: (loadWithOffers: LoadWithOffers) => {
        const ecoOffers = loadWithOffers.offers.filter(offer =>
            offer.vehicleEcoCertified || offer.isEcoFriendly
        );
        const regularOffers = loadWithOffers.offers.filter(offer =>
            !offer.vehicleEcoCertified && !offer.isEcoFriendly
        );

        const bestEco = ecoOffers.length > 0 ?
            ecoOffers.reduce((best, current) => current.price < best.price ? current : best) : null;

        const bestRegular = regularOffers.length > 0 ?
            regularOffers.reduce((best, current) => current.price < best.price ? current : best) : null;

        return {
            ecoFriendlyOffer: bestEco,
            regularOffer: bestRegular,
            hasEcoOption: ecoOffers.length > 0,
            ecoAdvantage: bestEco && bestRegular ?
                ((bestRegular.price - bestEco.price) / bestRegular.price * 100) : 0,
            carbonSavingsEstimate: bestEco ? 15 : 0 // %15 karbon tasarrufu varsayımı
        };
    },

    // Yük detayları için önerileri getir
    getOfferRecommendations: (loadWithOffers: LoadWithOffers) => {
        const comparison = loadService.compareOffersByEnvironmentalImpact(loadWithOffers);

        return {
            shouldChooseEco: comparison.hasEcoOption && comparison.ecoAdvantage >= -10, // %10'a kadar fark kabul et
            recommendation: comparison.hasEcoOption ?
                'Çevre dostu araç seçeneği mevcut! Doğaya katkı sağlayabilirsiniz.' :
                'Bu yük için çevre dostu araç seçeneği bulunmuyor.',
            priceComparison: comparison.ecoAdvantage,
            environmentalBenefit: comparison.carbonSavingsEstimate
        };
    },

    // Broker için açık yükleri getir (sayfalandırılmış)
    getOpenLoadsForBrokersPaginated: async (
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<Load>> => {
        try {
            return await apiService.get<PageResponse<Load>>('/loads/broker/open-loads/paginated', { page, size });
        } catch (error) {
            console.error('Get open loads for brokers paginated error:', error);
            throw error;
        }
    },

// Broker için açık yükleri getir (liste)
    getOpenLoadsForBrokers: async (): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/broker/open-loads');
        } catch (error) {
            console.error('Get open loads for brokers error:', error);
            throw error;
        }
    },

// Mal türüne göre yükleri getir
    getLoadsByGoodsType: async (goodsType: string): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/broker/by-goods-type', { goodsType });
        } catch (error) {
            console.error(`Get loads by goods type (${goodsType}) error:`, error);
            throw error;
        }
    },

// Ağırlık aralığına göre yükleri getir
    getLoadsByWeightRange: async (minWeight: number, maxWeight: number): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/broker/by-weight-range', { minWeight, maxWeight });
        } catch (error) {
            console.error(`Get loads by weight range (${minWeight}-${maxWeight}) error:`, error);
            throw error;
        }
    },

// Rota'ya göre yükleri getir
    getLoadsByRoute: async (loadingCity: string, deliveryCity: string): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/broker/by-route', { loadingCity, deliveryCity });
        } catch (error) {
            console.error(`Get loads by route (${loadingCity}-${deliveryCity}) error:`, error);
            throw error;
        }
    },

// Sigortalı yükleri getir
    getLoadsWithInsurance: async (): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/broker/with-insurance');
        } catch (error) {
            console.error('Get loads with insurance error:', error);
            throw error;
        }
    },

// Çevreci taşıma talep eden yükleri getir
    getLoadsRequestingEcoTransport: async (): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/broker/eco-transport');
        } catch (error) {
            console.error('Get loads requesting eco transport error:', error);
            throw error;
        }
    },

    // Carrier için tamamlanmış teslimatları getir
    getCompletedDeliveriesForCarrier: async (): Promise<Load[]> => {
        try {
            return await apiService.get<Load[]>('/loads/carrier/completed-deliveries');
        } catch (error) {
            console.error('Get completed deliveries for carrier error:', error);
            throw error;
        }
    },

};

export default loadService;