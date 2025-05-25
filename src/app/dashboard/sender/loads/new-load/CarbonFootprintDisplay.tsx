// src/app/dashboard/sender/loads/components/CarbonFootprintDisplay.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Leaf,
    TreePine,
    Zap,
    TrendingDown,
    Info,
    Lightbulb,
    Award
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface CarbonFootprintDisplayProps {
    carbonFootprint: number;
    weight?: number;
    className?: string;
}

export default function CarbonFootprintDisplay({
                                                   carbonFootprint,
                                                   weight = 0,
                                                   className = ""
                                               }: CarbonFootprintDisplayProps) {
    const { t } = useLanguage();

    // Carbon footprint kategorileri
    const getCarbonCategory = (footprint: number) => {
        if (footprint <= 0.5) return 'excellent';
        if (footprint <= 1.0) return 'good';
        if (footprint <= 2.0) return 'moderate';
        return 'high';
    };

    const getCarbonCategoryInfo = (category: string) => {
        const categoryInfo = {
            excellent: {
                color: 'text-green-700',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                label: t('carbonFootprint.categories.excellent'),
                icon: <Award className="h-5 w-5 text-green-600" />
            },
            good: {
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                label: t('carbonFootprint.categories.good'),
                icon: <Leaf className="h-5 w-5 text-green-600" />
            },
            moderate: {
                color: 'text-yellow-700',
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                label: t('carbonFootprint.categories.moderate'),
                icon: <Zap className="h-5 w-5 text-yellow-600" />
            },
            high: {
                color: 'text-red-700',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                label: t('carbonFootprint.categories.high'),
                icon: <TrendingDown className="h-5 w-5 text-red-600" />
            }
        };
        return categoryInfo[category as keyof typeof categoryInfo];
    };

    const category = getCarbonCategory(carbonFootprint);
    const categoryInfo = getCarbonCategoryInfo(category);

    // Progress değeri hesaplama (0-100 arası)
    const progressValue = Math.min((carbonFootprint / 3) * 100, 100);

    // Eşdeğer değerler hesaplama
    const treesEquivalent = Math.round(carbonFootprint * 45); // 1 ton CO2 = yaklaşık 45 ağaç
    const kmDriven = Math.round(carbonFootprint * 4347); // 1 ton CO2 = yaklaşık 4347 km araç

    const getEcoTips = () => {
        const tips = [
            t('carbonFootprint.tips.consolidateShipments'),
            t('carbonFootprint.tips.chooseEcoVehicles'),
            t('carbonFootprint.tips.optimizeRoutes'),
            t('carbonFootprint.tips.reducePackaging'),
            t('carbonFootprint.tips.localSuppliers')
        ];

        // Kategori bazlı öneriler
        if (category === 'high') {
            return tips.slice(0, 3);
        } else if (category === 'moderate') {
            return tips.slice(1, 4);
        } else {
            return tips.slice(2, 4);
        }
    };

    if (carbonFootprint <= 0) {
        return (
            <Card className={`${className} border-gray-200`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 text-gray-500">
                        <Leaf className="h-5 w-5" />
                        <span className="text-sm">{t('carbonFootprint.calculating')}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`${className} ${categoryInfo.borderColor} ${categoryInfo.bgColor}`}>
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {categoryInfo.icon}
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {t('carbonFootprint.title')}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {t('carbonFootprint.estimated')}
                            </p>
                        </div>
                    </div>
                    <Badge className={`${categoryInfo.color} ${categoryInfo.bgColor} border-0`}>
                        {categoryInfo.label}
                    </Badge>
                </div>

                {/* Main Metric */}
                <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        {carbonFootprint.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                        {t('carbonFootprint.unit')}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>{t('carbonFootprint.low')}</span>
                        <span>{t('carbonFootprint.high')}</span>
                    </div>
                    <Progress
                        value={progressValue}
                        className="h-2"
                    />
                </div>

                {/* Equivalents */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                        <TreePine className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-gray-900">
                            {treesEquivalent}
                        </div>
                        <div className="text-xs text-gray-600">
                            {t('carbonFootprint.treesEquivalent')}
                        </div>
                    </div>

                    <div className="text-center p-3 bg-white/50 rounded-lg">
                        <Zap className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-gray-900">
                            {kmDriven.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">
                            {t('carbonFootprint.kmEquivalent')}
                        </div>
                    </div>
                </div>

                {/* Eco Tips */}
                {(category === 'moderate' || category === 'high') && (
                    <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-900">
                                {t('carbonFootprint.ecoTips')}
                            </span>
                        </div>
                        <ul className="space-y-2">
                            {getEcoTips().map((tip, index) => (
                                <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
                                    <div className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Calculation Info */}
                <div className="mt-4 p-3 bg-white/30 rounded-lg">
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-600">
                            <p className="font-medium mb-1">{t('carbonFootprint.calculationBased')}</p>
                            <p>{t('carbonFootprint.calculationNote')}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}