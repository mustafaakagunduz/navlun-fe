// src/app/dashboard/sender/loads/LoadCard.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Weight, Shield, Leaf, Truck, Ship } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Load, LoadStatus, TransportType } from "@/services/loadService";
import { formatDate, formatDateTime, formatTime } from '@/utils/dateUtils';

interface LoadCardProps {
    load: Load;
    onClick: () => void;
    getStatusColor: (status: LoadStatus) => string;
    getStatusText: (status: LoadStatus) => string;
}

export default function LoadCard({ load, onClick, getStatusColor, getStatusText }: LoadCardProps) {
    const { t } = useLanguage();

    const formatWeight = (weight: number) => {
        if (weight >= 1000) {
            return `${(weight / 1000).toFixed(1)} ${t('loads.units.ton')}`;
        }
        return `${weight} ${t('loads.units.kg')}`;
    };

    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-l-green-500"
            onClick={onClick}
        >
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                {load.title}
                            </h3>
                            <Badge className={`${getStatusColor(load.status)} border-0`}>
                                {getStatusText(load.status)}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            {load.transportType === 'LAND' ? (
                                <Truck className="h-6 w-6" />
                            ) : (
                                <Ship className="h-6 w-6" />
                            )}
                            <span>{load.goodsType}</span>
                        </div>
                    </div>

                    {load.insuranceRequested && (
                        <div className="flex items-center gap-1 text-blue-600 ml-4">
                            <Shield className="h-4 w-4" />
                            <span className="text-xs font-medium">{t('loads.insured')}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Weight */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Weight className="h-4 w-4 text-gray-400" />
                        <span>{formatWeight(load.netWeight)}</span>
                    </div>

                    {/* Loading Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(load.loadingDate)}</span>
                    </div>

                    {/* Carbon Footprint */}
                    {load.estimatedCarbonFootprint && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <Leaf className="h-4 w-4" />
                            <span>{load.estimatedCarbonFootprint} {t('loads.units.co2')}</span>
                        </div>
                    )}
                </div>

                {/* Addresses */}
                <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="text-gray-600 text-xs uppercase tracking-wide">
                                {t('loads.pickup')}
                            </div>
                            <div className="text-gray-900 line-clamp-1">
                                {load.loadingAddress}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="text-gray-600 text-xs uppercase tracking-wide">
                                {t('loads.delivery')}
                            </div>
                            <div className="text-gray-900 line-clamp-1">
                                {load.deliveryAddress}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Preview */}
                {load.description && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {load.description}
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                        {t('loads.createdAt')}: {formatDate(load.createdAt || '')}
                    </div>

                    <div className="text-xs text-green-600 font-medium">
                        {t('loads.clickForDetails')}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}