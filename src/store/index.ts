import { configureStore } from '@reduxjs/toolkit'
import loadsReducer from './slices/loadsSlice'
import offersReducer from './slices/offersSlice'
import notificationsReducer from './slices/notificationsSlice'
import deliveryReducer from './slices/deliverySlice'

export const store = configureStore({
    reducer: {
        loads: loadsReducer,
        offers: offersReducer,
        notifications: notificationsReducer,
        delivery: deliveryReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch