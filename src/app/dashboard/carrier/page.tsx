"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime, formatTime } from '@/utils/dateUtils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Loader2,
    Package,
    TruckIcon,
    Calendar,
    Settings,
    BarChart3,
    CheckCircle,
    MapPin,
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    Award,
    Star,
    Globe,
    DollarSign,
    Fuel,
    Route,
    Clock,
    Leaf,
    Shield,
    Zap,
    Navigation,
    Phone,
    Mail,
    Users,
    AlertTriangle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import carrierService, { CarrierStatistics } from "@/services/carrierService";

export default function CarrierDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const { toast } = useToast();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [statistics, setStatistics] = useState<CarrierStatistics | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [showActiveVehiclesModal, setShowActiveVehiclesModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

    // Gerçek zamanlı saat güncellemesi
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Giriş yapmamış veya carrier olmayan kullanıcıları yönlendir
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'CARRIER')) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    // Load statistics from backend
    useEffect(() => {
        const loadStatistics = async () => {
            if (!isAuthenticated || user?.role !== 'CARRIER') return;

            try {
                setStatsLoading(true);
                const stats = await carrierService.getCurrentUserStatistics();
                setStatistics(stats);
            } catch (error: any) {
                console.error('Error loading carrier statistics:', error);
                toast({
                    title: "Hata",
                    description: "İstatistikler yüklenirken bir hata oluştu",
                    variant: "destructive"
                });
            } finally {
                setStatsLoading(false);
            }
        };

        loadStatistics();
    }, [isAuthenticated, user]);

    // Use statistics data or fallback to empty
    const carrierStats = statistics ? {
        totalEarnings: statistics.totalEarnings,
        monthlyGrowth: statistics.monthlyGrowth,
        activeDeliveries: statistics.activeDeliveries,
        completionRate: statistics.completionRate,
        avgDeliveryTime: statistics.avgDeliveryTime,
        fuelEfficiency: statistics.fuelEfficiency,
        customerRating: statistics.customerRating,
        ecoScore: statistics.ecoScore
    } : {
        totalEarnings: 0,
        monthlyGrowth: 0,
        activeDeliveries: 0,
        completionRate: 0,
        avgDeliveryTime: 0,
        fuelEfficiency: 0,
        customerRating: 0,
        ecoScore: 0
    };

    // Sadece bekleyen teslimatları göster (delivered hariç)
    const activeDeliveries = (statistics?.recentDeliveries || []).filter(delivery =>
        delivery.status !== 'delivered'
    );
    const topRoutes = statistics?.topRoutes || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'in_transit': return 'bg-blue-100 text-blue-800';
            case 'loading': return 'bg-purple-100 text-purple-800';
            case 'pickup': return 'bg-yellow-100 text-yellow-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'in_transit': return 'Yolda';
            case 'loading': return 'Yükleniyor';
            case 'pickup': return 'Alım Bekliyor';
            case 'delivered': return 'Teslim Edildi';
            default: return status;
        }
    };

    // Yükleme durumunda gösterilecek içerik
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                    <p className="text-green-600 font-medium">{t("dashboard.page.loading")}</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['CARRIER']}>
            <div className="flex h-[calc(100vh-4rem)]">


                {/* Main Content */}
                <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-purple-50 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header with Real-time Info */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    Taşıyıcı Yönetim Paneli
                                </h1>
                                <p className="text-gray-600 mt-2 text-lg">Güvenli ve verimli taşımacılığın dijital platformu</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatTime(currentTime.toISOString())}
                                    </div>
                                    <div className="text-gray-600">
                                        {formatDate(currentTime.toISOString())}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Key Performance Indicators */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card
                                className="shadow-lg border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white cursor-pointer hover:shadow-xl transition-shadow"
                                onClick={() => router.push('/dashboard/carrier/earnings')}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Toplam Kazanç</p>
                                            <p className="text-3xl font-bold text-purple-600">
                                                {carrierService.formatCurrency(carrierStats.totalEarnings)}
                                            </p>
                                            <div className="flex items-center mt-2">
                                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                                <span className="text-sm text-green-600 font-medium">
                                                    +{carrierStats.monthlyGrowth}% bu ay
                                                </span>
                                            </div>
                                        </div>
                                        <DollarSign className="h-12 w-12 text-purple-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className="shadow-lg border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white cursor-pointer hover:shadow-xl transition-shadow"
                                onClick={() => router.push('/dashboard/carrier/delivery-tracking')}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Aktif Teslimatlar</p>
                                            <p className="text-3xl font-bold text-blue-600">{carrierStats.activeDeliveries}</p>
                                            <div className="flex items-center mt-2">
                                                <Activity className="h-4 w-4 text-blue-600 mr-1" />
                                                <span className="text-sm text-blue-600 font-medium">
                                                    Devam eden işler
                                                </span>
                                            </div>
                                        </div>
                                        <TruckIcon className="h-12 w-12 text-blue-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className="shadow-lg border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white cursor-pointer hover:shadow-xl transition-shadow"
                                onClick={() => router.push('/dashboard/carrier/carrier-completed-deliveries')}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Tamamlanma Oranı</p>
                                            <p className="text-3xl font-bold text-green-600">{carrierStats.completionRate}%</p>
                                            <div className="flex items-center mt-2">
                                                <Target className="h-4 w-4 text-green-600 mr-1" />
                                                <span className="text-sm text-green-600 font-medium">
                                                    Sektör ort: 91%
                                                </span>
                                            </div>
                                        </div>
                                        <CheckCircle className="h-12 w-12 text-green-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className="shadow-lg border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-white cursor-pointer hover:shadow-xl transition-shadow"
                                onClick={() => router.push('/dashboard/carrier/eco-score')}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Çevreci Skor</p>
                                            <p className="text-3xl font-bold text-emerald-600">{carrierStats.ecoScore}</p>
                                            <div className="flex items-center mt-2">
                                                <Leaf className="h-4 w-4 text-emerald-600 mr-1" />
                                                <span className="text-sm text-emerald-600 font-medium">
                                                    Excellent seviye
                                                </span>
                                            </div>
                                        </div>
                                        <Leaf className="h-12 w-12 text-emerald-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Performance Dashboard */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Carrier Performance Metrics */}
                            <Card className="lg:col-span-2 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                        Taşımacılık Performansı
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Müşteri Memnuniyeti</span>
                                                <span className="font-bold text-green-600">{carrierStats.customerRating}/5.0</span>
                                            </div>
                                            <Progress value={(carrierStats.customerRating / 5) * 100} className="h-3" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Yakıt Verimliliği</span>
                                                <span className="font-bold text-green-600">{carrierStats.fuelEfficiency} km/L</span>
                                            </div>
                                            <Progress value={85} className="h-3" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Zamanında Teslimat</span>
                                                <span className="font-bold text-blue-600">96%</span>
                                            </div>
                                            <Progress value={96} className="h-3" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Güvenlik Skoru</span>
                                                <span className="font-bold text-purple-600">99%</span>
                                            </div>
                                            <Progress value={99} className="h-3" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">{carrierStats.avgDeliveryTime}</div>
                                            <div className="text-sm text-gray-600">Ort. Teslimat Süresi (gün)</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">2,847</div>
                                            <div className="text-sm text-gray-600">Toplam KM Bu Ay</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">43</div>
                                            <div className="text-sm text-gray-600">Tamamlanan İş</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Active Deliveries */}
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Navigation className="h-5 w-5 text-blue-600" />
                                        Aktif Teslimatlar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {activeDeliveries.slice(0, 4).map((delivery, index) => (
                                            <div key={index} className="p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg border border-purple-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-900">{delivery.cargo}</span>
                                                        {delivery.eco && (
                                                            <Leaf className="h-3 w-3 text-green-600" />
                                                        )}
                                                    </div>
                                                    <Badge className={getStatusColor(delivery.status)} variant="outline">
                                                        {getStatusText(delivery.status)}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {delivery.route}
                                                </p>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-bold text-purple-600">{delivery.value}</span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        ETA: {delivery.eta}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{width: `${delivery.progress}%`}}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 text-right">{delivery.progress}% tamamlandı</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Routes & Vehicle Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Top Performing Routes */}
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-yellow-600" />
                                        En Karlı Rotalar (KM Başı Kazanç)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {topRoutes.map((route, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg border border-purple-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{route.route}</p>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            <span>{route.count} sefer</span>
                                                            <span className="flex items-center gap-1">
                                                                <Route className="h-3 w-3 text-blue-600" />
                                                                {route.distanceKm} km
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <DollarSign className="h-3 w-3 text-green-600" />
                                                                ${route.pricePerKm.toFixed(2)}/km
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-purple-600">{carrierService.formatCurrency(route.earnings)}</p>
                                                    <Badge variant="outline" className="text-xs mt-1 bg-green-100 text-green-700 border-green-300">
                                                        En Karlı
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Fleet & Operations Analytics */}
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-blue-600" />
                                        Filo & Operasyon Analizi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Fleet Efficiency */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                                                <CardContent className="p-4 text-center">
                                                    <Fuel className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                                    <p className="text-sm text-green-800 font-medium">Yakıt Tasarrufu</p>
                                                    <p className="text-2xl font-bold text-green-600">{carrierService.formatCurrency(statistics?.fleetAnalytics?.fuelSavings || 0)}</p>
                                                    <p className="text-xs text-green-600 mt-1">Ort: {statistics?.fleetAnalytics?.avgFuelEfficiency?.toFixed(1) || 0} L/100km</p>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                                                <CardContent className="p-4 text-center">
                                                    <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                                    <p className="text-sm text-blue-800 font-medium">Operasyon Verimliliği</p>
                                                    <p className="text-2xl font-bold text-blue-600">{statistics?.fleetAnalytics?.operationEfficiency || 0}%</p>
                                                    <p className="text-xs text-blue-600 mt-1">Yakıt tasarrufuna göre</p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Vehicle Status */}
                                        <div>
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                <TruckIcon className="h-4 w-4" />
                                                Araç Durumu
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={() => setShowActiveVehiclesModal(true)}>
                                                    <span className="text-sm font-medium">Aktif Araçlar</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                            <div className="bg-green-600 h-2 rounded-full" style={{width: `${(statistics?.fleetAnalytics?.activeVehicles || 0) / (statistics?.fleetAnalytics?.totalVehicles || 1) * 100}%`}}></div>
                                                        </div>
                                                        <span className="text-sm font-bold text-green-600">{statistics?.fleetAnalytics?.activeVehicles || 0}/{statistics?.fleetAnalytics?.totalVehicles || 0}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={() => setShowMaintenanceModal(true)}>
                                                    <span className="text-sm font-medium">Bakım Durumu</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                            <div className="bg-blue-600 h-2 rounded-full" style={{width: `${statistics?.fleetAnalytics?.maintenancePercentage || 0}%`}}></div>
                                                        </div>
                                                        <span className="text-sm font-bold text-blue-600">{statistics?.fleetAnalytics?.maintenancePercentage || 0}%</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center p-2">
                                                    <span className="text-sm font-medium">Güvenlik Skoru</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                            <div className={`h-2 rounded-full ${(statistics?.fleetAnalytics?.safetyScore || 0) < 70 ? 'bg-red-600' : (statistics?.fleetAnalytics?.safetyScore || 0) < 90 ? 'bg-yellow-600' : 'bg-purple-600'}`} style={{width: `${statistics?.fleetAnalytics?.safetyScore || 0}%`}}></div>
                                                        </div>
                                                        <span className={`text-sm font-bold ${(statistics?.fleetAnalytics?.safetyScore || 0) < 70 ? 'text-red-600' : (statistics?.fleetAnalytics?.safetyScore || 0) < 90 ? 'text-yellow-600' : 'text-purple-600'}`}>{statistics?.fleetAnalytics?.safetyScore || 0}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Eco Performance */}
                                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-green-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-green-800">Çevresel Performans</h4>
                                                    <p className="text-sm text-green-600">Yakıt verimliliğine göre</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-bold text-green-600">{statistics?.fleetAnalytics?.ecoScore || 0}</div>
                                                    <div className="text-sm text-green-700">Çevreci Skor</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Enhanced Statistics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="shadow-md bg-gradient-to-br from-white to-purple-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Package className="h-5 w-5 text-purple-600" />
                                        Müsait Yükler
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-purple-600">{statistics?.availableLoads || 0}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <TrendingUp className="inline h-4 w-4 text-green-600 mr-1" />
                                        Aktif ilanlar
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md bg-gradient-to-br from-white to-blue-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Route className="h-5 w-5 text-blue-600" />
                                        Toplam Mesafe
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-600">{carrierService.formatNumber(statistics?.totalDistance || 0)} km</div>
                                    <div className="text-sm text-gray-600 mt-1">Toplam kat edilen yol</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md bg-gradient-to-br from-white to-green-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-green-600" />
                                        Güvenlik Rekorları
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">{statistics?.safetyDays || 0}</div>
                                    <div className="text-sm text-gray-600 mt-1">Kaza-sız gün</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md bg-gradient-to-br from-white to-emerald-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Users className="h-5 w-5 text-emerald-600" />
                                        Müşteri Puanı
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-emerald-600">{carrierStats.customerRating.toFixed(2)}/5</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <Star className="inline h-4 w-4 text-yellow-500 mr-1" />
                                        {statistics?.totalReviews || 0} değerlendirme
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Success Story Footer */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">🚛 Güvenilir Taşımacılık Partneri</h3>
                                    <p className="text-purple-100 mt-1">Teknoloji ile desteklenen akıllı lojistik çözümleri</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{carrierStats.completionRate}%</div>
                                    <div className="text-purple-100">tamamlanma oranı</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Vehicles Modal */}
                <Dialog open={showActiveVehiclesModal} onOpenChange={setShowActiveVehiclesModal}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <TruckIcon className="h-5 w-5 text-green-600" />
                                Aktif Araçlar
                            </DialogTitle>
                            <DialogDescription>
                                Filonuzdaki tüm aktif araçların detaylı listesi
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {statistics?.fleetAnalytics?.maintenanceAlerts
                                ?.filter(vehicle => vehicle.isActive)
                                .map((vehicle, index) => (
                                    <Card key={index} className="bg-gradient-to-r from-green-50 to-white border-green-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h4 className="font-bold text-lg">{vehicle.vehiclePlate}</h4>
                                                    <p className="text-sm text-gray-600">{vehicle.vehicleType}</p>
                                                </div>
                                                <Badge className="bg-green-100 text-green-700 border-green-300">Aktif</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mt-3">
                                                <div className="flex items-center gap-2">
                                                    <Route className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm">{vehicle.totalKm?.toLocaleString() || 0} km</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Fuel className="h-4 w-4 text-orange-600" />
                                                    <span className="text-sm">{vehicle.fuelConsumption} L/100km</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Maintenance Modal */}
                <Dialog open={showMaintenanceModal} onOpenChange={setShowMaintenanceModal}>
                    <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-blue-600" />
                                Bakım Durumu
                            </DialogTitle>
                            <DialogDescription>
                                Araçlarınızın bakım tarihleri ve uyarılar
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {statistics?.fleetAnalytics?.maintenanceAlerts?.map((vehicle, index) => (
                                <Card key={index} className={`${vehicle.alerts.length > 0 ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="font-bold text-lg flex items-center gap-2">
                                                    {vehicle.vehiclePlate}
                                                    {vehicle.alerts.length > 0 && (
                                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                                    )}
                                                </h4>
                                                <p className="text-sm text-gray-600">{vehicle.vehicleType}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge className={vehicle.isActive ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700"}>
                                                    {vehicle.isActive ? 'Aktif' : 'Pasif'}
                                                </Badge>
                                                {vehicle.alerts.length > 0 && (
                                                    <Badge variant="destructive">{vehicle.alerts.length} Uyarı</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                            <div className="bg-white p-2 rounded border">
                                                <p className="text-xs text-gray-500">Son Yağ Bakımı</p>
                                                <p className="text-sm font-semibold">{vehicle.lastOilChange}</p>
                                            </div>
                                            <div className="bg-white p-2 rounded border">
                                                <p className="text-xs text-gray-500">Son Lastik Değişimi</p>
                                                <p className="text-sm font-semibold">{vehicle.lastTireChange}</p>
                                            </div>
                                            <div className="bg-white p-2 rounded border">
                                                <p className="text-xs text-gray-500">Son Filtre Değişimi</p>
                                                <p className="text-sm font-semibold">{vehicle.lastFilterChange}</p>
                                            </div>
                                            <div className="bg-white p-2 rounded border">
                                                <p className="text-xs text-gray-500">Araç Muayenesi</p>
                                                <p className="text-sm font-semibold">{vehicle.inspectionDate}</p>
                                            </div>
                                        </div>

                                        {vehicle.alerts.length > 0 && (
                                            <div className="bg-red-100 border border-red-300 rounded p-3">
                                                <h5 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                                                    <Shield className="h-4 w-4" />
                                                    Güvenlik Uyarıları
                                                </h5>
                                                <ul className="space-y-1">
                                                    {vehicle.alerts.map((alert, alertIndex) => (
                                                        <li key={alertIndex} className="text-sm text-red-700 flex items-start gap-2">
                                                            <span className="text-red-600">•</span>
                                                            {alert}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </ProtectedRoute>
    );
}