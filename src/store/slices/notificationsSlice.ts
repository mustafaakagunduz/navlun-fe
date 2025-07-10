// src/store/slices/notificationsSlice.ts - YENİ DOSYA
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import messageService from "@/services/messageService";

interface NotificationCounts {
    offers: number
    loads: number
    messages: number
}

interface NotificationsState {
    counts: NotificationCounts
    loading: boolean
    error: string | null
}

const initialState: NotificationsState = {
    counts: {
        offers: 0,
        loads: 0,
        messages: 0,
    },
    loading: false,
    error: null,
}

export const fetchNotificationCounts = createAsyncThunk(
    'notifications/fetchCounts',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as any;
            const { offers } = state.offers;

            // Redux state'den mevcut verileri kullanarak counts hesapla
            const loadsWithOffers = offers.loadsWithOffers || [];
            const acceptedLoads = offers.acceptedLoads || [];
            const rejectedOffers = offers.rejectedOffers || [];

            const offerCount = loadsWithOffers.reduce(
                (total: number, loadWithOffers: any) => total + (loadWithOffers.pendingOffersCount || 0),
                0
            );

            const loadCount = acceptedLoads.length + rejectedOffers.length;

            return {
                offers: offerCount,
                loads: loadCount,
                messages: 0, // Şimdilik messages için 0
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Notification counts yüklenemedi');
        }
    }
);



const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        updateOfferCount: (state, action: PayloadAction<number>) => {
            state.counts.offers = action.payload
        },
        updateLoadCount: (state, action: PayloadAction<number>) => {
            state.counts.loads = action.payload
        },
        incrementOfferCount: (state) => {
            state.counts.offers += 1
        },
        decrementOfferCount: (state) => {
            state.counts.offers = Math.max(0, state.counts.offers - 1)
        },
        resetOfferCount: (state) => {
            state.counts.offers = 0
        },
        resetLoadCount: (state) => {
            state.counts.loads = 0
        },

        incrementMessageCount: (state) => {
            state.counts.messages += 1
        },
        decrementMessageCount: (state) => {
            state.counts.messages = Math.max(0, state.counts.messages - 1)
        },
        updateMessageCount: (state, action: PayloadAction<number>) => {
            state.counts.messages = action.payload;
        },
        resetMessageCount: (state) => {
            state.counts.messages = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotificationCounts.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchNotificationCounts.fulfilled, (state, action) => {
                state.loading = false
                state.counts = action.payload
            })
            .addCase(fetchNotificationCounts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

    },
})

export const {
    updateOfferCount,
    updateLoadCount,
    incrementOfferCount,
    decrementOfferCount,
    resetOfferCount,
    resetLoadCount,
    updateMessageCount,
    incrementMessageCount,
    decrementMessageCount,
    resetMessageCount,
} = notificationsSlice.actions

export default notificationsSlice.reducer