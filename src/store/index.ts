import { configureStore } from '@reduxjs/toolkit'
import loadsReducer from './slices/loadsSlice'
import offersReducer from './slices/offersSlice'
import notificationsReducer from './slices/notificationsSlice'

export const store = configureStore({
    reducer: {
        loads: loadsReducer,
        offers: offersReducer,
        notifications: notificationsReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch