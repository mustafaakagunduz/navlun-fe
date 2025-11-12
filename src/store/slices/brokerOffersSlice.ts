// src/store/slices/brokerOffersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import brokerService from '@/services/brokerService'
import authService from '@/services/authService'
import { BrokerOfferResponse } from '@/services/brokerService'

export enum OfferStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

export interface BrokerOffer {
    id: string
    loadId: string
    loadTitle?: string
    loadGoodsType?: string
    loadWeight?: number
    brokerProfileId: string
    brokerName?: string
    brokerEcoFriendlyCertified?: boolean
    shipId: string
    shipName?: string
    shipType?: string
    shipDeadweightTonnage?: number
    shipEcoFriendly?: boolean
    shipImoNumber?: string
    freightRate: number
    demurrageRate?: number
    despatchRate?: number
    estimatedLoadingDate: string
    estimatedDeliveryDate: string
    terms?: string
    notes?: string
    status: OfferStatus
    insuranceAccepted: boolean
    ecoFriendly: boolean
    commissionRate: number
    commissionAmount?: number
    totalAmount?: number
    validUntil: string
    validOffer?: boolean
    acceptedAt?: string
    rejectedAt?: string
    createdAt: string
    updatedAt?: string
}

export interface BrokerOfferRequest {
    loadId: string
    brokerProfileId: string
    shipId: string
    freightRate: number
    demurrageRate?: number
    despatchRate?: number
    estimatedLoadingDate: string
    estimatedDeliveryDate: string
    terms?: string
    notes?: string
    insuranceAccepted: boolean
    ecoFriendly: boolean
    commissionRate: number
    validUntil: string
}



interface BrokerOffersState {
    // All broker offers
    offers: BrokerOffer[]
    offersLoading: boolean
    offersError: string | null

    // Offers by status
    pendingOffers: BrokerOffer[]
    acceptedOffers: BrokerOffer[]
    rejectedOffers: BrokerOffer[]

    // Selected offer
    selectedOffer: BrokerOffer | null

    // Create offer
    createOfferLoading: boolean
    createOfferError: string | null
    createOfferSuccess: boolean

    // Filters
    filters: {
        status: OfferStatus | 'ALL'
        searchQuery: string
        ecoFriendly: string
        insurance: string
        sortBy: string
        sortDirection: 'asc' | 'desc'
    }

    // Pagination
    currentPage: number
    totalPages: number
    totalElements: number

    // Statistics
    stats: {
        totalOffers: number
        pendingCount: number
        acceptedCount: number
        rejectedCount: number
        totalCommission: number
        averageOfferValue: number
        successRate: number
    }
    statsLoading: boolean
    statsError: string | null
}

const initialState: BrokerOffersState = {
    offers: [],
    offersLoading: false,
    offersError: null,

    pendingOffers: [],
    acceptedOffers: [],
    rejectedOffers: [],

    selectedOffer: null,

    createOfferLoading: false,
    createOfferError: null,
    createOfferSuccess: false,

    filters: {
        status: 'ALL',
        searchQuery: '',
        ecoFriendly: '',
        insurance: '',
        sortBy: 'createdAt',
        sortDirection: 'desc'
    },

    currentPage: 0,
    totalPages: 0,
    totalElements: 0,

    stats: {
        totalOffers: 0,
        pendingCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        totalCommission: 0,
        averageOfferValue: 0,
        successRate: 0
    },
    statsLoading: false,
    statsError: null
}

// Async Thunks
export const fetchBrokerOffers = createAsyncThunk(
    'brokerOffers/fetchOffers',
    async (_, { rejectWithValue }) => {
        try {
            const currentUser = await authService.getCurrentUser()
            const brokerProfile = await brokerService.getBrokerProfileByUserId(currentUser.id)
            const offers = await brokerService.getOffersByBroker(brokerProfile.id)
            return offers
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Teklifler yüklenemedi')
        }
    }
)

// Broker'ın kendi tekliflerini getirme thunk'ı ekle
export const fetchCurrentBrokerOffers = createAsyncThunk(
    'brokerOffers/fetchCurrentBrokerOffers',
    async (status: OfferStatus | undefined = undefined, { rejectWithValue }) => {
        try {
            const offers = await brokerService.getCurrentBrokerOffers(status)
            return offers
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Broker teklifleri yüklenemedi')
        }
    }
)

// Broker teklif kabul etme
export const acceptBrokerOffer = createAsyncThunk(
    'brokerOffers/acceptBrokerOffer',
    async (offerId: string, { rejectWithValue }) => {
        try {
            return await brokerService.acceptBrokerOffer(offerId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Broker teklifi kabul edilemedi');
        }
    }
);

// Broker teklif reddetme
export const rejectBrokerOffer = createAsyncThunk(
    'brokerOffers/rejectBrokerOffer',
    async (offerId: string, { rejectWithValue }) => {
        try {
            return await brokerService.rejectBrokerOffer(offerId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Broker teklifi reddedilemedi');
        }
    }
);

// Sender'ın aldığı broker tekliflerini getir - DÜZELTİLMİŞ VERSİYON
export const fetchCurrentSenderReceivedBrokerOffers = createAsyncThunk(
    'brokerOffers/fetchCurrentSenderReceivedBrokerOffers',
    async (params: { loadId?: string; status?: OfferStatus } = {}, { rejectWithValue }) => {
        try {
            return await brokerService.getCurrentSenderReceivedBrokerOffers(params.loadId, params.status);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Broker teklifleri alınamadı');
        }
    }
);

// Broker'ın yük için teklif verip vermediğini kontrol et
export const checkBrokerAlreadyOfferedForLoad = createAsyncThunk(
    'brokerOffers/checkBrokerAlreadyOfferedForLoad',
    async ({ loadId, brokerId }: { loadId: string; brokerId: string }, { rejectWithValue }) => {
        try {
            return await brokerService.hasBrokerAlreadyOfferedForLoad(loadId, brokerId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Kontrol sırasında hata oluştu');
        }
    }
);

export const fetchBrokerOffersPaginated = createAsyncThunk(
    'brokerOffers/fetchOffersPaginated',
    async ({ page = 0, size = 20 }: { page?: number; size?: number }, { rejectWithValue }) => {
        try {
            const currentUser = await authService.getCurrentUser()
            const brokerProfile = await brokerService.getBrokerProfileByUserId(currentUser.id)
            const response = await brokerService.getOffersByBrokerPaginated(brokerProfile.id, page, size)
            return {
                offers: response.content || [],
                page: response.page || 0,
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Teklifler yüklenemedi')
        }
    }
)

export const fetchBrokerOffersByStatus = createAsyncThunk(
    'brokerOffers/fetchByStatus',
    async (status: OfferStatus, { rejectWithValue }) => {
        try {
            const currentUser = await authService.getCurrentUser()
            const brokerProfile = await brokerService.getBrokerProfileByUserId(currentUser.id)
            const offers = await brokerService.getOffersByBrokerAndStatus(brokerProfile.id, status)
            return { status, offers }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Teklifler yüklenemedi')
        }
    }
)

export const fetchBrokerOfferById = createAsyncThunk(
    'brokerOffers/fetchById',
    async (offerId: string, { rejectWithValue }) => {
        try {
            const offer = await brokerService.getBrokerOfferById(offerId)
            return offer
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Teklif detayları yüklenemedi')
        }
    }
)

export const createBrokerOffer = createAsyncThunk(
    'brokerOffers/create',
    async (offerData: BrokerOfferRequest, { rejectWithValue, dispatch }) => {
        try {
            const newOffer = await brokerService.createBrokerOffer(offerData)
            // Teklifleri yeniden yükle
            dispatch(fetchBrokerOffers())
            return newOffer
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Teklif oluşturulamadı')
        }
    }
)

export const fetchBrokerOfferStats = createAsyncThunk(
    'brokerOffers/fetchStats',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { brokerOffers: BrokerOffersState }
            const offers = state.brokerOffers.offers

            // Calculate stats from current offers
            const totalOffers = offers.length
            const pendingCount = offers.filter(offer => offer.status === OfferStatus.PENDING).length
            const acceptedCount = offers.filter(offer => offer.status === OfferStatus.ACCEPTED).length
            const rejectedCount = offers.filter(offer => offer.status === OfferStatus.REJECTED).length

            const totalCommission = offers
                .filter(offer => offer.status === OfferStatus.ACCEPTED)
                .reduce((sum, offer) => sum + (offer.commissionAmount || 0), 0)

            const averageOfferValue = totalOffers > 0
                ? offers.reduce((sum, offer) => sum + (offer.totalAmount || 0), 0) / totalOffers
                : 0

            const successRate = totalOffers > 0
                ? (acceptedCount / (acceptedCount + rejectedCount)) * 100
                : 0

            return {
                totalOffers,
                pendingCount,
                acceptedCount,
                rejectedCount,
                totalCommission,
                averageOfferValue,
                successRate
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'İstatistikler hesaplanamadı')
        }
    }
)

const brokerOffersSlice = createSlice({
    name: 'brokerOffers',
    initialState,
    reducers: {
        // Filter actions
        setStatusFilter: (state, action: PayloadAction<OfferStatus | 'ALL'>) => {
            state.filters.status = action.payload
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.filters.searchQuery = action.payload
        },
        setEcoFriendlyFilter: (state, action: PayloadAction<string>) => {
            state.filters.ecoFriendly = action.payload
        },
        setInsuranceFilter: (state, action: PayloadAction<string>) => {
            state.filters.insurance = action.payload
        },
        setSortBy: (state, action: PayloadAction<string>) => {
            state.filters.sortBy = action.payload
        },
        setSortDirection: (state, action: PayloadAction<'asc' | 'desc'>) => {
            state.filters.sortDirection = action.payload
        },
        resetFilters: (state) => {
            state.filters = initialState.filters
        },

        // Selection actions
        setSelectedOffer: (state, action: PayloadAction<BrokerOffer | null>) => {
            state.selectedOffer = action.payload
        },

        // Page actions
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload
        },

        // Clear errors and success states
        clearOffersError: (state) => {
            state.offersError = null
        },
        clearCreateOfferError: (state) => {
            state.createOfferError = null
        },
        clearCreateOfferSuccess: (state) => {
            state.createOfferSuccess = false
        },
        clearStatsError: (state) => {
            state.statsError = null
        },

        // Update offer in state
        updateOfferInState: (state, action: PayloadAction<BrokerOffer>) => {
            const updatedOffer = action.payload
            const index = state.offers.findIndex(offer => offer.id === updatedOffer.id)
            if (index !== -1) {
                state.offers[index] = updatedOffer
            }

            // Update in status-specific arrays
            if (updatedOffer.status === OfferStatus.PENDING) {
                const pendingIndex = state.pendingOffers.findIndex(offer => offer.id === updatedOffer.id)
                if (pendingIndex !== -1) {
                    state.pendingOffers[pendingIndex] = updatedOffer
                }
            } else if (updatedOffer.status === OfferStatus.ACCEPTED) {
                const acceptedIndex = state.acceptedOffers.findIndex(offer => offer.id === updatedOffer.id)
                if (acceptedIndex !== -1) {
                    state.acceptedOffers[acceptedIndex] = updatedOffer
                }
            } else if (updatedOffer.status === OfferStatus.REJECTED) {
                const rejectedIndex = state.rejectedOffers.findIndex(offer => offer.id === updatedOffer.id)
                if (rejectedIndex !== -1) {
                    state.rejectedOffers[rejectedIndex] = updatedOffer
                }
            }

            // Update selected offer if it's the same
            if (state.selectedOffer?.id === updatedOffer.id) {
                state.selectedOffer = updatedOffer
            }
        }
    },
    extraReducers: (builder) => {
        // Fetch Broker Offers
        builder
            .addCase(fetchBrokerOffers.pending, (state) => {
                state.offersLoading = true
                state.offersError = null
            })
            .addCase(fetchBrokerOffers.fulfilled, (state, action) => {
                state.offersLoading = false
                state.offers = action.payload

                // Separate by status
                state.pendingOffers = action.payload.filter(offer => offer.status === OfferStatus.PENDING)
                state.acceptedOffers = action.payload.filter(offer => offer.status === OfferStatus.ACCEPTED)
                state.rejectedOffers = action.payload.filter(offer => offer.status === OfferStatus.REJECTED)
            })
            .addCase(fetchBrokerOffers.rejected, (state, action) => {
                state.offersLoading = false
                state.offersError = action.payload as string
            })

        // Fetch Broker Offers Paginated
        builder
            .addCase(fetchBrokerOffersPaginated.pending, (state) => {
                state.offersLoading = true
                state.offersError = null
            })
            .addCase(fetchBrokerOffersPaginated.fulfilled, (state, action) => {
                state.offersLoading = false
                state.offers = action.payload.offers
                state.currentPage = action.payload.page
                state.totalPages = action.payload.totalPages
                state.totalElements = action.payload.totalElements

                // Separate by status
                state.pendingOffers = action.payload.offers.filter(offer => offer.status === OfferStatus.PENDING)
                state.acceptedOffers = action.payload.offers.filter(offer => offer.status === OfferStatus.ACCEPTED)
                state.rejectedOffers = action.payload.offers.filter(offer => offer.status === OfferStatus.REJECTED)
            })
            .addCase(fetchBrokerOffersPaginated.rejected, (state, action) => {
                state.offersLoading = false
                state.offersError = action.payload as string
            })

        // Fetch Offers by Status
        builder
            .addCase(fetchBrokerOffersByStatus.fulfilled, (state, action) => {
                const { status, offers } = action.payload
                if (status === OfferStatus.PENDING) {
                    state.pendingOffers = offers
                } else if (status === OfferStatus.ACCEPTED) {
                    state.acceptedOffers = offers
                } else if (status === OfferStatus.REJECTED) {
                    state.rejectedOffers = offers
                }
            })

        // Fetch Offer by ID
        builder
            .addCase(fetchBrokerOfferById.fulfilled, (state, action) => {
                state.selectedOffer = action.payload
            })

        // Create Broker Offer
        builder
            .addCase(createBrokerOffer.pending, (state) => {
                state.createOfferLoading = true
                state.createOfferError = null
                state.createOfferSuccess = false
            })
            .addCase(createBrokerOffer.fulfilled, (state, action) => {
                state.createOfferLoading = false
                state.createOfferSuccess = true
                // Yeni teklif offers array'ine eklenir (fetchBrokerOffers otomatik çağrılır)
            })
            .addCase(createBrokerOffer.rejected, (state, action) => {
                state.createOfferLoading = false
                state.createOfferError = action.payload as string
            })

        // Fetch Broker Offer Stats
        builder
            .addCase(fetchBrokerOfferStats.pending, (state) => {
                state.statsLoading = true
                state.statsError = null
            })
            .addCase(fetchBrokerOfferStats.fulfilled, (state, action) => {
                state.statsLoading = false
                state.stats = action.payload
            })
            .addCase(fetchBrokerOfferStats.rejected, (state, action) => {
                state.statsLoading = false
                state.statsError = action.payload as string
            })

        builder
            .addCase(fetchCurrentBrokerOffers.pending, (state) => {
                state.offersLoading = true
                state.offersError = null
            })
            .addCase(fetchCurrentBrokerOffers.fulfilled, (state, action) => {
                state.offersLoading = false
                state.offers = action.payload

                // Durumlara göre ayır
                state.pendingOffers = action.payload.filter(offer => offer.status === OfferStatus.PENDING)
                state.acceptedOffers = action.payload.filter(offer => offer.status === OfferStatus.ACCEPTED)
                state.rejectedOffers = action.payload.filter(offer => offer.status === OfferStatus.REJECTED)

                // Stats güncelle
                const totalOffers = action.payload.length
                const pendingCount = state.pendingOffers.length
                const acceptedCount = state.acceptedOffers.length
                const rejectedCount = state.rejectedOffers.length

                const totalCommission = action.payload.reduce(
                    (sum, offer) => sum + (offer.commissionAmount || 0), 0
                )

                const averageOfferValue = totalOffers > 0
                    ? action.payload.reduce((sum, offer) => sum + (offer.totalAmount || 0), 0) / totalOffers
                    : 0

                const successRate = totalOffers > 0
                    ? (acceptedCount / (acceptedCount + rejectedCount)) * 100
                    : 0

                state.stats = {
                    ...state.stats,
                    totalOffers,
                    pendingCount,
                    acceptedCount,
                    rejectedCount,
                    totalCommission,
                    averageOfferValue,
                    successRate
                }
            })
            .addCase(fetchCurrentBrokerOffers.rejected, (state, action) => {
                state.offersLoading = false
                state.offersError = action.payload as string
            })

        // Fetch Sender Received Broker Offers
        builder
            .addCase(fetchCurrentSenderReceivedBrokerOffers.pending, (state) => {
                state.offersLoading = true
                state.offersError = null
            })
            .addCase(fetchCurrentSenderReceivedBrokerOffers.fulfilled, (state, action) => {
                state.offersLoading = false
                state.offers = action.payload

                // Durumlara göre ayır
                state.pendingOffers = action.payload.filter(offer => offer.status === OfferStatus.PENDING)
                state.acceptedOffers = action.payload.filter(offer => offer.status === OfferStatus.ACCEPTED)
                state.rejectedOffers = action.payload.filter(offer => offer.status === OfferStatus.REJECTED)
            })
            .addCase(fetchCurrentSenderReceivedBrokerOffers.rejected, (state, action) => {
                state.offersLoading = false
                state.offersError = action.payload as string
            })

    }
})

export const {
    setStatusFilter,
    setSearchQuery,
    setEcoFriendlyFilter,
    setInsuranceFilter,
    setSortBy,
    setSortDirection,
    resetFilters,
    setSelectedOffer,
    setCurrentPage,
    clearOffersError,
    clearCreateOfferError,
    clearCreateOfferSuccess,
    clearStatsError,
    updateOfferInState
} = brokerOffersSlice.actions

export default brokerOffersSlice.reducer