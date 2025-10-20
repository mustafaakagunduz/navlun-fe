// src/services/shipService.ts
import apiService from "@/services/apiService";

export interface Ship {
    id: string;
    name: string;
    shipType: string;
    imoNumber: string;
    deadweightTonnage: number;
    grossTonnage: number;
    lengthOverall: number;
    beam: number;
    draught: number;
    buildYear: number;
    flag: string;
    classificationSociety: string;
    currentPort: string;
    registrationPort?: string;
    nextAvailableDate: string;
    ecoFriendly: boolean;
    available: boolean;
    brokerProfileId: string;
    brokerName?: string;
    ecoFriendlyValid?: boolean;
    insuranceValid?: boolean;
    classificationValid?: boolean;
    availableForBooking?: boolean;
    maxSpeed?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface ShipRequest {
    brokerProfileId: string;
    name: string;
    shipType: string;
    imoNumber?: string;
    deadweightTonnage: number;
    grossTonnage: number;
    lengthOverall: number;
    beam: number;
    draught: number;
    buildYear: number;
    flag: string;
    classificationSociety?: string;
    currentPort: string;
    registrationPort?: string;
    nextAvailableDate?: string;
    ecoFriendly: boolean;
}

export interface ShipUpdateRequest {
    name?: string;
    shipType?: string;
    currentPort?: string;
    registrationPort?: string;
    nextAvailableDate?: string;
    available?: boolean;
    ecoFriendly?: boolean;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

const shipService = {
    // Gemi oluşturur
    createShip: async (shipData: ShipRequest): Promise<Ship> => {
        try {
            return await apiService.post<Ship, ShipRequest>('/ships', shipData);
        } catch (error) {
            console.error('Create ship error:', error);
            throw error;
        }
    },

    // Gemi ID'sine göre getirir
    getShipById: async (id: string): Promise<Ship> => {
        try {
            return await apiService.get<Ship>(`/ships/${id}`);
        } catch (error) {
            console.error(`Get ship by ID (${id}) error:`, error);
            throw error;
        }
    },

    // Tüm gemileri getirir
    getAllShips: async (): Promise<Ship[]> => {
        try {
            return await apiService.get<Ship[]>('/ships');
        } catch (error) {
            console.error('Get all ships error:', error);
            throw error;
        }
    },

    // Sayfalandırılmış gemileri getirir
    getAllShipsPaginated: async (
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<Ship>> => {
        try {
            return await apiService.get<PageResponse<Ship>>('/ships/paginated', { page, size });
        } catch (error) {
            console.error('Get paginated ships error:', error);
            throw error;
        }
    },

    // Broker'a ait gemileri getirir
    getShipsByBroker: async (brokerProfileId: string): Promise<Ship[]> => {
        try {
            return await apiService.get<Ship[]>(`/ships/broker/${brokerProfileId}`);
        } catch (error) {
            console.error(`Get ships by broker (${brokerProfileId}) error:`, error);
            throw error;
        }
    },

    // Broker'a ait sayfalandırılmış gemileri getirir
    getShipsByBrokerPaginated: async (
        brokerProfileId: string,
        page: number = 0,
        size: number = 20
    ): Promise<PageResponse<Ship>> => {
        try {
            return await apiService.get<PageResponse<Ship>>(`/ships/broker/${brokerProfileId}/paginated`, { page, size });
        } catch (error) {
            console.error(`Get paginated ships by broker (${brokerProfileId}) error:`, error);
            throw error;
        }
    },

    // Müsait gemileri getirir
    getAvailableShips: async (): Promise<Ship[]> => {
        try {
            return await apiService.get<Ship[]>('/ships/available');
        } catch (error) {
            console.error('Get available ships error:', error);
            throw error;
        }
    },

    // Broker'ın müsait gemilerini getirir
    getAvailableShipsByBroker: async (brokerProfileId: string): Promise<Ship[]> => {
        try {
            return await apiService.get<Ship[]>(`/ships/broker/${brokerProfileId}/available`);
        } catch (error) {
            console.error(`Get available ships by broker (${brokerProfileId}) error:`, error);
            throw error;
        }
    },

    // Çevreci gemileri getirir
    getEcoFriendlyShips: async (): Promise<Ship[]> => {
        try {
            return await apiService.get<Ship[]>('/ships/eco-friendly');
        } catch (error) {
            console.error('Get eco-friendly ships error:', error);
            throw error;
        }
    },

    // Broker'ın çevreci gemilerini getirir
    getEcoFriendlyShipsByBroker: async (brokerProfileId: string): Promise<Ship[]> => {
        try {
            return await apiService.get<Ship[]>(`/ships/broker/${brokerProfileId}/eco-friendly`);
        } catch (error) {
            console.error(`Get eco-friendly ships by broker (${brokerProfileId}) error:`, error);
            throw error;
        }
    },

    // IMO numarasına göre gemi getirir
    getShipByImoNumber: async (imoNumber: string): Promise<Ship> => {
        try {
            return await apiService.get<Ship>(`/ships/imo/${imoNumber}`);
        } catch (error) {
            console.error(`Get ship by IMO (${imoNumber}) error:`, error);
            throw error;
        }
    },

    // Gemi tipine göre gemileri getirir
    getShipsByType: async (shipType: string): Promise<Ship[]> => {
        try {
            return await apiService.get<Ship[]>('/ships/by-type', { shipType });
        } catch (error) {
            console.error(`Get ships by type (${shipType}) error:`, error);
            throw error;
        }
    },

    // Kapasite aralığına göre gemileri getirir
    getShipsByCapacityRange: async (minDwt: number, maxDwt: number): Promise<Ship[]> => {
        try {
            return await apiService.get<Ship[]>('/ships/by-capacity-range', { minDwt, maxDwt });
        } catch (error) {
            console.error(`Get ships by capacity range (${minDwt}-${maxDwt}) error:`, error);
            throw error;
        }
    },

    // Broker'ın kapasite aralığındaki gemilerini getirir
    getBrokerShipsByCapacityRange: async (
        brokerProfileId: string,
        minDwt: number,
        maxDwt: number
    ): Promise<Ship[]> => {
        try {
            return await apiService.get<Ship[]>(`/ships/broker/${brokerProfileId}/by-capacity-range`, { minDwt, maxDwt });
        } catch (error) {
            console.error(`Get broker ships by capacity range error:`, error);
            throw error;
        }
    },

    // Limana göre gemileri getirir
    getShipsByPort: async (port: string): Promise<Ship[]> => {
        try {
            return await apiService.get<Ship[]>('/ships/by-port', { port });
        } catch (error) {
            console.error(`Get ships by port (${port}) error:`, error);
            throw error;
        }
    },

    // Tarihe göre müsait gemileri getirir
    getAvailableShipsByDate: async (date: string): Promise<Ship[]> => {
        try {
            return await apiService.get<Ship[]>('/ships/available-by-date', { date });
        } catch (error) {
            console.error(`Get available ships by date (${date}) error:`, error);
            throw error;
        }
    },

    // Broker'ın tarihe göre müsait gemilerini getirir
    getBrokerAvailableShipsByDate: async (brokerProfileId: string, date: string): Promise<Ship[]> => {
        try {
            return await apiService.get<Ship[]>(`/ships/broker/${brokerProfileId}/available-by-date`, { date });
        } catch (error) {
            console.error(`Get broker available ships by date error:`, error);
            throw error;
        }
    },

    // Gemi günceller
    updateShip: async (id: string, updateData: ShipUpdateRequest): Promise<Ship> => {
        try {
            return await apiService.put<Ship, ShipUpdateRequest>(`/ships/${id}`, updateData);
        } catch (error) {
            console.error(`Update ship (${id}) error:`, error);
            throw error;
        }
    },

    // Gemi siler
    deleteShip: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/ships/${id}`);
        } catch (error) {
            console.error(`Delete ship (${id}) error:`, error);
            throw error;
        }
    }
};

export default shipService;