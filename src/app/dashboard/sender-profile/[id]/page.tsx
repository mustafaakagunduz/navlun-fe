// src/app/dashboard/sender-profile/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
    Loader2,
    Building2,
    User,
    Mail,
    Phone,
    Package,
    Award,
    Leaf,
    Star,
    ArrowLeft,
    TrendingUp,
    Calendar,
    Factory,
    CheckCircle2,
    BarChart3,
    MessageSquare,
    ShieldCheck
} from 'lucide-react';
import senderService, { SenderProfile } from '@/services/senderService';
import reviewService, { Review, ReviewStatistics } from '@/services/reviewService';
import { formatDate } from '@/utils/dateUtils';

export default function SenderProfileViewPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const senderId = params.id as string;

    const [profile, setProfile] = useState<SenderProfile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (senderId) {
            fetchProfileData();
        }
    }, [senderId]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);

            // Profil bilgilerini çek
            const profileData = await senderService.getSenderProfileById(senderId);
            setProfile(profileData);

            // Değerlendirmeleri çek (varsa)
            try {
                const reviewsData = await reviewService.getReviewsBySenderId(senderId);
                setReviews(reviewsData);

                const statsData = await reviewService.getSenderReviewStatistics(senderId);
                setStatistics(statsData);
            } catch (error) {
                // Review sistemi henüz backend'de yoksa hata gösterme
                console.log('Reviews not available yet');
            }

        } catch (error: any) {
            toast({
                title: 'Hata',
                description: error.response?.data?.message || 'Profil bilgileri yüklenirken bir hata oluştu.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Profil yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <Card className="max-w-md w-full shadow-lg">
                    <CardContent className="p-12 text-center">
                        <div className="h-20 w-20 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                            <Building2 className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Profil Bulunamadı
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Aradığınız gönderici profili bulunamadı.
                        </p>
                        <Button onClick={() => router.back()} className="w-full">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Geri Dön
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const ecoRatio = profile.totalShipments > 0
        ? (profile.ecoFriendlyShipments / profile.totalShipments * 100).toFixed(1)
        : '0';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="hover:bg-white"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Geri
                    </Button>
                </div>

                {/* Profile Header Card */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <Avatar className="h-24 w-24 border-4 border-white/20 shadow-lg">
                                <AvatarFallback className="bg-white/10 text-white text-2xl font-bold backdrop-blur-sm">
                                    {getInitials(profile.companyName)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-3xl md:text-4xl font-bold">
                                        {profile.companyName}
                                    </h1>
                                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                        {profile.company ? (
                                            <>
                                                <Building2 className="h-3 w-3 mr-1" />
                                                Şirket
                                            </>
                                        ) : (
                                            <>
                                                <User className="h-3 w-3 mr-1" />
                                                Bireysel
                                            </>
                                        )}
                                    </Badge>
                                    {parseFloat(ecoRatio) >= 50 && (
                                        <Badge className="bg-green-500/90 text-white border-0 backdrop-blur-sm">
                                            <Leaf className="h-3 w-3 mr-1" />
                                            Çevre Dostu
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-4 text-white/90">
                                    {profile.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            <span className="text-sm">{profile.email}</span>
                                        </div>
                                    )}
                                    {profile.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            <span className="text-sm">{profile.phone}</span>
                                        </div>
                                    )}
                                    {profile.createdAt && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span className="text-sm">Üyelik: {formatDate(profile.createdAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-3">
                                <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                    <div className="text-2xl font-bold">{profile.totalShipments}</div>
                                    <div className="text-xs text-white/80">Toplam Sevkiyat</div>
                                </div>
                                <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                    <div className="text-2xl font-bold text-green-200">{profile.ecoFriendlyShipments}</div>
                                    <div className="text-xs text-white/80">Çevreci</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Company Details */}
                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                                <CardTitle className="flex items-center gap-2">
                                    <Factory className="h-5 w-5 text-blue-600" />
                                    Şirket Detayları
                                </CardTitle>
                                <CardDescription>Gönderici hakkında detaylı bilgiler</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Production Types */}
                                {profile.productionTypes && profile.productionTypes.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Package className="h-4 w-4 text-gray-600" />
                                            <h4 className="font-semibold text-gray-900">Üretim Türleri</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.productionTypes.map((type, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                                                >
                                                    {type}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Certificates */}
                                {profile.certificates && profile.certificates.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Award className="h-4 w-4 text-green-600" />
                                            <h4 className="font-semibold text-gray-900">Sertifikalar ve Belgeler</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {profile.certificates.map((cert, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200"
                                                >
                                                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                    <span className="text-sm text-green-900 font-medium">{cert}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Billing Info */}
                                {profile.billingInfo && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <ShieldCheck className="h-4 w-4 text-gray-600" />
                                            <h4 className="font-semibold text-gray-900">Fatura Bilgisi</h4>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-700">{profile.billingInfo}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Reviews Section */}
                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-gradient-to-r from-yellow-50 to-white">
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    Değerlendirmeler
                                </CardTitle>
                                <CardDescription>Diğer kullanıcıların görüşleri</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {statistics && statistics.totalReviews > 0 ? (
                                    <div className="space-y-6">
                                        {/* Overall Rating */}
                                        <div className="grid md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                                            <div className="text-center md:border-r border-yellow-200">
                                                <div className="text-5xl font-bold text-gray-900 mb-2">
                                                    {statistics.averageRating.toFixed(1)}
                                                </div>
                                                <div className="flex justify-center mb-2">
                                                    {renderStars(Math.round(statistics.averageRating))}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <MessageSquare className="h-4 w-4 inline mr-1" />
                                                    {statistics.totalReviews} değerlendirme
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {[5, 4, 3, 2, 1].map((rating) => {
                                                    const count = statistics.ratingDistribution[rating] || 0;
                                                    const percentage = statistics.totalReviews > 0
                                                        ? (count / statistics.totalReviews * 100)
                                                        : 0;
                                                    return (
                                                        <div key={rating} className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-700 w-8">{rating}★</span>
                                                            <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border border-yellow-200">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm text-gray-600 w-10 text-right">{count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Individual Reviews */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-gray-900">Son Değerlendirmeler</h4>
                                            {reviews.slice(0, 5).map((review) => (
                                                <div key={review.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                                                    {review.carrierName ? getInitials(review.carrierName) : 'T'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {review.carrierName || 'Taşıyıcı'}
                                                                </div>
                                                                {renderStars(review.rating)}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(review.createdAt)}
                                                        </span>
                                                    </div>
                                                    {review.comment && (
                                                        <p className="text-sm text-gray-700 leading-relaxed pl-13">
                                                            {review.comment}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="h-20 w-20 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                                            <Star className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Değerlendirme Yok</h3>
                                        <p className="text-gray-600">
                                            Bu gönderici için henüz değerlendirme yapılmamış.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Stats Sidebar */}
                    <div className="space-y-6">
                        {/* Statistics Card */}
                        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                    İstatistikler
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-600">Toplam Sevkiyat</span>
                                        <Package className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {profile.totalShipments}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">adet yük taşındı</div>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-green-900">Çevreci Sevkiyat</span>
                                        <Leaf className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-green-700">
                                        {profile.ecoFriendlyShipments}
                                    </div>
                                    <div className="mt-2 p-2 bg-white/60 rounded text-center">
                                        <div className="text-lg font-semibold text-green-700">%{ecoRatio}</div>
                                        <div className="text-xs text-green-600">çevreci oran</div>
                                    </div>
                                </div>

                                {statistics && statistics.totalReviews > 0 && (
                                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-yellow-900">Ortalama Puan</span>
                                            <Star className="h-5 w-5 text-yellow-500" />
                                        </div>
                                        <div className="text-3xl font-bold text-yellow-700">
                                            {statistics.averageRating.toFixed(1)}
                                        </div>
                                        <div className="flex justify-center my-2">
                                            {renderStars(Math.round(statistics.averageRating))}
                                        </div>
                                        <div className="text-xs text-yellow-600 text-center">
                                            {statistics.totalReviews} değerlendirme
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Eco Achievement Badge */}
                        {parseFloat(ecoRatio) >= 50 && (
                            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden">
                                <CardContent className="p-6 text-center relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                                    <div className="relative z-10">
                                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm mb-4 border-2 border-white/30">
                                            <Award className="h-10 w-10" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">
                                            Çevre Dostu Lider
                                        </h3>
                                        <p className="text-sm text-white/90 leading-relaxed">
                                            Sevkiyatların <span className="font-bold text-lg">%{ecoRatio}</span>'i çevre dostu
                                            taşıma yöntemleri kullanıyor. Doğaya katkınız için teşekkürler!
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
