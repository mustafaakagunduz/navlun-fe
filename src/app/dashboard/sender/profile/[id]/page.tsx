'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Loader2,
    Building2,
    Phone,
    Mail,
    Award,
    Package,
    Leaf,
    Calendar,
    ArrowLeft,
    TrendingUp,
    CheckCircle2,
    Factory,
    Star,
    MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import senderService, { SenderProfile, SenderStatistics } from '@/services/senderService';
import reviewService, { Review, ReviewStatistics } from '@/services/reviewService';
import { formatDate } from '@/utils/dateUtils';

export default function SenderProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [profile, setProfile] = useState<SenderProfile | null>(null);
    const [statistics, setStatistics] = useState<SenderStatistics | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewStats, setReviewStats] = useState<ReviewStatistics | null>(null);
    const [loading, setLoading] = useState(true);

    const senderId = params.id as string;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const [profileData, statsData, reviewsData, reviewStatsData] = await Promise.all([
                    senderService.getSenderProfileById(senderId),
                    senderService.getSenderStatistics(senderId).catch(() => null),
                    reviewService.getReviewsBySenderId(senderId).catch(() => []),
                    reviewService.getSenderReviewStatistics(senderId).catch(() => null)
                ]);
                setProfile(profileData);
                setStatistics(statsData);
                setReviews(reviewsData);
                setReviewStats(reviewStatsData);
            } catch (error: any) {
                console.error('Error fetching sender profile:', error);
                toast({
                    title: 'Hata',
                    description: error.message || 'Profil yüklenirken bir hata oluştu',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        if (senderId) {
            fetchProfileData();
        }
    }, [senderId, toast]);

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
                        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Profil Bulunamadı</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Aradığınız gönderici profili bulunamadı.
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

    const ecoRatio = profile.totalShipments > 0
        ? ((profile.ecoFriendlyShipments / profile.totalShipments) * 100).toFixed(1)
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
                    <h1 className="text-3xl font-bold text-gray-900">Gönderici Profili</h1>
                    <p className="text-gray-600 mt-1">Detaylı şirket bilgileri ve istatistikler</p>
                </div>
            </div>

            {/* Main Profile Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                                {profile.company ? (
                                    <Building2 className="h-8 w-8 text-blue-600" />
                                ) : (
                                    <Factory className="h-8 w-8 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{profile.companyName}</CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={profile.company ? "default" : "secondary"}>
                                        {profile.company ? "Şirket" : "Bireysel"}
                                    </Badge>
                                    {profile.ecoFriendlyShipments > 0 && (
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

                    {/* Production Types */}
                    {profile.productionTypes && profile.productionTypes.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Factory className="h-4 w-4" />
                                Üretim Tipleri
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.productionTypes.map((type, index) => (
                                    <Badge key={index} variant="outline" className="bg-blue-50">
                                        {type}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certificates */}
                    {profile.certificates && profile.certificates.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                Sertifikalar
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.certificates.map((cert, index) => (
                                    <Badge key={index} variant="outline" className="bg-yellow-50">
                                        <Award className="h-3 w-3 mr-1" />
                                        {cert}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Billing Info */}
                    {profile.billingInfo && (
                        <div className="pt-4 border-t">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Fatura Bilgisi</h3>
                            <p className="text-sm text-gray-600">{profile.billingInfo}</p>
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
                                <p className="text-sm text-gray-600">Toplam Sevkiyat</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">
                                    {profile.totalShipments}
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
                                <p className="text-sm text-gray-600">Çevre Dostu</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">
                                    {profile.ecoFriendlyShipments}
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

                {statistics && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Tamamlanan</p>
                                    <p className="text-3xl font-bold text-purple-600 mt-1">
                                        {statistics.completedShipments}
                                    </p>
                                </div>
                                <CheckCircle2 className="h-10 w-10 text-purple-600 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Additional Statistics */}
            {statistics && (
                <Card className="bg-gradient-to-r from-blue-50 to-green-50">
                    <CardHeader>
                        <CardTitle className="text-lg">Detaylı İstatistikler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">
                                    {statistics.totalWeight.toLocaleString()} kg
                                </p>
                                <p className="text-sm text-gray-600">Toplam Ağırlık</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {statistics.averageShipmentWeight.toFixed(0)} kg
                                </p>
                                <p className="text-sm text-gray-600">Ortalama Ağırlık</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-orange-600">
                                    {statistics.pendingShipments}
                                </p>
                                <p className="text-sm text-gray-600">Bekleyen</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">
                                    {statistics.ecoFriendlyRatio.toFixed(1)}%
                                </p>
                                <p className="text-sm text-gray-600">Çevreci Oranı</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reviews Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            Değerlendirmeler
                        </CardTitle>
                        {reviewStats && (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                    <span className="text-2xl font-bold">{reviewStats.averageRating.toFixed(1)}</span>
                                    <span className="text-sm text-gray-600">/ 5.0</span>
                                </div>
                                <Badge variant="outline">
                                    {reviewStats.totalReviews} değerlendirme
                                </Badge>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {reviewStats && reviewStats.totalReviews > 0 && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Puan Dağılımı</h4>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => {
                                    const count = reviewStats.ratingDistribution[rating] || 0;
                                    const percentage = reviewStats.totalReviews > 0
                                        ? (count / reviewStats.totalReviews) * 100
                                        : 0;
                                    return (
                                        <div key={rating} className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 w-16">
                                                <span className="text-sm font-medium">{rating}</span>
                                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                            </div>
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-500 transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!reviews || reviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-gray-600">Henüz değerlendirme yapılmamış</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {review.reviewerName || 'Taşıyıcı'}
                                                </p>
                                                <div className="flex items-center gap-1">
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
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>
                                    {review.comment && (
                                        <p className="text-sm text-gray-700 ml-12 mt-2">{review.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
