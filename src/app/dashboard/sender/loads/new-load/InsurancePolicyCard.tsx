"use client"

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
    Shield,
    Check,
    Star,
    Clock,
    DollarSign,
    Award,
    Leaf
} from "lucide-react";

interface InsurancePolicyCardProps {
    policies: any[];
    selectedPolicy?: string;
    onSelectPolicy: (policyId: string) => void;
    className?: string;
}

export default function InsurancePolicyCard({
                                                policies,
                                                selectedPolicy,
                                                onSelectPolicy,
                                                className = ""
                                            }: InsurancePolicyCardProps) {

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(price);
    };

    const formatCoverage = (coverage: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            maximumFractionDigits: 0
        }).format(coverage);
    };

    const getPolicyIcon = (policyId: string) => {
        if (policyId.includes('eco')) return <Leaf className="h-4 w-4 text-green-600" />;
        if (policyId.includes('premium')) return <Award className="h-4 w-4 text-purple-600" />;
        if (policyId.includes('logistics')) return <Shield className="h-4 w-4 text-blue-600" />;
        return <Shield className="h-4 w-4 text-gray-600" />;
    };

    const getPolicyBorderColor = (policyId: string) => {
        if (policyId.includes('eco')) return 'border-green-200';
        if (policyId.includes('premium')) return 'border-purple-200';
        if (policyId.includes('logistics')) return 'border-blue-200';
        return 'border-gray-200';
    };

    if (!policies || policies.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Sigorta seçeneği bulunamadı
                    </h3>
                    <p className="text-gray-600">
                        Şu anda mevcut sigorta paketi bulunmamaktadır.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Sigorta Paketi Seçin</h3>
                <Badge variant="outline" className="ml-auto">
                    {policies.length} seçenek mevcut
                </Badge>
            </div>

            <RadioGroup value={selectedPolicy} onValueChange={onSelectPolicy} className="space-y-3">
                {policies.map((policy) => (
                    <Card key={policy.id} className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedPolicy === policy.id
                            ? `ring-2 ring-green-500 shadow-md ${getPolicyBorderColor(policy.id)}`
                            : getPolicyBorderColor(policy.id)
                    } ${policy.recommended ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                {/* Radio Button */}
                                <RadioGroupItem
                                    value={policy.id}
                                    id={policy.id}
                                    className="flex-shrink-0"
                                />

                                {/* Policy Info */}
                                <div className="flex-1 min-w-0">
                                    <Label htmlFor={policy.id} className="cursor-pointer">
                                        <div className="flex items-center justify-between gap-4 mb-3">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                {getPolicyIcon(policy.id)}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-gray-900">
                                                            {policy.name}
                                                        </h4>
                                                        {policy.recommended && (
                                                            <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">
                                                                <Star className="h-3 w-3 mr-1" />
                                                                Önerilen
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {policy.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Kompakt Info Grid */}
                                        <div className="grid grid-cols-4 gap-4 mb-3">
                                            {/* Fiyat */}
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                                                    <DollarSign className="h-3 w-3" />
                                                    <span className="text-xs font-medium uppercase">Fiyat</span>
                                                </div>
                                                <div className="text-sm font-bold text-green-700">
                                                    {formatPrice(policy.price)}
                                                </div>
                                            </div>

                                            {/* Teminat */}
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                                                    <Shield className="h-3 w-3" />
                                                    <span className="text-xs font-medium uppercase">Teminat</span>
                                                </div>
                                                <div className="text-sm font-bold text-blue-700">
                                                    {formatCoverage(policy.coverage)}
                                                </div>
                                            </div>

                                            {/* Süre */}
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span className="text-xs font-medium uppercase">Süre</span>
                                                </div>
                                                <div className="text-xs font-bold text-orange-700">
                                                    {policy.duration}
                                                </div>
                                            </div>

                                            {/* Şirket */}
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                                                    <Award className="h-3 w-3" />
                                                    <span className="text-xs font-medium uppercase">Şirket</span>
                                                </div>
                                                <div className="text-xs font-bold text-purple-700 truncate">
                                                    {policy.provider}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Özellikler - Kompakt */}
                                        <div className="pt-3 border-t border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Check className="h-3 w-3 text-green-600" />
                                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                                    Özellikler
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {policy.features.map((feature: string, index: number) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="text-xs bg-gray-50 text-gray-700 border-gray-300 px-2 py-1"
                                                    >
                                                        <Check className="h-3 w-3 mr-1 text-green-600" />
                                                        {feature}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </RadioGroup>

            {/* Seçim Özeti */}
            {selectedPolicy && (
                <Card className="bg-green-50 border-green-200 border-2">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-green-800">
                                <Check className="h-5 w-5" />
                                <span className="font-semibold">
                                    Seçilen: {policies.find(p => p.id === selectedPolicy)?.name}
                                </span>
                            </div>
                            <div className="text-green-700">
                                <span className="text-sm">Toplam: </span>
                                <span className="text-lg font-bold">
                                    {formatPrice(policies.find(p => p.id === selectedPolicy)?.price || 0)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}