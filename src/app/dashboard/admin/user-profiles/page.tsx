"use client"

import { useEffect, useState } from 'react';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Loader2,
    Users,
    Truck,
    Ship,
    Building,
    Mail,
    Phone,
    MapPin,
    FileText,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    Anchor,
    Leaf,
    Star,
    Target,
    DollarSign
} from "lucide-react";
import apiService from "@/services/apiService";

type SenderProfile = {
    id: string;
    userId: string;
    company: boolean;
    companyName: string;
    productionTypes: string[];
    certificates: string[];
    billingInfo: string;
    totalShipments: number;
    ecoFriendlyShipments: number;
    createdAt: string;
    updatedAt: string;
    phone: string;
    email: string;
};

type CarrierProfile = {
    id: string;
    userId: string;
    company: boolean;
    name: string;
    taxNumber: string;
    iban: string;
    isEcoFriendly: boolean;
    driverLicense: string;
    averageRating: number;
    completedDeliveries: number;
    createdAt: string;
    updatedAt: string;
};

type BrokerProfile = {
    id: string;
    userId: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    company: boolean;
    name: string;
    taxNumber: string;
    specialization: string;
    phoneNumber: string;
    address: string;
    facilitatedDeals: number;
    ecoFriendlyDeals: number;
    totalCommissionEarned: number;
    commissionRate: number;
    averageRating: number;
    companyRegistrationNumber: string;
    licenseNumber: string;
    active: boolean;
    ecoFriendlyCertified: boolean;
    ecoFriendlyDealPercentage: number;
    createdAt: string;
    updatedAt: string;
};

export default function UserProfilesPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [senders, setSenders] = useState<SenderProfile[]>([]);
    const [carriers, setCarriers] = useState<CarrierProfile[]>([]);
    const [brokers, setBrokers] = useState<BrokerProfile[]>([]);

    useEffect(() => {
        const fetchProfiles = async () => {
            setIsLoading(true);
            try {
                const [sendersData, carriersData, brokersData] = await Promise.all([
                    apiService.get<SenderProfile[]>('/sender-profiles'),
                    apiService.get<CarrierProfile[]>('/carrier-profiles'),
                    apiService.get<BrokerProfile[]>('/broker-profiles')
                ]);

                setSenders(sendersData || []);
                setCarriers(carriersData || []);
                setBrokers(brokersData || []);
            } catch (error) {
                console.error('Error fetching profiles:', error);
                setSenders([]);
                setCarriers([]);
                setBrokers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfiles();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                    <p className="text-green-600 font-medium">Profiller yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Kullanıcı Profilleri</h1>
                        <p className="text-gray-600">Tüm kullanıcı profillerini görüntüleyin ve yönetin</p>
                    </div>

                    {/* Statistics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="shadow-lg border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Toplam Gönderici</p>
                                        <p className="text-3xl font-bold text-blue-600">{senders.length}</p>
                                    </div>
                                    <Building className="h-12 w-12 text-blue-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-purple-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Toplam Taşıyıcı</p>
                                        <p className="text-3xl font-bold text-purple-600">{carriers.length}</p>
                                    </div>
                                    <Truck className="h-12 w-12 text-purple-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-amber-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Toplam Broker</p>
                                        <p className="text-3xl font-bold text-amber-600">{brokers.length}</p>
                                    </div>
                                    <Ship className="h-12 w-12 text-amber-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs for different user types */}
                    <Tabs defaultValue="senders" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="senders" className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Gönderici Profilleri ({senders.length})
                            </TabsTrigger>
                            <TabsTrigger value="carriers" className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Taşıyıcı Profilleri ({carriers.length})
                            </TabsTrigger>
                            <TabsTrigger value="brokers" className="flex items-center gap-2">
                                <Ship className="h-4 w-4" />
                                Broker Profilleri ({brokers.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Senders Tab */}
                        <TabsContent value="senders">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {senders.length === 0 ? (
                                    <Card className="col-span-2">
                                        <CardContent className="p-12 text-center">
                                            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">Henüz kayıtlı gönderici bulunmuyor</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    senders.map((sender) => (
                                        <Card key={sender.id} className="shadow-lg hover:shadow-xl transition-shadow">
                                            <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
                                                            <Building className="h-5 w-5" />
                                                            {sender.companyName || 'Şirket Adı Belirtilmemiş'}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {sender.company ? (
                                                                <Badge className="bg-blue-100 text-blue-700">Kurumsal</Badge>
                                                            ) : (
                                                                <Badge className="bg-gray-100 text-gray-700">Bireysel</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-6 space-y-4">
                                                {/* Contact Info */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-4 w-4 text-gray-500" />
                                                        <span className="text-gray-700">{sender.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="h-4 w-4 text-gray-500" />
                                                        <span className="text-gray-700">{sender.phone || 'Belirtilmemiş'}</span>
                                                    </div>
                                                </div>

                                                {/* Production Types */}
                                                {sender.productionTypes && sender.productionTypes.length > 0 && (
                                                    <div className="pt-2 border-t">
                                                        <p className="text-xs font-semibold text-gray-600 mb-2">Üretim Tipleri:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {sender.productionTypes.map((type, idx) => (
                                                                <Badge key={idx} variant="outline" className="text-xs bg-blue-50">
                                                                    {type}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Certificates */}
                                                {sender.certificates && sender.certificates.length > 0 && (
                                                    <div className="pt-2 border-t">
                                                        <p className="text-xs font-semibold text-gray-600 mb-2">Sertifikalar:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {sender.certificates.map((cert, idx) => (
                                                                <Badge key={idx} variant="outline" className="text-xs bg-green-50 text-green-700">
                                                                    {cert}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Shipment Statistics */}
                                                <div className="pt-2 border-t">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-blue-50 p-3 rounded">
                                                            <p className="text-xs text-gray-600">Toplam Gönderi</p>
                                                            <p className="text-lg font-bold text-blue-600">{sender.totalShipments}</p>
                                                        </div>
                                                        <div className="bg-green-50 p-3 rounded">
                                                            <p className="text-xs text-gray-600">Çevre Dostu</p>
                                                            <p className="text-lg font-bold text-green-600">{sender.ecoFriendlyShipments}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Billing Info */}
                                                {sender.billingInfo && (
                                                    <div className="pt-2 border-t">
                                                        <p className="text-xs font-semibold text-gray-600 mb-1">Fatura Bilgisi:</p>
                                                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{sender.billingInfo}</p>
                                                    </div>
                                                )}

                                                {/* Dates */}
                                                <div className="flex items-center gap-2 text-sm pt-2 border-t">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-500 text-xs">Kayıt: {formatDate(sender.createdAt)}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        {/* Carriers Tab */}
                        <TabsContent value="carriers">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {carriers.length === 0 ? (
                                    <Card className="col-span-2">
                                        <CardContent className="p-12 text-center">
                                            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">Henüz kayıtlı taşıyıcı bulunmuyor</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    carriers.map((carrier) => (
                                        <Card key={carrier.id} className="shadow-lg hover:shadow-xl transition-shadow">
                                            <CardHeader className="bg-gradient-to-r from-purple-50 to-white">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
                                                            <Truck className="h-5 w-5" />
                                                            {carrier.name || 'İsim Belirtilmemiş'}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {carrier.company ? (
                                                                <Badge className="bg-purple-100 text-purple-700">Kurumsal</Badge>
                                                            ) : (
                                                                <Badge className="bg-gray-100 text-gray-700">Bireysel</Badge>
                                                            )}
                                                            {carrier.isEcoFriendly && (
                                                                <Badge className="bg-green-100 text-green-700">
                                                                    <Leaf className="h-3 w-3 mr-1" />
                                                                    Çevre Dostu
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-6 space-y-4">
                                                {/* Tax and License Info */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <FileText className="h-4 w-4 text-gray-500" />
                                                        <span className="text-gray-700">Vergi No: {carrier.taxNumber || 'Belirtilmemiş'}</span>
                                                    </div>
                                                    {carrier.driverLicense && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <FileText className="h-4 w-4 text-gray-500" />
                                                            <span className="text-gray-700">Ehliyet: {carrier.driverLicense}</span>
                                                        </div>
                                                    )}
                                                    {carrier.iban && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <DollarSign className="h-4 w-4 text-gray-500" />
                                                            <span className="text-gray-700">IBAN: {carrier.iban}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Performance Stats */}
                                                <div className="pt-2 border-t">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-purple-50 p-3 rounded">
                                                            <p className="text-xs text-gray-600">Tamamlanan</p>
                                                            <p className="text-lg font-bold text-purple-600">{carrier.completedDeliveries || 0}</p>
                                                        </div>
                                                        <div className="bg-amber-50 p-3 rounded">
                                                            <p className="text-xs text-gray-600">Ortalama Puan</p>
                                                            <p className="text-lg font-bold text-amber-600 flex items-center gap-1">
                                                                <Star className="h-4 w-4 fill-amber-500" />
                                                                {carrier.averageRating?.toFixed(1) || '0.0'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Dates */}
                                                <div className="flex items-center gap-2 text-sm pt-2 border-t">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-500 text-xs">Kayıt: {formatDate(carrier.createdAt)}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        {/* Brokers Tab */}
                        <TabsContent value="brokers">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {brokers.length === 0 ? (
                                    <Card className="col-span-2">
                                        <CardContent className="p-12 text-center">
                                            <Ship className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">Henüz kayıtlı broker bulunmuyor</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    brokers.map((broker) => (
                                        <Card key={broker.id} className="shadow-lg hover:shadow-xl transition-shadow">
                                            <CardHeader className="bg-gradient-to-r from-amber-50 to-white">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-xl text-amber-900 flex items-center gap-2">
                                                            <Ship className="h-5 w-5" />
                                                            {broker.name || 'İsim Belirtilmemiş'}
                                                        </CardTitle>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {broker.userFirstName} {broker.userLastName}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {broker.company ? (
                                                                <Badge className="bg-amber-100 text-amber-700">Kurumsal</Badge>
                                                            ) : (
                                                                <Badge className="bg-gray-100 text-gray-700">Bireysel</Badge>
                                                            )}
                                                            {broker.active ? (
                                                                <Badge className="bg-green-100 text-green-700">
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Aktif
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-red-100 text-red-700">
                                                                    <XCircle className="h-3 w-3 mr-1" />
                                                                    Pasif
                                                                </Badge>
                                                            )}
                                                            {broker.ecoFriendlyCertified && (
                                                                <Badge className="bg-green-100 text-green-700">
                                                                    <Leaf className="h-3 w-3 mr-1" />
                                                                    Çevre Sertifikalı
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-6 space-y-4">
                                                {/* Contact Info */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-4 w-4 text-gray-500" />
                                                        <span className="text-gray-700">{broker.userEmail}</span>
                                                    </div>
                                                    {broker.phoneNumber && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Phone className="h-4 w-4 text-gray-500" />
                                                            <span className="text-gray-700">{broker.phoneNumber}</span>
                                                        </div>
                                                    )}
                                                    {broker.address && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <MapPin className="h-4 w-4 text-gray-500" />
                                                            <span className="text-gray-700">{broker.address}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Business Info */}
                                                <div className="pt-2 border-t space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <FileText className="h-4 w-4 text-gray-500" />
                                                        <span className="text-gray-700">Vergi No: {broker.taxNumber || 'Belirtilmemiş'}</span>
                                                    </div>
                                                    {broker.specialization && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Target className="h-4 w-4 text-gray-500" />
                                                            <span className="text-gray-700">Uzmanlık: {broker.specialization}</span>
                                                        </div>
                                                    )}
                                                    {broker.licenseNumber && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <FileText className="h-4 w-4 text-gray-500" />
                                                            <span className="text-gray-700">Lisans No: {broker.licenseNumber}</span>
                                                        </div>
                                                    )}
                                                    {broker.companyRegistrationNumber && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <FileText className="h-4 w-4 text-gray-500" />
                                                            <span className="text-gray-700">Ticaret Sicil: {broker.companyRegistrationNumber}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Performance Stats */}
                                                <div className="pt-2 border-t">
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <div className="bg-amber-50 p-3 rounded">
                                                            <p className="text-xs text-gray-600">Anlaşma Sayısı</p>
                                                            <p className="text-lg font-bold text-amber-600">{broker.facilitatedDeals || 0}</p>
                                                        </div>
                                                        <div className="bg-green-50 p-3 rounded">
                                                            <p className="text-xs text-gray-600">Çevre Dostu</p>
                                                            <p className="text-lg font-bold text-green-600">{broker.ecoFriendlyDeals || 0}</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-purple-50 p-3 rounded">
                                                            <p className="text-xs text-gray-600">Komisyon Oranı</p>
                                                            <p className="text-lg font-bold text-purple-600">%{broker.commissionRate?.toFixed(1) || '0'}</p>
                                                        </div>
                                                        <div className="bg-blue-50 p-3 rounded">
                                                            <p className="text-xs text-gray-600">Ortalama Puan</p>
                                                            <p className="text-lg font-bold text-blue-600 flex items-center gap-1">
                                                                <Star className="h-4 w-4 fill-blue-500" />
                                                                {broker.averageRating?.toFixed(1) || '0.0'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Commission Earnings */}
                                                {broker.totalCommissionEarned > 0 && (
                                                    <div className="pt-2 border-t">
                                                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-3 rounded">
                                                            <p className="text-xs text-gray-600 mb-1">Toplam Komisyon Kazancı</p>
                                                            <p className="text-xl font-bold text-amber-600">
                                                                ₺{broker.totalCommissionEarned.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Eco Percentage */}
                                                {broker.ecoFriendlyDealPercentage > 0 && (
                                                    <div className="pt-2 border-t">
                                                        <p className="text-xs font-semibold text-gray-600 mb-2">Çevre Dostu Anlaşma Oranı</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1">
                                                                <Progress value={broker.ecoFriendlyDealPercentage} className="h-2" />
                                                            </div>
                                                            <span className="text-sm font-bold text-green-600">
                                                                %{broker.ecoFriendlyDealPercentage.toFixed(1)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dates */}
                                                <div className="flex items-center gap-2 text-sm pt-2 border-t">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-500 text-xs">Kayıt: {formatDate(broker.createdAt)}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </ProtectedRoute>
    );
}
