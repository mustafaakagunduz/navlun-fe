'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Loader2,
    Leaf,
    TreePine,
    Award,
    TrendingDown,
    TrendingUp,
    Package,
    BarChart3,
    Lightbulb,
    RefreshCw,
    Target,
    Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import environmentalService, { EnvironmentalImpact } from '@/services/environmentalService';

export default function EnvironmentalEffectPage() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [impact, setImpact] = useState<EnvironmentalImpact | null>(null);
    const { toast } = useToast();

    const loadData = async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);
            else setLoading(true);

            const data = await environmentalService.getCurrentUserEnvironmentalImpact();
            setImpact(data);
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error.message || "Çevresel etki verileri yüklenirken hata oluştu",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getRatingIcon = (rating: string) => {
        switch (rating) {
            case 'EXCELLENT':
                return <Award className="h-8 w-8 text-green-600" />;
            case 'GOOD':
                return <Leaf className="h-8 w-8 text-green-600" />;
            case 'MODERATE':
                return <Zap className="h-8 w-8 text-yellow-600" />;
            default:
                return <TrendingDown className="h-8 w-8 text-red-600" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Çevresel etki verileri yükleniyor...</span>
            </div>
        );
    }

    if (!impact) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Veri Bulunamadı</h3>
                    <p className="text-gray-600">Henüz çevresel etki verisi bulunmuyor.</p>
                </div>
            </div>
        );
    }

    const ratingColorClass = environmentalService.getRatingColor(impact.insights.rating);

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Çevresel Etki Analizi</h1>
                    <p className="text-gray-600 mt-1">
                        Karbon ayak izinizi takip edin ve çevre dostu kararlar alın.
                    </p>
                </div>
                <Button
                    onClick={() => loadData(true)}
                    variant="outline"
                    disabled={refreshing}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Yenile
                </Button>
            </div>

            {/* Rating Card */}
            <Card className={`border-2 ${ratingColorClass}`}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {getRatingIcon(impact.insights.rating)}
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {environmentalService.getRatingDisplayName(impact.insights.rating)}
                                </h2>
                                <p className="text-sm text-gray-600">Çevre Dostu Performans Değerlendirmesi</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-green-600">
                                {impact.ecoFriendlyPercentage.toFixed(1)}%
                            </div>
                            <p className="text-sm text-gray-600">Çevre Dostu Oran</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Carbon Footprint */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Toplam Karbon Ayak İzi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{impact.totalCarbonFootprint.toFixed(2)}</span>
                            <span className="text-sm text-gray-600">ton CO₂</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {impact.totalLoads} yük üzerinden
                        </p>
                    </CardContent>
                </Card>

                {/* Average Carbon */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Ortalama Karbon
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{impact.averageCarbonFootprint.toFixed(2)}</span>
                            <span className="text-sm text-gray-600">ton CO₂</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Yük başına ortalama
                        </p>
                    </CardContent>
                </Card>

                {/* Eco-Friendly Loads */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Çevre Dostu Yükler
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-green-600">{impact.ecoFriendlyLoads}</span>
                            <span className="text-sm text-gray-600">/ {impact.totalLoads}</span>
                        </div>
                        <Progress value={impact.ecoFriendlyPercentage} className="h-2 mt-2" />
                    </CardContent>
                </Card>

                {/* Carbon Savings Potential */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Tasarruf Potansiyeli
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-green-600">{impact.carbonSavingsPotential.toFixed(2)}</span>
                            <span className="text-sm text-gray-600">ton CO₂</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Çevre dostu seçeneklerle
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Equivalents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-full">
                                <TreePine className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-3xl font-bold text-green-900">
                                    {impact.insights.treesEquivalent.toLocaleString()}
                                </div>
                                <p className="text-sm text-green-700 mt-1">
                                    Ağaç eşdeğeri karbon emilimi gerekli
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    (1 yıllık CO₂ emilimi için)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-full">
                                <Zap className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-3xl font-bold text-blue-900">
                                    {impact.insights.kmDrivenEquivalent.toLocaleString()}
                                </div>
                                <p className="text-sm text-blue-700 mt-1">
                                    KM araç kullanımına eşdeğer
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    (Ortalama bir araç için)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Breakdown Chart */}
            {impact.monthlyBreakdown && impact.monthlyBreakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Aylık Karbon Ayak İzi Dağılımı
                        </CardTitle>
                        <CardDescription>
                            Aylara göre karbon emisyonu ve çevre dostu yük trendi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {impact.monthlyBreakdown.map((month, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium">
                                            {environmentalService.formatMonth(month.month)}
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-600">
                                                {month.carbonFootprint.toFixed(2)} ton CO₂
                                            </span>
                                            <Badge variant="outline" className="text-green-600 border-green-200">
                                                {month.ecoLoadsCount}/{month.loadsCount} çevre dostu
                                            </Badge>
                                        </div>
                                    </div>
                                    <Progress
                                        value={(month.carbonFootprint / impact.totalCarbonFootprint) * 100}
                                        className="h-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Category Breakdown */}
            {impact.categoryBreakdown && impact.categoryBreakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Mal Türüne Göre Karbon Dağılımı
                        </CardTitle>
                        <CardDescription>
                            Hangi mal türlerinin daha fazla karbon emisyonuna neden olduğunu görün
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {impact.categoryBreakdown.map((category, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium">{category.category}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-600">
                                                {category.carbonFootprint.toFixed(2)} ton CO₂
                                            </span>
                                            <Badge variant="outline">
                                                {category.loadsCount} yük ({category.percentage.toFixed(1)}%)
                                            </Badge>
                                        </div>
                                    </div>
                                    <Progress
                                        value={category.percentage}
                                        className="h-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Carbon Reduction Goal */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        Karbon Azaltma Hedefi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <span className="text-sm font-medium">Önerilen Hedef</span>
                                <span className="text-2xl font-bold text-green-600">
                                    %20 Azaltma
                                </span>
                            </div>
                            <Progress value={20} className="h-3" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                            <div>
                                <p className="text-xs text-gray-600">Mevcut Emisyon</p>
                                <p className="text-lg font-bold">{impact.totalCarbonFootprint.toFixed(2)} ton</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Hedef Emisyon</p>
                                <p className="text-lg font-bold text-green-600">
                                    {(impact.totalCarbonFootprint - impact.insights.carbonReductionGoal).toFixed(2)} ton
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recommendations */}
            {impact.insights.recommendations && impact.insights.recommendations.length > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-900">
                            <Lightbulb className="h-5 w-5" />
                            Öneriler
                        </CardTitle>
                        <CardDescription className="text-yellow-700">
                            Karbon ayak izinizi azaltmak için önerilerimiz
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {impact.insights.recommendations.map((recommendation, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-yellow-900">{index + 1}</span>
                                    </div>
                                    <span className="text-sm text-yellow-900">{recommendation}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
