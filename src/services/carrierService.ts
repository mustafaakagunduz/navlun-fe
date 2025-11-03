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
    distanceKm: number;
    pricePerKm: number;
}

export interface FleetAnalytics {
    activeVehicles: number;
    totalVehicles: number;
    maintenancePercentage: number;
    safetyScore: number;
    fuelSavings: number;
    operationEfficiency: number;
    co2ReductionPercentage: number;
    maintenanceAlerts: VehicleMaintenance[];
    avgFuelEfficiency: number;
    ecoScore: number;
}

export interface VehicleMaintenance {
    vehiclePlate: string;
    vehicleType: string;
    isActive: boolean;
    lastOilChange: string;
    lastTireChange: string;
    lastFilterChange: string;
    inspectionDate: string;
    totalKm: number;
    fuelConsumption: number;
    alerts: string[];
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

    async getCarrierProfileByUserId(userId: string): Promise<any> {
        try {
            return await apiService.get(`${this.baseUrl}/user/${userId}`);
        } catch (error) {
            console.error('Get carrier profile by user ID error:', error);
            throw error;
        }
    }

    async createCarrierProfile(profileData: any): Promise<any> {
        try {
            return await apiService.post(this.baseUrl, profileData);
        } catch (error) {
            console.error('Create carrier profile error:', error);
            throw error;
        }
    }

    async updateCarrierProfile(profileId: string, profileData: any): Promise<any> {
        try {
            return await apiService.put(`${this.baseUrl}/${profileId}`, profileData);
        } catch (error) {
            console.error('Update carrier profile error:', error);
            throw error;
        }
    }

    async getVehicles(userId: string): Promise<any[]> {
        try {
            return await apiService.get('/vehicles/my-vehicles');
        } catch (error) {
            console.error('Get vehicles error:', error);
            throw error;
        }
    }

    async getVehiclesByCarrier(carrierId: string): Promise<any[]> {
        try {
            return await apiService.get(`/vehicles/carrier/${carrierId}`);
        } catch (error) {
            console.error('Get vehicles by carrier error:', error);
            throw error;
        }
    }

    async createVehicle(vehicleData: any): Promise<any> {
        try {
            return await apiService.post('/vehicles', vehicleData);
        } catch (error) {
            console.error('Create vehicle error:', error);
            throw error;
        }
    }

    async updateVehicle(vehicleId: string, vehicleData: any): Promise<any> {
        try {
            return await apiService.put(`/vehicles/${vehicleId}`, vehicleData);
        } catch (error) {
            console.error('Update vehicle error:', error);
            throw error;
        }
    }

    async deleteVehicle(vehicleId: string): Promise<void> {
        try {
            await apiService.delete(`/vehicles/${vehicleId}`);
        } catch (error) {
            console.error('Delete vehicle error:', error);
            throw error;
        }
    }
}

const carrierService = new CarrierService();
export default carrierService;
