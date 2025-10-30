// src/app/dashboard/sender/loads/new-load/NewLoadForm.tsx
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAppDispatch } from '@/hooks/redux'
import { createLoad } from '@/store/slices/loadsSlice'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    ArrowLeft,
    Save,
    Loader2,
    Package,
    MapPin,
    Calendar,
    Weight,
    FileText,
    Shield,
    Leaf,
    AlertCircle,
    CheckCircle2,
    Ship,
    Truck
} from "lucide-react";
import loadService, { LoadRequest, InsurancePolicy, TransportType } from '@/services/loadService';
import GoodsTypeSelect from "@/app/dashboard/sender/loads/new-load/GoodsTypeSelect";
import InsurancePolicyCard from "@/app/dashboard/sender/loads/new-load/InsurancePolicyCard";
import CarbonFootprintDisplay from "@/app/dashboard/sender/loads/new-load/CarbonFootprintDisplay";
import senderService from "@/services/senderService";
import { useToast } from '@/hooks/use-toast';

type FormData = {
    title: string;
    goodsType: string;
    netWeight: number;
    loadingAddress: string;
    deliveryAddress: string;
    loadingDate: string;
    deliveryDate: string;
    description: string;
    insuranceRequested: boolean;
    selectedInsurancePolicy?: string;
    transportType: TransportType;
};

export default function NewLoadForm() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();
    const dispatch = useAppDispatch();
    const { toast } = useToast();

    // Form state
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormData>({
        defaultValues: {
            title: '',
            goodsType: '',
            netWeight: 0,
            loadingAddress: '',
            deliveryAddress: '',
            loadingDate: '',
            deliveryDate: '',
            description: '',
            insuranceRequested: false,
            selectedInsurancePolicy: undefined,
            transportType: TransportType.LAND
        }
    });

    // Component state
    const [goodsTypes, setGoodsTypes] = useState<string[]>([]);
    const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
    const [carbonFootprint, setCarbonFootprint] = useState<number>(0);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [submitError, setSubmitError] = useState<string>('');
    const [submitSuccess, setSubmitSuccess] = useState<string>('');

    // Watch form values for carbon footprint calculation
    const watchedWeight = watch('netWeight');
    const watchedInsuranceRequested = watch('insuranceRequested');
    const watchedSelectedPolicy = watch('selectedInsurancePolicy');

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoadingData(true);

                // Sadece goods types yükle
                const goodsTypesResponse = await loadService.getGoodsTypes();
                setGoodsTypes(goodsTypesResponse);

                // Insurance policies optional - hata olsa bile devam et
                try {
                    const insurancePoliciesResponse = await loadService.getInsurancePolicies();
                    setInsurancePolicies(insurancePoliciesResponse);
                } catch (insuranceError) {
                    console.warn('Insurance policies could not be loaded:', insuranceError);
                    setInsurancePolicies([]);
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
                setSubmitError('Mal türleri yüklenirken hata oluştu. Lütfen sayfayı yenileyin.');
            } finally {
                setIsLoadingData(false);
            }
        };

        loadInitialData();
    }, [t]);

    // Calculate carbon footprint when weight changes
    useEffect(() => {
        const calculateFootprint = async () => {
            if (watchedWeight && watchedWeight > 0) {
                try {
                    const footprint = await loadService.calculateCarbonFootprint({
                        netWeight: watchedWeight
                    });
                    setCarbonFootprint(footprint);
                } catch (error) {
                    console.error('Error calculating carbon footprint:', error);
                    setCarbonFootprint(0);
                }
            } else {
                setCarbonFootprint(0);
            }
        };

        const timeoutId = setTimeout(calculateFootprint, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [watchedWeight]);

    // Handle form submission
    const onSubmit = async (data: FormData) => {
        if (!user?.id) {
            setSubmitError(t('newLoad.errors.userNotFound'));
            return;
        }

        try {
            setSubmitError('');
            setSubmitSuccess('');

            // ÖNCE: User'ın sender profile'ını al
            console.log('🔍 Sender profile alınıyor...');
            const senderProfile = await senderService.getSenderProfileByUserId(user.id);
            console.log('✅ Sender profile bulundu:', senderProfile);

            // Prepare load request - SENDER PROFILE ID kullan
            const loadRequest: LoadRequest = {
                title: data.title,
                goodsType: data.goodsType,
                netWeight: data.netWeight,
                loadingAddress: data.loadingAddress,
                deliveryAddress: data.deliveryAddress,
                loadingDate: data.loadingDate,
                deliveryDate: data.deliveryDate,
                description: data.description || '',
                insuranceRequested: false, // Sigorta geçici olarak kapalı
                transportType: data.transportType,
                selectedInsurancePolicy: undefined,
                insurancePolicyDetails: undefined,
                senderId: senderProfile.id
            };

            console.log('📤 Gönderilen LoadRequest:', loadRequest);

            // Redux kullan:
            await dispatch(createLoad(loadRequest)).unwrap();

            toast({
                title: "Yük Başarıyla Oluşturuldu",
                description: "Yükünüz sisteme başarıyla eklendi ve açık yükler listesinde görünecektir.",
                variant: "default",
            });

            // Redirect after success
            setTimeout(() => {
                router.push('/dashboard/sender/loads');
            }, 1000);

        } catch (error: any) {
            console.error('❌ Yük oluşturma hatası:', error);

            let errorMessage = '';

            if (error.message && error.message.includes('Sender profile not found')) {
                errorMessage = 'Gönderici profili bulunamadı. Lütfen önce profil oluşturun.';
            } else {
                errorMessage = error ||
                    error.response?.data?.message ||
                    error.message ||
                    t('newLoad.errors.createFailed');
            }

            // Hem setSubmitError hem de toast göster
            setSubmitError(errorMessage);

            toast({
                title: "Yük Oluşturulamadı",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };
    // Handle back navigation
    const handleBack = () => {
        router.push('/dashboard/sender/loads');
    };

    if (isLoadingData) {
        return (
            <ProtectedRoute allowedRoles={['SENDER']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                        <span className="text-gray-600">{t('newLoad.loading')}</span>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['SENDER']}>
            <div className="p-4 lg:p-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('common.back')}
                    </Button>

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">{t('newLoad.title')}</h1>
                        <p className="text-gray-600 mt-1">{t('newLoad.description')}</p>
                    </div>
                </div>

                {/* Alerts */}
                {submitError && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                )}

                {submitSuccess && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{submitSuccess}</AlertDescription>
                    </Alert>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-green-600" />
                                {t('newLoad.sections.basicInfo')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-medium">
                                    {t('newLoad.fields.title')} *
                                </Label>
                                <Input
                                    id="title"
                                    {...register('title', {
                                        required: t('newLoad.validation.titleRequired')
                                    })}
                                    placeholder={t('newLoad.placeholders.title')}
                                    className={errors.title ? 'border-red-500' : ''}
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-600">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Goods Type */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    {t('newLoad.fields.goodsType')} *
                                </Label>
                                <GoodsTypeSelect
                                    goodsTypes={goodsTypes}
                                    value={watch('goodsType')}
                                    onChange={(value) => setValue('goodsType', value)}
                                    error={errors.goodsType?.message}
                                />
                            </div>

                            {/* Weight */}
                            <div className="space-y-2">
                                <Label htmlFor="netWeight" className="text-sm font-medium">
                                    {t('newLoad.fields.weight')} (kg) *
                                </Label>
                                <Input
                                    id="netWeight"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register('netWeight', {
                                        required: t('newLoad.validation.weightRequired'),
                                        min: { value: 0.1, message: t('newLoad.validation.weightMin') }
                                    })}
                                    placeholder={t('newLoad.placeholders.weight')}
                                    className={errors.netWeight ? 'border-red-500' : ''}
                                />
                                {errors.netWeight && (
                                    <p className="text-sm text-red-600">{errors.netWeight.message}</p>
                                )}
                            </div>

                            {/* Transport Type */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">
                                    Taşıma Tipi *
                                </Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            watch('transportType') === TransportType.LAND
                                                ? 'border-green-600 bg-green-50'
                                                : 'border-gray-200 hover:border-green-300'
                                        }`}
                                        onClick={() => setValue('transportType', TransportType.LAND)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Truck className={`h-6 w-6 ${
                                                watch('transportType') === TransportType.LAND
                                                    ? 'text-green-600'
                                                    : 'text-gray-400'
                                            }`} />
                                            <div>
                                                <p className="font-semibold">Kara Taşımacılığı</p>
                                                <p className="text-xs text-gray-600">Karayolu ile taşıma</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            watch('transportType') === TransportType.SEA
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                        onClick={() => setValue('transportType', TransportType.SEA)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Ship className={`h-6 w-6 ${
                                                watch('transportType') === TransportType.SEA
                                                    ? 'text-blue-600'
                                                    : 'text-gray-400'
                                            }`} />
                                            <div>
                                                <p className="font-semibold">Deniz Taşımacılığı</p>
                                                <p className="text-xs text-gray-600">Deniz yolu ile taşıma</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Addresses Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-green-600" />
                                {t('newLoad.sections.addresses')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Loading Address */}
                            <div className="space-y-2">
                                <Label htmlFor="loadingAddress" className="text-sm font-medium">
                                    {t('newLoad.fields.loadingAddress')} *
                                </Label>
                                <Textarea
                                    id="loadingAddress"
                                    {...register('loadingAddress', {
                                        required: t('newLoad.validation.loadingAddressRequired')
                                    })}
                                    placeholder={t('newLoad.placeholders.loadingAddress')}
                                    rows={3}
                                    className={errors.loadingAddress ? 'border-red-500' : ''}
                                />
                                {errors.loadingAddress && (
                                    <p className="text-sm text-red-600">{errors.loadingAddress.message}</p>
                                )}
                            </div>

                            {/* Delivery Address */}
                            <div className="space-y-2">
                                <Label htmlFor="deliveryAddress" className="text-sm font-medium">
                                    {t('newLoad.fields.deliveryAddress')} *
                                </Label>
                                <Textarea
                                    id="deliveryAddress"
                                    {...register('deliveryAddress', {
                                        required: t('newLoad.validation.deliveryAddressRequired')
                                    })}
                                    placeholder={t('newLoad.placeholders.deliveryAddress')}
                                    rows={3}
                                    className={errors.deliveryAddress ? 'border-red-500' : ''}
                                />
                                {errors.deliveryAddress && (
                                    <p className="text-sm text-red-600">{errors.deliveryAddress.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dates Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-green-600" />
                                {t('newLoad.sections.dates')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Loading Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="loadingDate" className="text-sm font-medium">
                                        {t('newLoad.fields.loadingDate')} *
                                    </Label>
                                    <Input
                                        id="loadingDate"
                                        type="date"
                                        {...register('loadingDate', {
                                            required: t('newLoad.validation.loadingDateRequired'),
                                            validate: (value) => {
                                                const today = new Date();
                                                const selectedDate = new Date(value);
                                                today.setHours(0, 0, 0, 0);
                                                return selectedDate >= today || t('newLoad.validation.dateNotPast');
                                            }
                                        })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={errors.loadingDate ? 'border-red-500' : ''}
                                    />
                                    {errors.loadingDate && (
                                        <p className="text-sm text-red-600">{errors.loadingDate.message}</p>
                                    )}
                                </div>

                                {/* Delivery Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="deliveryDate" className="text-sm font-medium">
                                        {t('newLoad.fields.deliveryDate')} *
                                    </Label>
                                    <Input
                                        id="deliveryDate"
                                        type="date"
                                        {...register('deliveryDate', {
                                            required: t('newLoad.validation.deliveryDateRequired'),
                                            validate: (value) => {
                                                const loadingDate = watch('loadingDate');
                                                if (!loadingDate) return true;

                                                const loading = new Date(loadingDate);
                                                const delivery = new Date(value);

                                                return delivery > loading || t('newLoad.validation.deliveryAfterLoading');
                                            }
                                        })}
                                        min={watch('loadingDate') || new Date().toISOString().split('T')[0]}
                                        className={errors.deliveryDate ? 'border-red-500' : ''}
                                    />
                                    {errors.deliveryDate && (
                                        <p className="text-sm text-red-600">{errors.deliveryDate.message}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-green-600" />
                                {t('newLoad.fields.description')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Textarea
                                    id="description"
                                    {...register('description')}
                                    placeholder={t('newLoad.placeholders.description')}
                                    rows={4}
                                    className="resize-none"
                                />
                                <p className="text-xs text-gray-500">
                                    {t('newLoad.descriptionHelp')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Carbon Footprint Display */}
                    {carbonFootprint > 0 && (
                        <CarbonFootprintDisplay
                            carbonFootprint={carbonFootprint}
                            weight={watchedWeight}
                        />
                    )}

                    {/* Insurance Section - Geçici olarak gizlendi */}
                    {false && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-green-600" />
                                    {t('newLoad.sections.insurance')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Insurance Checkbox */}
                                <div className="flex items-center space-x-3 p-4 border rounded-lg bg-blue-50">
                                    <Checkbox
                                        id="insuranceRequested"
                                        checked={watchedInsuranceRequested}
                                        onCheckedChange={(checked) => {
                                            setValue('insuranceRequested', !!checked);
                                            if (!checked) {
                                                setValue('selectedInsurancePolicy', undefined);
                                            }
                                        }}
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor="insuranceRequested" className="cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium">{t('newLoad.fields.insuranceRequested')}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {t('newLoad.insuranceDescription')}
                                            </p>
                                        </Label>
                                    </div>
                                </div>

                                {/* Insurance Policy Selection */}
                                {watchedInsuranceRequested && (
                                    <div className="mt-6">
                                        <InsurancePolicyCard
                                            policies={insurancePolicies}
                                            selectedPolicy={watchedSelectedPolicy}
                                            onSelectPolicy={(policyId) => setValue('selectedInsurancePolicy', policyId)}
                                        />
                                        {errors.selectedInsurancePolicy && (
                                            <p className="text-sm text-red-600 mt-2">
                                                {errors.selectedInsurancePolicy?.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            className="flex-1 sm:flex-none"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('common.cancel')}
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('common.saving')}
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('newLoad.createLoad')}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
}