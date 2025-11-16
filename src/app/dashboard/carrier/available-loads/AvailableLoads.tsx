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
    DollarSign,
    Search
} from 'lucide-react';
import loadService, { Load, LoadStatus, TransportType } from '@/services/loadService';
import offerService, { OfferRequest, VehicleInfo } from '@/services/offerService';
import vehicleService from '@/services/vehicleService';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchAvailableLoads, removeLoadFromAvailable } from '@/store/slices/loadsSlice';
import { createOffer } from '@/store/slices/offersSlice';
import { formatDate } from '@/utils/dateUtils';

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
    const [searchQuery, setSearchQuery] = useState('');

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
            // unwrap() reject edildiğinde error string olarak gelir
            toast({
                title: 'Uyarı',
                description: error || 'Teklif gönderilirken bir hata oluştu.',
                variant: 'destructive',
            });
        }
    };

    const handleMessageSender = (load: Load) => {
        // Backend'den gelen Load objesinde sender.userId'yi kullan (User ID, profile ID değil)
        if (load.sender?.userId) {
            router.push(`/dashboard/messages/load/${load.id}?otherUserId=${load.sender.userId}`);
        } else {
            toast({
                title: 'Hata',
                description: 'Gönderici bilgisi bulunamadı.',
                variant: 'destructive',
            });
        }
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

    // Sadece LAND (kara) taşıma tipindeki yükleri göster ve arama filtresi uygula
    const filteredLoads = availableLoads.filter(load => {
        // Transport type filtresi
        if (load.transportType !== TransportType.LAND) return false;

        // Arama filtresi (Türkçe karakterler için locale-aware)
        if (searchQuery) {
            const query = searchQuery.toLocaleLowerCase('tr-TR');
            return (
                load.title.toLocaleLowerCase('tr-TR').includes(query) ||
                load.loadingAddress.toLocaleLowerCase('tr-TR').includes(query) ||
                load.deliveryAddress.toLocaleLowerCase('tr-TR').includes(query)
            );
        }

        return true;
    });

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

    const formatWeight = (weight: number) => {
        if (weight >= 1000) {
            return `${(weight / 1000).toFixed(1)} ton`;
        }
        return `${weight} kg`;
    };

    return (
        <div className="p-4 md:p-8 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 md:gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Müsait Yükler</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">
                        Teklif verebileceğiniz müsait kara yüklerini görüntüleyin ve teklif gönderin
                    </p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
                    <Package className="h-4 w-4 mr-1" />
                    {filteredLoads.length} müsait yük
                </Badge>
            </div>

            {/* Search Bar */}
            <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Yük adı, yükleme noktası veya varış noktası ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {filteredLoads.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchQuery
                                ? 'Arama sonucu bulunamadı'
                                : 'Henüz müsait yük bulunmuyor'
                            }
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery
                                ? 'Farklı bir arama terimi deneyin.'
                                : 'Şu anda teklif verebileceğiniz yük bulunmamaktadır. Lütfen daha sonra tekrar kontrol edin.'
                            }
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <Card className="hidden md:block">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Yük Adı
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Mal Türü
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Ağırlık
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Yükleme
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Teslimat
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Tarih
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Durum
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                İşlemler
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredLoads.map((load) => (
                                            <tr
                                                key={load.id}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    setSelectedLoad(load);
                                                    setIsDetailsModalOpen(true);
                                                }}
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-900">{load.title}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-700">{load.goodsType}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Weight className="h-4 w-4 text-gray-400" />
                                                        <span>{formatWeight(load.netWeight)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                        <span className="truncate max-w-xs">{load.loadingAddress}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                                                        <span className="truncate max-w-xs">{load.deliveryAddress}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span>{formatDate(load.loadingDate)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={`${getStatusBadgeColor(load.status)} border-0`}>
                                                        {getStatusText(load.status)}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedLoad(load);
                                                                setIsDetailsModalOpen(true);
                                                            }}
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200"
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Detaylar
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedLoad(load);
                                                                setIsOfferModalOpen(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200"
                                                        >
                                                            <TruckIcon className="h-4 w-4 mr-2" />
                                                            Teklif Ver
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {filteredLoads.map((load) => (
                            <Card
                                key={load.id}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => {
                                    setSelectedLoad(load);
                                    setIsDetailsModalOpen(true);
                                }}
                            >
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="font-medium text-gray-900 text-sm">{load.title}</span>
                                            <Badge className={`${getStatusBadgeColor(load.status)} border-0 text-xs flex-shrink-0`}>
                                                {getStatusText(load.status)}
                                            </Badge>
                                        </div>

                                        {/* Sender Info */}
                                        {load.sender && (
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <Building2 className="h-3 w-3 text-gray-400" />
                                                <span>{load.sender.companyName}</span>
                                            </div>
                                        )}

                                        {/* Goods Type and Weight */}
                                        <div className="flex items-center gap-4 text-xs text-gray-600">
                                            <span>{load.goodsType}</span>
                                            <div className="flex items-center gap-1">
                                                <Weight className="h-3 w-3 text-gray-400" />
                                                <span>{formatWeight(load.netWeight)}</span>
                                            </div>
                                        </div>

                                        {/* Dates */}
                                        <div className="flex items-center gap-4 text-xs text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3 text-gray-400" />
                                                <span>{formatDate(load.loadingDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-gray-400" />
                                                <span>{formatDate(load.deliveryDate)}</span>
                                            </div>
                                        </div>

                                        {/* Addresses */}
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs text-gray-500 uppercase">Yükleme</div>
                                                    <div className="text-xs text-gray-900 break-words">{load.loadingAddress}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-3 w-3 text-red-600 flex-shrink-0 mt-0.5" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs text-gray-500 uppercase">Teslimat</div>
                                                    <div className="text-xs text-gray-900 break-words">{load.deliveryAddress}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        {(load.insuranceRequested || load.ecoTransportRequested) && (
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
                                        )}

                                        {/* Action Buttons */}
                                        <div className="pt-2 border-t flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedLoad(load);
                                                    setIsDetailsModalOpen(true);
                                                }}
                                                className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Detaylar
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedLoad(load);
                                                    setIsOfferModalOpen(true);
                                                }}
                                                className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200"
                                            >
                                                <TruckIcon className="h-4 w-4 mr-2" />
                                                Teklif Ver
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
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