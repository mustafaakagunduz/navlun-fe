"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Loader2,
    User,
    Building,
    Phone,
    Mail,
    MapPin,
    FileText,
    Award,
    Leaf,
    Save,
    Edit,
    X,
    CheckCircle,
    TrendingUp,
    DollarSign
} from "lucide-react";
import brokerService, { BrokerProfile } from "@/services/brokerService";
import { formatDate, formatDateTime, formatTime } from '@/utils/dateUtils';
import AccountTypeChangeSection from '@/components/AccountTypeChangeSection';

export default function BrokerProfilePage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [brokerProfile, setBrokerProfile] = useState<BrokerProfile | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        taxNumber: '',
        specialization: '',
        phoneNumber: '',
        address: '',
        companyRegistrationNumber: '',
        licenseNumber: '',
        ecoFriendlyCertified: false,
        active: true
    });

    // Giriş yapmamış veya broker olmayan kullanıcıları yönlendir
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'BROKER')) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    // Broker profilini yükle
    useEffect(() => {
        const loadBrokerProfile = async () => {
            if (!user?.id) return;

            try {
                setDataLoading(true);
                const profile = await brokerService.getBrokerProfileByUserId(user.id);
                setBrokerProfile(profile);

                // Form data'yı doldur
                setFormData({
                    name: profile.companyName || '',
                    taxNumber: profile.taxNumber || '',
                    specialization: profile.specializations?.join(', ') || '',
                    phoneNumber: user.phone || '',
                    address: '',
                    companyRegistrationNumber: profile.companyRegistrationNumber || '',
                    licenseNumber: profile.licenseNumber || '',
                    ecoFriendlyCertified: profile.ecoFriendlyCertified || false,
                    active: true
                });
            } catch (error) {
                console.error('Broker profili yüklenirken hata:', error);
            } finally {
                setDataLoading(false);
            }
        };

        if (user?.id && user?.role === 'BROKER') {
            loadBrokerProfile();
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSave = async () => {
        if (!brokerProfile?.id) return;

        try {
            setIsSaving(true);

            const updateData = {
                name: formData.name,
                taxNumber: formData.taxNumber || undefined,
                specialization: formData.specialization || undefined,
                phoneNumber: formData.phoneNumber || undefined,
                address: formData.address || undefined,
                companyRegistrationNumber: formData.companyRegistrationNumber || undefined,
                licenseNumber: formData.licenseNumber || undefined,
                ecoFriendlyCertified: formData.ecoFriendlyCertified,
                active: formData.active
            };

            await brokerService.updateBrokerProfile(brokerProfile.id, updateData);

            // Profili yeniden yükle
            const updatedProfile = await brokerService.getBrokerProfileByUserId(user!.id);
            setBrokerProfile(updatedProfile);
            setIsEditing(false);
        } catch (error) {
            console.error('Profil güncellenirken hata:', error);
            alert('Profil güncellenirken bir hata oluştu');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (brokerProfile) {
            setFormData({
                name: brokerProfile.companyName || '',
                taxNumber: brokerProfile.taxNumber || '',
                specialization: brokerProfile.specializations?.join(', ') || '',
                phoneNumber: user?.phone || '',
                address: '',
                companyRegistrationNumber: brokerProfile.companyRegistrationNumber || '',
                licenseNumber: brokerProfile.licenseNumber || '',
                ecoFriendlyCertified: brokerProfile.ecoFriendlyCertified || false,
                active: true
            });
        }
        setIsEditing(false);
    };

    // Yükleme durumunda gösterilecek içerik
    if (isLoading || dataLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                    <p className="text-green-600 font-medium">Profil yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!brokerProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="text-center">
                    <p className="text-red-600 font-medium">Broker profili bulunamadı</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['BROKER']}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                Broker Profili
                            </h1>
                            <p className="text-gray-600 mt-2 text-lg">Profilinizi görüntüleyin ve düzenleyin</p>
                        </div>
                        <div>
                            {!isEditing ? (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Düzenle
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        Kaydet
                                    </Button>
                                    <Button
                                        onClick={handleCancel}
                                        variant="outline"
                                        disabled={isSaving}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        İptal
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="shadow-lg border-l-4 border-l-amber-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Toplam Anlaşma</p>
                                        <p className="text-3xl font-bold text-amber-600">
                                            {brokerProfile.facilitatedDeals}
                                        </p>
                                    </div>
                                    <TrendingUp className="h-12 w-12 text-amber-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Çevreci Anlaşma</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {brokerProfile.ecoFriendlyDeals}
                                        </p>
                                    </div>
                                    <Leaf className="h-12 w-12 text-green-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-purple-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Toplam Komisyon</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ₺{Number(brokerProfile.totalCommissionEarned || 0).toLocaleString('tr-TR')}
                                        </p>
                                    </div>
                                    <DollarSign className="h-12 w-12 text-purple-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Çevreci Oran</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            {brokerProfile.ecoFriendlyDealPercentage?.toFixed(0) || 0}%
                                        </p>
                                    </div>
                                    <Leaf className="h-12 w-12 text-blue-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-amber-600" />
                                    Temel Bilgiler
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">İsim / Şirket Adı *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email">E-posta</Label>
                                    <div className="flex items-center gap-2 mt-1 p-2 bg-gray-100 rounded-lg">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-700">{user?.email}</span>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="phoneNumber">Telefon</Label>
                                    <Input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="mt-1"
                                        placeholder="+90 5XX XXX XX XX"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="address">Adres</Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="mt-1"
                                        rows={3}
                                        placeholder="Şirket adresi"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Professional Information */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5 text-amber-600" />
                                    Profesyonel Bilgiler
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="taxNumber">Vergi Numarası</Label>
                                    <Input
                                        id="taxNumber"
                                        name="taxNumber"
                                        value={formData.taxNumber}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="mt-1"
                                        placeholder="XXXXXXXXXX"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="companyRegistrationNumber">Şirket Kayıt Numarası</Label>
                                    <Input
                                        id="companyRegistrationNumber"
                                        name="companyRegistrationNumber"
                                        value={formData.companyRegistrationNumber}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="mt-1"
                                        placeholder="Ticaret sicil numarası"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="licenseNumber">Lisans Numarası</Label>
                                    <Input
                                        id="licenseNumber"
                                        name="licenseNumber"
                                        value={formData.licenseNumber}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="mt-1"
                                        placeholder="Broker lisans numarası"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="specialization">Uzmanlık Alanı</Label>
                                    <Textarea
                                        id="specialization"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="mt-1"
                                        rows={3}
                                        placeholder="Örn: Konteyner, Dökme yük, Proje yükü"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Certifications */}
                        <Card className="shadow-lg lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-amber-600" />
                                    Sertifikalar ve Ayarlar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-3">
                                        <Leaf className="h-6 w-6 text-green-600" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Çevreci Sertifikası</p>
                                            <p className="text-sm text-gray-600">Çevre dostu broker olarak işaretlenin</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={formData.ecoFriendlyCertified}
                                        onCheckedChange={(checked) => handleSwitchChange('ecoFriendlyCertified', checked)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-6 w-6 text-blue-600" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Aktif Durum</p>
                                            <p className="text-sm text-gray-600">Profil aktif/pasif durumu</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={formData.active}
                                        onCheckedChange={(checked) => handleSwitchChange('active', checked)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                {brokerProfile.certificates && brokerProfile.certificates.length > 0 && (
                                    <div>
                                        <Label className="mb-3 block">Mevcut Sertifikalar</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {brokerProfile.certificates.map((cert, index) => (
                                                <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700">
                                                    {cert}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {brokerProfile.commissionRate && (
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="flex items-center gap-3">
                                            <DollarSign className="h-6 w-6 text-purple-600" />
                                            <div>
                                                <p className="font-semibold text-gray-900">Komisyon Oranı</p>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    %{brokerProfile.commissionRate}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Hesap Türü Değiştirme Bölümü */}
                    <div className="mt-8">
                        <AccountTypeChangeSection />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
