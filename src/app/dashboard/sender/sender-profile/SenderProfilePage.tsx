// src/components/dashboard/sender/SenderProfilePage.tsx
"use client"

import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";

// Local User type with phone property
type UserWithPhone = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: 'ADMIN' | 'SENDER' | 'CARRIER' | 'BROKER';
    emailVerified?: boolean;
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, X, Building2, User, FileText, Mail, Phone, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import senderService from '@/services/senderService';

export default function SenderProfilePage() {
    const { user } = useAuth();
    const { t } = useLanguage();

    // Type assertion for user with phone
    const userWithPhone = user as UserWithPhone;

    // Form state
    const [formData, setFormData] = useState({
        company: false,
        companyName: '',
        productionTypes: [] as string[],
        certificates: [] as string[],
        certificateFiles: [] as File[],
        phone: '',
        email: '',
        billingInfo: ''
    });

    // UI state
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [hasExistingProfile, setHasExistingProfile] = useState(false);
    const [currentProfileId, setCurrentProfileId] = useState<string | null>(null); // BURADA DEĞİŞİKLİK

    // Predefined data
    const productionTypeOptions = [
        'Gıda Üretimi',
        'Tekstil Üretimi',
        'Otomotiv Parçaları',
        'Elektronik Cihazlar',
        'İnşaat Malzemeleri',
        'Kimyasal Ürünler',
        'Metal İşleme',
        'Plastik Ürünler',
        'Cam Ürünleri',
        'Mobilya Üretimi'
    ];

    const certificateOptions = [
        'ISO 9001',
        'ISO 14001',
        'ISO 45001',
        'TSE',
        'CE Belgesi',
        'FDA Onayı',
        'Helal Sertifikası',
        'Organik Sertifikası',
        'HACCP',
        'BRC Sertifikası'
    ];

    // Load existing profile
    // Load existing profile
    useEffect(() => {
        const loadProfile = async () => {
            if (!userWithPhone?.id) return;

            try {
                setIsLoading(true);
                const profile = await senderService.getSenderProfileByUserId(userWithPhone.id);

                setFormData({
                    company: profile.company,
                    companyName: profile.companyName || '',
                    productionTypes: profile.productionTypes || [],
                    certificates: profile.certificates || [],
                    certificateFiles: [],
                    phone: profile.phone || userWithPhone.phone || '', // ✅ Backend'den gelen phone
                    email: profile.email || userWithPhone.email || '', // ✅ Backend'den gelen email
                    billingInfo: profile.billingInfo || ''
                });
                setHasExistingProfile(true);
                setCurrentProfileId(profile.id);
            } catch (error) {
                console.log('No existing profile found, creating new one');
                setFormData(prev => ({
                    ...prev,
                    phone: userWithPhone?.phone || '',
                    email: userWithPhone?.email || ''
                }));
                setHasExistingProfile(false);
                setCurrentProfileId(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [userWithPhone]);

    // Handle form changes
    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleProductionTypeAdd = (type: string) => {
        if (!formData.productionTypes.includes(type)) {
            setFormData(prev => ({
                ...prev,
                productionTypes: [...prev.productionTypes, type]
            }));
        }
    };

    const handleProductionTypeRemove = (type: string) => {
        console.log('Removing production type:', type); // Debug için
        setFormData(prev => ({
            ...prev,
            productionTypes: prev.productionTypes.filter(t => t !== type)
        }));
        setError(''); // Hata mesajını temizle
    };

    const handleCertificateRemove = (cert: string) => {
        console.log('Removing certificate:', cert); // Debug için
        setFormData(prev => ({
            ...prev,
            certificates: prev.certificates.filter(c => c !== cert)
        }));
        setError(''); // Hata mesajını temizle
    };

    const handleCertificateAdd = (cert: string) => {
        if (!formData.certificates.includes(cert)) {
            setFormData(prev => ({
                ...prev,
                certificates: [...prev.certificates, cert]
            }));
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        // Dosya tipini kontrol et
        const invalidFiles = files.filter(file =>
            !file.type.includes('pdf') &&
            !file.type.startsWith('image/')
        );

        if (invalidFiles.length > 0) {
            setError('Sadece PDF ve resim dosyaları yüklenebilir');
            return;
        }

        // Dosyaları formData'ya ekle (şimdilik local'de tutuyoruz)
        setFormData(prev => ({
            ...prev,
            certificateFiles: [...prev.certificateFiles, ...files]
        }));

        // Input'u temizle
        event.target.value = '';
    };

    const handleFileRemove = (index: number) => {
        setFormData(prev => ({
            ...prev,
            certificateFiles: prev.certificateFiles.filter((_, i) => i !== index)
        }));
    };

    // Save profile
    const handleSave = async () => {
        if (!userWithPhone?.id) {
            setError(t('senderProfile.userNotFound'));
            return;
        }

        try {
            setIsSaving(true);
            setError('');

            const profileData = {
                userId: userWithPhone.id,
                company: formData.company,
                companyName: formData.companyName,
                productionTypes: formData.productionTypes,
                certificates: formData.certificates,
                billingInfo: formData.billingInfo,
                phone: formData.phone,
                email: formData.email
            };

            let savedProfile;
            if (hasExistingProfile && currentProfileId) {
                savedProfile = await senderService.updateSenderProfile(currentProfileId, profileData);
            } else {
                savedProfile = await senderService.createSenderProfile(profileData);
                setHasExistingProfile(true);
                setCurrentProfileId(savedProfile.id);
            }

            // Dosya yükleme işlemi
            if (formData.certificateFiles.length > 0) {
                try {
                    await senderService.uploadCertificateFiles(
                        savedProfile.id || currentProfileId!,
                        formData.certificateFiles
                    );
                    // Dosyalar yüklendikten sonra local files'ı temizle
                    setFormData(prev => ({
                        ...prev,
                        certificateFiles: []
                    }));
                } catch (fileError) {
                    console.error('File upload error:', fileError);
                    setError('Profil kaydedildi ancak dosya yükleme başarısız oldu');
                }
            }

            setSuccess(t('senderProfile.saved'));
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            console.error('Save error:', error);
            setError(error.response?.data?.message || t('senderProfile.error'));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-gray-600">{t('senderProfile.loading')}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {t('senderProfile.title')}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Profil bilgilerinizi güncelleyin ve hesabınızı yönetin
                        </p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('senderProfile.saving')}
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                {t('senderProfile.save')}
                            </>
                        )}
                    </Button>
                </div>

                {/* Alerts */}
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mb-4 border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="space-y-6">
                {/* User Type Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {t('senderProfile.userType.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={formData.company ? "company" : "individual"}
                            onValueChange={(value) => handleInputChange('company', value === 'company')}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                <RadioGroupItem value="individual" id="individual" />
                                <Label htmlFor="individual" className="flex items-center gap-2 cursor-pointer">
                                    <User className="h-4 w-4" />
                                    {t('senderProfile.userType.individual')}
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                <RadioGroupItem value="company" id="company" />
                                <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer">
                                    <Building2 className="h-4 w-4" />
                                    {t('senderProfile.userType.company')}
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Company Information */}
                {formData.company && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                {t('senderProfile.companyInfo.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Company Name */}
                            <div className="space-y-2">
                                <Label htmlFor="companyName">
                                    {t('senderProfile.companyInfo.companyNameRequired')}
                                </Label>
                                <Input
                                    id="companyName"
                                    value={formData.companyName}
                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    placeholder={t('senderProfile.companyInfo.companyNamePlaceholder')}
                                    required
                                />
                            </div>

                            <Separator />

                            {/* Production Types */}
                            <div className="space-y-3">
                                <Label>{t('senderProfile.companyInfo.productionTypes')}</Label>
                                <Select onValueChange={handleProductionTypeAdd}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('senderProfile.companyInfo.productionTypesPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productionTypeOptions.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {formData.productionTypes.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.productionTypes.map((type) => (
                                            <Badge key={type} variant="secondary" className="flex items-center gap-1">
                                                {type}
                                                <X
                                                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                                                    onClick={() => handleProductionTypeRemove(type)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Certificates */}
                            <div className="space-y-3">
                                <Label>{t('senderProfile.companyInfo.certificates')}</Label>
                                <Select onValueChange={handleCertificateAdd}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('senderProfile.companyInfo.certificatesPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {certificateOptions.map((cert) => (
                                            <SelectItem key={cert} value={cert}>
                                                {cert}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {formData.certificates.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.certificates.map((cert) => (
                                            <Badge key={cert} variant="outline" className="flex items-center gap-1">
                                                {cert}
                                                <X
                                                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                                                    onClick={() => handleCertificateRemove(cert)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Certificate Files */}
                            <div className="space-y-3">
                                <Label>{t('senderProfile.companyInfo.certificateFiles')}</Label>
                                <div>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="certificateFiles"
                                    />
                                    <Label
                                        htmlFor="certificateFiles"
                                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                                    >
                                        <Upload className="h-4 w-4" />
                                        {t('senderProfile.companyInfo.selectFile')}
                                    </Label>
                                </div>

                                {formData.certificateFiles.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.certificateFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm">{file.name}</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleFileRemove(index)}
                                                    className="h-6 w-6 p-0 hover:bg-red-100"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="h-5 w-5" />
                            {t('senderProfile.contactInfo.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('senderProfile.contactInfo.phone')}</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder={t('senderProfile.contactInfo.phonePlaceholder')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">{t('senderProfile.contactInfo.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder={t('senderProfile.contactInfo.emailPlaceholder')}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Billing Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('senderProfile.billingInfo.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="billingInfo">Fatura Bilgileri</Label>
                            <Textarea
                                id="billingInfo"
                                value={formData.billingInfo}
                                onChange={(e) => handleInputChange('billingInfo', e.target.value)}
                                placeholder={t('senderProfile.billingInfo.placeholder')}
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}