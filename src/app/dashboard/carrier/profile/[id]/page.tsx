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
    MapPin,
    Building,
    FileText,
    IdCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/dateUtils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import carrierService from '@/services/carrierService';
import reviewService, { Review } from '@/services/reviewService';

// Carrier profile type
type CarrierProfile = {
    id: string;
    userId: string;
    companyName: string;
    email?: string;
    phone?: string;
    address?: string;
    taxNumber?: string;
    totalDeliveries?: number;
    completedDeliveries?: number;
    ecoFriendlyDeliveries?: number;
    rating?: number;
    createdAt?: string;
};

type Vehicle = {
    id: string;
    plate: string;
    vehicleType: string;
    capacity: number;
    isActive: boolean;
};

export default function CarrierProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [profile, setProfile] = useState<CarrierProfile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    const carrierId = params.id as string;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);

                // Fetch carrier profile
                const profileData = await carrierService.getCarrierProfileById(carrierId);
                console.log('Carrier profile data:', profileData);
                setProfile(profileData);

                // Fetch reviews for this carrier (userId kullan, profile ID değil!)
                try {
                    const reviewsData = await reviewService.getReviewsForUser(profileData.userId);
                    console.log('Reviews for carrier:', reviewsData);
                    setReviews(reviewsData);
                } catch (reviewError) {
                    console.error('Error fetching reviews:', reviewError);
                    setReviews([]);
                }

                // Fetch vehicles for this carrier
                try {
                    const vehiclesData = await carrierService.getVehiclesByCarrier(carrierId);
                    setVehicles(vehiclesData);
                } catch (vehicleError) {
                    console.error('Error fetching vehicles:', vehicleError);
                    setVehicles([]);
                }
            } catch (error: any) {
                console.error('Error fetching carrier profile:', error);
                toast({
                    title: 'Hata',
                    description: error.response?.data?.message || 'Profil yüklenirken bir hata oluştu',
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

    const averageRating = reviews && reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : '0';

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

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
                                <CardTitle className="text-2xl">
                                    {profile.companyName || (profile as any).name || 'Taşıyıcı Firma'}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="default">Taşıyıcı</Badge>
                                    {profile.ecoFriendlyDeliveries && profile.ecoFriendlyDeliveries > 0 && (
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            <Leaf className="h-3 w-3 mr-1" />
                                            Çevre Dostu
                                        </Badge>
                                    )}
                                    {reviews && reviews.length > 0 && (
                                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                            <Star className="h-3 w-3 mr-1" />
                                            {averageRating} / 5.0
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
                        {profile.taxNumber && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <IdCard className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Vergi No</p>
                                    <p className="text-sm font-medium">{profile.taxNumber}</p>
                                </div>
                            </div>
                        )}
                        {profile.address && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <MapPin className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Adres</p>
                                    <p className="text-sm font-medium">{profile.address}</p>
                                </div>
                            </div>
                        )}
                    </div>

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

            {/* Reviews Section - Always Show */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Değerlendirmeler ve Yorumlar ({reviews ? reviews.length : 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {reviews && reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                                    {review.reviewerName ? getInitials(review.reviewerName) : 'K'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {review.reviewerName || 'Kullanıcı'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {review.reviewerType}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${
                                                                i < review.rating
                                                                    ? 'text-yellow-500 fill-yellow-500'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {review.rating}/5
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>
                                    {review.comment && (
                                        <p className="text-sm text-gray-700 leading-relaxed pl-13">{review.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                Henüz Değerlendirme Yapılmamış
                            </h3>
                            <p className="text-sm text-gray-500">
                                Bu taşıyıcı için henüz değerlendirme ve yorum bulunmamaktadır.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Vehicles Section */}
            {vehicles && vehicles.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-blue-600" />
                            Araçlar ({vehicles.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {vehicles.map((vehicle) => (
                                <div
                                    key={vehicle.id}
                                    className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 text-center hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Truck className="h-8 w-8 text-blue-600" />
                                        <p className="font-bold text-base text-gray-900">
                                            {vehicle.vehicleType || 'Araç'}
                                        </p>
                                        {vehicle.capacity && (
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <Package className="h-3 w-3" />
                                                <span>{vehicle.capacity} kg</span>
                                            </div>
                                        )}
                                        <Badge
                                            variant={vehicle.isActive ? 'default' : 'secondary'}
                                            className={vehicle.isActive ? 'bg-green-500 text-white mt-1' : 'bg-gray-400 text-white mt-1'}
                                        >
                                            {vehicle.isActive ? 'Aktif' : 'Pasif'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
