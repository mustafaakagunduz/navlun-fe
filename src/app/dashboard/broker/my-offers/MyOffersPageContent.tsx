'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
    Package,
    MapPin,
    Calendar,
    Weight,
    Shield,
    Leaf,
    Ship,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Search,
    Filter, Users
} from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
    fetchCurrentBrokerOffers,
    setStatusFilter,
    setSearchQuery,
    OfferStatus
} from '@/store/slices/brokerOffersSlice';
import { formatDate, formatCurrency } from '@/utils/formatters';

function MyOffersPageContent() {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const { toast } = useToast();

    const {
        offers,
        pendingOffers,
        acceptedOffers,
        rejectedOffers,
        offersLoading,
        offersError,
        stats,
        filters
    } = useAppSelector(state => state.brokerOffers);

    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (user?.role === 'BROKER') {
            dispatch(fetchCurrentBrokerOffers());
        }
    }, [dispatch, user]);

    const handleSearch = (searchTerm: string) => {
        dispatch(setSearchQuery(searchTerm));
    };

    const handleStatusFilter = (status: OfferStatus | 'ALL') => {
        dispatch(setStatusFilter(status));
        if (status !== 'ALL') {
            dispatch(fetchCurrentBrokerOffers(status));
        } else {
            dispatch(fetchCurrentBrokerOffers());
        }
    };

    // Filter offers based on search query
    const filteredOffers = (offersList: any[]) => {
        if (!filters.searchQuery) return offersList;

        return offersList.filter(offer =>
            offer.loadTitle?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
            offer.loadGoodsType?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
            offer.shipName?.toLowerCase().includes(filters.searchQuery.toLowerCase())
        );
    };

    const renderOfferCard = (offer: any) => (
        <Card key={offer.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Ship className="h-5 w-5 text-blue-600" />
                        <span>{offer.loadTitle || 'Yük Başlığı'}</span>
                    </div>
                    <Badge
                        className={
                            offer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                    offer.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                        }
                    >
                        {offer.status === 'PENDING' ? 'Beklemede' :
                            offer.status === 'ACCEPTED' ? 'Kabul Edildi' :
                                offer.status === 'REJECTED' ? 'Reddedildi' :
                                    offer.status}
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Yük Tipi: {offer.loadGoodsType || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Weight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Ağırlık: {offer.loadWeight ? `${offer.loadWeight} kg` : 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Yük Sahibi: {offer.senderName || offer.senderCompanyName || 'N/A'}</span>
                        </div>


                        <div className="flex items-center gap-2">
                            <Ship className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Gemi: {offer.shipName || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Navlun: {formatCurrency(offer.freightRate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Yükleme: {formatDate(offer.estimatedLoadingDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Teslimat: {formatDate(offer.estimatedDeliveryDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Özellikler */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {offer.ecoFriendly && (
                        <div className="flex items-center gap-1 text-green-600">
                            <Leaf className="h-4 w-4" />
                            <span className="text-sm">Çevre Dostu</span>
                        </div>
                    )}
                    {offer.insuranceAccepted && (
                        <div className="flex items-center gap-1 text-blue-600">
                            <Shield className="h-4 w-4" />
                            <span className="text-sm">Sigortalı</span>
                        </div>
                    )}
                </div>

                {/* Teklif Detayları */}
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="font-medium">Komisyon Oranı:</span>
                            <span className="ml-2">{offer.commissionRate}%</span>
                        </div>
                        <div>
                            <span className="font-medium">Komisyon Tutarı:</span>
                            <span className="ml-2">{formatCurrency(offer.commissionAmount || 0)}</span>
                        </div>
                        <div>
                            <span className="font-medium">Toplam Tutar:</span>
                            <span className="ml-2">{formatCurrency(offer.totalAmount || 0)}</span>
                        </div>
                        <div>
                            <span className="font-medium">Geçerlilik:</span>
                            <span className="ml-2">{formatDate(offer.validUntil)}</span>
                        </div>
                    </div>
                </div>

                {/* Notlar */}
                {offer.notes && (
                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                            <strong>Notlar:</strong> {offer.notes}
                        </p>
                    </div>
                )}

                {/* Durum bilgisi */}
                {offer.status === 'ACCEPTED' && offer.acceptedAt && (
                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                                Teklif kabul edildi - {formatDate(offer.acceptedAt)}
                            </span>
                        </div>
                    </div>
                )}

                {offer.status === 'REJECTED' && offer.rejectedAt && (
                    <div className="bg-red-50 p-3 rounded-md border border-red-200">
                        <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">
                                Teklif reddedildi - {formatDate(offer.rejectedAt)}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (offersLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Teklifler yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (offersError) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{offersError}</p>
                    <Button onClick={() => dispatch(fetchCurrentBrokerOffers())}>
                        Tekrar Dene
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Tekliflerim</h1>
                <p className="text-muted-foreground">
                    Verdiğiniz teklifleri takip edin ve durumlarını görün
                </p>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Toplam Teklif</p>
                                <p className="text-2xl font-bold">{stats.totalOffers}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Beklemede</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Kabul Edildi</p>
                                <p className="text-2xl font-bold text-green-600">{stats.acceptedCount}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Başarı Oranı</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.successRate.toFixed(1)}%</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtreler */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Yük başlığı, tipi veya gemi adı ile ara..."
                            value={filters.searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filters.status === 'ALL' ? 'default' : 'outline'}
                        onClick={() => handleStatusFilter('ALL')}
                        size="sm"
                    >
                        Tümü
                    </Button>
                    <Button
                        variant={filters.status === 'PENDING' ? 'default' : 'outline'}
                        onClick={() => handleStatusFilter(OfferStatus.PENDING)}
                        size="sm"
                    >
                        Beklemede
                    </Button>
                    <Button
                        variant={filters.status === 'ACCEPTED' ? 'default' : 'outline'}
                        onClick={() => handleStatusFilter(OfferStatus.ACCEPTED)}
                        size="sm"
                    >
                        Kabul Edildi
                    </Button>
                    <Button
                        variant={filters.status === 'REJECTED' ? 'default' : 'outline'}
                        onClick={() => handleStatusFilter(OfferStatus.REJECTED)}
                        size="sm"
                    >
                        Reddedildi
                    </Button>
                </div>
            </div>

            {/* Teklifler Listesi */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">
                        Tümü ({offers.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                        Beklemede ({pendingOffers.length})
                    </TabsTrigger>
                    <TabsTrigger value="accepted">
                        Kabul Edildi ({acceptedOffers.length})
                    </TabsTrigger>
                    <TabsTrigger value="rejected">
                        Reddedildi ({rejectedOffers.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    {filteredOffers(offers).length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Henüz teklif bulunmuyor</h3>
                                <p className="text-muted-foreground text-center">
                                    Yük sahibi taleplerini görüntüleyerek teklif vermeye başlayın.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {filteredOffers(offers).map(renderOfferCard)}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="pending" className="mt-6">
                    {filteredOffers(pendingOffers).length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Bekleyen teklif bulunmuyor</h3>
                                <p className="text-muted-foreground text-center">
                                    Tüm teklifleriniz yanıtlanmış.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {filteredOffers(pendingOffers).map(renderOfferCard)}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="accepted" className="mt-6">
                    {filteredOffers(acceptedOffers).length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Kabul edilmiş teklif bulunmuyor</h3>
                                <p className="text-muted-foreground text-center">
                                    Kabul edilmiş teklifleriniz burada görünecektir.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {filteredOffers(acceptedOffers).map(renderOfferCard)}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="rejected" className="mt-6">
                    {filteredOffers(rejectedOffers).length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Reddedilmiş teklif bulunmuyor</h3>
                                <p className="text-muted-foreground text-center">
                                    Reddedilmiş teklifleriniz burada görünecektir.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {filteredOffers(rejectedOffers).map(renderOfferCard)}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function MyOffersPage() {
    return (
        <ProtectedRoute allowedRoles={['BROKER']}>
            <MyOffersPageContent />
        </ProtectedRoute>
    );
}