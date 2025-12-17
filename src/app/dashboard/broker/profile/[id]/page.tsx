'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    Loader2,
    Building2,
    Phone,
    Mail,
    Award,
    Briefcase,
    Leaf,
    Calendar,
    ArrowLeft,
    TrendingUp,
    DollarSign,
    Users,
    CheckCircle2,
    Star,
    MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import brokerService, { BrokerProfile } from '@/services/brokerService';
import reviewService, { Review, ReviewStatistics } from '@/services/reviewService';
import { formatDate } from '@/utils/dateUtils';

export default function BrokerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [profile, setProfile] = useState<BrokerProfile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
    const [loading, setLoading] = useState(true);

    const brokerId = params.id as string;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);

                // Profil bilgilerini çek
                const profileData = await brokerService.getBrokerProfileById(brokerId);
                setProfile(profileData);

                // Değerlendirmeleri ve istatistikleri çek (userId kullan!)
                try {
                    const reviewsData = await reviewService.getReviewsForUser(profileData.userId);
                    console.log('Reviews for broker:', reviewsData);
                    setReviews(reviewsData);

                    const statsData = await reviewService.getUserStatistics(profileData.userId);
                    setStatistics(statsData);
                } catch (reviewError) {
                    console.error('Error fetching reviews:', reviewError);
                    // Review hatası profil yüklemeyi engellemez
                }
            } catch (error: any) {
                console.error('Error fetching broker profile:', error);
                toast({
                    title: 'Hata',
                    description: error.message || 'Profil yüklenirken bir hata oluştu',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        if (brokerId) {
            fetchProfileData();
        }
    }, [brokerId, toast]);

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
                            Aradığınız broker profili bulunamadı.
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

    const ecoRatio = profile.facilitatedDeals > 0
        ? ((profile.ecoFriendlyDeals / profile.facilitatedDeals) * 100).toFixed(1)
        : '0';

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
                    <h1 className="text-3xl font-bold text-gray-900">Broker Profili</h1>
                    <p className="text-gray-600 mt-1">Detaylı şirket bilgileri ve istatistikler</p>
                </div>
            </div>

            {/* Main Profile Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                                <Briefcase className="h-8 w-8 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{profile.companyName}</CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={profile.company ? "default" : "secondary"}>
                                        {profile.company ? "Şirket" : "Bireysel"}
                                    </Badge>
                                    {profile.ecoFriendlyCertified && (
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            <Leaf className="h-3 w-3 mr-1" />
                                            Çevreci Sertifikalı
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* License & Tax Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.licenseNumber && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Award className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Lisans Numarası</p>
                                    <p className="text-sm font-medium">{profile.licenseNumber}</p>
                                </div>
                            </div>
                        )}
                        {profile.taxNumber && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Building2 className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Vergi Numarası</p>
                                    <p className="text-sm font-medium">{profile.taxNumber}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Specializations */}
                    {profile.specializations && profile.specializations.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Uzmanlık Alanları
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.specializations.map((spec, index) => (
                                    <Badge key={index} variant="outline" className="bg-purple-50">
                                        {spec}
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

                    {/* Commission Rate */}
                    {profile.commissionRate && (
                        <div className="pt-4 border-t">
                            <div className="flex items-center gap-3">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Komisyon Oranı</p>
                                    <p className="text-lg font-semibold text-green-600">
                                        %{profile.commissionRate}
                                    </p>
                                </div>
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
                                <p className="text-sm text-gray-600">Toplam Anlaşma</p>
                                <p className="text-3xl font-bold text-purple-600 mt-1">
                                    {profile.facilitatedDeals}
                                </p>
                            </div>
                            <Briefcase className="h-10 w-10 text-purple-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Çevre Dostu</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">
                                    {profile.ecoFriendlyDeals}
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

                {profile.totalCommissionEarned && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Toplam Komisyon</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-1">
                                        {profile.totalCommissionEarned}
                                    </p>
                                </div>
                                <DollarSign className="h-10 w-10 text-blue-600 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Reviews Section */}
            <Card>
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-white">
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Değerlendirmeler
                    </CardTitle>
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
                                Bu broker için henüz değerlendirme yapılmamış.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Additional Info */}
            {(profile.ecoFriendlyDealPercentage || profile.companyRegistrationNumber) && (
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardHeader>
                        <CardTitle className="text-lg">Ek Bilgiler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profile.ecoFriendlyDealPercentage && (
                                <div className="text-center p-4 bg-white rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">
                                        {profile.ecoFriendlyDealPercentage.toFixed(1)}%
                                    </p>
                                    <p className="text-sm text-gray-600">Çevreci Anlaşma Oranı</p>
                                </div>
                            )}
                            {profile.companyRegistrationNumber && (
                                <div className="text-center p-4 bg-white rounded-lg">
                                    <p className="text-lg font-semibold text-purple-600">
                                        {profile.companyRegistrationNumber}
                                    </p>
                                    <p className="text-sm text-gray-600">Şirket Sicil No</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
