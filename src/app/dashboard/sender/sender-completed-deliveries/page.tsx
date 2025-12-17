"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Loader2,
    CheckCircle,
    Package,
    Calendar,
    MapPin,
    Weight,
    ArrowLeft,
    Search,
    TruckIcon,
    FileText,
    Download,
    DollarSign,
    User,
    Briefcase,
    Star,
    AlertCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import loadService, { Load } from "@/services/loadService";
import LoadDetailsDialog from "@/app/dashboard/sender/loads/LoadDetailsDialog";
import { formatDate as formatDateUtil, formatDateTime } from '@/utils/dateUtils';
import paymentService, { PaymentMethod } from "@/services/paymentService";
import { useToast } from "@/hooks/use-toast";
import offerService from "@/services/offerService";
import brokerService, { OfferStatus } from "@/services/brokerService";
import carrierService from "@/services/carrierService";
import reviewService, { Review, ReviewRequest, UserType } from "@/services/reviewService";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function CompletedDeliveriesPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const { toast } = useToast();
    const [completedDeliveries, setCompletedDeliveries] = useState<Load[]>([]);
    const [filteredDeliveries, setFilteredDeliveries] = useState<Load[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);
    const [paymentDescription, setPaymentDescription] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    // Review states
    const [reviewsMap, setReviewsMap] = useState<Map<string, Review | null>>(new Map());
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Giriş yapmamış veya sender olmayan kullanıcıları yönlendir
    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'SENDER')) {
            router.push('/dashboard');
        }
    }, [authLoading, isAuthenticated, user, router]);

    // Fetch completed deliveries
    useEffect(() => {
        const fetchCompletedDeliveries = async () => {
            if (!user?.id) return;

            setIsDataLoading(true);
            setError(null);

            try {
                const deliveries = await loadService.getCurrentUserCompletedDeliveries();
                console.log('Completed Deliveries:', deliveries); // Debug: Load nesnesini kontrol et

                // Her delivery için accepted offer'ı çek ve carrier/broker bilgisini ekle
                const deliveriesWithCarriers = await Promise.all(
                    deliveries.map(async (delivery) => {
                        try {
                            // Carrier offer'ları çek
                            const offers = await offerService.getOffersByLoad(delivery.id);
                            console.log(`Load ${delivery.id} - All offers:`, offers);
                            const acceptedOffer = offers.find(offer => offer.status === 'ACCEPTED');
                            console.log(`Load ${delivery.id} - Accepted offer:`, acceptedOffer);

                            // Broker offer'ları çek
                            const brokerOffers = await brokerService.getCurrentSenderReceivedBrokerOffers(
                                delivery.id,
                                OfferStatus.ACCEPTED
                            );
                            const acceptedBrokerOffer = brokerOffers.length > 0 ? brokerOffers[0] : null;

                            const result = {
                                ...delivery,
                                carrier: acceptedOffer?.carrierId ? {
                                    id: acceptedOffer.carrierId,
                                    companyName: (acceptedOffer as any).carrierName || 'Carrier',
                                    userId: ''
                                } : undefined,
                                carrierId: acceptedOffer?.carrierId,
                                broker: acceptedBrokerOffer?.brokerName ? {
                                    id: acceptedBrokerOffer.brokerProfileId || '',
                                    companyName: acceptedBrokerOffer.brokerName,
                                    userId: ''
                                } : undefined,
                                brokerId: acceptedBrokerOffer?.brokerProfileId
                            };

                            console.log(`Load ${delivery.id} - Result with carrier/broker:`, result);
                            return result;
                        } catch (error) {
                            console.error(`Error fetching offers for load ${delivery.id}:`, error);
                            return delivery;
                        }
                    })
                );

                console.log('Deliveries with carriers:', deliveriesWithCarriers);
                setCompletedDeliveries(deliveriesWithCarriers);
                setFilteredDeliveries(deliveriesWithCarriers);

                // Fetch reviews for each delivery
                const reviewsData = new Map<string, Review | null>();
                await Promise.all(
                    deliveriesWithCarriers.map(async (delivery) => {
                        try {
                            const reviews = await reviewService.getReviewsForLoad(delivery.id);
                            console.log(`Reviews for load ${delivery.id}:`, reviews);

                            // Find the review made by the current sender (reviewerId = current user)
                            const senderReview = reviews.find(r => r.reviewerId === user.id);

                            if (senderReview) {
                                console.log(`✓ Review was made by current sender (${user.id})`);
                                reviewsData.set(delivery.id, senderReview);
                            } else {
                                console.log(`✗ No review found by current sender (${user.id})`);
                                reviewsData.set(delivery.id, null);
                            }
                        } catch (error) {
                            console.error(`Error fetching review for load ${delivery.id}:`, error);
                            reviewsData.set(delivery.id, null);
                        }
                    })
                );
                console.log('All reviews map:', reviewsData);
                setReviewsMap(reviewsData);
            } catch (err: any) {
                console.error('Error fetching completed deliveries:', err);
                setError('Tamamlanmış teslimatlar yüklenirken hata oluştu');
                setCompletedDeliveries([]);
                setFilteredDeliveries([]);
            } finally {
                setIsDataLoading(false);
            }
        };

        if (user?.id) {
            fetchCompletedDeliveries();
        }
    }, [user?.id]);

    // Filter deliveries based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredDeliveries(completedDeliveries);
            return;
        }

        const filtered = completedDeliveries.filter(delivery =>
            delivery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.goodsType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.loadingAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredDeliveries(filtered);
    }, [searchTerm, completedDeliveries]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'Teslim Edildi';
            case 'COMPLETED': return 'Tamamlandı';
            default: return status;
        }
    };

    // formatDate artık dateUtils'den geliyor
    const formatDate = (dateString: string) => {
        return formatDateUtil(dateString);
    };

    const handleLoadClick = (load: Load) => {
        setSelectedLoad(load);
        setShowDetailsDialog(true);
    };

    const handleCloseDialog = () => {
        setShowDetailsDialog(false);
        setSelectedLoad(null);
    };

    const handleOpenPaymentDialog = (load: Load) => {
        setSelectedLoad(load);
        setPaymentAmount('');
        setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        setPaymentDescription(`${load.title} teslim ödemes i`);
        setShowPaymentDialog(true);
    };

    const handleClosePaymentDialog = () => {
        setShowPaymentDialog(false);
        setSelectedLoad(null);
        setPaymentAmount('');
        setPaymentDescription('');
    };

    const handleSubmitPayment = async () => {
        if (!selectedLoad) return;

        const amount = parseFloat(paymentAmount);
        if (!amount || amount <= 0) {
            toast({
                title: "Hata",
                description: "Geçerli bir ödeme tutarı girin",
                variant: "destructive",
            });
            return;
        }

        if (!selectedLoad.senderId) {
            toast({
                title: "Hata",
                description: "Gönderici bilgisi bulunamadı",
                variant: "destructive",
            });
            return;
        }

        setIsSubmittingPayment(true);
        try {
            await paymentService.createPaymentForLoad(selectedLoad.id, {
                amount,
                paymentMethod,
                description: paymentDescription,
                loadId: selectedLoad.id,
                senderId: selectedLoad.senderId,
            });

            toast({
                title: "Başarılı",
                description: "Ödeme başarıyla kaydedildi",
            });

            handleClosePaymentDialog();
        } catch (error: any) {
            console.error('Payment creation error:', error);
            toast({
                title: "Hata",
                description: error.response?.data?.message || "Ödeme kaydedilirken hata oluştu",
                variant: "destructive",
            });
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    // Review dialog handlers
    const handleOpenReviewDialog = (load: Load) => {
        setSelectedLoad(load);
        setReviewRating(0);
        setReviewComment('');
        setShowReviewDialog(true);
    };

    const handleCloseReviewDialog = () => {
        setShowReviewDialog(false);
        setSelectedLoad(null);
        setReviewRating(0);
        setReviewComment('');
    };

    const handleSubmitReview = async () => {
        if (!selectedLoad || !user?.id) return;

        if (reviewRating === 0) {
            toast({
                title: "Hata",
                description: "Lütfen bir puan seçin (1-5 yıldız)",
                variant: "destructive",
            });
            return;
        }

        if (!reviewComment || reviewComment.trim().length < 10) {
            toast({
                title: "Hata",
                description: "Yorum en az 10 karakter olmalıdır",
                variant: "destructive",
            });
            return;
        }

        if (reviewComment.length > 500) {
            toast({
                title: "Hata",
                description: "Yorum en fazla 500 karakter olmalıdır",
                variant: "destructive",
            });
            return;
        }

        const carrierProfileId = (selectedLoad as any).carrierId;
        if (!carrierProfileId) {
            toast({
                title: "Hata",
                description: "Taşıyıcı bilgisi bulunamadı",
                variant: "destructive",
            });
            return;
        }

        setIsSubmittingReview(true);
        try {
            // Carrier profile'dan userId'yi al
            const carrierProfile = await carrierService.getCarrierProfileById(carrierProfileId);

            const reviewData: ReviewRequest = {
                reviewedUserId: carrierProfile.userId,  // <- USER ID kullan!
                reviewedUserType: UserType.CARRIER,
                loadId: selectedLoad.id,
                rating: reviewRating,
                comment: reviewComment.trim(),
            };

            console.log('Sending review data:', reviewData);
            const newReview = await reviewService.createReview(reviewData);
            console.log('Review created successfully:', newReview);

            // Update reviews map
            const updatedReviewsMap = new Map(reviewsMap);
            updatedReviewsMap.set(selectedLoad.id, newReview);
            setReviewsMap(updatedReviewsMap);

            toast({
                title: "Başarılı",
                description: "Değerlendirme başarıyla kaydedildi",
            });

            handleCloseReviewDialog();
        } catch (error: any) {
            console.error('Review creation error:', error);
            toast({
                title: "Hata",
                description: error.response?.data?.message || "Değerlendirme kaydedilirken hata oluştu",
                variant: "destructive",
            });
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // Yükleme durumunda gösterilecek içerik
    if (authLoading || isDataLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                    <p className="text-green-600 font-medium">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['SENDER']}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/dashboard/sender')}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Geri Dön
                        </Button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                    Tamamlanmış Teslimatlar
                                </h1>
                                <p className="text-gray-600 mt-2 text-lg">
                                    Başarıyla tamamlanan tüm teslimatlarınız
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-white rounded-lg px-6 py-4 shadow-md border border-green-200">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Toplam Teslimat</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {completedDeliveries.length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="text"
                                placeholder="Teslimat ara (başlık, mal türü, adres...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-6 text-lg border-gray-200 focus:border-green-500"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <Card className="mb-6 border-red-200 bg-red-50">
                            <CardContent className="p-6">
                                <p className="text-red-600">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Deliveries List */}
                    {filteredDeliveries.length === 0 ? (
                        <Card className="border-gray-200 shadow-lg">
                            <CardContent className="p-12 text-center">
                                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-xl text-gray-600 mb-2">
                                    {searchTerm ? 'Arama kriterlerine uygun teslimat bulunamadı' : 'Henüz tamamlanmış teslimat bulunmuyor'}
                                </p>
                                <p className="text-gray-500">
                                    {searchTerm ? 'Farklı bir arama terimi deneyin' : 'Teslimatlarınız tamamlandığında burada görünecektir'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredDeliveries.map((delivery) => (
                                <Card
                                    key={delivery.id}
                                    className="border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
                                    onClick={() => handleLoadClick(delivery)}
                                >
                                    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                                    <CardTitle className="text-xl font-bold text-gray-900">
                                                        {delivery.title}
                                                    </CardTitle>
                                                </div>
                                                <p className="text-gray-600">{delivery.goodsType}</p>
                                            </div>
                                            <Badge className={`${getStatusColor(delivery.status)} px-4 py-2 text-sm font-semibold`}>
                                                {getStatusText(delivery.status)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Route Information */}
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Yükleme</p>
                                                        <p className="text-gray-900 font-medium">{delivery.loadingAddress}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Teslimat</p>
                                                        <p className="text-gray-900 font-medium">{delivery.deliveryAddress}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Date Information */}
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Yükleme Tarihi</p>
                                                        <p className="text-gray-900 font-medium">{formatDate(delivery.loadingDate)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="h-5 w-5 text-green-600 mt-1" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Teslimat Tarihi</p>
                                                        <p className="text-gray-900 font-medium">{formatDate(delivery.deliveryDate)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Weight and Transport Type */}
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <Weight className="h-5 w-5 text-purple-600 mt-1" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Net Ağırlık</p>
                                                        <p className="text-gray-900 font-medium">{delivery.netWeight} kg</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <TruckIcon className="h-5 w-5 text-orange-600 mt-1" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Taşıma Türü</p>
                                                        <p className="text-gray-900 font-medium">
                                                            {delivery.transportType === 'SEA' ? 'Deniz' : 'Kara'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {delivery.description && (
                                            <div className="mt-6 pt-6 border-t border-gray-100">
                                                <div className="flex items-start gap-3">
                                                    <FileText className="h-5 w-5 text-gray-600 mt-1" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500 mb-1">Açıklama</p>
                                                        <p className="text-gray-700">{delivery.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Carrier and Broker Info with Review */}
                                        {(delivery.carrier || delivery.broker) && (
                                            <div className="mt-6 pt-6 border-t border-gray-100">
                                                <div className="grid grid-cols-1 gap-4">
                                                    {delivery.carrier && (
                                                        <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <TruckIcon className="h-6 w-6 text-blue-600" />
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-blue-600 uppercase">Taşıyıcı</p>
                                                                        <p className="text-lg font-bold text-gray-900">
                                                                            {delivery.carrier.companyName}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    size="default"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        router.push(`/dashboard/carrier/profile/${delivery.carrier?.id}`);
                                                                    }}
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                                >
                                                                    <User className="h-4 w-4 mr-2" />
                                                                    Profil Git
                                                                </Button>
                                                            </div>
                                                            {/* Review Status */}
                                                            {!reviewsMap.get(delivery.id) ? (
                                                                <div className="mt-2 flex items-center gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleOpenReviewDialog(delivery);
                                                                        }}
                                                                        className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400"
                                                                    >
                                                                        <AlertCircle className="h-4 w-4 mr-2 text-red-600 animate-pulse" />
                                                                        <Star className="h-4 w-4 mr-1" />
                                                                        Taşıyıcıyı Değerlendir (Zorunlu)
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="mt-2 flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    <span className="text-sm font-medium">
                                                                        Değerlendirme yapıldı ({reviewsMap.get(delivery.id)?.rating}/5 ⭐)
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {delivery.broker && (
                                                        <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Briefcase className="h-6 w-6 text-purple-600" />
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-purple-600 uppercase">Broker</p>
                                                                        <p className="text-lg font-bold text-gray-900">
                                                                            {delivery.broker.companyName}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    size="default"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        router.push(`/dashboard/broker/profile/${delivery.broker?.id}`);
                                                                    }}
                                                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                                                >
                                                                    <User className="h-4 w-4 mr-2" />
                                                                    Profil Git
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer with Action Buttons */}
                                        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="h-4 w-4" />
                                                <span>Oluşturulma: {formatDate(delivery.createdAt)}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenPaymentDialog(delivery);
                                                    }}
                                                >
                                                    <DollarSign className="h-4 w-4 mr-2" />
                                                    Ödeme Yap
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="border-green-600 text-green-600 hover:bg-green-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLoadClick(delivery);
                                                    }}
                                                >
                                                    Detayları Görüntüle
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Summary Stats at Bottom */}
                    {filteredDeliveries.length > 0 && (
                        <Card className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 text-white border-none">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {filteredDeliveries.length}
                                        </p>
                                        <p className="text-green-100">Toplam Teslimat</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {(filteredDeliveries.reduce((sum, d) => sum + d.netWeight, 0) / 1000).toFixed(1)} ton
                                        </p>
                                        <p className="text-green-100">Toplam Ağırlık</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {filteredDeliveries.filter(d => d.transportType === 'SEA').length}
                                        </p>
                                        <p className="text-green-100">Deniz Taşımacılığı</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {filteredDeliveries.filter(d => d.transportType === 'LAND').length}
                                        </p>
                                        <p className="text-green-100">Kara Taşımacılığı</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Load Details Dialog */}
                    <LoadDetailsDialog
                        load={selectedLoad}
                        isOpen={showDetailsDialog}
                        onClose={handleCloseDialog}
                    />

                    {/* Payment Dialog */}
                    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Ödeme Kaydı Oluştur</DialogTitle>
                                <DialogDescription>
                                    {selectedLoad && (
                                        <>Teslimat: <span className="font-semibold">{selectedLoad.title}</span></>
                                    )}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Ödeme Tutarı (TL) *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="Örn: 15000"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="paymentMethod">Ödeme Yöntemi *</Label>
                                    <Select
                                        value={paymentMethod}
                                        onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Ödeme yöntemi seçin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={PaymentMethod.BANK_TRANSFER}>Banka Havalesi</SelectItem>
                                            <SelectItem value={PaymentMethod.CREDIT_CARD}>Kredi Kartı</SelectItem>
                                            <SelectItem value={PaymentMethod.DEBIT_CARD}>Banka Kartı</SelectItem>
                                            <SelectItem value={PaymentMethod.CASH}>Nakit</SelectItem>
                                            <SelectItem value={PaymentMethod.OTHER}>Diğer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Açıklama</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Ödeme ile ilgili not ekleyin..."
                                        value={paymentDescription}
                                        onChange={(e) => setPaymentDescription(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={handleClosePaymentDialog}
                                    disabled={isSubmittingPayment}
                                >
                                    İptal
                                </Button>
                                <Button
                                    onClick={handleSubmitPayment}
                                    disabled={isSubmittingPayment || !paymentAmount}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isSubmittingPayment ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Ödemeyi Kaydet
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Review Dialog */}
                    <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Taşıyıcıyı Değerlendir</DialogTitle>
                                <DialogDescription asChild>
                                    <div>
                                        {selectedLoad && (
                                            <>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <TruckIcon className="h-4 w-4 text-blue-600" />
                                                    <span className="font-semibold">{(selectedLoad as any).carrier?.companyName}</span>
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Teslimat: {selectedLoad.title}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Puan (1-5 Yıldız) *</Label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewRating(star)}
                                                className={`text-3xl transition-all ${
                                                    star <= reviewRating
                                                        ? 'text-yellow-400 scale-110'
                                                        : 'text-gray-300 hover:text-yellow-200'
                                                }`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    {reviewRating > 0 && (
                                        <p className="text-sm text-gray-600">
                                            Seçilen puan: <span className="font-semibold">{reviewRating}/5</span>
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="reviewComment">Yorumunuz (Zorunlu - Min 10, Maks 500 karakter) *</Label>
                                    <Textarea
                                        id="reviewComment"
                                        placeholder="Taşıyıcı hakkında yorumunuzu yazın... (En az 10 karakter)"
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        rows={4}
                                        maxLength={500}
                                    />
                                    <div className="flex justify-between text-xs">
                                        <span className={reviewComment.length < 10 ? 'text-red-600' : 'text-green-600'}>
                                            {reviewComment.length < 10
                                                ? `En az ${10 - reviewComment.length} karakter daha gerekli`
                                                : '✓ Yeterli karakter'}
                                        </span>
                                        <span className="text-gray-500">
                                            {reviewComment.length}/500
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-semibold">Değerlendirme Zorunludur</p>
                                        <p className="text-xs mt-1">
                                            Teslimat tamamlandıktan sonra taşıyıcıyı değerlendirmeniz gerekmektedir.
                                            Bu, platformumuzun kalitesini korumamıza yardımcı olur.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={handleCloseReviewDialog}
                                    disabled={isSubmittingReview}
                                >
                                    İptal
                                </Button>
                                <Button
                                    onClick={handleSubmitReview}
                                    disabled={isSubmittingReview || reviewRating === 0}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmittingReview ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <Star className="h-4 w-4 mr-2" />
                                            Değerlendirmeyi Kaydet
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </ProtectedRoute>
    );
}
