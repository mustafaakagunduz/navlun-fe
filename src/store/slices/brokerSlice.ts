// src/store/slices/brokerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Load } from '@/services/loadService'
import loadService from '@/services/loadService'
import brokerService, { BrokerProfile } from '@/services/brokerService'
import authService from '@/services/authService'

interface BrokerState {
    // Broker profile
    profile: BrokerProfile | null
    profileLoading: boolean
    profileError: string | null

    offeredLoads: string[], // loadId'leri içeren array
    offeredLoadsLoading: boolean,
    offeredLoadsError: string | null,

    // Available loads for broker
    availableLoads: Load[]
    availableLoadsLoading: boolean
    availableLoadsError: string | null
    availableLoadsPage: number
    availableLoadsTotalPages: number
    availableLoadsTotalElements: number

    // Broker statistics
    stats: {
        totalCommission: number
        monthlyGrowth: number
        activeDeals: number
        successRate: number
        avgDealValue: number
        ecoDealsRatio: number
        clientSatisfaction: number
        marketShare: number
    }
    statsLoading: boolean
    statsError: string | null

    // Filters for available loads
    filters: {
        searchQuery: string
        goodsType: string
        insurance: string
        ecoFriendly: string
        sortBy: string
        sortDirection: 'asc' | 'desc'
    }
}

const initialState: BrokerState = {
    profile: null,
    profileLoading: false,
    profileError: null,

    offeredLoads: [],
    offeredLoadsLoading: false,
    offeredLoadsError: null,

    availableLoads: [],
    availableLoadsLoading: false,
    availableLoadsError: null,
    availableLoadsPage: 0,
    availableLoadsTotalPages: 0,
    availableLoadsTotalElements: 0,

    stats: {
        totalCommission: 0,
        monthlyGrowth: 0,
        activeDeals: 0,
        successRate: 0,
        avgDealValue: 0,
        ecoDealsRatio: 0,
        clientSatisfaction: 0,
        marketShare: 0
    },
    statsLoading: false,
    statsError: null,

    filters: {
        searchQuery: '',
        goodsType: '',
        insurance: '',
        ecoFriendly: '',
        sortBy: 'createdAt',
        sortDirection: 'desc'
    }
}

// Async Thunks
export const fetchBrokerProfile = createAsyncThunk(
    'broker/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const currentUser = await authService.getCurrentUser()
            const profile = await brokerService.getBrokerProfileByUserId(currentUser.id)
            return profile
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Broker profili yüklenemedi')
        }
    }
)

export const checkOfferedLoads = createAsyncThunk(
    'broker/checkOfferedLoads',
    async (loadIds: string[], { rejectWithValue }) => {
        try {
            const currentUser = await authService.getCurrentUser()
            const brokerProfile = await brokerService.getBrokerProfileByUserId(currentUser.id)

            const offeredLoadIds: string[] = []

            // Her load için teklif verilip verilmediğini kontrol et
            for (const loadId of loadIds) {
                const hasOffered = await brokerService.hasBrokerAlreadyOfferedForLoad(loadId, brokerProfile.id)
                if (hasOffered) {
                    offeredLoadIds.push(loadId)
                }
            }

            return offeredLoadIds
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Teklif kontrolü yapılamadı')
        }
    }
)

export const fetchAvailableLoadsForBroker = createAsyncThunk(
    'broker/fetchAvailableLoads',
    async ({ page = 0, size = 12 }: { page?: number; size?: number }, { rejectWithValue }) => {
        try {
            const response = await loadService.getOpenLoadsForBrokersPaginated(page, size)
            return {
                loads: response.content || [],
                page: response.page || 0,
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Açık yükler yüklenemedi')
        }
    }
)

export const fetchBrokerStats = createAsyncThunk(
    'broker/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            // Bu API endpoint'i backend'te olduğunda kullanılacak
            // Şimdilik mock data döndürüyoruz
            const stats = {
                totalCommission: 125640,
                monthlyGrowth: 31.2,
                activeDeals: 47,
                successRate: 96.8,
                avgDealValue: 8750,
                ecoDealsRatio: 73,
                clientSatisfaction: 98.1,
                marketShare: 15.4
            }
            return stats
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'İstatistikler yüklenemedi')
        }
    }
)

const brokerSlice = createSlice({
    name: 'broker',
    initialState,
    reducers: {
        // Filter actions
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.filters.searchQuery = action.payload
        },
        setGoodsTypeFilter: (state, action: PayloadAction<string>) => {
            state.filters.goodsType = action.payload
        },
        setInsuranceFilter: (state, action: PayloadAction<string>) => {
            state.filters.insurance = action.payload
        },
        setEcoFriendlyFilter: (state, action: PayloadAction<string>) => {
            state.filters.ecoFriendly = action.payload
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

        // Page actions
        setAvailableLoadsPage: (state, action: PayloadAction<number>) => {
            state.availableLoadsPage = action.payload
        },

        // Clear errors
        clearProfileError: (state) => {
            state.profileError = null
        },
        clearAvailableLoadsError: (state) => {
            state.availableLoadsError = null
        },
        clearStatsError: (state) => {
            state.statsError = null
        }
    },
    extraReducers: (builder) => {
        // Broker Profile
        builder
            .addCase(fetchBrokerProfile.pending, (state) => {
                state.profileLoading = true
                state.profileError = null
            })
            .addCase(fetchBrokerProfile.fulfilled, (state, action) => {
                state.profileLoading = false
                state.profile = action.payload
            })
            .addCase(fetchBrokerProfile.rejected, (state, action) => {
                state.profileLoading = false
                state.profileError = action.payload as string
            })

        // Available Loads
        builder
            .addCase(fetchAvailableLoadsForBroker.pending, (state) => {
                state.availableLoadsLoading = true
                state.availableLoadsError = null
            })
            .addCase(fetchAvailableLoadsForBroker.fulfilled, (state, action) => {
                state.availableLoadsLoading = false
                state.availableLoads = action.payload.loads
                state.availableLoadsPage = action.payload.page
                state.availableLoadsTotalPages = action.payload.totalPages
                state.availableLoadsTotalElements = action.payload.totalElements
            })
            .addCase(fetchAvailableLoadsForBroker.rejected, (state, action) => {
                state.availableLoadsLoading = false
                state.availableLoadsError = action.payload as string
            })

        // Broker Stats
        builder
            .addCase(fetchBrokerStats.pending, (state) => {
                state.statsLoading = true
                state.statsError = null
            })
            .addCase(fetchBrokerStats.fulfilled, (state, action) => {
                state.statsLoading = false
                state.stats = action.payload
            })
            .addCase(fetchBrokerStats.rejected, (state, action) => {
                state.statsLoading = false
                state.statsError = action.payload as string
            })

        builder
            .addCase(checkOfferedLoads.pending, (state) => {
                state.offeredLoadsLoading = true
                state.offeredLoadsError = null
            })
            .addCase(checkOfferedLoads.fulfilled, (state, action) => {
                state.offeredLoadsLoading = false
                state.offeredLoads = action.payload
            })
            .addCase(checkOfferedLoads.rejected, (state, action) => {
                state.offeredLoadsLoading = false
                state.offeredLoadsError = action.payload as string
            })
    }
})

export const {
    setSearchQuery,
    setGoodsTypeFilter,
    setInsuranceFilter,
    setEcoFriendlyFilter,
    setSortBy,
    setSortDirection,
    resetFilters,
    setAvailableLoadsPage,
    clearProfileError,
    clearAvailableLoadsError,
    clearStatsError
} = brokerSlice.actions

export default brokerSlice.reducer