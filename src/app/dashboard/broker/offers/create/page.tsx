"use client"

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Suspense } from 'react';
import {
    ArrowLeft,
    Ship,
    Package,
    DollarSign,
    Calendar,
    Shield,
    Leaf,
    MapPin,
    Weight,
    Building2,
    Clock,
    AlertCircle,
    CheckCircle,
    Truck,
    Target,
    Calculator,
    FileText,
    Users,
    Globe,
    Anchor
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import loadService, { Load } from "@/services/loadService";
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
    fetchBrokerProfile
} from '@/store/slices/brokerSlice';
import {
    fetchAvailableShipsByBroker,
    setSelectedShip,
    clearAvailableShipsError
} from '@/store/slices/shipsSlice';
import {
    createBrokerOffer,
    clearCreateOfferError,
    clearCreateOfferSuccess,
    BrokerOfferRequest
} from '@/store/slices/brokerOffersSlice';



function BrokerOfferCreate() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const dispatch = useAppDispatch();

    // URL'den loadId'yi al
    const loadId = searchParams.get('loadId');

    // Redux state
    const { profile } = useAppSelector(state => state.broker);
    const {
        availableShips,
        availableShipsLoading,
        availableShipsError,
        selectedShip
    } = useAppSelector(state => state.ships);
    const {
        createOfferLoading,
        createOfferError,
        createOfferSuccess
    } = useAppSelector(state => state.brokerOffers);

    // Local state
    const [load, setLoad] = useState<Load | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form data
    const [formData, setFormData] = useState({
        shipId: '',
        freightRate: '',
        demurrageRate: '',
        despatchRate: '',
        estimatedLoadingDate: '',
        estimatedDeliveryDate: '',
        terms: '',
        notes: '',
        insuranceAccepted: false,
        ecoFriendly: false,
        commissionRate: '3.5', // Default %3.5
        validUntil: ''
    });

    // Form validation
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Redirect non-broker users
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'BROKER')) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    // Redirect if no loadId
    useEffect(() => {
        if (!loadId) {
            router.push('/dashboard/broker/available-loads');
        }
    }, [loadId, router]);

    const getDateString = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                // Invalid date, use today
                return new Date().toISOString().split('T')[0];
            }
            return date.toISOString().split('T')[0];
        } catch {
            return new Date().toISOString().split('T')[0];
        }
    };

    // Fetch load details and broker data
    useEffect(() => {
        const fetchData = async () => {
            if (!loadId || !user) return;

            setLoading(true);
            setError(null);

            try {
                // Load detaylarını getir
                const loadData = await loadService.getLoadById(loadId);
                setLoad(loadData);

                // Broker profilini getir (eğer yoksa)
                if (!profile) {
                    dispatch(fetchBrokerProfile());
                }

                // Müsait gemileri getir
                dispatch(fetchAvailableShipsByBroker());

                // Default dates
                const validUntilDate = new Date();
                validUntilDate.setDate(validUntilDate.getDate() + 7);

                setFormData(prev => ({
                    ...prev,
                    estimatedLoadingDate: getDateString(loadData.loadingDate),
                    estimatedDeliveryDate: getDateString(loadData.deliveryDate),
                    validUntil: validUntilDate.toISOString().split('T')[0],
                    insuranceAccepted: loadData.insuranceRequested,
                    ecoFriendly: loadData.ecoTransportRequested || false
                }));

            } catch (err: any) {
                setError(err.message || 'Veriler yüklenirken hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [loadId, user, profile, dispatch]);

    // Clear errors on unmount
    useEffect(() => {
        return () => {
            dispatch(clearAvailableShipsError());
            dispatch(clearCreateOfferError());
            dispatch(clearCreateOfferSuccess());
        };
    }, [dispatch]);

    // Redirect on success
    useEffect(() => {
        if (createOfferSuccess) {
            router.push('/dashboard/broker/offers?success=true');
        }
    }, [createOfferSuccess, router]);

    // Ship selection handler
    const handleShipSelect = (shipId: string) => {
        const ship = availableShips.find(s => s.id === shipId);
        dispatch(setSelectedShip(ship || null));
        setFormData(prev => ({
            ...prev,
            shipId,
            ecoFriendly: ship?.ecoFriendly || prev.ecoFriendly
        }));
    };

    // Gemileri filtreleyen fonksiyon ekleyin
    const getAvailableShips = () => {
        return availableShips.filter(ship => {
            // Frontend'de de aynı kontrolü yapalım
            if (!ship.available) return false;
            if (ship.nextAvailableDate) {
                const nextDate = new Date(ship.nextAvailableDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return nextDate <= today;
            }
            return true;
        });
    };

// Ship seçim kısmında availableShips yerine getAvailableShips() kullanın

    // Form validation
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.shipId) {
            errors.shipId = 'Gemi seçimi zorunludur';
        }

        if (!formData.freightRate || parseFloat(formData.freightRate) <= 0) {
            errors.freightRate = 'Geçerli bir navlun ücreti giriniz';
        }

        if (!formData.estimatedLoadingDate) {
            errors.estimatedLoadingDate = 'Tahmini yükleme tarihi zorunludur';
        }

        if (!formData.estimatedDeliveryDate) {
            errors.estimatedDeliveryDate = 'Tahmini teslimat tarihi zorunludur';
        }

        if (new Date(formData.estimatedDeliveryDate) <= new Date(formData.estimatedLoadingDate)) {
            errors.estimatedDeliveryDate = 'Teslimat tarihi yükleme tarihinden sonra olmalıdır';
        }

        if (!formData.commissionRate || parseFloat(formData.commissionRate) < 0 || parseFloat(formData.commissionRate) > 10) {
            errors.commissionRate = 'Komisyon oranı 0-10% arasında olmalıdır';
        }

        if (!formData.validUntil) {
            errors.validUntil = 'Geçerlilik tarihi zorunludur';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Calculate total amount
    const calculateTotalAmount = () => {
        const freight = parseFloat(formData.freightRate) || 0;
        const demurrage = parseFloat(formData.demurrageRate) || 0;
        const despatch = parseFloat(formData.despatchRate) || 0;
        return freight + demurrage + despatch;
    };

    // Calculate commission
    const calculateCommission = () => {
        const total = calculateTotalAmount();
        const rate = parseFloat(formData.commissionRate) || 0;
        return (total * rate) / 100;
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !load || !profile) return;

        const offerRequest: BrokerOfferRequest = {
            loadId: load.id,
            brokerProfileId: profile.id,
            shipId: formData.shipId,
            freightRate: parseFloat(formData.freightRate),
            demurrageRate: formData.demurrageRate ? parseFloat(formData.demurrageRate) : undefined,
            despatchRate: formData.despatchRate ? parseFloat(formData.despatchRate) : undefined,
            estimatedLoadingDate: formData.estimatedLoadingDate,
            estimatedDeliveryDate: formData.estimatedDeliveryDate,
            terms: formData.terms || undefined,
            notes: formData.notes || undefined,
            insuranceAccepted: formData.insuranceAccepted,
            ecoFriendly: formData.ecoFriendly,
            commissionRate: parseFloat(formData.commissionRate),
            validUntil: formData.validUntil
        };

        dispatch(createBrokerOffer(offerRequest));
    };

    // Format functions
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (isLoading || loading || availableShipsLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Ship className="h-8 w-8 animate-pulse mx-auto mb-4" />
                    <p>Teklif formu hazırlanıyor...</p>
                </div>
            </div>
        );
    }

    if (!load) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-red-800 mb-2">Yük Bulunamadı</h3>
                        <p className="text-red-600 mb-4">Belirtilen yük bilgilerine ulaşılamadı.</p>
                        <Button onClick={() => router.push('/dashboard/broker/available-loads')}>
                            Açık Yüklere Dön
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['BROKER']}>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Geri
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Teklif Ver</h1>
                        <p className="text-gray-600 mt-1">
                            Seçili yük için teklif oluşturun ve gönderin
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Load Details */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Yük Detayları
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{load.goodsType}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                        <Building2 className="h-4 w-4" />
                                        {load.sender?.companyName || 'Şirket bilgisi yok'}
                                    </div>
                                </div>

                                <Separator />

                                {/* Route */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Rota</Label>
                                    <div className="mt-1 space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-green-600" />
                                            <span className="font-medium">Yükleme:</span>
                                            <span>{load.loadingAddress}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-red-600" />
                                            <span className="font-medium">Teslimat:</span>
                                            <span>{load.deliveryAddress}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Tarihler</Label>
                                    <div className="mt-1 space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            <span className="font-medium">Yükleme:</span>
                                            <span>{formatDate(load.loadingDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-orange-600" />
                                            <span className="font-medium">Teslimat:</span>
                                            <span>{formatDate(load.deliveryDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Weight & Price */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Ağırlık</Label>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Weight className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm">{load.netWeight?.toLocaleString()} kg</span>
                                        </div>
                                    </div>
                                    {load.estimatedPrice && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Tahmini Fiyat</Label>
                                            <div className="flex items-center gap-1 mt-1">
                                                <DollarSign className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm">{formatPrice(load.estimatedPrice)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="flex flex-wrap gap-2">
                                    {load.insuranceRequested && (
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                            <Shield className="h-3 w-3 mr-1" />
                                            Sigorta Gerekli
                                        </Badge>
                                    )}
                                    {load.ecoTransportRequested && (
                                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                            <Leaf className="h-3 w-3 mr-1" />
                                            Çevreci Taşıma
                                        </Badge>
                                    )}
                                </div>

                                {load.description && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Açıklama</Label>
                                        <p className="text-sm text-gray-600 mt-1">{load.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Offer Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Ship Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Ship className="h-5 w-5" />
                                        Gemi Seçimi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="shipId">Gemi Seçin *</Label>
                                        <Select value={formData.shipId} onValueChange={handleShipSelect}>
                                            <SelectTrigger className={validationErrors.shipId ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Gemi seçiniz..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getAvailableShips().map((ship) => (
                                                    <SelectItem key={ship.id} value={ship.id}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{ship.name}</span>
                                                                <span className="text-sm text-gray-500">
                                                                    {ship.shipType} • {ship.deadweightTonnage.toLocaleString()} DWT
                                                                </span>
                                                            </div>
                                                            {ship.ecoFriendly && (
                                                                <Badge variant="secondary" className="bg-green-50 text-green-700 ml-2">
                                                                    <Leaf className="h-3 w-3 mr-1" />
                                                                    Çevreci
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {validationErrors.shipId && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.shipId}</p>
                                        )}
                                    </div>

                                    {/* Selected Ship Details */}
                                    {selectedShip && (
                                        <Card className="bg-amber-50 border-amber-200">
                                            <CardContent className="p-4">
                                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                    <Anchor className="h-4 w-4" />
                                                    {selectedShip.name} - Detaylar
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium">Tip:</span> {selectedShip.shipType}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">DWT:</span> {selectedShip.deadweightTonnage.toLocaleString()} ton
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Uzunluk:</span> {selectedShip.lengthOverall} m
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Yapım Yılı:</span> {selectedShip.buildYear}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Bayrak:</span> {selectedShip.flag}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Mevcut Liman:</span> {selectedShip.currentPort}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    {selectedShip.ecoFriendly && (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                            <Leaf className="h-3 w-3 mr-1" />
                                                            Çevre Dostu
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Pricing */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="h-5 w-5" />
                                        Fiyatlandırma
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="freightRate">Navlun Ücreti (₺) *</Label>
                                            <Input
                                                id="freightRate"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.freightRate}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    freightRate: e.target.value
                                                }))}
                                                className={validationErrors.freightRate ? 'border-red-500' : ''}
                                                placeholder="0.00"
                                            />
                                            {validationErrors.freightRate && (
                                                <p className="text-red-500 text-sm mt-1">{validationErrors.freightRate}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="demurrageRate">Demuraj Ücreti (₺)</Label>
                                            <Input
                                                id="demurrageRate"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.demurrageRate}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    demurrageRate: e.target.value
                                                }))}
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="despatchRate">Dispeç Ücreti (₺)</Label>
                                            <Input
                                                id="despatchRate"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.despatchRate}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    despatchRate: e.target.value
                                                }))}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="commissionRate">Komisyon Oranı (%) *</Label>
                                        <Input
                                            id="commissionRate"
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="10"
                                            value={formData.commissionRate}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                commissionRate: e.target.value
                                            }))}
                                            className={validationErrors.commissionRate ? 'border-red-500' : ''}
                                        />
                                        {validationErrors.commissionRate && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.commissionRate}</p>
                                        )}
                                    </div>

                                    {/* Price Summary */}
                                    <Card className="bg-gray-50 border-gray-200">
                                        <CardContent className="p-4">
                                            <h4 className="font-semibold mb-2">Fiyat Özeti</h4>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Navlun Ücreti:</span>
                                                    <span>{formatPrice(parseFloat(formData.freightRate) || 0)}</span>
                                                </div>
                                                {formData.demurrageRate && (
                                                    <div className="flex justify-between">
                                                        <span>Demuraj Ücreti:</span>
                                                        <span>{formatPrice(parseFloat(formData.demurrageRate))}</span>
                                                    </div>
                                                )}
                                                {formData.despatchRate && (
                                                    <div className="flex justify-between">
                                                        <span>Dispeç Ücreti:</span>
                                                        <span>{formatPrice(parseFloat(formData.despatchRate))}</span>
                                                    </div>
                                                )}
                                                <Separator />
                                                <div className="flex justify-between font-semibold">
                                                    <span>Toplam Tutar:</span>
                                                    <span>{formatPrice(calculateTotalAmount())}</span>
                                                </div>
                                                <div className="flex justify-between text-amber-600">
                                                    <span>Komisyon (%{formData.commissionRate}):</span>
                                                    <span>{formatPrice(calculateCommission())}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CardContent>
                            </Card>

                            {/* Dates */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Tarihler
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="estimatedLoadingDate">Tahmini Yükleme Tarihi *</Label>
                                            <Input
                                                id="estimatedLoadingDate"
                                                type="date"
                                                value={formData.estimatedLoadingDate}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    estimatedLoadingDate: e.target.value
                                                }))}
                                                className={validationErrors.estimatedLoadingDate ? 'border-red-500' : ''}
                                            />
                                            {validationErrors.estimatedLoadingDate && (
                                                <p className="text-red-500 text-sm mt-1">{validationErrors.estimatedLoadingDate}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="estimatedDeliveryDate">Tahmini Teslimat Tarihi *</Label>
                                            <Input
                                                id="estimatedDeliveryDate"
                                                type="date"
                                                value={formData.estimatedDeliveryDate}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    estimatedDeliveryDate: e.target.value
                                                }))}
                                                className={validationErrors.estimatedDeliveryDate ? 'border-red-500' : ''}
                                            />
                                            {validationErrors.estimatedDeliveryDate && (
                                                <p className="text-red-500 text-sm mt-1">{validationErrors.estimatedDeliveryDate}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="validUntil">Teklifin Geçerlilik Tarihi *</Label>
                                            <Input
                                                id="validUntil"
                                                type="date"
                                                value={formData.validUntil}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    validUntil: e.target.value
                                                }))}
                                                className={validationErrors.validUntil ? 'border-red-500' : ''}
                                            />
                                            {validationErrors.validUntil && (
                                                <p className="text-red-500 text-sm mt-1">{validationErrors.validUntil}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Options */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Seçenekler
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="insuranceAccepted"
                                            checked={formData.insuranceAccepted}
                                            onCheckedChange={(checked) => setFormData(prev => ({
                                                ...prev,
                                                insuranceAccepted: checked as boolean
                                            }))}
                                        />
                                        <Label htmlFor="insuranceAccepted" className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            Sigorta kabul edilir
                                            {load?.insuranceRequested && (
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                                    Gerekli
                                                </Badge>
                                            )}
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="ecoFriendly"
                                            checked={formData.ecoFriendly}
                                            onCheckedChange={(checked) => setFormData(prev => ({
                                                ...prev,
                                                ecoFriendly: checked as boolean
                                            }))}
                                        />
                                        <Label htmlFor="ecoFriendly" className="flex items-center gap-2">
                                            <Leaf className="h-4 w-4" />
                                            Çevreci taşımacılık
                                            {selectedShip?.ecoFriendly && (
                                                <Badge variant="secondary" className="bg-green-50 text-green-700">
                                                    Gemi uygun
                                                </Badge>
                                            )}
                                            {load?.ecoTransportRequested && (
                                                <Badge variant="secondary" className="bg-green-50 text-green-700">
                                                    Talep edilen
                                                </Badge>
                                            )}
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Terms and Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Şartlar ve Notlar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="terms">Şartlar ve Koşullar</Label>
                                        <Textarea
                                            id="terms"
                                            placeholder="Teklif şartlarınızı ve koşullarınızı belirtiniz..."
                                            value={formData.terms}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                terms: e.target.value
                                            }))}
                                            rows={4}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="notes">Ek Notlar</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Ek bilgiler, özel durumlar veya açıklamalar..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                notes: e.target.value
                                            }))}
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Error Display */}
                            {(error || createOfferError || availableShipsError) && (
                                <Card className="border-red-200 bg-red-50">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-red-800">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>{error || createOfferError || availableShipsError}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Submit Actions */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                Teklif gönderildikten sonra {formatDate(formData.validUntil)} tarihine kadar geçerli olacaktır
                                            </span>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.back()}
                                                disabled={createOfferLoading}
                                            >
                                                İptal
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={createOfferLoading || !formData.shipId || !formData.freightRate}
                                                className="bg-amber-600 hover:bg-amber-700"
                                            >
                                                {createOfferLoading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Gönderiliyor...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Teklifi Gönder
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Final Summary */}
                                    {formData.shipId && formData.freightRate && (
                                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                            <h4 className="font-semibold text-amber-800 mb-2">Teklif Özeti</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Gemi:</span>
                                                    <p className="font-medium">{selectedShip?.name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Toplam Tutar:</span>
                                                    <p className="font-medium">{formatPrice(calculateTotalAmount())}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Komisyon:</span>
                                                    <p className="font-medium">{formatPrice(calculateCommission())}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Geçerlilik:</span>
                                                    <p className="font-medium">{formatDate(formData.validUntil)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

// En altta, export default'tan önce:
function BrokerOfferCreatePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Ship className="h-8 w-8 animate-pulse mx-auto mb-4" />
                    <p>Sayfa yükleniyor...</p>
                </div>
            </div>
        }>
            <BrokerOfferCreate />
        </Suspense>
    );
}

export default BrokerOfferCreatePage;