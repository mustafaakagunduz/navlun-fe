"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Loader2,
    ArrowLeft,
    Leaf,
    TrendingUp,
    Fuel,
    Zap,
    Award,
    Target,
    TruckIcon,
    Globe,
    Wind,
    Droplet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import carrierService from "@/services/carrierService";

export default function CarrierEcoScorePage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState<any>(null);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'CARRIER')) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    useEffect(() => {
        const loadData = async () => {
            if (!isAuthenticated || user?.role !== 'CARRIER') return;

            try {
                setLoading(true);
                const stats = await carrierService.getCurrentUserStatistics();
                setStatistics(stats);
            } catch (error: any) {
                console.error('Error loading eco score:', error);
                toast({
                    title: "Hata",
                    description: "Çevre skoru verileri yüklenirken bir hata oluştu",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isAuthenticated, user]);

    if (isLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-emerald-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                    <p className="text-emerald-600 font-medium">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    const ecoScore = statistics?.ecoScore || 0;
    const fuelEfficiency = statistics?.fuelEfficiency || 0;

    const getEcoRating = (score: number) => {
        if (score >= 90) return { text: 'Mükemmel', color: 'emerald', icon: '🌟' };
        if (score >= 75) return { text: 'İyi', color: 'green', icon: '✨' };
        if (score >= 60) return { text: 'Orta', color: 'yellow', icon: '⭐' };
        return { text: 'Geliştirilmeli', color: 'orange', icon: '📊' };
    };

    const rating = getEcoRating(ecoScore);

    return (
        <ProtectedRoute allowedRoles={['CARRIER']}>
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Geri
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                Çevreci Skor
                            </h1>
                            <p className="text-gray-600 mt-1">Çevresel performans ve sürdürülebilirlik göstergeleri</p>
                        </div>
                    </div>

                    {/* Main Eco Score Card */}
                    <Card className="shadow-2xl mb-8 bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="text-center md:text-left">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Leaf className="h-6 w-6 text-emerald-600" />
                                        <h2 className="text-2xl font-bold text-gray-900">Toplam Çevreci Skor</h2>
                                    </div>
                                    <div className="text-7xl font-bold text-emerald-600 my-4">{ecoScore}</div>
                                    <Badge className={`bg-${rating.color}-100 text-${rating.color}-700 border-${rating.color}-300 text-lg px-4 py-2`}>
                                        {rating.icon} {rating.text}
                                    </Badge>
                                </div>
                                <div className="flex-1 w-full max-w-md">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium">Genel Performans</span>
                                                <span className="font-bold text-emerald-600">{ecoScore}%</span>
                                            </div>
                                            <Progress value={ecoScore} className="h-4 bg-gray-200" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-emerald-200">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-emerald-600">A+</div>
                                                <div className="text-xs text-gray-600">Sınıf</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">Top 5%</div>
                                                <div className="text-xs text-gray-600">Sıralama</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">+12%</div>
                                                <div className="text-xs text-gray-600">Bu Ay</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                        <Card className="shadow-lg border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Yakıt Verimliliği</p>
                                        <p className="text-3xl font-bold text-green-600">{fuelEfficiency}</p>
                                        <p className="text-xs text-gray-500 mt-1">km/L</p>
                                    </div>
                                    <Fuel className="h-12 w-12 text-green-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">CO₂ Tasarrufu</p>
                                        <p className="text-3xl font-bold text-blue-600">1.2</p>
                                        <p className="text-xs text-gray-500 mt-1">ton/ay</p>
                                    </div>
                                    <Wind className="h-12 w-12 text-blue-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-emerald-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Enerji Verimliliği</p>
                                        <p className="text-3xl font-bold text-emerald-600">94%</p>
                                        <p className="text-xs text-gray-500 mt-1">Hedef: 95%</p>
                                    </div>
                                    <Zap className="h-12 w-12 text-emerald-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-cyan-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Su Tasarrufu</p>
                                        <p className="text-3xl font-bold text-cyan-600">850</p>
                                        <p className="text-xs text-gray-500 mt-1">litre/ay</p>
                                    </div>
                                    <Droplet className="h-12 w-12 text-cyan-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Environmental Impact */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-emerald-600" />
                                    Çevresel Etki
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Karbon Ayak İzi Azaltımı</span>
                                        <span className="font-bold text-green-600">88%</span>
                                    </div>
                                    <Progress value={88} className="h-3" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Yakıt Optimizasyonu</span>
                                        <span className="font-bold text-green-600">92%</span>
                                    </div>
                                    <Progress value={92} className="h-3" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Rota Optimizasyonu</span>
                                        <span className="font-bold text-emerald-600">96%</span>
                                    </div>
                                    <Progress value={96} className="h-3" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Atık Yönetimi</span>
                                        <span className="font-bold text-green-600">85%</span>
                                    </div>
                                    <Progress value={85} className="h-3" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Achievements */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-yellow-600" />
                                    Çevre Başarıları
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl">
                                                🌳
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Karbon Nötr</p>
                                                <p className="text-sm text-gray-600">100+ teslimat karbon nötr tamamlandı</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
                                                ⚡
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Enerji Kahramanı</p>
                                                <p className="text-sm text-gray-600">%20 enerji tasarrufu sağlandı</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white text-2xl">
                                                🏆
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Yeşil Lider</p>
                                                <p className="text-sm text-gray-600">En çevreci taşıyıcı ödülü</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommendations */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-purple-600" />
                                İyileştirme Önerileri
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <TruckIcon className="h-8 w-8 text-purple-600 mb-2" />
                                    <h4 className="font-semibold text-gray-900 mb-1">Araç Bakımı</h4>
                                    <p className="text-sm text-gray-600">Düzenli bakım ile %5 daha fazla yakıt tasarrufu</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <Leaf className="h-8 w-8 text-green-600 mb-2" />
                                    <h4 className="font-semibold text-gray-900 mb-1">Çevreci Rotalar</h4>
                                    <p className="text-sm text-gray-600">Optimize rotalar ile karbon emisyonunu azaltın</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <Zap className="h-8 w-8 text-blue-600 mb-2" />
                                    <h4 className="font-semibold text-gray-900 mb-1">Elektrikli Araçlar</h4>
                                    <p className="text-sm text-gray-600">Hibrit veya elektrikli araç kullanımını artırın</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
