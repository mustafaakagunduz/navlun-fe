'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Loader2,
    Truck,
    Phone,
    Mail,
    Award,
    Package,
    Leaf,
    Calendar,
    ArrowLeft,
    TrendingUp,
    CheckCircle2,
    Star,
    MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/dateUtils';

// Basit Carrier tipi - gerçek API'den gelene kadar
type CarrierProfile = {
    id: string;
    userId: string;
    companyName: string;
    email?: string;
    phone?: string;
    totalDeliveries?: number;
    completedDeliveries?: number;
    ecoFriendlyDeliveries?: number;
    rating?: number;
    createdAt?: string;
};

export default function CarrierProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [profile, setProfile] = useState<CarrierProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const carrierId = params.id as string;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                // TODO: Gerçek API endpoint'i eklenecek
                // const profileData = await carrierService.getCarrierProfileById(carrierId);

                // Şimdilik mock data
                setProfile({
                    id: carrierId,
                    userId: '',
                    companyName: 'Taşıyıcı Firma',
                    totalDeliveries: 0,
                    completedDeliveries: 0,
                    ecoFriendlyDeliveries: 0,
                    rating: 0
                });
            } catch (error: any) {
                console.error('Error fetching carrier profile:', error);
                toast({
                    title: 'Hata',
                    description: error.message || 'Profil yüklenirken bir hata oluştu',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        if (carrierId) {
            fetchProfileData();
        }
    }, [carrierId, toast]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Profil yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-8">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Profil Bulunamadı</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Aradığınız taşıyıcı profili bulunamadı.
                        </p>
                        <Button onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Geri Dön
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const ecoRatio = profile.totalDeliveries && profile.totalDeliveries > 0
        ? ((profile.ecoFriendlyDeliveries || 0) / profile.totalDeliveries * 100).toFixed(1)
        : '0';

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Geri
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Taşıyıcı Profili</h1>
                    <p className="text-gray-600 mt-1">Detaylı şirket bilgileri ve istatistikler</p>
                </div>
            </div>

            {/* Main Profile Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <Truck className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{profile.companyName}</CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="default">Taşıyıcı</Badge>
                                    {profile.ecoFriendlyDeliveries && profile.ecoFriendlyDeliveries > 0 && (
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            <Leaf className="h-3 w-3 mr-1" />
                                            Çevre Dostu
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.phone && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Phone className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Telefon</p>
                                    <p className="text-sm font-medium">{profile.phone}</p>
                                </div>
                            </div>
                        )}
                        {profile.email && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Mail className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">E-posta</p>
                                    <p className="text-sm font-medium">{profile.email}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rating */}
                    {profile.rating !== undefined && profile.rating > 0 && (
                        <div className="flex items-center gap-3 pt-4 border-t">
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            <div>
                                <p className="text-xs text-gray-500">Ortalama Puan</p>
                                <p className="text-lg font-semibold">{profile.rating.toFixed(1)} / 5.0</p>
                            </div>
                        </div>
                    )}

                    {/* Member Since */}
                    {profile.createdAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 pt-4 border-t">
                            <Calendar className="h-4 w-4" />
                            <span>Üyelik Tarihi: {formatDate(profile.createdAt)}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Toplam Teslimat</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">
                                    {profile.totalDeliveries || 0}
                                </p>
                            </div>
                            <Package className="h-10 w-10 text-blue-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tamamlanan</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">
                                    {profile.completedDeliveries || 0}
                                </p>
                            </div>
                            <CheckCircle2 className="h-10 w-10 text-green-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Çevre Dostu</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">
                                    {profile.ecoFriendlyDeliveries || 0}
                                </p>
                            </div>
                            <Leaf className="h-10 w-10 text-green-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Çevreci Oran</p>
                                <p className="text-3xl font-bold text-orange-600 mt-1">
                                    {ecoRatio}%
                                </p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-orange-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Info Note */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <p className="text-sm text-blue-800">
                        <strong>Not:</strong> Taşıyıcı profili bilgileri geliştirme aşamasındadır.
                        Daha detaylı bilgiler yakında eklenecektir.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
