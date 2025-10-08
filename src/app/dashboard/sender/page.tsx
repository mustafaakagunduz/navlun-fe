"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Package,
    FileText,
    TruckIcon,
    ClockIcon,
    BarChart3,
    PlusCircle,
    Leaf,
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    CheckCircle,
    DollarSign,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import loadService, { Load, LoadWithOffers, SenderStatisticsDto } from "@/services/loadService";

export default function SenderDashboard() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const [currentTime, setCurrentTime] = useState(new Date());

    // State for real data
    const [statistics, setStatistics] = useState<SenderStatisticsDto | null>(null);
    const [activeLoads, setActiveLoads] = useState<Load[]>([]);
    const [loadsWithOffers, setLoadsWithOffers] = useState<LoadWithOffers[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Gerçek zamanlı saat güncellemesi
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Giriş yapmamış veya sender olmayan kullanıcıları yönlendir
    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'SENDER')) {
            router.push('/dashboard');
        }
    }, [authLoading, isAuthenticated, user, router]);

    // Fetch real data from backend
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.id) return;

            setIsDataLoading(true);
            setError(null);

            try {
                // Fetch statistics first (required)
                const stats = await loadService.getCurrentUserStatistics();
                setStatistics(stats);

                // Try to fetch loads, but don't fail if they don't exist
                try {
                    const loads = await loadService.getCurrentUserActiveLoads();
                    setActiveLoads(loads || []);
                } catch (loadErr: any) {
                    console.warn('Active loads not available:', loadErr);
                    setActiveLoads([]);
                }

                // Try to fetch offers, but don't fail if they don't exist
                try {
                    const offers = await loadService.getCurrentUserLoadsWithOffers();
                    setLoadsWithOffers(offers || []);
                } catch (offerErr: any) {
                    console.warn('Loads with offers not available:', offerErr);
                    setLoadsWithOffers([]);
                }
            } catch (err: any) {
                console.error('Error fetching dashboard data:', err);
                // If it's a 404 or profile not found error, show helpful message
                if (err.response?.status === 404 || err.message?.includes('bulunamadı')) {
                    setError('Henüz yük bulunmuyor. İlk yükünüzü oluşturarak başlayın!');
                } else {
                    setError('Dashboard verileri yüklenirken hata oluştu');
                }
                // Set default empty statistics
                setStatistics({
                    totalLoads: 0,
                    averageWeight: 0,
                    completedLoads: 0,
                    pendingLoads: 0
                });
            } finally {
                setIsDataLoading(false);
            }
        };

        if (user?.id) {
            fetchDashboardData();
        }
    }, [user?.id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800';
            case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'Teslim Edildi';
            case 'IN_TRANSIT': return 'Yolda';
            case 'ASSIGNED': return 'Atandı';
            case 'PENDING': return 'Beklemede';
            case 'COMPLETED': return 'Tamamlandı';
            default: return status;
        }
    };

    // Calculate pending offers count
    const pendingOffersCount = loadsWithOffers.reduce((sum, loadWithOffer) =>
        sum + loadWithOffer.pendingOffersCount, 0
    );

    // Calculate completion rate
    const completionRate = statistics
        ? (statistics.completedLoads / Math.max(statistics.totalLoads, 1)) * 100
        : 0;

    // Calculate average weight in tons
    const avgWeightTons = statistics
        ? (statistics.averageWeight / 1000).toFixed(1)
        : '0.0';

    // Yükleme durumunda gösterilecek içerik
    if (authLoading || isDataLoading) {
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
        <ProtectedRoute allowedRoles={['SENDER']}>
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Main Content */}
                <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-blue-50 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header with Real-time Info */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                    Gönderici Yönetim Paneli
                                </h1>
                                <p className="text-gray-600 mt-2 text-lg">Akıllı lojistik çözümleriyle işinizi büyütün</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {currentTime.toLocaleTimeString('tr-TR')}
                                    </div>
                                    <div className="text-gray-600">
                                        {currentTime.toLocaleDateString('tr-TR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <Button
                                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg"
                                    onClick={() => router.push('/dashboard/sender/loads/new-load')}
                                >
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    {t("senderPage.createNewLoad")}
                                </Button>
                            </div>
                        </div>

                        {/* Key Performance Indicators */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="shadow-lg border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Toplam Yükler</p>
                                            <p className="text-3xl font-bold text-blue-600">
                                                {statistics?.totalLoads || 0}
                                            </p>
                                            <div className="flex items-center mt-2">
                                                <Activity className="h-4 w-4 text-blue-600 mr-1" />
                                                <span className="text-sm text-blue-600 font-medium">
                                                    {activeLoads.length} aktif
                                                </span>
                                            </div>
                                        </div>
                                        <Package className="h-12 w-12 text-blue-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                                            <p className="text-3xl font-bold text-green-600">
                                                {statistics?.completedLoads || 0}
                                            </p>
                                            <div className="flex items-center mt-2">
                                                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                                                <span className="text-sm text-green-600 font-medium">
                                                    %{completionRate.toFixed(1)} başarı
                                                </span>
                                            </div>
                                        </div>
                                        <CheckCircle className="h-12 w-12 text-green-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Bekleyen Yükler</p>
                                            <p className="text-3xl font-bold text-purple-600">
                                                {statistics?.pendingLoads || 0}
                                            </p>
                                            <div className="flex items-center mt-2">
                                                <FileText className="h-4 w-4 text-purple-600 mr-1" />
                                                <span className="text-sm text-purple-600 font-medium">
                                                    {pendingOffersCount} teklif
                                                </span>
                                            </div>
                                        </div>
                                        <ClockIcon className="h-12 w-12 text-purple-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Ort. Ağırlık</p>
                                            <p className="text-3xl font-bold text-emerald-600">{avgWeightTons} ton</p>
                                            <div className="flex items-center mt-2">
                                                <Leaf className="h-4 w-4 text-emerald-600 mr-1" />
                                                <span className="text-sm text-emerald-600 font-medium">
                                                    Yük başına
                                                </span>
                                            </div>
                                        </div>
                                        <Leaf className="h-12 w-12 text-emerald-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Action Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card
                                className="shadow-md bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => router.push('/dashboard/sender/loads')}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-blue-100">
                                            <Package className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-blue-900">{t("senderPage.myLoads")}</h3>
                                            <span className="text-blue-700 text-2xl font-bold">{statistics?.totalLoads || 0}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className="shadow-md bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => router.push('/dashboard/sender/offers')}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-amber-100">
                                            <FileText className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-amber-900">{t("senderPage.pendingOffers")}</h3>
                                            <span className="text-amber-700 text-2xl font-bold">{pendingOffersCount}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className="shadow-md bg-gradient-to-r from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => router.push('/dashboard/sender/loads')}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-green-100">
                                            <TruckIcon className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-green-900">{t("senderPage.activeShipments")}</h3>
                                            <span className="text-green-700 text-2xl font-bold">{activeLoads.length}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className="shadow-md bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => router.push('/dashboard/sender/loads')}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-purple-100">
                                            <ClockIcon className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-purple-900">{t("senderPage.completedLoads")}</h3>
                                            <span className="text-purple-700 text-2xl font-bold">{statistics?.completedLoads || 0}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Performance Dashboard */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Shipping Performance Metrics */}
                            <Card className="lg:col-span-2 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        Gönderi Performansı
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Tamamlanma Oranı</span>
                                                <span className="font-bold text-green-600">{completionRate.toFixed(1)}%</span>
                                            </div>
                                            <Progress value={completionRate} className="h-3" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Aktif Yükler</span>
                                                <span className="font-bold text-blue-600">
                                                    {statistics ? ((activeLoads.length / Math.max(statistics.totalLoads, 1)) * 100).toFixed(0) : 0}%
                                                </span>
                                            </div>
                                            <Progress value={statistics ? (activeLoads.length / Math.max(statistics.totalLoads, 1)) * 100 : 0} className="h-3" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Teklifli Yükler</span>
                                                <span className="font-bold text-purple-600">
                                                    {statistics ? ((loadsWithOffers.length / Math.max(statistics.totalLoads, 1)) * 100).toFixed(0) : 0}%
                                                </span>
                                            </div>
                                            <Progress value={statistics ? (loadsWithOffers.length / Math.max(statistics.totalLoads, 1)) * 100 : 0} className="h-3" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{statistics?.totalLoads || 0}</div>
                                            <div className="text-sm text-gray-600">Toplam Yük</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{statistics?.completedLoads || 0}</div>
                                            <div className="text-sm text-gray-600">Tamamlanan</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">{statistics?.pendingLoads || 0}</div>
                                            <div className="text-sm text-gray-600">Bekleyen</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Shipment Activities */}
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        Son Aktif Yükler
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {activeLoads.slice(0, 4).map((load) => (
                                            <div key={load.id} className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-blue-100">
                                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                                    load.status === 'DELIVERED' ? 'bg-green-500' :
                                                    load.status === 'IN_TRANSIT' ? 'bg-blue-500' :
                                                    load.status === 'ASSIGNED' ? 'bg-purple-500' : 'bg-yellow-500'
                                                }`}></div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-sm font-medium text-gray-900">{load.goodsType}</p>
                                                        {load.ecoTransportRequested && (
                                                            <Leaf className="h-3 w-3 text-green-600" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 mb-1">{load.loadingAddress} → {load.deliveryAddress}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-blue-600">{load.netWeight} kg</span>
                                                        <Badge className={getStatusColor(load.status)} variant="outline">
                                                            {getStatusText(load.status)}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(load.createdAt).toLocaleDateString('tr-TR')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {activeLoads.length === 0 && (
                                            <p className="text-center text-gray-500 py-4">Aktif yük bulunmuyor</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Success Story Footer */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">📦 Akıllı Lojistik Lideri</h3>
                                    <p className="text-blue-100 mt-1">Çevre dostu çözümlerle maliyetlerinizi optimize ediyoruz</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{statistics?.totalLoads || 0}</div>
                                    <div className="text-blue-100">Toplam Gönderi</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
