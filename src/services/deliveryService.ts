// src/services/deliveryService.ts
import apiService from '@/services/apiService';

// Enum tanımlamaları
export enum DeliveryStep {
    ASSIGNED = 'ASSIGNED',
    ON_THE_WAY = 'ON_THE_WAY',
    PICKED_UP = 'PICKED_UP',
    DELIVERED = 'DELIVERED',
    PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
    PAYMENT_PENDING = 'PAYMENT_PENDING',
    COMPLETED = 'COMPLETED'
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

// Mevcut type'lardan sonra ekle:

export type DeliveryTrackingData = {
    loadId: string; // Backend'den gelen loadId aslında deliveryStatusId
    actualLoadId: string; // Gerçek load ID
    loadTitle: string;
    currentStatus: DeliveryStep;
    currentLocation?: string;
    lastUpdate: string;
    statusNote?: string;
    statusHistory: StatusHistoryItem[];
    pickupDocuments: string[];
    deliveryDocuments: string[];
    cancellationDocuments: string[];
    carrier: {
        name: string;
        phone?: string;
        isEcoFriendly: boolean;
    };
    vehicle: {
        plateNumber: string;
        type: string;
        ecoCertified: boolean;
    };
};

export type StatusHistoryItem = {
    status: DeliveryStep;
    timestamp: string;
    location?: string;
    note?: string;
};

export type DocumentUploadRequest = {
    file: File;
    description?: string;
};

export type DocumentUploadResponse = {
    documentUrl: string;
    documentType: string;
    description?: string;
    uploadedAt: string;
};

export type StatusUpdateRequest = {
    step: DeliveryStep;
    location?: string;
    note?: string;
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
    },
    // Mevcut uploadFile metodundan sonra ekle:

// === TESLİMAT TAKİBİ METODLARI ===

// Pickup belgesi yükleme
    uploadPickupDocument: async (deliveryStatusId: string, file: File, description?: string): Promise<DocumentUploadResponse> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (description) {
                formData.append('description', description);
            }

            const response = await apiService.uploadFile<DocumentUploadResponse>(
                `/delivery-status/${deliveryStatusId}/upload-pickup-document`,
                formData
            );
            return response;
        } catch (error) {
            console.error('Pickup document upload error:', error);
            throw error;
        }
    },

// Delivery belgesi yükleme
    uploadDeliveryDocument: async (deliveryStatusId: string, file: File, description?: string): Promise<DocumentUploadResponse> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (description) {
                formData.append('description', description);
            }

            const response = await apiService.uploadFile<DocumentUploadResponse>(
                `/delivery-status/${deliveryStatusId}/upload-delivery-document`,
                formData
            );
            return response;
        } catch (error) {
            console.error('Delivery document upload error:', error);
            throw error;
        }
    },

// Cancellation belgesi yükleme
    uploadCancellationDocument: async (deliveryStatusId: string, file: File, description?: string): Promise<DocumentUploadResponse> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (description) {
                formData.append('description', description);
            }

            const response = await apiService.uploadFile<DocumentUploadResponse>(
                `/delivery-status/${deliveryStatusId}/upload-cancellation-document`,
                formData
            );
            return response;
        } catch (error) {
            console.error('Cancellation document upload error:', error);
            throw error;
        }
    },

// Status güncelleme + bildirim gönderme
    updateStatusWithNotification: async (deliveryStatusId: string, request: StatusUpdateRequest): Promise<DeliveryStatus> => {
        try {
            const params = new URLSearchParams();
            params.append('step', request.step);
            if (request.location) params.append('location', request.location);
            if (request.note) params.append('note', request.note);

            return await apiService.post<DeliveryStatus>(
                `/delivery-status/${deliveryStatusId}/update-status-with-notification?${params.toString()}`,
                {}
            );
        } catch (error) {
            console.error('Update status with notification error:', error);
            throw error;
        }
    },

// Delivery tracking bilgilerini getir
    getDeliveryTracking: async (deliveryStatusId: string): Promise<DeliveryTrackingData> => {
        try {
            return await apiService.get<DeliveryTrackingData>(`/delivery-status/${deliveryStatusId}/tracking`);
        } catch (error) {
            console.error(`Get delivery tracking (${deliveryStatusId}) error:`, error);
            throw error;
        }
    },

// Load ID'ye göre delivery tracking
    getDeliveryTrackingByLoad: async (loadId: string): Promise<DeliveryTrackingData> => {
        try {
            return await apiService.get<DeliveryTrackingData>(`/delivery-status/tracking/load/${loadId}`);
        } catch (error) {
            console.error(`Get delivery tracking by load (${loadId}) error:`, error);
            throw error;
        }
    },

// Carrier'ın aktif teslimatları
    getCurrentCarrierActiveDeliveries: async (): Promise<DeliveryTrackingData[]> => {
        try {
            return await apiService.get<DeliveryTrackingData[]>('/delivery-status/my-active-deliveries');
        } catch (error) {
            console.error('Get current carrier active deliveries error:', error);
            throw error;
        }
    },

// Sender'ın teslimat takipleri
    getSenderDeliveryTrackings: async (senderId: string): Promise<DeliveryTrackingData[]> => {
        try {
            return await apiService.get<DeliveryTrackingData[]>(`/delivery-status/sender/${senderId}/trackings`);
        } catch (error) {
            console.error(`Get sender delivery trackings (${senderId}) error:`, error);
            throw error;
        }
    },

// Konum güncelleme
    updateLocationOnly: async (deliveryStatusId: string, location: string): Promise<DeliveryStatus> => {
        try {
            const params = new URLSearchParams();
            params.append('location', location);

            return await apiService.patch<DeliveryStatus>(
                `/delivery-status/${deliveryStatusId}/location?${params.toString()}`,
                {}
            );
        } catch (error) {
            console.error(`Update location (${deliveryStatusId}) error:`, error);
            throw error;
        }
    },

// Belge silme
    removeDocument: async (deliveryStatusId: string, documentUrl: string, documentType: 'pickup' | 'delivery'): Promise<void> => {
        try {
            const params = new URLSearchParams();
            params.append('documentUrl', documentUrl);
            params.append('documentType', documentType);

            await apiService.delete(`/delivery-status/${deliveryStatusId}/documents?${params.toString()}`);
        } catch (error) {
            console.error(`Remove document (${deliveryStatusId}) error:`, error);
            throw error;
        }
    },

// Pickup belgelerini getir
    getPickupDocuments: async (deliveryStatusId: string): Promise<string[]> => {
        try {
            return await apiService.get<string[]>(`/delivery-status/${deliveryStatusId}/pickup-documents`);
        } catch (error) {
            console.error(`Get pickup documents (${deliveryStatusId}) error:`, error);
            throw error;
        }
    },

// Delivery belgelerini getir
    getDeliveryDocuments: async (deliveryStatusId: string): Promise<string[]> => {
        try {
            return await apiService.get<string[]>(`/delivery-status/${deliveryStatusId}/delivery-documents`);
        } catch (error) {
            console.error(`Get delivery documents (${deliveryStatusId}) error:`, error);
            throw error;
        }
    },

// === HELPER METODLAR ===

// Status display name
    getStatusDisplayName: (step: DeliveryStep): string => {
        switch (step) {
            case DeliveryStep.ASSIGNED:
                return 'Atandı';
            case DeliveryStep.ON_THE_WAY:
                return 'Yola Çıkıldı';
            case DeliveryStep.PICKED_UP:
                return 'Yük Alındı';
            case DeliveryStep.DELIVERED:
                return 'Teslim Edildi';
            case DeliveryStep.PAYMENT_RECEIVED:
                return 'Ödeme Alındı';
            case DeliveryStep.PAYMENT_PENDING:
                return 'Ödeme Beklemede';
            case DeliveryStep.COMPLETED:
                return 'Tamamlandı';
            default:
                return String(step).replace(/_/g, ' ');
        }
    },

// Status progress hesaplama
    getStatusProgress: (step: DeliveryStep): number => {
        switch (step) {
            case DeliveryStep.ASSIGNED:
                return 10;
            case DeliveryStep.ON_THE_WAY:
                return 30;
            case DeliveryStep.PICKED_UP:
                return 60;
            case DeliveryStep.DELIVERED:
                return 80;
            case DeliveryStep.PAYMENT_RECEIVED:
                return 95;
            case DeliveryStep.PAYMENT_PENDING:
                return 85;
            case DeliveryStep.COMPLETED:
                return 100;
            default:
                return 0;
        }
    },

// Status color
    getStatusColor: (step: DeliveryStep): string => {
        switch (step) {
            case DeliveryStep.ASSIGNED:
                return 'gray';
            case DeliveryStep.ON_THE_WAY:
                return 'blue';
            case DeliveryStep.PICKED_UP:
                return 'orange';
            case DeliveryStep.DELIVERED:
                return 'purple';
            case DeliveryStep.PAYMENT_RECEIVED:
                return 'green';
            case DeliveryStep.PAYMENT_PENDING:
                return 'yellow';
            case DeliveryStep.COMPLETED:
                return 'green';
            default:
                return 'gray';
        }
    },

// Dosya boyutu formatı
    formatFileSize: (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

// Dosya tipi kontrolü
    isValidFileType: (file: File): boolean => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        return allowedTypes.includes(file.type);
    },

// Maximum dosya boyutu kontrolü (5MB)
    isValidFileSize: (file: File): boolean => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        return file.size <= maxSize;
    },
    // getDeliveryStatusIdByLoadId method'unu ekleyin
    getDeliveryStatusIdByLoadId: async (loadId: string): Promise<string> => {
        try {
            const tracking = await deliveryService.getDeliveryTrackingByLoad(loadId);
            // Backend'den gelen response'da gerçek delivery status ID'sini döndür
            return tracking.loadId; // Bu aslında delivery status ID olacak
        } catch (error) {
            console.error(`Get delivery status ID by load ID (${loadId}) error:`, error);
            throw error;
        }
    },

    // === YENİ AKIŞ METODları ===

    // Yola çıkma
    startJourney: async (deliveryStatusId: string): Promise<DeliveryStatus> => {
        try {
            return await apiService.post<DeliveryStatus>(
                `/delivery-status/${deliveryStatusId}/start-journey`,
                {}
            );
        } catch (error) {
            console.error(`Start journey (${deliveryStatusId}) error:`, error);
            throw error;
        }
    },

    // Boşaltma tamamlama
    completeUnloading: async (deliveryStatusId: string): Promise<DeliveryStatus> => {
        try {
            return await apiService.post<DeliveryStatus>(
                `/delivery-status/${deliveryStatusId}/complete-unloading`,
                {}
            );
        } catch (error) {
            console.error(`Complete unloading (${deliveryStatusId}) error:`, error);
            throw error;
        }
    },

    // Ödeme durumu işaretleme
    markPaymentStatus: async (deliveryStatusId: string, paymentReceived: boolean): Promise<DeliveryStatus> => {
        try {
            const params = new URLSearchParams();
            params.append('paymentReceived', String(paymentReceived));

            return await apiService.post<DeliveryStatus>(
                `/delivery-status/${deliveryStatusId}/payment-status?${params.toString()}`,
                {}
            );
        } catch (error) {
            console.error(`Mark payment status (${deliveryStatusId}) error:`, error);
            throw error;
        }
    },
};

export default deliveryService;