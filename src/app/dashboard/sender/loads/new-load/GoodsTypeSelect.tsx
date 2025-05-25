// src/app/dashboard/sender/loads/components/GoodsTypeSelect.tsx
"use client"

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";

interface GoodsTypeSelectProps {
    goodsTypes: string[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function GoodsTypeSelect({ goodsTypes, value, onChange, error }: GoodsTypeSelectProps) {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');

    // Filter goods types based on search term
    const filteredGoodsTypes = goodsTypes.filter(type =>
        type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get recommendations based on selected goods type
    const getRecommendations = (goodsType: string): string[] => {
        const recommendations: Record<string, string[]> = {
            "Gıda Ürünleri": [
                t('newLoad.recommendations.coldChain'),
                t('newLoad.recommendations.moistureProtection'),
                t('newLoad.recommendations.expiryTracking')
            ],
            "Elektronik Cihazlar": [
                t('newLoad.recommendations.antiStatic'),
                t('newLoad.recommendations.vibrationProtection'),
                t('newLoad.recommendations.moistureProtection')
            ],
            "Kimyasal Ürünler": [
                t('newLoad.recommendations.adrCertificate'),
                t('newLoad.recommendations.specialPackaging'),
                t('newLoad.recommendations.safetyLabels')
            ],
            "Tekstil Ürünleri": [
                t('newLoad.recommendations.moistureProtection'),
                t('newLoad.recommendations.wrinkleProtection')
            ],
            "İnşaat Malzemeleri": [
                t('newLoad.recommendations.heavyLoad'),
                t('newLoad.recommendations.shockResistant')
            ]
        };

        return recommendations[goodsType] || [t('newLoad.recommendations.standard')];
    };

    return (
        <div className="space-y-3">
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className={`w-full ${error ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder={t('newLoad.placeholders.goodsType')} />
                </SelectTrigger>
                <SelectContent>
                    {/* Search input */}
                    <div className="p-2 border-b">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder={t('newLoad.searchGoodsType')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 h-9"
                            />
                        </div>
                    </div>

                    {/* Goods types list */}
                    <div className="max-h-48 overflow-y-auto">
                        {filteredGoodsTypes.length > 0 ? (
                            filteredGoodsTypes.map((type) => (
                                <SelectItem key={type} value={type} className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-gray-400" />
                                    {type}
                                </SelectItem>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                {t('newLoad.noGoodsTypeFound')}
                            </div>
                        )}
                    </div>
                </SelectContent>
            </Select>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {/* Recommendations */}
            {value && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {t('newLoad.packagingRecommendations')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {getRecommendations(value).map((recommendation, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs bg-blue-100 text-blue-800 border-blue-300"
                            >
                                {recommendation}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}