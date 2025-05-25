// src/app/dashboard/sender/loads/components/InsurancePolicyCard.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useLanguage } from "@/context/LanguageContext";
import { InsurancePolicy } from "@/services/loadService";

interface InsurancePolicyCardProps {
    policies: InsurancePolicy[];
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
    const { t } = useLanguage();

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
        if (policyId.includes('eco')) return <Leaf className="h-5 w-5 text-green-600" />;
        if (policyId.includes('premium')) return <Award className="h-5 w-5 text-purple-600" />;
        if (policyId.includes('logistics')) return <Shield className="h-5 w-5 text-blue-600" />;
        return <Shield className="h-5 w-5 text-gray-600" />;
    };

    const getPolicyBorderColor = (policyId: string) => {
        if (policyId.includes('eco')) return 'border-green-200';
        if (policyId.includes('premium')) return 'border-purple-200';
        if (policyId.includes('logistics')) return 'border-blue-200';
        return 'border-gray-200';
    };

    if (policies.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t('newLoad.insurance.noPolicies')}
                    </h3>
                    <p className="text-gray-600">
                        {t('newLoad.insurance.noPoliciesDescription')}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">{t('newLoad.insurance.selectPolicy')}</h3>
                <Badge variant="outline" className="ml-auto">
                    {policies.length} {t('newLoad.insurance.optionsAvailable')}
                </Badge>
            </div>

            <RadioGroup value={selectedPolicy} onValueChange={onSelectPolicy} className="space-y-4">
                {policies.map((policy) => (
                    <div key={policy.id} className="relative">
                        <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedPolicy === policy.id
                                ? `ring-2 ring-green-500 ${getPolicyBorderColor(policy.id)}`
                                : getPolicyBorderColor(policy.id)
                        } ${policy.recommended ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    {/* Radio Button */}
                                    <RadioGroupItem
                                        value={policy.id}
                                        id={policy.id}
                                        className="mt-1"
                                    />

                                    {/* Policy Icon */}
                                    <div className="flex-shrink-0">
                                        {getPolicyIcon(policy.id)}
                                    </div>

                                    {/* Policy Details */}
                                    <div className="flex-1 min-w-0">
                                        <Label htmlFor={policy.id} className="cursor-pointer">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold text-gray-900">{policy.name}</h4>
                                                {policy.recommended && (
                                                    <Badge className="bg-blue-600 text-white text-xs">
                                                        <Star className="h-3 w-3 mr-1" />
                                                        {t('newLoad.insurance.recommended')}
                                                    </Badge>
                                                )}
                                            </div>

                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {policy.description}
                                            </p>

                                            {/* Policy Info Grid */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <div>
                                                        <div className="text-xs text-gray-500">
                                                            {t('newLoad.insurance.price')}
                                                        </div>
                                                        <div className="font-semibold text-green-700">
                                                            {formatPrice(policy.price)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-blue-600" />
                                                    <div>
                                                        <div className="text-xs text-gray-500">
                                                            {t('newLoad.insurance.coverage')}
                                                        </div>
                                                        <div className="font-semibold text-blue-700">
                                                            {formatCoverage(policy.coverage)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Award className="h-4 w-4 text-purple-600" />
                                                    <div>
                                                        <div className="text-xs text-gray-500">
                                                            {t('newLoad.insurance.provider')}
                                                        </div>
                                                        <div className="font-semibold text-purple-700 text-sm">
                                                            {policy.provider}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-orange-600" />
                                                    <div>
                                                        <div className="text-xs text-gray-500">
                                                            {t('newLoad.insurance.duration')}
                                                        </div>
                                                        <div className="font-semibold text-orange-700">
                                                            {policy.duration}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div className="space-y-2">
                                                <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                                    {t('newLoad.insurance.features')}
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {policy.features.map((feature, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                            className="text-xs bg-gray-50 text-gray-700 border-gray-300"
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
                    </div>
                ))}
            </RadioGroup>

            {/* Selection Summary */}
            {selectedPolicy && (
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-green-800">
                            <Check className="h-5 w-5" />
                            <span className="font-medium">
                                {t('newLoad.insurance.selectedPolicy')}: {' '}
                                {policies.find(p => p.id === selectedPolicy)?.name}
                            </span>
                        </div>
                        <div className="mt-2 text-sm text-green-700">
                            {t('newLoad.insurance.totalCost')}: {' '}
                            <span className="font-semibold">
                                {formatPrice(policies.find(p => p.id === selectedPolicy)?.price || 0)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}