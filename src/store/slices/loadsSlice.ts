// src/store/slices/loadsSlice.ts - YENİ DOSYA
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Load, LoadStatus, LoadRequest } from '@/services/loadService'
import loadService from '@/services/loadService'
import authService from "@/services/authService";
import senderService from "@/services/senderService";

interface LoadsState {
    // Sender loads
    myLoads: Load[]
    myLoadsLoading: boolean
    myLoadsError: string | null

    // Available loads for carriers
    availableLoads: Load[]
    availableLoadsLoading: boolean
    availableLoadsError: string | null

    // Load details
    selectedLoad: Load | null

    // Filters
    statusFilter: LoadStatus | 'ALL'
    searchQuery: string

    // Pagination
    currentPage: number
    totalPages: number
    totalElements: number
}

const initialState: LoadsState = {
    myLoads: [],
    myLoadsLoading: false,
    myLoadsError: null,
    availableLoads: [],
    availableLoadsLoading: false,
    availableLoadsError: null,
    selectedLoad: null,
    statusFilter: 'ALL',
    searchQuery: '',
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
}

// Async Thunks
export const fetchMyLoads = createAsyncThunk(
    'loads/fetchMyLoads',
    async (_, { rejectWithValue }) => {
        try {
            // getCurrentUserLoads yerine mevcut mantığı kullan
            const currentUser = await authService.getCurrentUser()
            const senderProfile = await senderService.getSenderProfileByUserId(currentUser.id)
            const response = await loadService.getLoadsBySenderPaginated(senderProfile.id)
            return response
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Yükler yüklenemedi')
        }
    }
)

export const fetchAvailableLoads = createAsyncThunk(
    'loads/fetchAvailableLoads',
    async ({ page = 0, size = 50 }: { page?: number; size?: number }, { rejectWithValue }) => {
        try {
            const response = await loadService.getAvailableLoadsForOffers(page, size)
            return response
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Müsait yükler yüklenemedi')
        }
    }
)

export const createLoad = createAsyncThunk(
    'loads/createLoad',
    async (loadData: LoadRequest, { rejectWithValue, dispatch }) => {
        try {
            const newLoad = await loadService.createLoad(loadData)
            // Yeni yük eklendikten sonra listeyi yenile
            dispatch(fetchMyLoads())
            return newLoad
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Yük oluşturulamadı')
        }
    }
)

export const updateLoadStatus = createAsyncThunk(
    'loads/updateLoadStatus',
    async ({ loadId, status }: { loadId: string; status: LoadStatus }, { rejectWithValue }) => {
        try {
            const updatedLoad = await loadService.updateLoadStatus(loadId, status)
            return updatedLoad
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Yük durumu güncellenemedi')
        }
    }
)

const loadsSlice = createSlice({
    name: 'loads',
    initialState,
    reducers: {
        setStatusFilter: (state, action: PayloadAction<LoadStatus | 'ALL'>) => {
            state.statusFilter = action.payload
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload
        },
        setSelectedLoad: (state, action: PayloadAction<Load | null>) => {
            state.selectedLoad = action.payload
        },
        updateLoadInState: (state, action: PayloadAction<Load>) => {
            // Bellek içinde yük güncelleme
            const index = state.myLoads.findIndex(load => load.id === action.payload.id)
            if (index !== -1) {
                state.myLoads[index] = action.payload
            }

            const availableIndex = state.availableLoads.findIndex(load => load.id === action.payload.id)
            if (availableIndex !== -1) {
                state.availableLoads[availableIndex] = action.payload
            }
        },
        removeLoadFromAvailable: (state, action: PayloadAction<string>) => {
            // Teklif verilen yükü available listesinden çıkar
            state.availableLoads = state.availableLoads.filter(load => load.id !== action.payload)
        },
    },
    extraReducers: (builder) => {
        // My Loads
        builder
            .addCase(fetchMyLoads.pending, (state) => {
                state.myLoadsLoading = true
                state.myLoadsError = null
            })
            .addCase(fetchMyLoads.fulfilled, (state, action) => {
                state.myLoadsLoading = false
                // API response'u kontrol et - eğer PageResponse ise content'i al, değilse direkt kullan
                state.myLoads = Array.isArray(action.payload) ? action.payload : action.payload.content || []
            })
            .addCase(fetchMyLoads.rejected, (state, action) => {
                state.myLoadsLoading = false
                state.myLoadsError = action.payload as string
            })

        // Available Loads
        builder
            .addCase(fetchAvailableLoads.pending, (state) => {
                state.availableLoadsLoading = true
                state.availableLoadsError = null
            })
            .addCase(fetchAvailableLoads.fulfilled, (state, action) => {
                state.availableLoadsLoading = false
                state.availableLoads = action.payload.content || []
                state.totalPages = action.payload.totalPages || 0
                state.totalElements = action.payload.totalElements || 0
                state.currentPage = action.payload.page !== undefined ? action.payload.page : action.payload.page || 0
            })
            .addCase(fetchAvailableLoads.rejected, (state, action) => {
                state.availableLoadsLoading = false
                state.availableLoadsError = action.payload as string
            })

        // Update Load Status
        builder
            .addCase(updateLoadStatus.fulfilled, (state, action) => {
                const updatedLoad = action.payload
                // State'teki yükü güncelle
                const index = state.myLoads.findIndex(load => load.id === updatedLoad.id)
                if (index !== -1) {
                    state.myLoads[index] = updatedLoad
                }
            })
    },
})

export const {
    setStatusFilter,
    setSearchQuery,
    setSelectedLoad,
    updateLoadInState,
    removeLoadFromAvailable,
} = loadsSlice.actions

export default loadsSlice.reducer