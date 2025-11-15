"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
    TruckIcon,
    TrendingUp,
    BarChart3,
    Brain,
    Target,
    Zap,
    Loader2,
    MapPin,
    DollarSign,
    Leaf,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    Fuel,
    Route,
    Star,
    Award,
    Shield,
    Activity,
    Clock
} from "lucide-react";
import carrierService, { CarrierStatistics, TopRoute } from "@/services/carrierService";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type FleetInsightData = {
    totalEarnings: number;
    avgEarningsPerRoute: number;
    topRoutes: TopRoute[];
    totalDistance: number;
    avgFuelEfficiency: number;
    co2Reduction: number;
    completionRate: number;
    customerRating: number;
    safetyDays: number;
    activeVehicleRate: number;
    maintenanceDueCount: number;
    avgDeliveryTime: number;
    earningsGrowth: number;
    mostProfitableRoute: TopRoute | null;
    ecoScore: number;
};

export default function FleetAnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [insights, setInsights] = useState<FleetInsightData | null>(null);
    const [statistics, setStatistics] = useState<CarrierStatistics | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const stats = await carrierService.getCurrentUserStatistics();
                setStatistics(stats);

                const calculatedInsights = calculateInsights(stats);
                setInsights(calculatedInsights);
            } catch (error) {
                console.error('Error fetching carrier data:', error);
                setInsights({
                    totalEarnings: 0,
                    avgEarningsPerRoute: 0,
                    topRoutes: [],
                    totalDistance: 0,
                    avgFuelEfficiency: 0,
                    co2Reduction: 0,
                    completionRate: 0,
                    customerRating: 0,
                    safetyDays: 0,
                    activeVehicleRate: 0,
                    maintenanceDueCount: 0,
                    avgDeliveryTime: 0,
                    earningsGrowth: 0,
                    mostProfitableRoute: null,
                    ecoScore: 0
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const calculateInsights = (stats: CarrierStatistics): FleetInsightData => {
        // Calculate average earnings per route
        const totalRouteEarnings = stats.topRoutes?.reduce((sum, route) => sum + route.earnings, 0) || 0;
        const avgEarningsPerRoute = stats.topRoutes?.length > 0
            ? totalRouteEarnings / stats.topRoutes.length
            : 0;

        // Find most profitable route
        const mostProfitableRoute = stats.topRoutes?.length > 0
            ? stats.topRoutes.reduce((best, current) =>
                current.earnings > best.earnings ? current : best
            )
            : null;

        // Calculate active vehicle rate
        const activeVehicleRate = stats.fleetAnalytics?.totalVehicles > 0
            ? (stats.fleetAnalytics.activeVehicles / stats.fleetAnalytics.totalVehicles) * 100
            : 0;

        // Count maintenance alerts
        const maintenanceDueCount = stats.fleetAnalytics?.maintenanceAlerts
            ?.filter(vehicle => vehicle.alerts && vehicle.alerts.length > 0).length || 0;

        return {
            totalEarnings: stats.totalEarnings || 0,
            avgEarningsPerRoute,
            topRoutes: stats.topRoutes || [],
            totalDistance: stats.totalDistance || 0,
            avgFuelEfficiency: stats.fleetAnalytics?.avgFuelEfficiency || stats.fuelEfficiency || 0,
            co2Reduction: stats.fleetAnalytics?.co2ReductionPercentage || 0,
            completionRate: stats.completionRate || 0,
            customerRating: stats.customerRating || 0,
            safetyDays: stats.safetyDays || 0,
            activeVehicleRate,
            maintenanceDueCount,
            avgDeliveryTime: stats.avgDeliveryTime || 0,
            earningsGrowth: stats.monthlyGrowth || 0,
            mostProfitableRoute,
            ecoScore: stats.ecoScore || 0
        };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                    <p className="text-purple-600 font-medium">Filo verileriniz analiz ediliyor...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['CARRIER']}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                                <TruckIcon className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    Filo Performans Analizi
                                </h1>
                                <p className="text-gray-600 mt-1">Verilerinizle filonuzu optimize edin</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Statistics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="shadow-lg border-l-4 border-l-purple-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Toplam Kazanç</p>
                                        <p className="text-3xl font-bold text-purple-600">
                                            ₺{insights?.totalEarnings.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {insights?.earningsGrowth && insights.earningsGrowth > 0 ? '+' : ''}{insights?.earningsGrowth?.toFixed(1) || 0}% bu ay
                                        </p>
                                    </div>
                                    <DollarSign className="h-12 w-12 text-purple-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Tamamlanma Oranı</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            %{insights?.completionRate.toFixed(0)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">başarı oranı</p>
                                    </div>
                                    <CheckCircle2 className="h-12 w-12 text-green-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Müşteri Memnuniyeti</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            {insights?.customerRating.toFixed(1)}/5
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">ortalama puan</p>
                                    </div>
                                    <Star className="h-12 w-12 text-blue-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-amber-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Yakıt Verimliliği</p>
                                        <p className="text-3xl font-bold text-amber-600">
                                            {insights?.avgFuelEfficiency.toFixed(1)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">L/100km</p>
                                    </div>
                                    <Fuel className="h-12 w-12 text-amber-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Insights and Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Top Routes */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Route className="h-5 w-5 text-purple-600" />
                                    En Karlı Rotalar
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {insights && insights.topRoutes.length > 0 ? (
                                    <div className="space-y-4">
                                        {insights.topRoutes.slice(0, 5).map((route, index) => (
                                            <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900">{route.route}</p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {route.count} sefer · {route.distanceKm} km
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="bg-purple-50">
                                                        #{index + 1}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <p className="text-sm font-medium text-purple-600">
                                                        Kazanç: ₺{route.earnings.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                                    </p>
                                                    <p className="text-sm font-medium text-blue-600">
                                                        Verimlilik: %{route.efficiency.toFixed(0)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 mt-2">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-sm text-gray-600">{route.rating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">
                                        Henüz yeterli veri bulunmuyor
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Fleet Insights */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-blue-600" />
                                    Filo İçgörüleri
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Güvenlik Performansı</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {insights?.safetyDays} gün kazasız operasyon
                                            </p>
                                            <Progress
                                                value={Math.min((insights?.safetyDays || 0) / 365 * 100, 100)}
                                                className="h-2 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-100">
                                    <div className="flex items-start gap-3">
                                        <Activity className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Aktif Araç Oranı</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Filonuzun %{insights?.activeVehicleRate.toFixed(1)}'i aktif
                                            </p>
                                            <Progress
                                                value={insights?.activeVehicleRate || 0}
                                                className="h-2 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100">
                                    <div className="flex items-start gap-3">
                                        <Route className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Toplam Mesafe</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {insights?.totalDistance.toLocaleString('tr-TR')} km kat edildi
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-r from-amber-50 to-white rounded-lg border border-amber-100">
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Ortalama Teslimat</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {insights?.avgDeliveryTime.toFixed(1)} gün
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommendations */}
                    <Card className="shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 mb-8">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Target className="h-6 w-6 text-purple-600" />
                                Akıllı Öneriler
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {insights && insights.mostProfitableRoute && (
                                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                                        <TrendingUp className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">En Karlı Rota</h4>
                                            <p className="text-gray-600 mt-1">
                                                <span className="font-semibold">{insights.mostProfitableRoute.route}</span> rotası
                                                en yüksek kazancı sağlıyor (₺{insights.mostProfitableRoute.earnings.toLocaleString('tr-TR')}).
                                                Bu rotaya daha fazla kaynak ayırabilirsiniz.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {insights && insights.co2Reduction > 0 && (
                                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                                        <Leaf className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Çevre Dostu Operasyon</h4>
                                            <p className="text-gray-600 mt-1">
                                                Filonuz %{insights.co2Reduction.toFixed(1)} CO₂ azaltımı sağlıyor.
                                                Eco-score'unuz: {insights.ecoScore.toFixed(0)}/100
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {insights && insights.maintenanceDueCount > 0 && (
                                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Bakım Uyarısı</h4>
                                            <p className="text-gray-600 mt-1">
                                                {insights.maintenanceDueCount} aracınız bakım gerektiriyor.
                                                Operasyonel verimliliği korumak için bakımları zamanında yaptırın.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {insights && insights.avgFuelEfficiency > 0 && (
                                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                                        <Fuel className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Yakıt Optimizasyonu</h4>
                                            <p className="text-gray-600 mt-1">
                                                Ortalama yakıt tüketiminiz {insights.avgFuelEfficiency.toFixed(1)} L/100km.
                                                Sürücü eğitimleri ve rota optimizasyonu ile %10-15 tasarruf sağlayabilirsiniz.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {insights && insights.completionRate < 90 && (
                                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                                        <Zap className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Performans İyileştirme</h4>
                                            <p className="text-gray-600 mt-1">
                                                Tamamlanma oranınız %{insights.completionRate.toFixed(0)}.
                                                %90'ın üzerine çıkarak daha fazla müşteri kazanabilirsiniz.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* CTA Section */}
                    <Card className="shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                        <CardContent className="p-8 text-center">
                            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-80" />
                            <h3 className="text-2xl font-bold mb-2">Filo Verileriniz Güç Kaynağınız</h3>
                            <p className="text-purple-100 max-w-2xl mx-auto">
                                Her taşımanızdan toplanan veriler analiz edilerek filonuzun performansını
                                artırmanıza yardımcı oluyor. Daha verimli, daha karlı ve daha güvenli
                                operasyonlar için verilerinizden faydalanın.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
