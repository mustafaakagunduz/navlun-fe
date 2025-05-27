// src/store/slices/offersSlice.ts - YENİ DOSYA
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { LoadWithOffers, OfferWithVehicleInfo } from '@/services/loadService'
import { OfferRequest } from '@/services/offerService'
import loadService from '@/services/loadService'
import offerService from '@/services/offerService'
import { updateOfferCount, incrementOfferCount, decrementOfferCount } from './notificationsSlice'


interface OffersState {
    // Sender - Gelen teklifler
    loadsWithOffers: LoadWithOffers[]
    loadsWithOffersLoading: boolean
    loadsWithOffersError: string | null

    // Carrier - Verilen teklifler
    myOffers: OfferWithVehicleInfo[]
    myOffersLoading: boolean
    myOffersError: string | null

    // Carrier - Kabul edilmiş yükler
    acceptedLoads: LoadWithOffers[]
    acceptedLoadsLoading: boolean

    // Carrier - Reddedilen teklifler
    rejectedOffers: LoadWithOffers[]
    rejectedOffersLoading: boolean

    // UI State
    selectedOffer: OfferWithVehicleInfo | null
    offerSubmitting: boolean
}

const initialState: OffersState = {
    loadsWithOffers: [],
    loadsWithOffersLoading: false,
    loadsWithOffersError: null,
    myOffers: [],
    myOffersLoading: false,
    myOffersError: null,
    acceptedLoads: [],
    acceptedLoadsLoading: false,
    rejectedOffers: [],
    rejectedOffersLoading: false,
    selectedOffer: null,
    offerSubmitting: false,
}

// Async Thunks
export const fetchLoadsWithOffers = createAsyncThunk(
    'offers/fetchLoadsWithOffers',
    async (_, { rejectWithValue }) => {
        try {
            const data = await loadService.getCurrentUserLoadsWithOffers()
            return data
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Teklifler yüklenemedi')
        }
    }
)

export const createOffer = createAsyncThunk(
    'offers/createOffer',
    async (offerData: OfferRequest, { rejectWithValue, dispatch }) => {
        try {
            const newOffer = await offerService.createOffer(offerData)
            // Teklif verildikten sonra available loads'ı güncelle
            dispatch({ type: 'loads/removeLoadFromAvailable', payload: offerData.loadId })
            return newOffer
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Teklif gönderilemedi')
        }
    }
)

export const acceptOffer = createAsyncThunk(
    'offers/acceptOffer',
    async (offerId: string, { rejectWithValue, dispatch }) => {
        try {
            await offerService.acceptOffer(offerId)
            // Teklif kabul edildikten sonra listeyi yenile
            dispatch(fetchLoadsWithOffers())
            return offerId
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Teklif kabul edilemedi')
        }
    }
)

export const rejectOffer = createAsyncThunk(
    'offers/rejectOffer',
    async (offerId: string, { rejectWithValue, dispatch }) => {
        try {
            await offerService.rejectOffer(offerId)
            // Teklif reddedildikten sonra listeyi yenile
            dispatch(fetchLoadsWithOffers())
            return offerId
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Teklif reddedilemedi')
        }
    }
)

export const fetchAcceptedLoads = createAsyncThunk(
    'offers/fetchAcceptedLoads',
    async (_, { rejectWithValue }) => {
        try {
            const data = await offerService.getCurrentCarrierAcceptedLoads()
            return data
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Kabul edilmiş yükler yüklenemedi')
        }
    }
)

export const fetchRejectedOffers = createAsyncThunk(
    'offers/fetchRejectedOffers',
    async (_, { rejectWithValue }) => {
        try {
            const data = await offerService.getCurrentCarrierRejectedOffers()
            return data
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Reddedilen teklifler yüklenemedi')
        }
    }
)

const offersSlice = createSlice({
    name: 'offers',
    initialState,
    reducers: {
        setSelectedOffer: (state, action: PayloadAction<OfferWithVehicleInfo | null>) => {
            state.selectedOffer = action.payload
        },
        updateOfferStatus: (state, action: PayloadAction<{ offerId: string; status: 'PENDING' | 'ACCEPTED' | 'REJECTED' }>) => {
            // Bellek içinde teklif durumu güncelleme
            state.loadsWithOffers.forEach(loadWithOffers => {
                const offer = loadWithOffers.offers.find(o => o.offerId === action.payload.offerId)
                if (offer) {
                    offer.status = action.payload.status
                }
            })
        },
    },
    extraReducers: (builder) => {
        // Loads with Offers
        builder
            .addCase(fetchLoadsWithOffers.pending, (state) => {
                state.loadsWithOffersLoading = true
                state.loadsWithOffersError = null
            })
            .addCase(fetchLoadsWithOffers.fulfilled, (state, action) => {
                state.loadsWithOffersLoading = false
                state.loadsWithOffers = action.payload
            })
            .addCase(fetchLoadsWithOffers.rejected, (state, action) => {
                state.loadsWithOffersLoading = false
                state.loadsWithOffersError = action.payload as string
            })


        // Create Offer
        builder
            .addCase(createOffer.pending, (state) => {
                state.offerSubmitting = true
            })
            .addCase(createOffer.fulfilled, (state) => {
                state.offerSubmitting = false
            })
            .addCase(createOffer.rejected, (state) => {
                state.offerSubmitting = false
            })

        // Accepted Loads
        builder
            .addCase(fetchAcceptedLoads.pending, (state) => {
                state.acceptedLoadsLoading = true
            })
            .addCase(fetchAcceptedLoads.fulfilled, (state, action) => {
                state.acceptedLoadsLoading = false
                state.acceptedLoads = action.payload
            })

        // Rejected Offers
        builder
            .addCase(fetchRejectedOffers.pending, (state) => {
                state.rejectedOffersLoading = true
            })
            .addCase(fetchRejectedOffers.fulfilled, (state, action) => {
                state.rejectedOffersLoading = false
                state.rejectedOffers = action.payload
            })
    },
})

export const { setSelectedOffer, updateOfferStatus } = offersSlice.actions
export default offersSlice.reducer