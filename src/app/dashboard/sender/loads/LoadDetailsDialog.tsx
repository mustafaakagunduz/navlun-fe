// src/app/dashboard/sender/loads/LoadDetailsDialog.tsx
"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
    Calendar,
    MapPin,
    Weight,
    Shield,
    Leaf,
    Package,
    FileText,
    Clock,
    CheckCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Load, LoadStatus } from "@/services/loadService";
import { formatDate, formatDateTime, formatTime } from '@/utils/dateUtils';

interface LoadDetailsDialogProps {
    load: Load | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function LoadDetailsDialog({ load, isOpen, onClose }: LoadDetailsDialogProps) {
    const { t } = useLanguage();

    if (!load) return null;

    const formatWeight = (weight: number) => {
        if (weight >= 1000) {
            return `${(weight / 1000).toFixed(1)} ${t('loads.units.ton')}`;
        }
        return `${weight} ${t('loads.units.kg')}`;
    };

    const getStatusColor = (status: LoadStatus) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ASSIGNED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
            case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: LoadStatus) => {
        return t(`loads.status.${status.toLowerCase()}`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-md md:max-w-3xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold">
                            {load.title}
                        </DialogTitle>
                        <Badge className={`${getStatusColor(load.status)}`}>
                            {getStatusText(load.status)}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5 text-green-600" />
                                {t('loads.details.basicInfo')}
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-600">{t('loads.details.goodsType')}</div>
                                    <div className="font-medium">{load.goodsType}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-600">{t('loads.details.weight')}</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Weight className="h-4 w-4 text-gray-400" />
                                        {formatWeight(load.netWeight)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-600">{t('loads.details.loadingDate')}</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        {formatDate(load.loadingDate)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-600">{t('loads.details.deliveryDate')}</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        {formatDate(load.deliveryDate)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Addresses */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-green-600" />
                                {t('loads.details.addresses')}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                        <MapPin className="h-4 w-4 text-green-600" />
                                        {t('loads.details.pickupAddress')}
                                    </div>
                                    <div className="pl-6 text-gray-900">{load.loadingAddress}</div>
                                </div>

                                <Separator />

                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                        <MapPin className="h-4 w-4 text-red-600" />
                                        {t('loads.details.deliveryAddress')}
                                    </div>
                                    <div className="pl-6 text-gray-900">{load.deliveryAddress}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Information */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-green-600" />
                                {t('loads.details.additionalInfo')}
                            </h3>

                            <div className="space-y-4">
                                {/* Insurance */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Shield className={`h-5 w-5 ${load.insuranceRequested ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <span className="font-medium">{t('loads.details.insurance')}</span>
                                    </div>
                                    <Badge variant={load.insuranceRequested ? "default" : "secondary"}>
                                        {load.insuranceRequested ? t('loads.details.insured') : t('loads.details.notInsured')}
                                    </Badge>
                                </div>

                                {/* Carbon Footprint */}
                                {load.estimatedCarbonFootprint && (
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Leaf className="h-5 w-5 text-green-600" />
                                            <span className="font-medium">{t('loads.details.carbonFootprint')}</span>
                                        </div>
                                        <span className="text-green-700 font-semibold">
                                            {load.estimatedCarbonFootprint} {t('loads.units.co2')}
                                        </span>
                                    </div>
                                )}

                                {/* Completion Status */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className={`h-5 w-5 ${load.isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                                        <span className="font-medium">{t('loads.details.completionStatus')}</span>
                                    </div>
                                    <Badge variant={load.isCompleted ? "default" : "secondary"}>
                                        {load.isCompleted ? t('loads.details.completed') : t('loads.details.inProgress')}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    {load.description && (
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-green-600" />
                                    {t('loads.details.description')}
                                </h3>
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {load.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Timestamps */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-green-600" />
                                {t('loads.details.timestamps')}
                            </h3>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-600">{t('loads.details.createdAt')}</div>
                                    <div className="font-medium">
                                        {load.createdAt ? formatDateTime(load.createdAt) : '-'}
                                    </div>
                                </div>

                                {load.updatedAt && (
                                    <div>
                                        <div className="text-gray-600">{t('loads.details.updatedAt')}</div>
                                        <div className="font-medium">
                                            {formatDateTime(load.updatedAt)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}