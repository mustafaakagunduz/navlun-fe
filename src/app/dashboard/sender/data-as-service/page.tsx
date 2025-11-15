"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Database, TrendingUp, BarChart3, Brain, Target, Zap, ArrowRight, Loader2, MapPin, Package, DollarSign, Leaf, TrendingDown, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import loadService, { Load, LoadWithOffers } from "@/services/loadService";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type RouteAnalysis = {
    route: string;
    count: number;
    avgCost: number;
    totalWeight: number;
};

type InsightData = {
    totalLoads: number;
    completedLoads: number;
    totalCost: number;
    avgCostPerKg: number;
    topRoutes: RouteAnalysis[];
    totalCarbonFootprint: number;
    ecoFriendlyPercentage: number;
    avgDeliveryTime: number;
    costSavingsPotential: number;
    mostUsedGoodsType: string;
    peakShippingMonth: string;
};

export default function DataAsServicePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [insights, setInsights] = useState<InsightData | null>(null);
    const [allLoads, setAllLoads] = useState<Load[]>([]);
    const [loadsWithOffers, setLoadsWithOffers] = useState<LoadWithOffers[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch all necessary data
                const [completed, active, withOffers] = await Promise.all([
                    loadService.getCurrentUserCompletedDeliveries(),
                    loadService.getCurrentUserActiveLoads(),
                    loadService.getCurrentUserLoadsWithOffers()
                ]);

                const allUserLoads = [...completed, ...active];
                setAllLoads(allUserLoads);
                setLoadsWithOffers(withOffers);

                // Calculate insights
                const calculatedInsights = calculateInsights(allUserLoads, withOffers);
                setInsights(calculatedInsights);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Set empty insights on error
                setInsights({
                    totalLoads: 0,
                    completedLoads: 0,
                    totalCost: 0,
                    avgCostPerKg: 0,
                    topRoutes: [],
                    totalCarbonFootprint: 0,
                    ecoFriendlyPercentage: 0,
                    avgDeliveryTime: 0,
                    costSavingsPotential: 0,
                    mostUsedGoodsType: '-',
                    peakShippingMonth: '-'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const calculateInsights = (loads: Load[], withOffers: LoadWithOffers[]): InsightData => {
        if (loads.length === 0) {
            return {
                totalLoads: 0,
                completedLoads: 0,
                totalCost: 0,
                avgCostPerKg: 0,
                topRoutes: [],
                totalCarbonFootprint: 0,
                ecoFriendlyPercentage: 0,
                avgDeliveryTime: 0,
                costSavingsPotential: 0,
                mostUsedGoodsType: '-',
                peakShippingMonth: '-'
            };
        }

        // Calculate total cost from loads with accepted offers
        let totalCost = 0;
        let acceptedOffersCount = 0;
        withOffers.forEach(loadWithOffer => {
            const acceptedOffer = loadWithOffer.offers.find(o => o.status === 'ACCEPTED');
            if (acceptedOffer) {
                totalCost += acceptedOffer.price;
                acceptedOffersCount++;
            }
        });

        // Calculate total weight
        const totalWeight = loads.reduce((sum, load) => sum + load.netWeight, 0);

        // Calculate average cost per kg
        const avgCostPerKg = totalWeight > 0 ? totalCost / totalWeight : 0;

        // Analyze routes
        const routeMap = new Map<string, RouteAnalysis>();
        loads.forEach(load => {
            const route = `${load.loadingAddress} → ${load.deliveryAddress}`;
            const existing = routeMap.get(route);

            const loadOffer = withOffers.find(wo => wo.load.id === load.id);
            const acceptedOffer = loadOffer?.offers.find(o => o.status === 'ACCEPTED');
            const cost = acceptedOffer?.price || 0;

            if (existing) {
                existing.count++;
                existing.totalWeight += load.netWeight;
                existing.avgCost = (existing.avgCost * (existing.count - 1) + cost) / existing.count;
            } else {
                routeMap.set(route, {
                    route,
                    count: 1,
                    avgCost: cost,
                    totalWeight: load.netWeight
                });
            }
        });

        const topRoutes = Array.from(routeMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Calculate carbon footprint
        const totalCarbonFootprint = loads.reduce((sum, load) =>
            sum + (load.estimatedCarbonFootprint || 0), 0);

        // Calculate eco-friendly percentage
        const ecoLoadsCount = loads.filter(load => load.ecoTransportRequested).length;
        const ecoFriendlyPercentage = (ecoLoadsCount / loads.length) * 100;

        // Calculate average delivery time
        const completedLoads = loads.filter(load =>
            load.status === 'DELIVERED' || load.status === 'COMPLETED'
        );
        let totalDays = 0;
        completedLoads.forEach(load => {
            const loadingDate = new Date(load.loadingDate);
            const deliveryDate = new Date(load.deliveryDate);
            const diffTime = Math.abs(deliveryDate.getTime() - loadingDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            totalDays += diffDays;
        });
        const avgDeliveryTime = completedLoads.length > 0 ? totalDays / completedLoads.length : 0;

        // Estimate cost savings potential by comparing eco vs regular offers
        let potentialSavings = 0;
        withOffers.forEach(loadWithOffer => {
            const comparison = loadService.compareOffersByEnvironmentalImpact(loadWithOffer);
            if (comparison.hasEcoOption && comparison.ecoAdvantage > 0) {
                potentialSavings += (comparison.regularOffer?.price || 0) - (comparison.ecoFriendlyOffer?.price || 0);
            }
        });

        // Find most used goods type
        const goodsTypeMap = new Map<string, number>();
        loads.forEach(load => {
            goodsTypeMap.set(load.goodsType, (goodsTypeMap.get(load.goodsType) || 0) + 1);
        });
        const mostUsedGoodsType = Array.from(goodsTypeMap.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

        // Find peak shipping month
        const monthMap = new Map<string, number>();
        loads.forEach(load => {
            const month = new Date(load.loadingDate).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
            monthMap.set(month, (monthMap.get(month) || 0) + 1);
        });
        const peakShippingMonth = Array.from(monthMap.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

        return {
            totalLoads: loads.length,
            completedLoads: completedLoads.length,
            totalCost,
            avgCostPerKg,
            topRoutes,
            totalCarbonFootprint,
            ecoFriendlyPercentage,
            avgDeliveryTime,
            costSavingsPotential: potentialSavings,
            mostUsedGoodsType,
            peakShippingMonth
        };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                    <p className="text-green-600 font-medium">Verileriniz analiz ediliyor...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['SENDER']}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                                <Database className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                    İş Analitiği Gösterge Paneli
                                </h1>
                                <p className="text-gray-600 mt-1">Verilerinizden anlam çıkarın, daha iyi kararlar alın</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Statistics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="shadow-lg border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Toplam Harcama</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            ₺{insights?.totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {insights?.totalLoads} gönderi
                                        </p>
                                    </div>
                                    <DollarSign className="h-12 w-12 text-blue-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Ortalama Maliyet</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            ₺{insights?.avgCostPerKg.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">kilogram başına</p>
                                    </div>
                                    <BarChart3 className="h-12 w-12 text-green-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-purple-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Karbon Ayak İzi</p>
                                        <p className="text-3xl font-bold text-purple-600">
                                            {insights?.totalCarbonFootprint.toFixed(1)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">ton CO₂</p>
                                    </div>
                                    <Leaf className="h-12 w-12 text-purple-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-amber-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Ort. Teslimat Süresi</p>
                                        <p className="text-3xl font-bold text-amber-600">
                                            {insights?.avgDeliveryTime.toFixed(0)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">gün</p>
                                    </div>
                                    <Calendar className="h-12 w-12 text-amber-600 opacity-20" />
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
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                    En Çok Kullanılan Rotalar
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {insights && insights.topRoutes.length > 0 ? (
                                    <div className="space-y-4">
                                        {insights.topRoutes.map((route, index) => (
                                            <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900">{route.route}</p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {route.count} gönderi · {route.totalWeight.toLocaleString('tr-TR')} kg
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="bg-blue-50">
                                                        #{index + 1}
                                                    </Badge>
                                                </div>
                                                {route.avgCost > 0 && (
                                                    <p className="text-sm font-medium text-blue-600">
                                                        Ortalama Maliyet: ₺{route.avgCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                                    </p>
                                                )}
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

                        {/* Business Insights */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-purple-600" />
                                    İş İçgörüleri
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Tamamlanma Oranı</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Toplam {insights?.totalLoads} gönderiden {insights?.completedLoads} tanesi başarıyla tamamlandı.
                                            </p>
                                            <Progress
                                                value={(insights?.completedLoads || 0) / Math.max(insights?.totalLoads || 1, 1) * 100}
                                                className="h-2 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-100">
                                    <div className="flex items-start gap-3">
                                        <Leaf className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Çevre Dostu Tercih</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Gönderilerinizin %{insights?.ecoFriendlyPercentage.toFixed(1)}'i çevre dostu taşıma talep ediyor.
                                            </p>
                                            <Progress
                                                value={insights?.ecoFriendlyPercentage || 0}
                                                className="h-2 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100">
                                    <div className="flex items-start gap-3">
                                        <Package className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">En Çok Gönderilen Ürün</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {insights?.mostUsedGoodsType}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-r from-amber-50 to-white rounded-lg border border-amber-100">
                                    <div className="flex items-start gap-3">
                                        <TrendingUp className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">En Yoğun Dönem</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {insights?.peakShippingMonth}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommendations */}
                    <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 mb-8">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Target className="h-6 w-6 text-blue-600" />
                                Akıllı Öneriler
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {insights && insights.costSavingsPotential > 0 && (
                                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                                        <DollarSign className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Maliyet Tasarrufu Fırsatı</h4>
                                            <p className="text-gray-600 mt-1">
                                                Çevre dostu araçları tercih ederek yaklaşık <span className="font-bold text-green-600">
                                                ₺{insights.costSavingsPotential.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span> tasarruf edebilirsiniz.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {insights && insights.ecoFriendlyPercentage < 50 && (
                                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                                        <Leaf className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Sürdürülebilirlik Önerisi</h4>
                                            <p className="text-gray-600 mt-1">
                                                Çevre dostu taşıma oranınız düşük. Karbon ayak izinizi azaltmak için
                                                eco-friendly seçenekleri tercih edebilirsiniz.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {insights && insights.avgDeliveryTime > 7 && (
                                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                                        <Zap className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Teslimat Hızı İyileştirmesi</h4>
                                            <p className="text-gray-600 mt-1">
                                                Ortalama teslimat süreniz {insights.avgDeliveryTime.toFixed(0)} gün.
                                                Daha yakın taşıyıcılar seçerek bu süreyi kısaltabilirsiniz.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {insights && insights.topRoutes.length > 0 && (
                                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                                        <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Rota Optimizasyonu</h4>
                                            <p className="text-gray-600 mt-1">
                                                En çok kullanılan rotanız: <span className="font-semibold">{insights.topRoutes[0].route}</span>.
                                                Bu rota için özel anlaşmalar yaparak maliyet avantajı sağlayabilirsiniz.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* CTA Section */}
                    <Card className="shadow-lg bg-gradient-to-r from-blue-600 to-green-600 text-white">
                        <CardContent className="p-8 text-center">
                            <Database className="h-12 w-12 mx-auto mb-4 opacity-80" />
                            <h3 className="text-2xl font-bold mb-2">Verileriniz Sizin İçin Çalışıyor</h3>
                            <p className="text-blue-100 max-w-2xl mx-auto">
                                Platformumuz, her gönderinizden toplanan verileri analiz ederek
                                size özel öneriler sunuyor. Böylece daha verimli, daha ekonomik
                                ve daha sürdürülebilir kararlar alabiliyorsunuz.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
