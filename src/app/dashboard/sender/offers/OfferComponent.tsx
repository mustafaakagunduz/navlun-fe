'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
    Loader2,
    Package,
    MapPin,
    Calendar,
    Weight,
    Shield,
    Leaf,
    TruckIcon,
    CheckCircle,
    XCircle,
    Clock,

} from 'lucide-react';
import loadService, { LoadWithOffers, OfferWithVehicleInfo } from '@/services/loadService';
import offerService from '@/services/offerService';
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchLoadsWithOffers, acceptOffer, rejectOffer, setSelectedOffer } from '@/store/slices/offersSlice'
import {decrementOfferCount, updateOfferCount} from "@/store/slices/notificationsSlice";

export default function SenderOffersPage() {

    const dispatch = useAppDispatch()
    const {
        loadsWithOffers,
        loadsWithOffersLoading,
        selectedOffer,
        offerSubmitting
    } = useAppSelector(state => state.offers)

    const [selectedLoad, setSelectedLoad] = useState<LoadWithOffers | null>(null);
    const [isOfferDetailModalOpen, setIsOfferDetailModalOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'eco'>('all');

    const { toast } = useToast();

    useEffect(() => {
        dispatch(fetchLoadsWithOffers()).then(() => {
            // Notification count'u hesapla ve güncelle
            const totalPendingOffers = loadsWithOffers.reduce(
                (total, loadWithOffers) => total + loadWithOffers.pendingOffersCount,
                0
            );
            dispatch(updateOfferCount(totalPendingOffers));
        });
    }, [dispatch]);

    const handleAcceptOffer = async (offerId: string) => {
        try {
            await dispatch(acceptOffer(offerId)).unwrap()
            dispatch(decrementOfferCount()); // Notification count'u azalt

            toast({
                title: 'Başarılı!',
                description: 'Teklif başarıyla kabul edildi.',
                variant: 'default',
            });

            setIsOfferDetailModalOpen(false);
        } catch (error: any) {
            toast({
                title: 'Hata',
                description: error || 'Teklif kabul edilirken bir hata oluştu.',
                variant: 'destructive',
            });
        }
    };

    const handleRejectOffer = async (offerId: string) => {
        try {
            await dispatch(rejectOffer(offerId)).unwrap()
            dispatch(decrementOfferCount()); // Notification count'u azalt

            toast({
                title: 'Başarılı!',
                description: 'Teklif reddedildi.',
                variant: 'default',
            });

            setIsOfferDetailModalOpen(false);
        } catch (error: any) {
            toast({
                title: 'Hata',
                description: error || 'Teklif reddedilirken bir hata oluştu.',
                variant: 'destructive',
            });
        }
    };

    const openOfferDetail = (offer: OfferWithVehicleInfo, load: LoadWithOffers) => {
        dispatch(setSelectedOffer(offer));
        setSelectedLoad(load);
        setIsOfferDetailModalOpen(true);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'ACCEPTED':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'REJECTED':
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Bekliyor';
            case 'ACCEPTED':
                return 'Kabul Edildi';
            case 'REJECTED':
                return 'Reddedildi';
            default:
                return status;
        }
    };

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'PENDING':
                return 'default';
            case 'ACCEPTED':
                return 'secondary';
            case 'REJECTED':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('tr-TR');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    };

    const filteredLoads = loadsWithOffers.filter(loadWithOffers => {
        if (filter === 'pending') {
            return loadWithOffers.offers.some(offer => offer.status === 'PENDING');
        }
        if (filter === 'eco') {
            return loadWithOffers.offers.some(offer => offer.vehicleEcoCertified || offer.isEcoFriendly);
        }
        return true;
    });

    if (loadsWithOffersLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Teklifler yükleniyor...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Gelen Teklifler</h1>
                <p className="text-muted-foreground">
                    Yükleriniz için gelen teklifler aşağıda listelenmiştir.
                </p>
            </div>

            {/* Filtre Butonları */}
            <div className="flex space-x-2 mb-6">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                >
                    Tümü
                </Button>
                <Button
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setFilter('pending')}
                >
                    Bekleyen Teklifler
                </Button>
                <Button
                    variant={filter === 'eco' ? 'default' : 'outline'}
                    onClick={() => setFilter('eco')}
                    className="text-green-700 border-green-300 hover:bg-green-50"
                >
                    <Leaf className="h-4 w-4 mr-2" />
                    Yeşil Seçim
                </Button>
            </div>

            {filteredLoads.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {filter === 'all' ? 'Henüz teklif bulunmuyor' :
                                filter === 'pending' ? 'Bekleyen teklif bulunmuyor' :
                                    'Çevreci teklif bulunmuyor'}
                        </h3>
                        <p className="text-muted-foreground text-center">
                            {filter === 'all' ? 'Yükleriniz için henüz teklif gelmemiştir.' :
                                filter === 'pending' ? 'Şu anda bekleyen teklif bulunmamaktadır.' :
                                    'Çevre dostu araçlardan teklif bulunmamaktadır.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {filteredLoads.map((loadWithOffers) => (
                        <Card key={loadWithOffers.load.id} className="overflow-hidden">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{loadWithOffers.load.title}</span>
                                    <div className="flex items-center space-x-2">
                                        {loadWithOffers.load.insuranceRequested && (
                                            <Badge variant="secondary">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Sigortalı
                                            </Badge>
                                        )}
                                        <Badge variant="outline">
                                            {loadWithOffers.pendingOffersCount} Teklif
                                        </Badge>
                                    </div>
                                </CardTitle>

                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <Weight className="h-4 w-4 mr-1" />
                                        {loadWithOffers.load.netWeight} kg
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {formatDate(loadWithOffers.load.loadingDate)}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-4">
                                    {/* Yük Detayları */}
                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            <span className="truncate">
                                                {loadWithOffers.load.loadingAddress} → {loadWithOffers.load.deliveryAddress}
                                            </span>
                                        </div>
                                        {loadWithOffers.load.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {loadWithOffers.load.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Çevreci Teklif Uyarısı */}
                                    {loadService.hasEcoFriendlyOffers(loadWithOffers) && (
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center">
                                                <Leaf className="h-4 w-4 text-green-600 mr-2" />
                                                <span className="text-sm text-green-700 font-medium">
                                                    🌱 Doğaya dost bir tercih yapmak ister misiniz?
                                                </span>
                                            </div>
                                            <p className="text-xs text-green-600 mt-1">
                                                Bu yük için çevreci araç seçenekleri mevcut! Aynı kalitede hizmet, daha az karbon emisyonu.
                                            </p>
                                        </div>
                                    )}

                                    {/* Teklifler Listesi */}
                                    <div className="space-y-3">
                                        {[...loadWithOffers.offers]
                                            .sort((a, b) => {
                                                // Çevreci araçları öne çıkar, sonra fiyata göre sırala
                                                if (a.vehicleEcoCertified && !b.vehicleEcoCertified) return -1;
                                                if (!a.vehicleEcoCertified && b.vehicleEcoCertified) return 1;
                                                return a.price - b.price;
                                            })
                                            .map((offer) => (
                                                <div
                                                    key={offer.offerId}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                                                        offer.vehicleEcoCertified ? 'border-green-300 bg-green-50/50' : ''
                                                    }`}
                                                    onClick={() => openOfferDetail(offer, loadWithOffers)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <h4 className="font-semibold">{offer.carrierName}</h4>
                                                                {offer.vehicleEcoCertified && (
                                                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                                        <Leaf className="h-3 w-3 mr-1" />
                                                                        Çevreci Araç
                                                                    </Badge>
                                                                )}
                                                                <Badge variant={getStatusVariant(offer.status)}>
                                                                    {getStatusIcon(offer.status)}
                                                                    <span className="ml-1">{getStatusText(offer.status)}</span>
                                                                </Badge>
                                                            </div>

                                                            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                                                <div className="flex items-center">
                                                                    <TruckIcon className="h-4 w-4 mr-1" />
                                                                    {offer.vehiclePlateNumber} - {offer.vehicleType}
                                                                </div>
                                                                {offer.insuranceAccepted && (
                                                                    <div className="flex items-center">
                                                                        <Shield className="h-4 w-4 mr-1" />
                                                                        Sigorta Kabul
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-primary">
                                                                {formatCurrency(offer.price)}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {formatDateTime(offer.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {offer.vehicleEcoCertified && (
                                                        <div className="mt-2 text-xs text-green-600">
                                                            ✨ Bu araç daha az karbon emisyonu üretir ve çevreye daha az zarar verir.
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Teklif Detay Modal */}
            <Dialog open={isOfferDetailModalOpen} onOpenChange={setIsOfferDetailModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Teklif Detayları</DialogTitle>
                    </DialogHeader>

                    {selectedOffer && selectedLoad && (
                        <div className="space-y-6">
                            {/* Yük Bilgisi */}
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold mb-2">{selectedLoad.load.title}</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Ağırlık:</span>
                                        <span className="ml-2">{selectedLoad.load.netWeight} kg</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Mal Türü:</span>
                                        <span className="ml-2">{selectedLoad.load.goodsType}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Taşıyıcı ve Araç Bilgisi */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-semibold mb-2">Taşıyıcı Bilgileri</h5>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Firma:</span>
                                            <span className="ml-2">{selectedOffer.carrierName}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Teklif Fiyatı:</span>
                                            <span className="ml-2 font-bold text-primary">
                                                {formatCurrency(selectedOffer.price)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-semibold mb-2">Araç Bilgileri</h5>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Plaka:</span>
                                            <span className="ml-2">{selectedOffer.vehiclePlateNumber}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Tip:</span>
                                            <span className="ml-2">{selectedOffer.vehicleType}</span>
                                        </div>
                                        {selectedOffer.vehicleEcoCertified && (
                                            <div className="flex items-center text-green-600">
                                                <Leaf className="h-4 w-4 mr-1" />
                                                <span>Çevre dostu sertifikalı araç</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Çevreci Araç Avantajları */}
                            {selectedOffer.vehicleEcoCertified && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <h5 className="font-semibold text-green-800 mb-2">🌱 Çevreci Araç Avantajları</h5>
                                    <ul className="text-sm text-green-700 space-y-1">
                                        <li>• Yaklaşık %15 daha az karbon emisyonu</li>
                                        <li>• Çevre dostu sertifikalı araç</li>
                                        <li>• Sürdürülebilir taşımacılık</li>
                                        <li>• Kurumsal sosyal sorumluluk katkısı</li>
                                    </ul>
                                </div>
                            )}

                            {/* Durum ve Aksiyonlar */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-muted-foreground">Durum:</span>
                                    <Badge variant={getStatusVariant(selectedOffer.status)}>
                                        {getStatusIcon(selectedOffer.status)}
                                        <span className="ml-1">{getStatusText(selectedOffer.status)}</span>
                                    </Badge>
                                </div>

                                {selectedOffer.status === 'PENDING' && (
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleRejectOffer(selectedOffer.offerId)}
                                            disabled={offerSubmitting}
                                        >
                                            {offerSubmitting ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <XCircle className="h-4 w-4 mr-2" />
                                            )}
                                            Reddet
                                        </Button>
                                        <Button
                                            onClick={() => handleAcceptOffer(selectedOffer.offerId)}
                                            disabled={offerSubmitting}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {offerSubmitting ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                            )}
                                            Kabul Et
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-muted-foreground">
                                Teklif tarihi: {formatDateTime(selectedOffer.createdAt)}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}