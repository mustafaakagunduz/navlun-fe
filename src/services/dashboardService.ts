// src/services/dashboardService.ts
import apiService from '@/services/apiService';

// Tip tanımlamaları
export type DashboardSummary = {
    totalLoads: number;
    pendingLoads: number;
    activeLoads: number;
    completedLoads: number;
    totalOffers: number;
    acceptedOffers: number;
    totalEcoFriendlyShipments: number;
    ecoFriendlyPercentage: number;
    totalUsers: number;
    newUsersThisMonth: number;
};

export type ChartData = {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string;
        fill?: boolean;
    }[];
};

export type LoadsByStatusData = {
    pending: number;
    assigned: number;
    inTransit: number;
    delivered: number;
    completed: number;
};

export type MonthlyMetricsData = {
    month: string;
    loads: number;
    offers: number;
    ecoFriendlyShipments: number;
};

export type TopCarriersData = {
    carrierId: string;
    carrierName: string;
    completedDeliveries: number;
    averageRating: number;
};

export type TopSendersData = {
    senderId: string;
    senderName: string;
    totalShipments: number;
    ecoFriendlyRatio: number;
};

export type GoodsTypeDistribution = {
    goodsType: string;
    count: number;
    percentage: number;
};

export type UserGrowthData = {
    month: string;
    totalUsers: number;
    newUsers: number;
    senders: number;
    carriers: number;
};

export type PerformanceMetrics = {
    averageOfferResponseTime: number;    // saat olarak
    averageDeliveryTime: number;         // gün olarak
    averageDistancePerLoad: number;      // km olarak
    averageLoadWeight: number;           // kg olarak
    successfulDeliveryRate: number;      // yüzde olarak
    ecoFriendlyDeliveryRate: number;     // yüzde olarak
};

export type AnalyticsReport = {
    title: string;
    description: string;
    dateRange: {
        start: string;
        end: string;
    };
    metrics: Record<string, number | string>;
    insights: string[];
    recommendations: string[];
};

const dashboardService = {
    // Dashboard özeti bilgilerini getirir
    getDashboardSummary: async (): Promise<DashboardSummary> => {
        try {
            return await apiService.get<DashboardSummary>('/dashboard/summary');
        } catch (error) {
            console.error('Get dashboard summary error:', error);
            throw error;
        }
    },

    // Son X gündeki yüklerin durumlarını getirir (Chart için)
    getLoadStatusChart: async (days: number = 30): Promise<ChartData> => {
        try {
            return await apiService.get<ChartData>('/dashboard/charts/load-status', { days });
        } catch (error) {
            console.error(`Get load status chart (${days} days) error:`, error);
            throw error;
        }
    },

    // Aylık yük, teklif ve çevre dostu gönderileri getirir (Chart için)
    getMonthlyMetricsChart: async (months: number = 12): Promise<ChartData> => {
        try {
            return await apiService.get<ChartData>('/dashboard/charts/monthly-metrics', { months });
        } catch (error) {
            console.error(`Get monthly metrics chart (${months} months) error:`, error);
            throw error;
        }
    },

    // Çevre dostu teslimatların oranını getirir (Chart için)
    getEcoFriendlyRatioChart: async (months: number = 12): Promise<ChartData> => {
        try {
            return await apiService.get<ChartData>('/dashboard/charts/eco-friendly-ratio', { months });
        } catch (error) {
            console.error(`Get eco-friendly ratio chart (${months} months) error:`, error);
            throw error;
        }
    },

    // Yük durumlarına göre dağılımı getirir
    getLoadsByStatusData: async (): Promise<LoadsByStatusData> => {
        try {
            return await apiService.get<LoadsByStatusData>('/dashboard/data/loads-by-status');
        } catch (error) {
            console.error('Get loads by status data error:', error);
            throw error;
        }
    },

    // Aylık metrik verilerini getirir
    getMonthlyMetricsData: async (months: number = 12): Promise<MonthlyMetricsData[]> => {
        try {
            return await apiService.get<MonthlyMetricsData[]>('/dashboard/data/monthly-metrics', { months });
        } catch (error) {
            console.error(`Get monthly metrics data (${months} months) error:`, error);
            throw error;
        }
    },

    // En iyi taşıyıcıları getirir
    getTopCarriers: async (limit: number = 10): Promise<TopCarriersData[]> => {
        try {
            return await apiService.get<TopCarriersData[]>('/dashboard/data/top-carriers', { limit });
        } catch (error) {
            console.error(`Get top carriers (limit: ${limit}) error:`, error);
            throw error;
        }
    },

    // En aktif göndericileri getirir
    getTopSenders: async (limit: number = 10): Promise<TopSendersData[]> => {
        try {
            return await apiService.get<TopSendersData[]>('/dashboard/data/top-senders', { limit });
        } catch (error) {
            console.error(`Get top senders (limit: ${limit}) error:`, error);
            throw error;
        }
    },

    // Mal türlerine göre dağılımı getirir
    getGoodsTypeDistribution: async (): Promise<GoodsTypeDistribution[]> => {
        try {
            return await apiService.get<GoodsTypeDistribution[]>('/dashboard/data/goods-type-distribution');
        } catch (error) {
            console.error('Get goods type distribution error:', error);
            throw error;
        }
    },

    // Kullanıcı büyüme verilerini getirir
    getUserGrowthData: async (months: number = 12): Promise<UserGrowthData[]> => {
        try {
            return await apiService.get<UserGrowthData[]>('/dashboard/data/user-growth', { months });
        } catch (error) {
            console.error(`Get user growth data (${months} months) error:`, error);
            throw error;
        }
    },

    // Performans metriklerini getirir
    getPerformanceMetrics: async (): Promise<PerformanceMetrics> => {
        try {
            return await apiService.get<PerformanceMetrics>('/dashboard/data/performance-metrics');
        } catch (error) {
            console.error('Get performance metrics error:', error);
            throw error;
        }
    },

    // Belirlenen tarih aralığı için analitik rapor oluşturur
    generateAnalyticsReport: async (
        startDate: string,
        endDate: string,
        type: 'general' | 'eco-friendly' | 'performance' | 'growth'
    ): Promise<AnalyticsReport> => {
        try {
            return await apiService.post<AnalyticsReport, {
                startDate: string,
                endDate: string,
                type: string
            }>('/dashboard/reports/analytics', { startDate, endDate, type });
        } catch (error) {
            console.error(`Generate analytics report error:`, error);
            throw error;
        }
    },

    // Gönderici için özet bilgileri getirir
    getSenderDashboardSummary: async (senderId?: string): Promise<{
        totalLoads: number;
        activeLoads: number;
        completedLoads: number;
        ecoFriendlyShipments: number;
        ecoFriendlyRatio: number;
        averageOfferResponseTime: number;
    }> => {
        try {
            const params: Record<string, any> = {};
            if (senderId) params.senderId = senderId;

            return await apiService.get('/dashboard/sender-summary', params);
        } catch (error) {
            console.error('Get sender dashboard summary error:', error);
            throw error;
        }
    },

    // Taşıyıcı için özet bilgileri getirir
    getCarrierDashboardSummary: async (carrierId?: string): Promise<{
        totalOffers: number;
        acceptedOffers: number;
        pendingOffers: number;
        completedDeliveries: number;
        ecoFriendlyDeliveries: number;
        averageRating: number;
    }> => {
        try {
            const params: Record<string, any> = {};
            if (carrierId) params.carrierId = carrierId;

            return await apiService.get('/dashboard/carrier-summary', params);
        } catch (error) {
            console.error('Get carrier dashboard summary error:', error);
            throw error;
        }
    },

    // Kullanıcı rolüne göre uygun dashboard verilerini getirir
    getUserDashboard: async (): Promise<{
        summary: DashboardSummary | any;
        recentActivities: any[];
        charts: Record<string, ChartData>;
    }> => {
        try {
            return await apiService.get('/dashboard/user');
        } catch (error) {
            console.error('Get user dashboard error:', error);
            throw error;
        }
    },

    // Son aktiviteleri getirir
    getRecentActivities: async (limit: number = 10): Promise<any[]> => {
        try {
            return await apiService.get('/dashboard/recent-activities', { limit });
        } catch (error) {
            console.error(`Get recent activities (limit: ${limit}) error:`, error);
            throw error;
        }
    }
};

export default dashboardService;