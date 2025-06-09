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
    HandshakeIcon,
    DollarSign,
    BarChart3,
    Users,
    PlusCircle,
    Leaf,
    Building,
    Truck,
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    Award,
    Clock,
    CheckCircle,
    Star,
    Globe,
    Zap,
    Calendar,
    Phone,
    Mail,
    MapPin
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function BrokerDashboard() {
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

    // Giriş yapmamış veya broker olmayan kullanıcıları yönlendir
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'BROKER')) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    // Dummy data - yatırımcı sunumu için
    const brokerStats = {
        totalCommission: 125640,
        monthlyGrowth: 31.2,
        activeDeals: 47,
        successRate: 96.8,
        avgDealValue: 8750,
        ecoDealsRatio: 73,
        clientSatisfaction: 98.1,
        marketShare: 15.4
    };

    const recentDeals = [
        { id: 'D001', client: 'MetalWorks Ltd.', route: 'İstanbul → Bursa', value: '₺15,500', status: 'completed', eco: true, time: '3 dakika önce' },
        { id: 'D002', client: 'EkoGıda A.Ş.', route: 'Ankara → İzmir', value: '₺12,300', status: 'active', eco: true, time: '8 dakika önce' },
        { id: 'D003', client: 'Tekstil Pro', route: 'Bursa → Adana', value: '₺9,750', status: 'pending', eco: false, time: '15 dakika önce' },
        { id: 'D004', client: 'Çelik Yapı', route: 'İzmir → Antalya', value: '₺18,900', status: 'negotiating', eco: true, time: '22 dakika önce' },
        { id: 'D005', client: 'Organik Tarım', route: 'Konya → İstanbul', value: '₺7,850', status: 'completed', eco: true, time: '28 dakika önce' }
    ];

    const topPerformers = [
        { name: 'Sürdürülebilir Lojistik A.Ş.', deals: 156, commission: '₺87,450', rating: 4.9, ecoRatio: 89 },
        { name: 'Yeşil Kargo Ltd.', deals: 134, commission: '₺76,200', rating: 4.8, ecoRatio: 92 },
        { name: 'EkoTrans Nakliyat', deals: 128, commission: '₺69,800', rating: 4.9, ecoRatio: 95 },
        { name: 'Çevreci Taşımacılık', deals: 119, commission: '₺64,300', rating: 4.7, ecoRatio: 88 },
        { name: 'Karbon Nötr Lojistik', deals: 107, commission: '₺58,900', rating: 4.8, ecoRatio: 100 }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'active': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'negotiating': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return 'Tamamlandı';
            case 'active': return 'Aktif';
            case 'pending': return 'Beklemede';
            case 'negotiating': return 'Müzakere';
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
        <ProtectedRoute allowedRoles={['BROKER']}>
            <div className="flex h-[calc(100vh-4rem)]">


                {/* Main Content */}
                <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-amber-50 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header with Real-time Info */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                    Aracı Yönetim Paneli
                                </h1>
                                <p className="text-gray-600 mt-2 text-lg">Taşımacılık sektörünün güvenilir köprüsü</p>
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
                                <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg">
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Yeni Anlaşma
                                </Button>
                            </div>
                        </div>

                        {/* Key Performance Indicators */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="shadow-lg border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Toplam Komisyon</p>
                                            <p className="text-3xl font-bold text-amber-600">
                                                ₺{brokerStats.totalCommission.toLocaleString()}
                                            </p>
                                            <div className="flex items-center mt-2">
                                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                                <span className="text-sm text-green-600 font-medium">
                                                    +{brokerStats.monthlyGrowth}% bu ay
                                                </span>
                                            </div>
                                        </div>
                                        <DollarSign className="h-12 w-12 text-amber-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Aktif Anlaşmalar</p>
                                            <p className="text-3xl font-bold text-blue-600">{brokerStats.activeDeals}</p>
                                            <div className="flex items-center mt-2">
                                                <Activity className="h-4 w-4 text-blue-600 mr-1" />
                                                <span className="text-sm text-blue-600 font-medium">
                                                    23 yeni müzakere
                                                </span>
                                            </div>
                                        </div>
                                        <HandshakeIcon className="h-12 w-12 text-blue-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Başarı Oranı</p>
                                            <p className="text-3xl font-bold text-green-600">{brokerStats.successRate}%</p>
                                            <div className="flex items-center mt-2">
                                                <Target className="h-4 w-4 text-green-600 mr-1" />
                                                <span className="text-sm text-green-600 font-medium">
                                                    Sektör ortalaması: 78%
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
                                            <p className="text-sm font-medium text-gray-600">Ort. Anlaşma Değeri</p>
                                            <p className="text-3xl font-bold text-purple-600">₺{brokerStats.avgDealValue.toLocaleString()}</p>
                                            <div className="flex items-center mt-2">
                                                <BarChart3 className="h-4 w-4 text-purple-600 mr-1" />
                                                <span className="text-sm text-purple-600 font-medium">
                                                    +15% artış
                                                </span>
                                            </div>
                                        </div>
                                        <Award className="h-12 w-12 text-purple-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Performance Dashboard */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Broker Performance Metrics */}
                            <Card className="lg:col-span-2 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-amber-600" />
                                        Aracılık Performansı
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Müşteri Memnuniyeti</span>
                                                <span className="font-bold text-green-600">{brokerStats.clientSatisfaction}%</span>
                                            </div>
                                            <Progress value={brokerStats.clientSatisfaction} className="h-3" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Çevreci Anlaşma Oranı</span>
                                                <span className="font-bold text-green-600">{brokerStats.ecoDealsRatio}%</span>
                                            </div>
                                            <Progress value={brokerStats.ecoDealsRatio} className="h-3" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Pazar Payı</span>
                                                <span className="font-bold text-blue-600">{brokerStats.marketShare}%</span>
                                            </div>
                                            <Progress value={brokerStats.marketShare} className="h-3" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Anlaşma Kapanma Hızı</span>
                                                <span className="font-bold text-purple-600">92%</span>
                                            </div>
                                            <Progress value={92} className="h-3" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-amber-600">2.1</div>
                                            <div className="text-sm text-gray-600">Ort. Kapanma Süresi (gün)</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">347</div>
                                            <div className="text-sm text-gray-600">Bu Ay Anlaşma</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">₺2.8M</div>
                                            <div className="text-sm text-gray-600">Aylık Hacim</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Deal Activities */}
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        Son Anlaşmalar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentDeals.slice(0, 4).map((deal, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-amber-50 rounded-lg border border-amber-100">
                                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                                    deal.status === 'completed' ? 'bg-green-500' :
                                                        deal.status === 'active' ? 'bg-blue-500' :
                                                            deal.status === 'pending' ? 'bg-yellow-500' : 'bg-purple-500'
                                                }`}></div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-sm font-medium text-gray-900">{deal.client}</p>
                                                        {deal.eco && (
                                                            <Leaf className="h-3 w-3 text-green-600" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 mb-1">{deal.route}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-amber-600">{deal.value}</span>
                                                        <Badge className={getStatusColor(deal.status)} variant="outline">
                                                            {getStatusText(deal.status)}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{deal.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Performers & Market Insights */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Top Performing Partners */}
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-yellow-600" />
                                        En İyi Performans Gösteren Ortaklar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {topPerformers.map((partner, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-amber-50 rounded-lg border border-amber-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{partner.name}</p>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            <span>{partner.deals} anlaşma</span>
                                                            <span className="flex items-center gap-1">
                                                                <Star className="h-3 w-3 text-yellow-500" />
                                                                {partner.rating}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Leaf className="h-3 w-3 text-green-600" />
                                                                {partner.ecoRatio}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-amber-600">{partner.commission}</p>
                                                    <Badge variant="outline" className="text-xs mt-1">
                                                        Çevreci Ortak
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Market Intelligence */}
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-blue-600" />
                                        Pazar Analizi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Market Trends */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                                                <CardContent className="p-4 text-center">
                                                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                                    <p className="text-sm text-green-800 font-medium">Çevreci Talep</p>
                                                    <p className="text-2xl font-bold text-green-600">+47%</p>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                                                <CardContent className="p-4 text-center">
                                                    <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                                    <p className="text-sm text-blue-800 font-medium">Dijital Dönüşüm</p>
                                                    <p className="text-2xl font-bold text-blue-600">89%</p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Regional Performance */}
                                        <div>
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Bölgesel Performans
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm">İstanbul Bölgesi</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                            <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                                                        </div>
                                                        <span className="text-sm font-bold">85%</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm">Ankara Bölgesi</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '72%'}}></div>
                                                        </div>
                                                        <span className="text-sm font-bold">72%</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm">İzmir Bölgesi</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                            <div className="bg-purple-600 h-2 rounded-full" style={{width: '68%'}}></div>
                                                        </div>
                                                        <span className="text-sm font-bold">68%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button variant="outline" size="sm" className="text-xs">
                                                <Phone className="h-3 w-3 mr-1" />
                                                Müşteri Ara
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-xs">
                                                <Mail className="h-3 w-3 mr-1" />
                                                Rapor Gönder
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Enhanced Statistics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="shadow-md bg-gradient-to-br from-white to-amber-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <HandshakeIcon className="h-5 w-5 text-amber-600" />
                                        Toplam Anlaşmalar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-amber-600">1,247</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <TrendingUp className="inline h-4 w-4 text-green-600 mr-1" />
                                        +24% bu ay
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md bg-gradient-to-br from-white to-green-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Leaf className="h-5 w-5 text-green-600" />
                                        Çevreci Anlaşmalar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">912</div>
                                    <div className="text-sm text-gray-600 mt-1">Toplam anlaşmaların %73'ü</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md bg-gradient-to-br from-white to-purple-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-purple-600" />
                                        Aylık Komisyon
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-purple-600">₺67,850</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <TrendingUp className="inline h-4 w-4 text-green-600 mr-1" />
                                        +31% artış
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md bg-gradient-to-br from-white to-blue-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        Bekleyen Komisyon
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-600">₺23,450</div>
                                    <div className="text-sm text-gray-600 mt-1">17 anlaşma bekliyor</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Success Story Footer */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">🤝 Güvenilir Aracılık Lideri</h3>
                                    <p className="text-amber-100 mt-1">Taşımacılık sektöründe köprü kurarak değer yaratıyoruz</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{brokerStats.successRate}%</div>
                                    <div className="text-amber-100">başarı oranı</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}