// src/services/deliveryService.ts
import apiService from '@/services/apiService';

// Enum tanımlamaları
export enum DeliveryStep {
    ON_THE_WAY = 'ON_THE_WAY',
    PICKED_UP = 'PICKED_UP',
    DELIVERED = 'DELIVERED'
}

// Tip tanımlamaları
export type DeliveryStatus = {
    id: string;
    offerId: string;
    status: DeliveryStep;
    locationUpdates: string[];
    locationTimestamps: string[];
    pickupProof?: string;
    pickupTime?: string;
    deliveryProof?: string;
    deliveryTime?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type DeliveryStatusRequest = {
    offerId: string;
    status: DeliveryStep;
};

export type DeliveryStatusUpdateRequest = {
    status?: DeliveryStep;
    location?: string;
    pickupProof?: string;
    deliveryProof?: string;
};

export type LocationUpdateRequest = {
    location: string;
};

const deliveryService = {
    // Tüm teslimat durumlarını getirir
    getAllDeliveryStatus: async (): Promise<DeliveryStatus[]> => {
        try {
            return await apiService.get<DeliveryStatus[]>('/delivery-status');
        } catch (error) {
            console.error('Get all delivery status error:', error);
            throw error;
        }
    },

    // Belirli bir teslimat durumunu ID'ye göre getirir
    getDeliveryStatusById: async (id: string): Promise<DeliveryStatus> => {
        try {
            return await apiService.get<DeliveryStatus>(`/delivery-status/${id}`);
        } catch (error) {
            console.error(`Get delivery status by ID (${id}) error:`, error);
            throw error;
        }
    },

    // Belirli bir adıma (ON_THE_WAY, PICKED_UP, DELIVERED) göre teslimat durumlarını getirir
    getDeliveryStatusByStep: async (step: DeliveryStep): Promise<DeliveryStatus[]> => {
        try {
            return await apiService.get<DeliveryStatus[]>(`/delivery-status/step/${step}`);
        } catch (error) {
            console.error(`Get delivery status by step (${step}) error:`, error);
            throw error;
        }
    },

    // Belirli bir tarih aralığındaki yük alımlarını getirir
    getDeliveryStatusByPickupTimeBetween: async (
        start: string,
        end: string
    ): Promise<DeliveryStatus[]> => {
        try {
            return await apiService.get<DeliveryStatus[]>('/delivery-status/pickup-time', { start, end });
        } catch (error) {
            console.error(`Get delivery status by pickup time between error:`, error);
            throw error;
        }
    },

    // Belirli bir tarih aralığındaki teslimatları getirir
    getDeliveryStatusByDeliveryTimeBetween: async (
        start: string,
        end: string
    ): Promise<DeliveryStatus[]> => {
        try {
            return await apiService.get<DeliveryStatus[]>('/delivery-status/delivery-time', { start, end });
        } catch (error) {
            console.error(`Get delivery status by delivery time between error:`, error);
            throw error;
        }
    },

    // Yeni teslimat durumu oluşturur
    createDeliveryStatus: async (requestDto: DeliveryStatusRequest): Promise<DeliveryStatus> => {
        try {
            return await apiService.post<DeliveryStatus, DeliveryStatusRequest>('/delivery-status', requestDto);
        } catch (error) {
            console.error('Create delivery status error:', error);
            throw error;
        }
    },

    // Teslimat durumunu günceller
    updateDeliveryStatus: async (
        id: string,
        updateDto: DeliveryStatusUpdateRequest
    ): Promise<DeliveryStatus> => {
        try {
            return await apiService.put<DeliveryStatus, DeliveryStatusUpdateRequest>(
                `/delivery-status/${id}`,
                updateDto
            );
        } catch (error) {
            console.error(`Update delivery status (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Teslimat adımını günceller (ON_THE_WAY, PICKED_UP, DELIVERED)
    updateDeliveryStep: async (id: string, step: DeliveryStep): Promise<DeliveryStatus> => {
        try {
            return await apiService.patch<DeliveryStatus>(`/delivery-status/${id}/step`, { step });
        } catch (error) {
            console.error(`Update delivery step (ID: ${id}, step: ${step}) error:`, error);
            throw error;
        }
    },

    // Konum güncellemesi ekler
    addLocationUpdate: async (id: string, locationDto: LocationUpdateRequest): Promise<DeliveryStatus> => {
        try {
            return await apiService.post<DeliveryStatus, LocationUpdateRequest>(
                `/delivery-status/${id}/location`,
                locationDto
            );
        } catch (error) {
            console.error(`Add location update (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Yük alım kanıtı yükler
    uploadPickupProof: async (id: string, proofUrl: string): Promise<DeliveryStatus> => {
        try {
            return await apiService.post<DeliveryStatus, { proofUrl: string }>(
                `/delivery-status/${id}/pickup-proof`,
                { proofUrl }
            );
        } catch (error) {
            console.error(`Upload pickup proof (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Teslimat kanıtı yükler
    uploadDeliveryProof: async (id: string, proofUrl: string): Promise<DeliveryStatus> => {
        try {
            return await apiService.post<DeliveryStatus, { proofUrl: string }>(
                `/delivery-status/${id}/delivery-proof`,
                { proofUrl }
            );
        } catch (error) {
            console.error(`Upload delivery proof (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Teslimat durumunu siler
    deleteDeliveryStatus: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/delivery-status/${id}`);
        } catch (error) {
            console.error(`Delete delivery status (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Belirli bir teklif için mevcut teslimat durumunu getirir
    getDeliveryStatusByOffer: async (offerId: string): Promise<DeliveryStatus> => {
        try {
            return await apiService.get<DeliveryStatus>(`/delivery-status/offer/${offerId}`);
        } catch (error) {
            console.error(`Get delivery status by offer (${offerId}) error:`, error);
            throw error;
        }
    },

    // Mevcut kullanıcının (taşıyıcı) teslimat durumlarını getirir
    getCurrentCarrierDeliveryStatuses: async (status?: DeliveryStep): Promise<DeliveryStatus[]> => {
        try {
            const params: Record<string, any> = {};
            if (status) params.status = status;

            return await apiService.get<DeliveryStatus[]>('/delivery-status/my-deliveries', params);
        } catch (error) {
            console.error('Get current carrier delivery statuses error:', error);
            throw error;
        }
    },

    // Mevcut kullanıcının (gönderici) teslimat durumlarını getirir
    getCurrentSenderDeliveryStatuses: async (status?: DeliveryStep): Promise<DeliveryStatus[]> => {
        try {
            const params: Record<string, any> = {};
            if (status) params.status = status;

            return await apiService.get<DeliveryStatus[]>('/delivery-status/my-shipments', params);
        } catch (error) {
            console.error('Get current sender delivery statuses error:', error);
            throw error;
        }
    },

    // Dosya yükleme işlemi (resim/belge gibi teslimat kanıtı için)
    uploadFile: async (file: File): Promise<string> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiService.uploadFile<{ fileUrl: string }>('/files/upload', formData);
            return response.fileUrl;
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }
};

export default deliveryService;