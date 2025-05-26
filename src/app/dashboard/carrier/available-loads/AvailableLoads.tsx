'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, MapPin, Calendar, Weight, Shield, Leaf, TruckIcon } from 'lucide-react';
import loadService, { Load, LoadStatus } from '@/services/loadService';
import offerService, { OfferRequest, VehicleInfo } from '@/services/offerService';
import vehicleService from '@/services/vehicleService';

export default function AvailableLoadsPage() {
    const [loads, setLoads] = useState<Load[]>([]);
    const [vehicles, setVehicles] = useState<VehicleInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    // Teklif form state
    const [offerForm, setOfferForm] = useState({
        price: '',
        vehicleId: '',
        insuranceAccepted: false,
        notes: ''
    });

    const { toast } = useToast();

    useEffect(() => {
        fetchAvailableLoads();
        fetchUserVehicles();
    }, []);

    const fetchAvailableLoads = async () => {
        try {
            setLoading(true);
            const response = await loadService.getAvailableLoadsForOffers(0, 50);
            setLoads(response.content);
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Yükler yüklenirken bir hata oluştu.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchUserVehicles = async () => {
        try {
            const userVehicles = await vehicleService.getVehiclesForOffers();
            setVehicles(userVehicles);
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Araçlar yüklenirken bir hata oluştu.',
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
            setSubmitting(true);

            const selectedVehicle = vehicles.find(v => v.id === offerForm.vehicleId);
            if (!selectedVehicle) {
                throw new Error('Seçilen araç bulunamadı');
            }

            const offerData: OfferRequest = {
                loadId: selectedLoad.id,
                carrierId: '', // Backend'de current user'dan alınacak
                vehicleId: offerForm.vehicleId,
                price: parseFloat(offerForm.price),
                insuranceAccepted: offerForm.insuranceAccepted,
                isEcoFriendly: selectedVehicle.ecoCertified
            };

            await offerService.createOffer(offerData);

            toast({
                title: 'Başarılı!',
                description: 'Teklifiniz başarıyla gönderildi.',
                variant: 'default',
            });

            setIsOfferModalOpen(false);
            resetOfferForm();
            fetchAvailableLoads(); // Listeyi yenile

        } catch (error: any) {
            toast({
                title: 'Hata',
                description: error.message || 'Teklif gönderilirken bir hata oluştu.',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const resetOfferForm = () => {
        setOfferForm({
            price: '',
            vehicleId: '',
            insuranceAccepted: false,
            notes: ''
        });
        setSelectedLoad(null);
    };

    const openOfferModal = (load: Load) => {
        setSelectedLoad(load);
        setIsOfferModalOpen(true);
    };

    const getSelectedVehicle = () => {
        return vehicles.find(v => v.id === offerForm.vehicleId);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Yükler yükleniyor...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Mevcut Yükler</h1>
                <p className="text-muted-foreground">
                    Teklif verebileceğiniz yükler aşağıda listelenmiştir.
                </p>
            </div>

            {loads.length === 0 ? (
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
                    {loads.map((load) => (
                        <Card key={load.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="truncate">{load.title}</span>
                                    {load.insuranceRequested && (
                                        <Badge variant="secondary">
                                            <Shield className="h-3 w-3 mr-1" />
                                            Sigortalı
                                        </Badge>
                                    )}
                                </CardTitle>
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
                                        {formatDate(load.loadingDate)} - {formatDate(load.deliveryDate)}
                                    </div>
                                </div>

                                {load.estimatedCarbonFootprint > 0 && (
                                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                                        <div className="flex items-center">
                                            <Leaf className="h-4 w-4 text-green-600 mr-2" />
                                            <span className="text-sm text-green-700">
                                                Karbon Ayak İzi
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-green-800">
                                            {load.estimatedCarbonFootprint} ton CO₂
                                        </span>
                                    </div>
                                )}

                                {load.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {load.description}
                                    </p>
                                )}

                                <Dialog open={isOfferModalOpen} onOpenChange={setIsOfferModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="w-full"
                                            onClick={() => openOfferModal(load)}
                                        >
                                            <TruckIcon className="h-4 w-4 mr-2" />
                                            Teklif Ver
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Teklif Ver</DialogTitle>
                                        </DialogHeader>

                                        {selectedLoad && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-muted rounded-lg">
                                                    <h4 className="font-semibold">{selectedLoad.title}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedLoad.netWeight} kg - {selectedLoad.goodsType}
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="vehicle">Araç Seçin</Label>
                                                    <Select
                                                        value={offerForm.vehicleId}
                                                        onValueChange={(value) =>
                                                            setOfferForm(prev => ({ ...prev, vehicleId: value }))
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Araç seçin..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {vehicles.map((vehicle) => (
                                                                <SelectItem key={vehicle.id} value={vehicle.id}>
                                                                    <div className="flex items-center">
                                                                        <span>{vehicle.plateNumber} - {vehicle.type}</span>
                                                                        {vehicle.ecoCertified && (
                                                                            <Leaf className="h-3 w-3 ml-2 text-green-600" />
                                                                        )}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {getSelectedVehicle()?.ecoCertified && (
                                                    <div className="p-3 bg-green-50 rounded-lg">
                                                        <div className="flex items-center">
                                                            <Leaf className="h-4 w-4 text-green-600 mr-2" />
                                                            <span className="text-sm text-green-700 font-medium">
                                                                Çevreci Araç Seçtiniz!
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-green-600 mt-1">
                                                            Bu araç daha az karbon emisyonu üretir.
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <Label htmlFor="price">Teklif Fiyatı (TL)</Label>
                                                    <Input
                                                        id="price"
                                                        type="number"
                                                        placeholder="Örn: 1500"
                                                        value={offerForm.price}
                                                        onChange={(e) =>
                                                            setOfferForm(prev => ({ ...prev, price: e.target.value }))
                                                        }
                                                    />
                                                </div>

                                                {selectedLoad.insuranceRequested && (
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="insurance"
                                                            checked={offerForm.insuranceAccepted}
                                                            onChange={(e) =>
                                                                setOfferForm(prev => ({
                                                                    ...prev,
                                                                    insuranceAccepted: e.target.checked
                                                                }))
                                                            }
                                                        />
                                                        <Label htmlFor="insurance">
                                                            Sigorta şartlarını kabul ediyorum
                                                        </Label>
                                                    </div>
                                                )}

                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsOfferModalOpen(false)}
                                                        className="flex-1"
                                                    >
                                                        İptal
                                                    </Button>
                                                    <Button
                                                        onClick={handleOfferSubmit}
                                                        disabled={submitting}
                                                        className="flex-1"
                                                    >
                                                        {submitting ? (
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
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}