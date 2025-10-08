import apiService from '@/services/apiService';

export interface MonthlyImpactData {
    month: string;
    carbonFootprint: number;
    loadsCount: number;
    ecoLoadsCount: number;
}

export interface CategoryBreakdown {
    category: string;
    carbonFootprint: number;
    loadsCount: number;
    percentage: number;
}

export interface EnvironmentalInsights {
    rating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'NEEDS_IMPROVEMENT';
    treesEquivalent: number;
    kmDrivenEquivalent: number;
    recommendations: string[];
    carbonReductionGoal: number;
}

export interface EnvironmentalImpact {
    totalCarbonFootprint: number;
    averageCarbonFootprint: number;
    totalLoads: number;
    ecoFriendlyLoads: number;
    ecoFriendlyPercentage: number;
    totalWeight: number;
    carbonSavingsPotential: number;
    monthlyBreakdown: MonthlyImpactData[];
    categoryBreakdown: CategoryBreakdown[];
    insights: EnvironmentalInsights;
}

class EnvironmentalService {
    private baseUrl = '/api/v1/loads';

    /**
     * Get current user's environmental impact statistics
     */
    async getCurrentUserEnvironmentalImpact(): Promise<EnvironmentalImpact> {
        const response = await apiService.get<EnvironmentalImpact>(
            `${this.baseUrl}/current-user/environmental-impact`
        );
        return response;
    }

    /**
     * Get rating color class based on rating
     */
    getRatingColor(rating: string): string {
        switch (rating) {
            case 'EXCELLENT':
                return 'text-green-700 bg-green-50 border-green-200';
            case 'GOOD':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'MODERATE':
                return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            case 'NEEDS_IMPROVEMENT':
                return 'text-red-700 bg-red-50 border-red-200';
            default:
                return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    }

    /**
     * Get rating display name
     */
    getRatingDisplayName(rating: string): string {
        switch (rating) {
            case 'EXCELLENT':
                return 'Mükemmel';
            case 'GOOD':
                return 'İyi';
            case 'MODERATE':
                return 'Orta';
            case 'NEEDS_IMPROVEMENT':
                return 'Geliştirilmeli';
            default:
                return 'Bilinmiyor';
        }
    }

    /**
     * Format month display
     */
    formatMonth(monthString: string): string {
        try {
            const [year, month] = monthString.split('-');
            const monthNames = [
                'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
            ];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        } catch (e) {
            return monthString;
        }
    }
}

const environmentalService = new EnvironmentalService();
export default environmentalService;
