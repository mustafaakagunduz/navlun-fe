import { configureStore } from '@reduxjs/toolkit'
import loadsReducer from './slices/loadsSlice'
import offersReducer from './slices/offersSlice'
import notificationsReducer from './slices/notificationsSlice'
import deliveryReducer from './slices/deliverySlice'
import brokerReducer from './slices/brokerSlice'
import shipsReducer from './slices/shipsSlice'
import brokerOffersReducer from './slices/brokerOffersSlice'
import messagesReducer from './slices/messagesSlice'

export const store = configureStore({
    reducer: {
        loads: loadsReducer,
        offers: offersReducer,
        notifications: notificationsReducer,
        delivery: deliveryReducer,
        broker: brokerReducer,
        ships: shipsReducer,
        brokerOffers: brokerOffersReducer,
        messages: messagesReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch