// src/app/dashboard/carrier/available-loads/AvailableLoads.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
    Eye,
    MessageSquare,
    Building2,
    Clock,
    DollarSign
} from 'lucide-react';
import loadService, { Load, LoadStatus } from '@/services/loadService';
import offerService, { OfferRequest, VehicleInfo } from '@/services/offerService';
import vehicleService from '@/services/vehicleService';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchAvailableLoads, removeLoadFromAvailable } from '@/store/slices/loadsSlice';
import { createOffer } from '@/store/slices/offersSlice';

export default function AvailableLoadsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const {
        availableLoads,
        availableLoadsLoading
    } = useAppSelector(state => state.loads);
    const {
        offerSubmitting
    } = useAppSelector(state => state.offers);

    const [vehicles, setVehicles] = useState<VehicleInfo[]>([]);
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Teklif form state
    const [offerForm, setOfferForm] = useState({
        price: '',
        vehicleId: '',
        insuranceAccepted: false,
        notes: ''
    });

    const { toast } = useToast();

    useEffect(() => {
        dispatch(fetchAvailableLoads({ page: 0, size: 50 }));
        fetchUserVehicles();
    }, [dispatch]);

    const fetchUserVehicles = async () => {
        try {
            console.log('Fetching user vehicles...'); // Debug
            const userVehicles = await vehicleService.getCurrentUserVehicles();
            console.log('Fetched vehicles:', userVehicles); // Debug
            setVehicles(userVehicles);
        } catch (error: any) {
            console.error('Vehicle fetch error:', error); // Debug
            toast({
                title: 'Hata',
                description: `Araçlar yüklenirken bir hata oluştu: ${error.response?.data?.message || error.message}`,
                variant: 'destructive',
            });
        }
    };

    const handleOfferSubmit = async () => {
        if (!selectedLoad || !offerForm.price || !offerForm.vehicleId) {
            toast({
                title: 'Eksik Bilgi',
                description: 'Lütfen tüm gerekli alanları doldurun.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const selectedVehicle = vehicles.find(v => v.id === offerForm.vehicleId);

            const offerRequest: OfferRequest = {
                loadId: selectedLoad.id,
                vehicleId: offerForm.vehicleId,
                price: parseFloat(offerForm.price),
                insuranceAccepted: offerForm.insuranceAccepted,
                note: offerForm.notes,
                isEcoFriendly: selectedVehicle?.ecoCertified || false
            };

            console.log('Submitting offer:', offerRequest); // Debug

            // Redux kullanarak teklif gönder
            await dispatch(createOffer(offerRequest)).unwrap();

            toast({
                title: 'Başarılı',
                description: 'Teklifiniz başarıyla gönderildi!',
            });

            // Formu temizle ve modalı kapat
            setOfferForm({
                price: '',
                vehicleId: '',
                insuranceAccepted: false,
                notes: ''
            });
            setIsOfferModalOpen(false);
            setSelectedLoad(null);

            // Listeyi yenile
            dispatch(fetchAvailableLoads({ page: 0, size: 50 }));

        } catch (error: any) {
            console.error('Offer submission error:', error); // Debug
            toast({
                title: 'Hata',
                description: error.message || 'Teklif gönderilirken bir hata oluştu.',
                variant: 'destructive',
            });
        }
    };

    const handleMessageSender = (load: Load) => {
        // Backend'den gelen Load objesinde sender.id'yi kullan
        if (load.sender?.id) {
            router.push(`/dashboard/messages/load/${load.id}?otherUserId=${load.sender.id}`);
        } else {
            toast({
                title: 'Hata',
                description: 'Gönderici bilgisi bulunamadı.',
                variant: 'destructive',
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    const getStatusBadgeColor = (status: LoadStatus) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusText = (status: LoadStatus) => {
        switch (status) {
            case 'PENDING':
                return 'Beklemede';
            case 'ACTIVE':
                return 'Aktif';
            case 'COMPLETED':
                return 'Tamamlandı';
            case 'CANCELLED':
                return 'İptal Edildi';
            default:
                return status;
        }
    };

    if (availableLoadsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Müsait yükler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Müsait Yükler</h1>
                    <p className="text-gray-600 mt-1">
                        Teklif verebileceğiniz müsait yükleri görüntüleyin ve teklif gönderin
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Package className="h-4 w-4 mr-1" />
                        {availableLoads.length} müsait yük
                    </Badge>
                </div>
            </div>

            {availableLoads.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Henüz müsait yük bulunmuyor</h3>
                        <p className="text-muted-foreground text-center">
                            Şu anda teklif verebileceğiniz yük bulunmamaktadır. Lütfen daha sonra tekrar kontrol edin.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {availableLoads.map((load) => (
                        <Card key={load.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="truncate">{load.title}</span>
                                    <Badge className={`${getStatusBadgeColor(load.status)} border`}>
                                        {getStatusText(load.status)}
                                    </Badge>
                                </CardTitle>
                                {load.sender && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Building2 className="h-4 w-4 mr-1" />
                                        {load.sender.companyName}
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Package className="h-4 w-4 mr-2" />
                                        {load.goodsType}
                                    </div>

                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Weight className="h-4 w-4 mr-2" />
                                        {load.netWeight} kg
                                    </div>

                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        <div className="truncate">
                                            {load.loadingAddress} → {load.deliveryAddress}
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Yükleme: {formatDate(load.loadingDate)}
                                    </div>

                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Teslimat: {formatDate(load.deliveryDate)}
                                    </div>

                                    {load.estimatedPrice && (
                                        <div className="flex items-center text-sm font-medium text-green-600">
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Tahmini: ₺{load.estimatedPrice.toLocaleString()}
                                        </div>
                                    )}
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {load.insuranceRequested && (
                                        <Badge variant="secondary" className="text-xs">
                                            <Shield className="h-3 w-3 mr-1" />
                                            Sigortalı
                                        </Badge>
                                    )}
                                    {load.ecoTransportRequested && (
                                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                            <Leaf className="h-3 w-3 mr-1" />
                                            Çevreci
                                        </Badge>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedLoad(load);
                                            setIsDetailsModalOpen(true);
                                        }}
                                        className="flex-1"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Detaylar
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            setSelectedLoad(load);
                                            setIsOfferModalOpen(true);
                                        }}
                                        size="sm"
                                        className="flex-1"
                                    >
                                        <TruckIcon className="h-4 w-4 mr-2" />
                                        Teklif Ver
                                    </Button>

                                    {/* Mesajlaş Butonu */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleMessageSender(load)}
                                        className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                                    >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Mesajlaş
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Load Details Modal */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Yük Detayları</DialogTitle>
                        <DialogDescription>
                            Seçili yükün detaylı bilgilerini görüntüleyin
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLoad && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Yük Başlığı</Label>
                                    <p className="mt-1">{selectedLoad.title}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Mal Türü</Label>
                                    <p className="mt-1">{selectedLoad.goodsType}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Net Ağırlık</Label>
                                    <p className="mt-1">{selectedLoad.netWeight} kg</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Durum</Label>
                                    <Badge className={`${getStatusBadgeColor(selectedLoad.status)} mt-1`}>
                                        {getStatusText(selectedLoad.status)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Yükleme Adresi</Label>
                                    <p className="mt-1">{selectedLoad.loadingAddress}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Teslimat Adresi</Label>
                                    <p className="mt-1">{selectedLoad.deliveryAddress}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Yükleme Tarihi</Label>
                                    <p className="mt-1">{formatDate(selectedLoad.loadingDate)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Teslimat Tarihi</Label>
                                    <p className="mt-1">{formatDate(selectedLoad.deliveryDate)}</p>
                                </div>
                            </div>

                            {selectedLoad.description && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Açıklama</Label>
                                    <p className="mt-1">{selectedLoad.description}</p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                {selectedLoad.insuranceRequested && (
                                    <Badge variant="secondary">
                                        <Shield className="h-4 w-4 mr-1" />
                                        Sigorta Talep Edildi
                                    </Badge>
                                )}
                                {selectedLoad.ecoTransportRequested && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        <Leaf className="h-4 w-4 mr-1" />
                                        Çevreci Taşıma
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Offer Modal */}
            <Dialog open={isOfferModalOpen} onOpenChange={setIsOfferModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Teklif Ver</DialogTitle>
                        <DialogDescription>
                            Seçili yük için teklif gönderin
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLoad && (
                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-medium">{selectedLoad.title}</h4>
                                <p className="text-sm text-gray-600">{selectedLoad.goodsType} - {selectedLoad.netWeight} kg</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="price">Teklif Fiyatı (₺)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="Fiyat girin"
                                        value={offerForm.price}
                                        onChange={(e) => setOfferForm(prev => ({ ...prev, price: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="vehicle">Araç Seçin *</Label>
                                    {vehicles.length === 0 ? (
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                                            Henüz araç eklememişsiniz. Teklif vermek için önce araç eklemelisiniz.
                                        </div>
                                    ) : (
                                        <Select value={offerForm.vehicleId} onValueChange={(value) => setOfferForm(prev => ({ ...prev, vehicleId: value }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Araç seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vehicles.map((vehicle) => (
                                                    <SelectItem key={vehicle.id} value={vehicle.id}>
                                                        {vehicle.plateNumber} - {vehicle.type}
                                                        {vehicle.ecoCertified && ' (Çevreci)'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>


                                <div>
                                    <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Ek bilgiler veya özel durumlar..."
                                        value={offerForm.notes}
                                        onChange={(e) => setOfferForm(prev => ({ ...prev, notes: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsOfferModalOpen(false)} className="flex-1">
                                    İptal
                                </Button>
                                <Button onClick={handleOfferSubmit} disabled={offerSubmitting} className="flex-1">
                                    {offerSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Gönderiliyor...
                                        </>
                                    ) : (
                                        'Teklif Gönder'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}