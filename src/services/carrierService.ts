import apiService from '@/services/apiService';

export interface ActiveDelivery {
    id: string;
    route: string;
    cargo: string;
    status: string;
    progress: number;
    eta: string;
    value: number;
    eco: boolean;
}

export interface TopRoute {
    route: string;
    count: number;
    earnings: number;
    rating: number;
    efficiency: number;
}

export interface FleetAnalytics {
    activeVehicles: number;
    totalVehicles: number;
    maintenancePercentage: number;
    safetyScore: number;
    fuelSavings: number;
    operationEfficiency: number;
    co2ReductionPercentage: number;
}

export interface CarrierStatistics {
    totalEarnings: number;
    monthlyGrowth: number;
    activeDeliveries: number;
    completionRate: number;
    avgDeliveryTime: number;
    fuelEfficiency: number;
    customerRating: number;
    ecoScore: number;
    availableLoads: number;
    totalDistance: number;
    safetyDays: number;
    totalReviews: number;
    recentDeliveries: ActiveDelivery[];
    topRoutes: TopRoute[];
    fleetAnalytics: FleetAnalytics;
}

class CarrierService {
    private baseUrl = '/carrier-profiles';

    async getCurrentUserStatistics(): Promise<CarrierStatistics> {
        const response = await apiService.get<CarrierStatistics>(`${this.baseUrl}/current-user/statistics`);
        return response;
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatNumber(num: number): string {
        return new Intl.NumberFormat('tr-TR').format(num);
    }

    getVehicleTypes(): string[] {
        return [
            'Kamyon',
            'Kamyonet',
            'TIR',
            'Çekici',
            'Panelvan',
            'Konteyner',
            'Frigofik',
            'Tanker',
            'Lowbed'
        ];
    }

    // Mock method - to be implemented with real API
    async getCarrierProfileByUserId(userId: string): Promise<any> {
        // TODO: Implement real API call
        return {
            id: userId,
            company: false,
            name: '',
            companyName: '',
            taxNumber: '',
            iban: '',
            isEcoFriendly: false,
            driverLicense: '',
            phone: '',
            email: ''
        };
    }

    // Mock method - to be implemented with real API
    async createCarrierProfile(profileData: any): Promise<any> {
        // TODO: Implement real API call
        return {
            id: 'mock-profile-id',
            ...profileData
        };
    }

    // Mock method - to be implemented with real API
    async updateCarrierProfile(profileId: string, profileData: any): Promise<any> {
        // TODO: Implement real API call
        return {
            id: profileId,
            ...profileData
        };
    }

    // Mock method - to be implemented with real API
    async getVehicles(userId: string): Promise<any[]> {
        // TODO: Implement real API call
        return [];
    }

    // Mock method - to be implemented with real API
    async getVehiclesByCarrier(carrierId: string): Promise<any[]> {
        // TODO: Implement real API call
        return [];
    }

    // Mock method - to be implemented with real API
    async createVehicle(vehicleData: any): Promise<any> {
        // TODO: Implement real API call
        return {
            id: 'mock-vehicle-id',
            ...vehicleData
        };
    }

    // Mock method - to be implemented with real API
    async updateVehicle(vehicleId: string, vehicleData: any): Promise<any> {
        // TODO: Implement real API call
        return {
            id: vehicleId,
            ...vehicleData
        };
    }

    // Mock method - to be implemented with real API
    async deleteVehicle(vehicleId: string): Promise<void> {
        // TODO: Implement real API call
        return;
    }
}

const carrierService = new CarrierService();
export default carrierService;
