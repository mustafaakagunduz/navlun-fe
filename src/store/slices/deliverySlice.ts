// src/store/slices/deliverySlice.ts - YENİ DOSYA
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { DeliveryTrackingData, DeliveryStep, StatusUpdateRequest, DocumentUploadRequest } from '@/services/deliveryService'
import deliveryService from '@/services/deliveryService'

interface DeliveryState {
    // Carrier - Aktif teslimatlar
    activeDeliveries: DeliveryTrackingData[]
    activeDeliveriesLoading: boolean
    activeDeliveriesError: string | null

    // Sender - Teslimat takipleri
    senderTrackings: DeliveryTrackingData[]
    senderTrackingsLoading: boolean
    senderTrackingsError: string | null

    // Seçili teslimat detayı
    selectedDelivery: DeliveryTrackingData | null
    selectedDeliveryLoading: boolean

    // Dosya yükleme durumu
    uploadingDocument: boolean
    uploadError: string | null

    // Status güncelleme durumu
    updatingStatus: boolean
    statusUpdateError: string | null

    // UI state
    showStatusModal: boolean
    showDocumentModal: boolean
    selectedDocumentType: 'pickup' | 'delivery' | 'cancellation' | null
}

const initialState: DeliveryState = {
    activeDeliveries: [],
    activeDeliveriesLoading: false,
    activeDeliveriesError: null,
    senderTrackings: [],
    senderTrackingsLoading: false,
    senderTrackingsError: null,
    selectedDelivery: null,
    selectedDeliveryLoading: false,
    uploadingDocument: false,
    uploadError: null,
    updatingStatus: false,
    statusUpdateError: null,
    showStatusModal: false,
    showDocumentModal: false,
    selectedDocumentType: null,
}

// Async Thunks
export const fetchActiveDeliveries = createAsyncThunk(
    'delivery/fetchActiveDeliveries',
    async (userRole: 'CARRIER' | 'BROKER' | undefined, { rejectWithValue }) => {
        try {
            console.log('🔄 [REDUX] Fetching active deliveries for role:', userRole);

            const result = userRole === 'BROKER'
                ? await deliveryService.getCurrentBrokerActiveDeliveries()
                : await deliveryService.getCurrentCarrierActiveDeliveries();

            console.log('✅ [REDUX-SUCCESS] Fetched', result.length, 'active deliveries for', userRole);
            return result;
        } catch (error: any) {
            console.error('❌ [REDUX-ERROR] Failed to fetch active deliveries:', error);
            return rejectWithValue(error.response?.data?.message || 'Aktif teslimatlar yüklenemedi')
        }
    }
)

export const fetchSenderTrackings = createAsyncThunk(
    'delivery/fetchSenderTrackings',
    async (senderId: string, { rejectWithValue }) => {
        try {
            console.log('🔄 [REDUX-SENDER] Fetching trackings for sender:', senderId);
            const result = await deliveryService.getSenderDeliveryTrackings(senderId);
            console.log('✅ [REDUX-SENDER-SUCCESS] Fetched', result.length, 'trackings');
            return result;
        } catch (error: any) {
            console.error('❌ [REDUX-SENDER-ERROR] Failed to fetch sender trackings:', error);
            return rejectWithValue(error.response?.data?.message || 'Teslimat takipleri yüklenemedi')
        }
    }
)

export const fetchDeliveryTracking = createAsyncThunk(
    'delivery/fetchDeliveryTracking',
    async (deliveryStatusId: string, { rejectWithValue }) => {
        try {
            return await deliveryService.getDeliveryTracking(deliveryStatusId)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Teslimat takibi yüklenemedi')
        }
    }
)

export const updateDeliveryStatus = createAsyncThunk(
    'delivery/updateStatus',
    async ({ deliveryStatusId, request }: { deliveryStatusId: string, request: StatusUpdateRequest },
           { rejectWithValue, dispatch }) => {
        try {
            await deliveryService.updateStatusWithNotification(deliveryStatusId, request)
            // Status güncelledikten sonra tracking'i yenile (hata olsa bile devam et)
            try {
                await dispatch(fetchDeliveryTracking(deliveryStatusId)).unwrap()
            } catch (trackingError) {
                console.warn('⚠️ [UPDATE-STATUS] Tracking refresh failed, but status was updated successfully:', trackingError)
            }
            return request.step
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Status güncellenemedi')
        }
    }
)

export const uploadDocument = createAsyncThunk(
    'delivery/uploadDocument',
    async ({
               deliveryStatusId,
               file,
               description,
               documentType
           }: {
        deliveryStatusId: string,
        file: File,
        description?: string,
        documentType: 'pickup' | 'delivery' | 'cancellation'
    }, { rejectWithValue, dispatch }) => {
        try {
            if (documentType === 'pickup') {
                await deliveryService.uploadPickupDocument(deliveryStatusId, file, description)
            } else if (documentType === 'delivery') {
                await deliveryService.uploadDeliveryDocument(deliveryStatusId, file, description)
            } else {
                await deliveryService.uploadCancellationDocument(deliveryStatusId, file, description)
            }

            // Belge yüklendikten sonra tracking'i yenile (hata olsa bile devam et)
            try {
                await dispatch(fetchDeliveryTracking(deliveryStatusId)).unwrap()
            } catch (trackingError) {
                console.warn('⚠️ [UPLOAD-DOC] Tracking refresh failed, but document was uploaded successfully:', trackingError)
            }

            return documentType
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Belge yüklenemedi')
        }
    }
)

export const updateLocation = createAsyncThunk(
    'delivery/updateLocation',
    async ({ deliveryStatusId, location }: { deliveryStatusId: string, location: string },
           { rejectWithValue, dispatch }) => {
        try {
            await deliveryService.updateLocationOnly(deliveryStatusId, location)
            // Konum güncelledikten sonra tracking'i yenile (hata olsa bile devam et)
            try {
                await dispatch(fetchDeliveryTracking(deliveryStatusId)).unwrap()
            } catch (trackingError) {
                console.warn('⚠️ [UPDATE-LOCATION] Tracking refresh failed, but location was updated successfully:', trackingError)
            }
            return location
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Konum güncellenemedi')
        }
    }
)

const deliverySlice = createSlice({
    name: 'delivery',
    initialState,
    reducers: {
        setSelectedDelivery: (state, action: PayloadAction<DeliveryTrackingData | null>) => {
            state.selectedDelivery = action.payload
        },
        setShowStatusModal: (state, action: PayloadAction<boolean>) => {
            state.showStatusModal = action.payload
        },
        setShowDocumentModal: (state, action: PayloadAction<boolean>) => {
            state.showDocumentModal = action.payload
        },
        setSelectedDocumentType: (state, action: PayloadAction<'pickup' | 'delivery' | 'cancellation' | null>) => {
            state.selectedDocumentType = action.payload
        },
        clearErrors: (state) => {
            state.activeDeliveriesError = null
            state.senderTrackingsError = null
            state.uploadError = null
            state.statusUpdateError = null
        },
        updateDeliveryInState: (state, action: PayloadAction<DeliveryTrackingData>) => {
            // Bellek içinde delivery güncelleme
            const delivery = action.payload

            // Active deliveries'de güncelle
            const activeIndex = state.activeDeliveries.findIndex(d => d.loadId === delivery.loadId)
            if (activeIndex !== -1) {
                state.activeDeliveries[activeIndex] = delivery
            }

            // Sender trackings'de güncelle
            const senderIndex = state.senderTrackings.findIndex(d => d.loadId === delivery.loadId)
            if (senderIndex !== -1) {
                state.senderTrackings[senderIndex] = delivery
            }

            // Selected delivery güncelle
            if (state.selectedDelivery?.loadId === delivery.loadId) {
                state.selectedDelivery = delivery
            }
        },
    },
    extraReducers: (builder) => {
        // Active Deliveries
        builder
            .addCase(fetchActiveDeliveries.pending, (state) => {
                state.activeDeliveriesLoading = true
                state.activeDeliveriesError = null
            })
            .addCase(fetchActiveDeliveries.fulfilled, (state, action) => {
                state.activeDeliveriesLoading = false
                state.activeDeliveries = action.payload
            })
            .addCase(fetchActiveDeliveries.rejected, (state, action) => {
                state.activeDeliveriesLoading = false
                state.activeDeliveriesError = action.payload as string
            })

        // Sender Trackings
        builder
            .addCase(fetchSenderTrackings.pending, (state) => {
                state.senderTrackingsLoading = true
                state.senderTrackingsError = null
            })
            .addCase(fetchSenderTrackings.fulfilled, (state, action) => {
                state.senderTrackingsLoading = false
                state.senderTrackings = action.payload
            })
            .addCase(fetchSenderTrackings.rejected, (state, action) => {
                state.senderTrackingsLoading = false
                state.senderTrackingsError = action.payload as string
            })

        // Selected Delivery
        builder
            .addCase(fetchDeliveryTracking.pending, (state) => {
                state.selectedDeliveryLoading = true
            })
            .addCase(fetchDeliveryTracking.fulfilled, (state, action) => {
                state.selectedDeliveryLoading = false
                state.selectedDelivery = action.payload
            })
            .addCase(fetchDeliveryTracking.rejected, (state) => {
                state.selectedDeliveryLoading = false
            })

        // Status Update
        builder
            .addCase(updateDeliveryStatus.pending, (state) => {
                state.updatingStatus = true
                state.statusUpdateError = null
            })
            .addCase(updateDeliveryStatus.fulfilled, (state) => {
                state.updatingStatus = false
                state.showStatusModal = false
            })
            .addCase(updateDeliveryStatus.rejected, (state, action) => {
                state.updatingStatus = false
                state.statusUpdateError = action.payload as string
            })

        // Document Upload
        builder
            .addCase(uploadDocument.pending, (state) => {
                state.uploadingDocument = true
                state.uploadError = null
            })
            .addCase(uploadDocument.fulfilled, (state) => {
                state.uploadingDocument = false
                state.showDocumentModal = false
                state.selectedDocumentType = null
            })
            .addCase(uploadDocument.rejected, (state, action) => {
                state.uploadingDocument = false
                state.uploadError = action.payload as string
            })

        // Location Update
        builder
            .addCase(updateLocation.fulfilled, (state) => {
                // Location güncelleme başarılı
            })
    },
})

export const {
    setSelectedDelivery,
    setShowStatusModal,
    setShowDocumentModal,
    setSelectedDocumentType,
    clearErrors,
    updateDeliveryInState,
} = deliverySlice.actions

export default deliverySlice.reducer