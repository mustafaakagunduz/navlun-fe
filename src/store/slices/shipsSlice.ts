// src/store/slices/shipsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import shipService, { Ship, ShipRequest, ShipUpdateRequest } from '@/services/shipService'
import brokerService from '@/services/brokerService'
import authService from '@/services/authService'

interface ShipsState {
    // All ships
    ships: Ship[]
    shipsLoading: boolean
    shipsError: string | null

    // Broker's ships
    brokerShips: Ship[]
    brokerShipsLoading: boolean
    brokerShipsError: string | null

    // Available ships for broker
    availableShips: Ship[]
    availableShipsLoading: boolean
    availableShipsError: string | null

    // Eco-friendly ships
    ecoFriendlyShips: Ship[]
    ecoFriendlyShipsLoading: boolean
    ecoFriendlyShipsError: string | null

    // Selected ship
    selectedShip: Ship | null

    // Ship creation/update
    createShipLoading: boolean
    createShipError: string | null
    updateShipLoading: boolean
    updateShipError: string | null

    // Filters
    filters: {
        shipType: string
        ecoFriendly: string
        available: string
        port: string
        minCapacity: string
        maxCapacity: string
    }

    // Pagination for broker ships
    brokerShipsPage: number
    brokerShipsTotalPages: number
    brokerShipsTotalElements: number
}

const initialState: ShipsState = {
    ships: [],
    shipsLoading: false,
    shipsError: null,

    brokerShips: [],
    brokerShipsLoading: false,
    brokerShipsError: null,

    availableShips: [],
    availableShipsLoading: false,
    availableShipsError: null,

    ecoFriendlyShips: [],
    ecoFriendlyShipsLoading: false,
    ecoFriendlyShipsError: null,

    selectedShip: null,

    createShipLoading: false,
    createShipError: null,
    updateShipLoading: false,
    updateShipError: null,

    filters: {
        shipType: '',
        ecoFriendly: '',
        available: '',
        port: '',
        minCapacity: '',
        maxCapacity: ''
    },

    brokerShipsPage: 0,
    brokerShipsTotalPages: 0,
    brokerShipsTotalElements: 0
}

// Async Thunks
export const fetchAllShips = createAsyncThunk(
    'ships/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const ships = await shipService.getAllShips()
            return ships
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Gemiler yüklenemedi')
        }
    }
)

export const fetchBrokerShips = createAsyncThunk(
    'ships/fetchBrokerShips',
    async (_, { rejectWithValue }) => {
        try {
            const currentUser = await authService.getCurrentUser()
            const brokerProfile = await brokerService.getBrokerProfileByUserId(currentUser.id)
            const ships = await shipService.getShipsByBroker(brokerProfile.id)
            return ships
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Broker gemileri yüklenemedi')
        }
    }
)

export const fetchBrokerShipsPaginated = createAsyncThunk(
    'ships/fetchBrokerShipsPaginated',
    async ({ page = 0, size = 20 }: { page?: number; size?: number }, { rejectWithValue }) => {
        try {
            const currentUser = await authService.getCurrentUser()
            const brokerProfile = await brokerService.getBrokerProfileByUserId(currentUser.id)
            const response = await shipService.getShipsByBrokerPaginated(brokerProfile.id, page, size)
            return {
                ships: response.content || [],
                page: response.page || 0,
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Broker gemileri yüklenemedi')
        }
    }
)

export const fetchAvailableShipsByBroker = createAsyncThunk(
    'ships/fetchAvailableShipsByBroker',
    async (_, { rejectWithValue }) => {
        try {
            const currentUser = await authService.getCurrentUser()
            const brokerProfile = await brokerService.getBrokerProfileByUserId(currentUser.id)
            const ships = await shipService.getAvailableShipsByBroker(brokerProfile.id)
            return ships
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Müsait gemiler yüklenemedi')
        }
    }
)

export const fetchEcoFriendlyShipsByBroker = createAsyncThunk(
    'ships/fetchEcoFriendlyShipsByBroker',
    async (_, { rejectWithValue }) => {
        try {
            const currentUser = await authService.getCurrentUser()
            const brokerProfile = await brokerService.getBrokerProfileByUserId(currentUser.id)
            const ships = await shipService.getEcoFriendlyShipsByBroker(brokerProfile.id)
            return ships
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Çevreci gemiler yüklenemedi')
        }
    }
)

export const fetchShipById = createAsyncThunk(
    'ships/fetchById',
    async (shipId: string, { rejectWithValue }) => {
        try {
            const ship = await shipService.getShipById(shipId)
            return ship
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Gemi detayları yüklenemedi')
        }
    }
)

export const createShip = createAsyncThunk(
    'ships/create',
    async (shipData: ShipRequest, { rejectWithValue, dispatch }) => {
        try {
            const newShip = await shipService.createShip(shipData)
            // Broker gemilerini yeniden yükle
            dispatch(fetchBrokerShips())
            return newShip
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Gemi oluşturulamadı')
        }
    }
)

export const updateShip = createAsyncThunk(
    'ships/update',
    async ({ shipId, updateData }: { shipId: string; updateData: ShipUpdateRequest }, { rejectWithValue, dispatch }) => {
        try {
            const updatedShip = await shipService.updateShip(shipId, updateData)
            // Broker gemilerini yeniden yükle
            dispatch(fetchBrokerShips())
            return updatedShip
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Gemi güncellenemedi')
        }
    }
)

export const deleteShip = createAsyncThunk(
    'ships/delete',
    async (shipId: string, { rejectWithValue, dispatch }) => {
        try {
            await shipService.deleteShip(shipId)
            // Broker gemilerini yeniden yükle
            dispatch(fetchBrokerShips())
            return shipId
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Gemi silinemedi')
        }
    }
)

const shipsSlice = createSlice({
    name: 'ships',
    initialState,
    reducers: {
        // Filter actions
        setShipTypeFilter: (state, action: PayloadAction<string>) => {
            state.filters.shipType = action.payload
        },
        setEcoFriendlyFilter: (state, action: PayloadAction<string>) => {
            state.filters.ecoFriendly = action.payload
        },
        setAvailableFilter: (state, action: PayloadAction<string>) => {
            state.filters.available = action.payload
        },
        setPortFilter: (state, action: PayloadAction<string>) => {
            state.filters.port = action.payload
        },
        setCapacityFilter: (state, action: PayloadAction<{ min: string; max: string }>) => {
            state.filters.minCapacity = action.payload.min
            state.filters.maxCapacity = action.payload.max
        },
        resetFilters: (state) => {
            state.filters = initialState.filters
        },

        // Selection actions
        setSelectedShip: (state, action: PayloadAction<Ship | null>) => {
            state.selectedShip = action.payload
        },

        // Pagination actions
        setBrokerShipsPage: (state, action: PayloadAction<number>) => {
            state.brokerShipsPage = action.payload
        },

        // Clear errors
        clearShipsError: (state) => {
            state.shipsError = null
        },
        clearBrokerShipsError: (state) => {
            state.brokerShipsError = null
        },
        clearAvailableShipsError: (state) => {
            state.availableShipsError = null
        },
        clearCreateShipError: (state) => {
            state.createShipError = null
        },
        clearUpdateShipError: (state) => {
            state.updateShipError = null
        },

        // Update ship in state
        updateShipInState: (state, action: PayloadAction<Ship>) => {
            const updatedShip = action.payload

            // Update in brokerShips
            const brokerShipIndex = state.brokerShips.findIndex(ship => ship.id === updatedShip.id)
            if (brokerShipIndex !== -1) {
                state.brokerShips[brokerShipIndex] = updatedShip
            }

            // Update in availableShips
            const availableShipIndex = state.availableShips.findIndex(ship => ship.id === updatedShip.id)
            if (availableShipIndex !== -1) {
                state.availableShips[availableShipIndex] = updatedShip
            }

            // Update selected ship if it's the same
            if (state.selectedShip?.id === updatedShip.id) {
                state.selectedShip = updatedShip
            }
        },

        // Remove ship from state
        removeShipFromState: (state, action: PayloadAction<string>) => {
            const shipId = action.payload

            state.brokerShips = state.brokerShips.filter(ship => ship.id !== shipId)
            state.availableShips = state.availableShips.filter(ship => ship.id !== shipId)
            state.ecoFriendlyShips = state.ecoFriendlyShips.filter(ship => ship.id !== shipId)

            if (state.selectedShip?.id === shipId) {
                state.selectedShip = null
            }
        }
    },
    extraReducers: (builder) => {
        // Fetch All Ships
        builder
            .addCase(fetchAllShips.pending, (state) => {
                state.shipsLoading = true
                state.shipsError = null
            })
            .addCase(fetchAllShips.fulfilled, (state, action) => {
                state.shipsLoading = false
                state.ships = action.payload
            })
            .addCase(fetchAllShips.rejected, (state, action) => {
                state.shipsLoading = false
                state.shipsError = action.payload as string
            })

        // Fetch Broker Ships
        builder
            .addCase(fetchBrokerShips.pending, (state) => {
                state.brokerShipsLoading = true
                state.brokerShipsError = null
            })
            .addCase(fetchBrokerShips.fulfilled, (state, action) => {
                state.brokerShipsLoading = false
                state.brokerShips = action.payload
            })
            .addCase(fetchBrokerShips.rejected, (state, action) => {
                state.brokerShipsLoading = false
                state.brokerShipsError = action.payload as string
            })

        // Fetch Broker Ships Paginated
        builder
            .addCase(fetchBrokerShipsPaginated.pending, (state) => {
                state.brokerShipsLoading = true
                state.brokerShipsError = null
            })
            .addCase(fetchBrokerShipsPaginated.fulfilled, (state, action) => {
                state.brokerShipsLoading = false
                state.brokerShips = action.payload.ships
                state.brokerShipsPage = action.payload.page
                state.brokerShipsTotalPages = action.payload.totalPages
                state.brokerShipsTotalElements = action.payload.totalElements
            })
            .addCase(fetchBrokerShipsPaginated.rejected, (state, action) => {
                state.brokerShipsLoading = false
                state.brokerShipsError = action.payload as string
            })

        // Fetch Available Ships by Broker
        builder
            .addCase(fetchAvailableShipsByBroker.pending, (state) => {
                state.availableShipsLoading = true
                state.availableShipsError = null
            })
            .addCase(fetchAvailableShipsByBroker.fulfilled, (state, action) => {
                state.availableShipsLoading = false
                state.availableShips = action.payload
            })
            .addCase(fetchAvailableShipsByBroker.rejected, (state, action) => {
                state.availableShipsLoading = false
                state.availableShipsError = action.payload as string
            })

        // Fetch Eco-Friendly Ships by Broker
        builder
            .addCase(fetchEcoFriendlyShipsByBroker.pending, (state) => {
                state.ecoFriendlyShipsLoading = true
                state.ecoFriendlyShipsError = null
            })
            .addCase(fetchEcoFriendlyShipsByBroker.fulfilled, (state, action) => {
                state.ecoFriendlyShipsLoading = false
                state.ecoFriendlyShips = action.payload
            })
            .addCase(fetchEcoFriendlyShipsByBroker.rejected, (state, action) => {
                state.ecoFriendlyShipsLoading = false
                state.ecoFriendlyShipsError = action.payload as string
            })

        // Fetch Ship by ID
        builder
            .addCase(fetchShipById.fulfilled, (state, action) => {
                state.selectedShip = action.payload
            })

        // Create Ship
        builder
            .addCase(createShip.pending, (state) => {
                state.createShipLoading = true
                state.createShipError = null
            })
            .addCase(createShip.fulfilled, (state, action) => {
                state.createShipLoading = false
                // Yeni gemi broker gemilerine eklenir (fetchBrokerShips otomatik çağrılır)
            })
            .addCase(createShip.rejected, (state, action) => {
                state.createShipLoading = false
                state.createShipError = action.payload as string
            })

        // Update Ship
        builder
            .addCase(updateShip.pending, (state) => {
                state.updateShipLoading = true
                state.updateShipError = null
            })
            .addCase(updateShip.fulfilled, (state, action) => {
                state.updateShipLoading = false
                // Güncellenmiş gemi state'e otomatik yansır (fetchBrokerShips otomatik çağrılır)
            })
            .addCase(updateShip.rejected, (state, action) => {
                state.updateShipLoading = false
                state.updateShipError = action.payload as string
            })
    }
})

export const {
    setShipTypeFilter,
    setEcoFriendlyFilter,
    setAvailableFilter,
    setPortFilter,
    setCapacityFilter,
    resetFilters,
    setSelectedShip,
    setBrokerShipsPage,
    clearShipsError,
    clearBrokerShipsError,
    clearAvailableShipsError,
    clearCreateShipError,
    clearUpdateShipError,
    updateShipInState,
    removeShipFromState
} = shipsSlice.actions

export default shipsSlice.reducer