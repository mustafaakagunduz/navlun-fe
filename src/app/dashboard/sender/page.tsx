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
    Award,
    CheckCircle,
    Star,
    Globe,
    DollarSign,
    Calendar,
    MapPin,
    Shield,
    Zap,
    Factory,
    Users,
    Phone,
    Mail
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SenderDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Gerçek zamanlı saat güncellemesi
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Giriş yapmamış veya sender olmayan kullanıcıları yönlendir
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'SENDER')) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    // Dummy data - yatırımcı sunumu için
    const senderStats = {
        totalSpent: 847350,
        monthlySavings: 18.7,
        totalLoads: 342,
        completedRate: 97.2,
        avgDeliveryTime: 2.3,
        carbonSaved: 156.8,
        customerSatisfaction: 98.9,
        ecoChoiceRate: 81.3
    };

    const recentShipments = [
        { id: 'SH001', destination: 'İstanbul → Ankara', cargo: 'Elektronik Cihazlar', value: '₺15,500', status: 'delivered', eco: true, carrier: 'EkoTrans', time: '2 saat önce' },
        { id: 'SH002', destination: 'Bursa → İzmir', cargo: 'Tekstil Ürünleri', value: '₺8,750', status: 'in_transit', eco: true, carrier: 'Yeşil Kargo', time: '4 saat önce' },
        { id: 'SH003', destination: 'Ankara → Antalya', cargo: 'Gıda Ürünleri', value: '₺12,300', status: 'pending', eco: false, carrier: 'Hızlı Taşıma', time: '1 gün önce' },
        { id: 'SH004', destination: 'İzmir → Adana', cargo: 'İnşaat Malzemeleri', value: '₺22,900', status: 'loading', eco: true, carrier: 'Çevreci Lojistik', time: '2 gün önce' },
        { id: 'SH005', destination: 'Konya → İstanbul', cargo: 'Tarım Ürünleri', value: '₺6,850', status: 'delivered', eco: true, carrier: 'Organik Taşıma', time: '3 gün önce' }
    ];

    const topCarriers = [
        { name: 'EkoTrans Lojistik', shipments: 45, rating: 4.9, savings: '₺23,400', ecoScore: 95 },
        { name: 'Yeşil Kargo Ltd.', shipments: 38, rating: 4.8, savings: '₺19,750', ecoScore: 92 },
        { name: 'Sürdürülebilir Nakliyat', shipments: 34, rating: 4.9, savings: '₺18,600', ecoScore: 88 },
        { name: 'Çevreci Lojistik A.Ş.', shipments: 29, rating: 4.7, savings: '₺15,900', ecoScore: 91 },
        { name: 'Karbon Nötr Taşıma', shipments: 27, rating: 4.8, savings: '₺14,200', ecoScore: 100 }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'in_transit': return 'bg-blue-100 text-blue-800';
            case 'loading': return 'bg-purple-100 text-purple-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'delivered': return 'Teslim Edildi';
            case 'in_transit': return 'Yolda';
            case 'loading': return 'Yükleniyor';
            case 'pending': return 'Beklemede';
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
                                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg">
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
                                            <p className="text-sm font-medium text-gray-600">Toplam Harcama</p>
                                            <p className="text-3xl font-bold text-blue-600">
                                                ₺{senderStats.totalSpent.toLocaleString()}
                                            </p>
                                            <div className="flex items-center mt-2">
                                                <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                                                <span className="text-sm text-green-600 font-medium">
                                                    -{senderStats.monthlySavings}% maliyet tasarrufu
                                                </span>
                                            </div>
                                        </div>
                                        <DollarSign className="h-12 w-12 text-blue-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Toplam Yükler</p>
                                            <p className="text-3xl font-bold text-green-600">{senderStats.totalLoads}</p>
                                            <div className="flex items-center mt-2">
                                                <Activity className="h-4 w-4 text-green-600 mr-1" />
                                                <span className="text-sm text-green-600 font-medium">
                                                    28 aktif gönderi
                                                </span>
                                            </div>
                                        </div>
                                        <Package className="h-12 w-12 text-green-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Tamamlanma Oranı</p>
                                            <p className="text-3xl font-bold text-purple-600">{senderStats.completedRate}%</p>
                                            <div className="flex items-center mt-2">
                                                <CheckCircle className="h-4 w-4 text-purple-600 mr-1" />
                                                <span className="text-sm text-purple-600 font-medium">
                                                    Sektör ort: 89%
                                                </span>
                                            </div>
                                        </div>
                                        <Target className="h-12 w-12 text-purple-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">CO₂ Tasarrufu</p>
                                            <p className="text-3xl font-bold text-emerald-600">{senderStats.carbonSaved} ton</p>
                                            <div className="flex items-center mt-2">
                                                <Leaf className="h-4 w-4 text-emerald-600 mr-1" />
                                                <span className="text-sm text-emerald-600 font-medium">
                                                    Bu ay +23.4 ton
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
                            <Card className="shadow-md bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-blue-100">
                                            <Package className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-blue-900">{t("senderPage.myLoads")}</h3>
                                            <span className="text-blue-700 text-2xl font-bold">28</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 cursor-pointer hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-amber-100">
                                            <FileText className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-amber-900">{t("senderPage.pendingOffers")}</h3>
                                            <span className="text-amber-700 text-2xl font-bold">12</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md bg-gradient-to-r from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-green-100">
                                            <TruckIcon className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-green-900">{t("senderPage.activeShipments")}</h3>
                                            <span className="text-green-700 text-2xl font-bold">5</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 cursor-pointer hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-purple-100">
                                            <ClockIcon className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-purple-900">{t("senderPage.loadHistory")}</h3>
                                            <span className="text-purple-700 text-2xl font-bold">87</span>
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
                                                <span>Müşteri Memnuniyeti</span>
                                                <span className="font-bold text-green-600">{senderStats.customerSatisfaction}%</span>
                                            </div>
                                            <Progress value={senderStats.customerSatisfaction} className="h-3" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Çevreci Seçim Oranı</span>
                                                <span className="font-bold text-green-600">{senderStats.ecoChoiceRate}%</span>
                                            </div>
                                            <Progress value={senderStats.ecoChoiceRate} className="h-3" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Zamanında Teslimat</span>
                                                <span className="font-bold text-blue-600">95%</span>
                                            </div>
                                            <Progress value={95} className="h-3" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Maliyet Optimizasyonu</span>
                                                <span className="font-bold text-purple-600">88%</span>
                                            </div>
                                            <Progress value={88} className="h-3" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{senderStats.avgDeliveryTime}</div>
                                            <div className="text-sm text-gray-600">Ort. Teslimat Süresi (gün)</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">47</div>
                                            <div className="text-sm text-gray-600">Bu Ay Gönderi</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">₺8.7K</div>
                                            <div className="text-sm text-gray-600">Ort. Kargo Maliyeti</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Shipment Activities */}
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        Son Gönderiler
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentShipments.slice(0, 4).map((shipment, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-blue-100">
                                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                                    shipment.status === 'delivered' ? 'bg-green-500' :
                                                        shipment.status === 'in_transit' ? 'bg-blue-500' :
                                                            shipment.status === 'loading' ? 'bg-purple-500' : 'bg-yellow-500'
                                                }`}></div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-sm font-medium text-gray-900">{shipment.cargo}</p>
                                                        {shipment.eco && (
                                                            <Leaf className="h-3 w-3 text-green-600" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 mb-1">{shipment.destination}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-blue-600">{shipment.value}</span>
                                                        <Badge className={getStatusColor(shipment.status)} variant="outline">
                                                            {getStatusText(shipment.status)}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{shipment.carrier} • {shipment.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Statistics Grid */}
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">{t("senderPage.statistics")}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="shadow-lg bg-gradient-to-br from-white to-blue-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Package className="h-5 w-5 text-blue-600" />
                                        {t("senderPage.totalLoads")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-600">120</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <TrendingUp className="inline h-4 w-4 text-green-600 mr-1" />
                                        +15% bu ay
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg bg-gradient-to-br from-white to-green-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        {t("senderPage.completedLoads")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">87</div>
                                    <div className="text-sm text-gray-600 mt-1">%97.2 başarı oranı</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg bg-gradient-to-br from-white to-yellow-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <ClockIcon className="h-5 w-5 text-yellow-600" />
                                        {t("senderPage.pendingLoads")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-yellow-600">17</div>
                                    <div className="text-sm text-gray-600 mt-1">12 teklif bekliyor</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg bg-gradient-to-br from-white to-emerald-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Leaf className="h-5 w-5 text-emerald-600" />
                                        {t("senderPage.avgCarbonSaved")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center">
                                        <span className="text-3xl font-bold text-emerald-600">28%</span>
                                        <Leaf className="h-5 w-5 text-green-600 ml-2" />
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Sektör ort: 15%</div>
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
                                    <div className="text-2xl font-bold">{senderStats.carbonSaved} ton</div>
                                    <div className="text-blue-100">CO₂ tasarrufu</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}