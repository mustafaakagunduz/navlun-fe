'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
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
    Ship,
    Anchor
} from 'lucide-react';
import loadService, { LoadWithOffers, OfferWithVehicleInfo } from '@/services/loadService';
import offerService from '@/services/offerService';
import brokerService, { BrokerOfferResponse } from '@/services/brokerService';
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchLoadsWithOffers, acceptOffer, rejectOffer, setSelectedOffer } from '@/store/slices/offersSlice'
import {decrementOfferCount, updateOfferCount} from "@/store/slices/notificationsSlice";
import { formatDate, formatDateTime, formatTime } from '@/utils/dateUtils';

export default function SenderOffersPage() {

    const dispatch = useAppDispatch()
    const {
        loadsWithOffers,
        loadsWithOffersLoading,
        selectedOffer,
        offerSubmitting
    } = useAppSelector(state => state.offers)

    const [selectedLoad, setSelectedLoad] = useState<LoadWithOffers | null>(null);
    const [selectedBrokerOffer, setSelectedBrokerOffer] = useState<BrokerOfferResponse | null>(null);
    const [isOfferDetailModalOpen, setIsOfferDetailModalOpen] = useState(false);
    const [isBrokerOfferDetailModalOpen, setIsBrokerOfferDetailModalOpen] = useState(false);
    const [filter, setFilter] = useState<'pending' | 'accepted' | 'rejected' | 'eco'>('pending');
    const [brokerOffers, setBrokerOffers] = useState<BrokerOfferResponse[]>([]);
    const [brokerOffersLoading, setBrokerOffersLoading] = useState(false);

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

        // Broker tekliflerini de getir
        fetchBrokerOffers();
    }, [dispatch]);

    const fetchBrokerOffers = async () => {
        console.log('=== FETCHING BROKER OFFERS STARTED ===');
        setBrokerOffersLoading(true);
        try {
            const offers = await brokerService.getCurrentSenderReceivedBrokerOffers();
            console.log('=== BROKER OFFERS RECEIVED ===');
            console.log('Offers count:', offers.length);
            console.log('Offers:', offers);
            setBrokerOffers(offers);
        } catch (error) {
            console.error('Broker teklifleri yüklenirken hata:', error);
        } finally {
            setBrokerOffersLoading(false);
        }
    };

    const handleAcceptOffer = async (offerId: string) => {
        try {
            await dispatch(acceptOffer(offerId)).unwrap()
            dispatch(decrementOfferCount()); // Notification count'u azalt

            toast({
                title: 'Başarılı!',
                description: 'Carrier teklifi başarıyla kabul edildi.',
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
                description: 'Carrier teklifi reddedildi.',
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

    const handleAcceptBrokerOffer = async (offerId: string) => {
        try {
            await brokerService.acceptBrokerOffer(offerId);

            toast({
                title: 'Başarılı!',
                description: 'Broker teklifi başarıyla kabul edildi.',
                variant: 'default',
            });

            setIsBrokerOfferDetailModalOpen(false);
            await fetchBrokerOffers(); // Refresh broker offers
        } catch (error: any) {
            toast({
                title: 'Hata',
                description: error.response?.data?.message || 'Broker teklifi kabul edilirken bir hata oluştu.',
                variant: 'destructive',
            });
        }
    };

    const handleRejectBrokerOffer = async (offerId: string) => {
        try {
            await brokerService.rejectBrokerOffer(offerId);

            toast({
                title: 'Başarılı!',
                description: 'Broker teklifi reddedildi.',
                variant: 'default',
            });

            setIsBrokerOfferDetailModalOpen(false);
            await fetchBrokerOffers(); // Refresh broker offers
        } catch (error: any) {
            toast({
                title: 'Hata',
                description: error.response?.data?.message || 'Broker teklifi reddedilirken bir hata oluştu.',
                variant: 'destructive',
            });
        }
    };

    const openOfferDetail = (offer: OfferWithVehicleInfo, load: LoadWithOffers) => {
        dispatch(setSelectedOffer(offer));
        setSelectedLoad(load);
        setIsOfferDetailModalOpen(true);
    };

    const handleBrokerOfferDetailClick = (offer: BrokerOfferResponse) => {
        setSelectedBrokerOffer(offer);
        setIsBrokerOfferDetailModalOpen(true);
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

    const formatDateHelper = (dateString: string | number[]) => {
        if (Array.isArray(dateString)) {
            const [year, month, day] = dateString;
            return formatDate(new Date(year, month - 1, day).toISOString());
        }
        return formatDate(dateString);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    };

    // Broker tekliflerini yüklere göre grupla (filtrelemeden önce)
    const brokerOffersByLoad = brokerOffers.reduce((acc, offer) => {
        if (!acc[offer.loadId]) {
            acc[offer.loadId] = [];
        }
        acc[offer.loadId].push(offer);
        return acc;
    }, {} as Record<string, BrokerOfferResponse[]>);

    // Broker teklifi olan ama carrier teklifi olmayan yükleri de ekle
    const allLoadIds = new Set([
        ...loadsWithOffers.map(l => l.load.id),
        ...Object.keys(brokerOffersByLoad)
    ]);

    // Tüm yükleri birleştir
    const allLoadsMap = new Map<string, LoadWithOffers>();
    loadsWithOffers.forEach(load => {
        allLoadsMap.set(load.load.id, load);
    });

    // Broker teklifi olan ama carrier teklifi olmayan yükleri ekle
    brokerOffers.forEach(brokerOffer => {
        if (!allLoadsMap.has(brokerOffer.loadId)) {
            // Broker teklifinden load bilgisini çıkar
            allLoadsMap.set(brokerOffer.loadId, {
                load: {
                    id: brokerOffer.loadId,
                    title: brokerOffer.loadTitle || 'Yük',
                    goodsType: '',
                    netWeight: 0,
                    loadingAddress: '',
                    deliveryAddress: '',
                    loadingDate: '',
                    deliveryDate: '',
                    description: '',
                    insuranceRequested: false,
                    ecoTransportRequested: false,
                    status: 'PENDING',
                    transportType: 'SEA',
                    active: true
                } as any,
                offers: [],
                pendingOffersCount: 0,
                hasAcceptedOffer: false
            });
        }
    });

    const allLoadsWithOffers = Array.from(allLoadsMap.values());

    const filteredLoads = allLoadsWithOffers.filter(loadWithOffers => {
        const carrierOffers = loadWithOffers.offers;
        const brokerOffersForLoad = brokerOffersByLoad[loadWithOffers.load.id] || [];

        if (filter === 'pending') {
            return carrierOffers.some(offer => offer.status === 'PENDING') ||
                   brokerOffersForLoad.some(offer => offer.status === 'PENDING');
        }
        if (filter === 'accepted') {
            return carrierOffers.some(offer => offer.status === 'ACCEPTED') ||
                   brokerOffersForLoad.some(offer => offer.status === 'ACCEPTED');
        }
        if (filter === 'rejected') {
            return carrierOffers.some(offer => offer.status === 'REJECTED') ||
                   brokerOffersForLoad.some(offer => offer.status === 'REJECTED');
        }
        if (filter === 'eco') {
            return carrierOffers.some(offer => offer.vehicleEcoCertified || offer.isEcoFriendly) ||
                   brokerOffersForLoad.some(offer => offer.ecoFriendly);
        }
        return true;
    });

    if (loadsWithOffersLoading || brokerOffersLoading) {
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
                    Yükleriniz için gelen carrier ve broker tekliflerini görüntüleyin ve yönetin.
                </p>
            </div>

            {/* Filtre Butonları */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <Button
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setFilter('pending')}
                    className={`flex-1 h-14 md:h-16 text-base ${filter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                >
                    <Clock className="h-5 w-5 mr-2" />
                    Bekleyen
                </Button>
                <Button
                    variant={filter === 'accepted' ? 'default' : 'outline'}
                    onClick={() => setFilter('accepted')}
                    className={`flex-1 h-14 md:h-16 text-base ${filter === 'accepted' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Kabul Edilen
                </Button>
                <Button
                    variant={filter === 'rejected' ? 'default' : 'outline'}
                    onClick={() => setFilter('rejected')}
                    className={`flex-1 h-14 md:h-16 text-base ${filter === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                    <XCircle className="h-5 w-5 mr-2" />
                    Reddedilen
                </Button>
                <Button
                    variant={filter === 'eco' ? 'default' : 'outline'}
                    onClick={() => setFilter('eco')}
                    className={`flex-1 h-14 md:h-16 text-base ${filter === 'eco' ? 'bg-green-600 hover:bg-green-700' : 'text-green-700 border-green-300 hover:bg-green-50'}`}
                >
                    <Leaf className="h-5 w-5 mr-2" />
                    Yeşil Seçim
                </Button>
            </div>

            {filteredLoads.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {filter === 'pending' ? 'Bekleyen teklif bulunmuyor' :
                                filter === 'accepted' ? 'Kabul edilmiş teklif bulunmuyor' :
                                    filter === 'rejected' ? 'Reddedilmiş teklif bulunmuyor' :
                                        'Çevreci teklif bulunmuyor'}
                        </h3>
                        <p className="text-muted-foreground text-center">
                            {filter === 'pending' ? 'Şu anda bekleyen teklif bulunmamaktadır.' :
                                filter === 'accepted' ? 'Henüz kabul edilmiş teklif bulunmamaktadır.' :
                                    filter === 'rejected' ? 'Henüz reddedilmiş teklif bulunmamaktadır.' :
                                        'Çevre dostu araçlardan teklif bulunmamaktadır.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Accordion type="single" collapsible className="space-y-4">
                    {filteredLoads.map((loadWithOffers) => (
                        <AccordionItem
                            key={loadWithOffers.load.id}
                            value={loadWithOffers.load.id}
                            className="border rounded-lg bg-white"
                        >
                            <AccordionTrigger className="px-4 md:px-6 py-4 hover:no-underline hover:bg-gray-50">
                                <div className="flex flex-col md:flex-row md:items-center justify-between w-full pr-4 gap-3">
                                    <div className="flex items-start gap-3 md:gap-4 min-w-0 flex-1">
                                        <Package className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-left min-w-0 flex-1">
                                            <div className="font-semibold text-base md:text-lg truncate">{loadWithOffers.load.title}</div>
                                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mt-1">
                                                <div className="flex items-center">
                                                    <Weight className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                                    {loadWithOffers.load.netWeight} kg
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                                    {formatDateHelper(loadWithOffers.load.loadingDate)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 md:flex-shrink-0">
                                        {loadWithOffers.load.insuranceRequested && (
                                            <Badge variant="secondary" className="text-xs">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Sigortalı
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                                            Carrier: {loadWithOffers.pendingOffersCount}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                                            Broker: {brokerOffersByLoad[loadWithOffers.load.id]?.length || 0}
                                        </Badge>
                                    </div>
                                </div>
                            </AccordionTrigger>

                            <AccordionContent className="px-3 md:px-6 pb-4">
                                <div className="space-y-4">
                                    {/* Yük Detayları */}
                                    <div className="p-3 md:p-4 bg-muted rounded-lg">
                                        <div className="flex items-start text-xs md:text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                                            <span className="break-words min-w-0">
                                                <span className="block md:inline">{loadWithOffers.load.loadingAddress}</span>
                                                <span className="mx-1">→</span>
                                                <span className="block md:inline">{loadWithOffers.load.deliveryAddress}</span>
                                            </span>
                                        </div>

                                    </div>

                                    {/* Çevreci Teklif Uyarısı */}
                                    {loadService.hasEcoFriendlyOffers(loadWithOffers) && (
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-start">
                                                <Leaf className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="text-xs md:text-sm text-green-700 font-medium">
                                                        🌱 Doğaya dost bir tercih yapmak ister misiniz?
                                                    </span>
                                                    <p className="text-xs text-green-600 mt-1">
                                                        Bu yük için çevreci araç seçenekleri mevcut! Aynı kalitede hizmet, daha az karbon emisyonu.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Teklifler */}
                                    <div className="space-y-3 mt-4">
                                        {loadWithOffers.offers.length === 0 &&
                                         (!brokerOffersByLoad[loadWithOffers.load.id] || brokerOffersByLoad[loadWithOffers.load.id].length === 0) ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p>Bu yük için henüz teklif bulunmuyor.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {/* Carrier Teklifleri */}
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
                                                                className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                                                                    offer.vehicleEcoCertified ? 'border-green-300 bg-green-50/50' : ''
                                                                }`}
                                                                onClick={() => openOfferDetail(offer, loadWithOffers)}
                                                            >
                                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                                                                            <h4 className="font-semibold text-sm md:text-base">{offer.carrierName}</h4>
                                                                            {offer.vehicleEcoCertified && (
                                                                                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                                                                    <Leaf className="h-3 w-3 mr-1" />
                                                                                    <span className="hidden sm:inline">Çevreci Araç</span>
                                                                                    <span className="sm:hidden">Çevreci</span>
                                                                                </Badge>
                                                                            )}
                                                                            <Badge variant={getStatusVariant(offer.status)} className="text-xs">
                                                                                {getStatusIcon(offer.status)}
                                                                                <span className="ml-1">{getStatusText(offer.status)}</span>
                                                                            </Badge>
                                                                        </div>

                                                                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm text-muted-foreground">
                                                                            <div className="flex items-center">
                                                                                <TruckIcon className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                                                                <span className="truncate">{offer.vehiclePlateNumber} - {offer.vehicleType}</span>
                                                                            </div>
                                                                            {offer.insuranceAccepted && (
                                                                                <div className="flex items-center">
                                                                                    <Shield className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                                                                    Sigorta
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center justify-between md:block md:text-right">
                                                                        <div className="text-lg md:text-2xl font-bold text-primary">
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

                                                {/* Broker Teklifleri */}
                                                {brokerOffersByLoad[loadWithOffers.load.id] &&
                                                 brokerOffersByLoad[loadWithOffers.load.id].length > 0 &&
                                                    brokerOffersByLoad[loadWithOffers.load.id]
                                                        .sort((a, b) => {
                                                            // Çevreci gemileri öne çıkar, sonra fiyata göre sırala
                                                            if (a.ecoFriendly && !b.ecoFriendly) return -1;
                                                            if (!a.ecoFriendly && b.ecoFriendly) return 1;
                                                            return a.freightRate - b.freightRate;
                                                        })
                                                        .map((offer) => (
                                                            <div
                                                                key={offer.id}
                                                                className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                                                                    offer.ecoFriendly ? 'border-green-300 bg-green-50/50' : 'border-blue-300 bg-blue-50/50'
                                                                }`}
                                                                onClick={() => handleBrokerOfferDetailClick(offer)}
                                                            >
                                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                                                                            <h4 className="font-semibold text-sm md:text-base">{offer.brokerName}</h4>
                                                                            {offer.ecoFriendly && (
                                                                                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                                                                    <Leaf className="h-3 w-3 mr-1" />
                                                                                    <span className="hidden sm:inline">Çevreci Gemi</span>
                                                                                    <span className="sm:hidden">Çevreci</span>
                                                                                </Badge>
                                                                            )}
                                                                            <Badge variant={getStatusVariant(offer.status)} className="text-xs">
                                                                                {getStatusIcon(offer.status)}
                                                                                <span className="ml-1">{getStatusText(offer.status)}</span>
                                                                            </Badge>
                                                                        </div>

                                                                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm text-muted-foreground">
                                                                            <div className="flex items-center">
                                                                                <Ship className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                                                                <span className="truncate">{offer.shipName} - {offer.shipType}</span>
                                                                            </div>
                                                                            {offer.insuranceAccepted && (
                                                                                <div className="flex items-center">
                                                                                    <Shield className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                                                                    Sigorta
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-col gap-1 md:text-right">
                                                                        <div className="text-lg md:text-2xl font-bold text-blue-600">
                                                                            {formatCurrency(offer.freightRate)}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            Komisyon: %{offer.commissionRate}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {formatDateTime(offer.createdAt)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {offer.ecoFriendly && (
                                                                    <div className="mt-2 text-xs text-green-600">
                                                                        ✨ Bu gemi daha az karbon emisyonu üretir ve çevreye daha az zarar verir.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}

            {/* Carrier Teklif Detay Modal */}
            <Dialog open={isOfferDetailModalOpen} onOpenChange={setIsOfferDetailModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Carrier Teklif Detayları</DialogTitle>
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

            {/* Broker Teklif Detay Modal */}
            <Dialog open={isBrokerOfferDetailModalOpen} onOpenChange={setIsBrokerOfferDetailModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Broker Teklif Detayları</DialogTitle>
                    </DialogHeader>

                    {selectedBrokerOffer && (
                        <div className="space-y-6">
                            {/* Yük Bilgisi */}
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold mb-2">{selectedBrokerOffer.loadTitle}</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Ağırlık:</span>
                                        <span className="ml-2">{selectedBrokerOffer.loadWeight} kg</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Mal Türü:</span>
                                        <span className="ml-2">{selectedBrokerOffer.loadGoodsType}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Broker ve Gemi Bilgisi */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-semibold mb-2">Broker Bilgileri</h5>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Firma:</span>
                                            <span className="ml-2">{selectedBrokerOffer.brokerName}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Navlun Ücreti:</span>
                                            <span className="ml-2 font-bold text-primary">
                                                {formatCurrency(selectedBrokerOffer.freightRate)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Komisyon:</span>
                                            <span className="ml-2">%{selectedBrokerOffer.commissionRate}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-semibold mb-2">Gemi Bilgileri</h5>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Gemi Adı:</span>
                                            <span className="ml-2">{selectedBrokerOffer.shipName}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Gemi Türü:</span>
                                            <span className="ml-2">{selectedBrokerOffer.shipType}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">DWT:</span>
                                            <span className="ml-2">{selectedBrokerOffer.shipDeadweightTonnage} ton</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">IMO:</span>
                                            <span className="ml-2">{selectedBrokerOffer.shipImoNumber}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tarih Bilgileri */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-muted-foreground">Tahmini Yükleme:</span>
                                    <span className="ml-2">{formatDateHelper(selectedBrokerOffer.estimatedLoadingDate)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Tahmini Teslimat:</span>
                                    <span className="ml-2">{formatDateHelper(selectedBrokerOffer.estimatedDeliveryDate)}</span>
                                </div>
                            </div>

                            {/* Şartlar ve Notlar */}
                            {selectedBrokerOffer.terms && (
                                <div>
                                    <span className="text-muted-foreground">Şartlar:</span>
                                    <p className="mt-1 text-sm">{selectedBrokerOffer.terms}</p>
                                </div>
                            )}

                            {selectedBrokerOffer.notes && (
                                <div>
                                    <span className="text-muted-foreground">Notlar:</span>
                                    <p className="mt-1 text-sm">{selectedBrokerOffer.notes}</p>
                                </div>
                            )}

                            {/* Çevreci Gemi Avantajları */}
                            {selectedBrokerOffer.ecoFriendly && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <h5 className="font-semibold text-green-800 mb-2">🌱 Çevreci Gemi Avantajları</h5>
                                    <ul className="text-sm text-green-700 space-y-1">
                                        <li>• Yaklaşık %20 daha az karbon emisyonu</li>
                                        <li>• Çevre dostu sertifikalı gemi</li>
                                        <li>• Sürdürülebilir denizcilik</li>
                                        <li>• Uluslararası çevre standartlarına uygun</li>
                                    </ul>
                                </div>
                            )}

                            {/* Özellikler */}
                            <div className="flex gap-2">
                                {selectedBrokerOffer.ecoFriendly && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                        <Leaf className="h-3 w-3 mr-1" />
                                        Çevreci Gemi
                                    </Badge>
                                )}
                                {selectedBrokerOffer.insuranceAccepted && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Sigorta Kabul
                                    </Badge>
                                )}
                            </div>

                            {/* Durum ve Aksiyon Butonları */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-muted-foreground">Durum:</span>
                                    <Badge variant={getStatusVariant(selectedBrokerOffer.status)}>
                                        {getStatusIcon(selectedBrokerOffer.status)}
                                        <span className="ml-1">{getStatusText(selectedBrokerOffer.status)}</span>
                                    </Badge>
                                </div>

                                {selectedBrokerOffer.status === 'PENDING' && (
                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={() => handleRejectBrokerOffer(selectedBrokerOffer.id)}
                                            variant="outline"
                                            className="border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reddet
                                        </Button>
                                        <Button
                                            onClick={() => handleAcceptBrokerOffer(selectedBrokerOffer.id)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Kabul Et
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-muted-foreground">
                                Teklif tarihi: {formatDateTime(selectedBrokerOffer.createdAt)}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}