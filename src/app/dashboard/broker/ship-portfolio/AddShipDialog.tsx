"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, AlertCircle, Leaf, Ship, Building2, Shield, Calendar } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { createShip, clearCreateShipError } from '@/store/slices/shipsSlice';
import { ShipRequest } from '@/services/shipService';

interface AddShipDialogProps {
    children: React.ReactNode;
}

interface ShipFormData {
    // Temel Bilgiler (Zorunlu)
    name: string;
    shipType: string;
    flag: string;
    currentPort: string;
    registrationPort: string;
    deadweightTonnage: string;
    grossTonnage: string;

    // Opsiyonel Bilgiler
    imoNumber: string;
    buildYear: string;
    builder: string;
    classificationSociety: string;

    // Boyutlar (Opsiyonel)
    lengthOverall: string;
    beam: string;
    draught: string;
    maxSpeed: string;
    netTonnage: string;
    draft: string;

    // Ana Makine Bilgileri
    mainEngineType: string;
    mainEnginePower: string;

    // Ambar Bilgileri
    numberOfHolds: string;
    holdCapacities: string;

    // Tahliye/Tahmil Donanımları
    hasCrane: boolean;
    numberOfCranes: string;
    craneCapacity: string;
    hasWinch: boolean;
    numberOfWinches: string;
    winchCapacity: string;

    // Çevreci Bilgileri
    ecoFriendly: boolean;
    ecoClassification: string;
    ecoValidUntil: string;

    // Sigorta ve Sertifikalar
    insuranceProvider: string;
    insuranceValidUntil: string;
    classValidUntil: string;

    // Operasyonel
    nextAvailableDate: string;
    notes: string;
}

const initialFormData: ShipFormData = {
    // Zorunlu
    name: '',
    shipType: '',
    flag: '',
    currentPort: '',
    registrationPort: '',
    deadweightTonnage: '',
    grossTonnage: '',

    // Opsiyonel
    imoNumber: '',
    buildYear: '',
    builder: '',
    classificationSociety: '',
    lengthOverall: '',
    beam: '',
    draught: '',
    maxSpeed: '',
    netTonnage: '',
    draft: '',
    mainEngineType: '',
    mainEnginePower: '',
    numberOfHolds: '',
    holdCapacities: '',
    hasCrane: false,
    numberOfCranes: '',
    craneCapacity: '',
    hasWinch: false,
    numberOfWinches: '',
    winchCapacity: '',
    ecoFriendly: false,
    ecoClassification: '',
    ecoValidUntil: '',
    insuranceProvider: '',
    insuranceValidUntil: '',
    classValidUntil: '',
    nextAvailableDate: '',
    notes: ''
};

export default function AddShipDialog({ children }: AddShipDialogProps) {
    const dispatch = useAppDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<ShipFormData>(initialFormData);

    const { profile } = useAppSelector(state => state.broker);
    const { createShipLoading, createShipError } = useAppSelector(state => state.ships);

    // Clear errors when dialog closes
    useEffect(() => {
        if (!isOpen) {
            dispatch(clearCreateShipError());
            setFormData(initialFormData);
        }
    }, [isOpen, dispatch]);

    const handleFormChange = (field: keyof ShipFormData, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const isFormValid = () => {
        return formData.name.trim() !== '' &&
            formData.shipType.trim() !== '' &&
            formData.flag.trim() !== '' &&
            formData.currentPort.trim() !== '' &&
            formData.deadweightTonnage.trim() !== '' &&
            formData.grossTonnage.trim() !== '';
    };

    const handleCreateShip = async () => {
        if (!profile?.id || !isFormValid()) return;

        const shipRequest: ShipRequest = {
            brokerProfileId: profile.id,
            name: formData.name,
            shipType: formData.shipType,
            imoNumber: formData.imoNumber || undefined,
            deadweightTonnage: Number(formData.deadweightTonnage),
            grossTonnage: Number(formData.grossTonnage),
            lengthOverall: Number(formData.lengthOverall) || 0,
            beam: Number(formData.beam) || 0,
            draught: Number(formData.draught) || 0,
            buildYear: Number(formData.buildYear) || new Date().getFullYear(),
            flag: formData.flag,
            classificationSociety: formData.classificationSociety || undefined,
            currentPort: formData.currentPort,
            registrationPort: formData.registrationPort || undefined,
            nextAvailableDate: formData.nextAvailableDate || undefined,
            ecoFriendly: formData.ecoFriendly,
            maxSpeed: formData.maxSpeed ? Number(formData.maxSpeed) : undefined,
            netTonnage: formData.netTonnage ? Number(formData.netTonnage) : undefined,
            draft: formData.draft ? Number(formData.draft) : undefined,
            mainEngineType: formData.mainEngineType || undefined,
            mainEnginePower: formData.mainEnginePower ? Number(formData.mainEnginePower) : undefined,
            numberOfHolds: formData.numberOfHolds ? Number(formData.numberOfHolds) : undefined,
            holdCapacities: formData.holdCapacities || undefined,
            hasCrane: formData.hasCrane || undefined,
            numberOfCranes: formData.numberOfCranes ? Number(formData.numberOfCranes) : undefined,
            craneCapacity: formData.craneCapacity ? Number(formData.craneCapacity) : undefined,
            hasWinch: formData.hasWinch || undefined,
            numberOfWinches: formData.numberOfWinches ? Number(formData.numberOfWinches) : undefined,
            winchCapacity: formData.winchCapacity ? Number(formData.winchCapacity) : undefined
        };

        try {
            await dispatch(createShip(shipRequest)).unwrap();
            setIsOpen(false);
            setFormData(initialFormData);
        } catch (error) {
            // Error handled by Redux
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Ship className="h-5 w-5" />
                        Yeni Gemi Ekle
                    </DialogTitle>
                    <p className="text-sm text-gray-600">
                        <span className="text-red-500">*</span> ile işaretli alanlar zorunludur
                    </p>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Error Message */}
                    {createShipError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{createShipError}</span>
                            </div>
                        </div>
                    )}

                    {/* Temel Bilgiler */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Ship className="h-4 w-4" />
                            Temel Bilgiler
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Gemi Adı <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleFormChange('name', e.target.value)}
                                    placeholder="MV ISTANBUL"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="shipType" className="text-sm font-medium">
                                    Gemi Tipi <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.shipType}
                                    onValueChange={(value) => handleFormChange('shipType', value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Gemi tipi seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Tanker Gemisi">Tanker Gemisi</SelectItem>
                                        <SelectItem value="Kuru Dökme Yük Gemisi">Kuru Dökme Yük Gemisi</SelectItem>

                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="flag" className="text-sm font-medium">
                                    Bayrak Ülkesi <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="flag"
                                    value={formData.flag}
                                    onChange={(e) => handleFormChange('flag', e.target.value)}
                                    placeholder="Turkey"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="currentPort" className="text-sm font-medium">
                                    Mevcut Liman <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="currentPort"
                                    value={formData.currentPort}
                                    onChange={(e) => handleFormChange('currentPort', e.target.value)}
                                    placeholder="İstanbul Port"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="registrationPort" className="text-sm font-medium">
                                    Sicil Limanı
                                </Label>
                                <Input
                                    id="registrationPort"
                                    value={formData.registrationPort}
                                    onChange={(e) => handleFormChange('registrationPort', e.target.value)}
                                    placeholder="İstanbul"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="imoNumber" className="text-sm font-medium">
                                    IMO Numarası
                                </Label>
                                <Input
                                    id="imoNumber"
                                    value={formData.imoNumber}
                                    onChange={(e) => handleFormChange('imoNumber', e.target.value)}
                                    placeholder="IMO1234567"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="buildYear" className="text-sm font-medium">
                                    İnşa Yılı
                                </Label>
                                <Input
                                    id="buildYear"
                                    type="number"
                                    value={formData.buildYear}
                                    onChange={(e) => handleFormChange('buildYear', e.target.value)}
                                    placeholder="2020"
                                    min="1900"
                                    max="2030"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Kapasite Bilgileri */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            📊 Teknik Özellikler
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="deadweightTonnage" className="text-sm font-medium">
                                    DWT (Deadweight Tonnage) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="deadweightTonnage"
                                    type="number"
                                    value={formData.deadweightTonnage}
                                    onChange={(e) => handleFormChange('deadweightTonnage', e.target.value)}
                                    placeholder="75000"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="grossTonnage" className="text-sm font-medium">
                                    GT (Gross Tonnage) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="grossTonnage"
                                    type="number"
                                    value={formData.grossTonnage}
                                    onChange={(e) => handleFormChange('grossTonnage', e.target.value)}
                                    placeholder="45000"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="netTonnage" className="text-sm font-medium">
                                    NT (Net Tonnage)
                                </Label>
                                <Input
                                    id="netTonnage"
                                    type="number"
                                    value={formData.netTonnage}
                                    onChange={(e) => handleFormChange('netTonnage', e.target.value)}
                                    placeholder="35000"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="maxSpeed" className="text-sm font-medium">
                                    Maksimum Hız (Knot)
                                </Label>
                                <Input
                                    id="maxSpeed"
                                    type="number"
                                    value={formData.maxSpeed}
                                    onChange={(e) => handleFormChange('maxSpeed', e.target.value)}
                                    placeholder="14.5"
                                    step="0.1"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="draft" className="text-sm font-medium">
                                    Su Çekimi / Draft (metre)
                                </Label>
                                <Input
                                    id="draft"
                                    type="number"
                                    value={formData.draft}
                                    onChange={(e) => handleFormChange('draft', e.target.value)}
                                    placeholder="12.5"
                                    step="0.1"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <h4 className="text-md font-medium">Ana Makine Bilgileri</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="mainEngineType" className="text-sm font-medium">
                                    Ana Makine Tipi
                                </Label>
                                <Input
                                    id="mainEngineType"
                                    value={formData.mainEngineType}
                                    onChange={(e) => handleFormChange('mainEngineType', e.target.value)}
                                    placeholder="Örn: MAN-B&W 6S50MC"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="mainEnginePower" className="text-sm font-medium">
                                    Ana Makine Gücü (KW)
                                </Label>
                                <Input
                                    id="mainEnginePower"
                                    type="number"
                                    value={formData.mainEnginePower}
                                    onChange={(e) => handleFormChange('mainEnginePower', e.target.value)}
                                    placeholder="12000"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <h4 className="text-md font-medium">Ambar Bilgileri</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="numberOfHolds" className="text-sm font-medium">
                                    Ambar Sayısı
                                </Label>
                                <Input
                                    id="numberOfHolds"
                                    type="number"
                                    value={formData.numberOfHolds}
                                    onChange={(e) => handleFormChange('numberOfHolds', e.target.value)}
                                    placeholder="5"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="holdCapacities" className="text-sm font-medium">
                                    Ambar Kapasiteleri
                                </Label>
                                <Input
                                    id="holdCapacities"
                                    value={formData.holdCapacities}
                                    onChange={(e) => handleFormChange('holdCapacities', e.target.value)}
                                    placeholder="Örn: 1:15000, 2:18000, 3:20000, 4:18000, 5:15000"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <h4 className="text-md font-medium">Tahmil/Tahliye Donanımları</h4>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="hasCrane"
                                    checked={formData.hasCrane}
                                    onCheckedChange={(checked) => handleFormChange('hasCrane', checked)}
                                />
                                <Label htmlFor="hasCrane">Crane Mevcut</Label>
                            </div>

                            {formData.hasCrane && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                                    <div>
                                        <Label htmlFor="numberOfCranes" className="text-sm font-medium">
                                            Crane Sayısı
                                        </Label>
                                        <Input
                                            id="numberOfCranes"
                                            type="number"
                                            value={formData.numberOfCranes}
                                            onChange={(e) => handleFormChange('numberOfCranes', e.target.value)}
                                            placeholder="4"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="craneCapacity" className="text-sm font-medium">
                                            Crane Kapasitesi (Ton)
                                        </Label>
                                        <Input
                                            id="craneCapacity"
                                            type="number"
                                            value={formData.craneCapacity}
                                            onChange={(e) => handleFormChange('craneCapacity', e.target.value)}
                                            placeholder="30"
                                            step="0.1"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="hasWinch"
                                    checked={formData.hasWinch}
                                    onCheckedChange={(checked) => handleFormChange('hasWinch', checked)}
                                />
                                <Label htmlFor="hasWinch">Winch Mevcut</Label>
                            </div>

                            {formData.hasWinch && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                                    <div>
                                        <Label htmlFor="numberOfWinches" className="text-sm font-medium">
                                            Winch Sayısı
                                        </Label>
                                        <Input
                                            id="numberOfWinches"
                                            type="number"
                                            value={formData.numberOfWinches}
                                            onChange={(e) => handleFormChange('numberOfWinches', e.target.value)}
                                            placeholder="2"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="winchCapacity" className="text-sm font-medium">
                                            Winch Kapasitesi (Ton)
                                        </Label>
                                        <Input
                                            id="winchCapacity"
                                            type="number"
                                            value={formData.winchCapacity}
                                            onChange={(e) => handleFormChange('winchCapacity', e.target.value)}
                                            placeholder="25"
                                            step="0.1"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Sertifikasyon */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Klas Bilgileri ve İnşa
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="classificationSociety" className="text-sm font-medium">
                                    Klas Kuruluşu
                                </Label>
                                <Input
                                    id="classificationSociety"
                                    value={formData.classificationSociety}
                                    onChange={(e) => handleFormChange('classificationSociety', e.target.value)}
                                    placeholder="Lloyd's Register, DNV GL, ABS"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="builder" className="text-sm font-medium">
                                    İnşa Eden Tersane
                                </Label>
                                <Input
                                    id="builder"
                                    value={formData.builder}
                                    onChange={(e) => handleFormChange('builder', e.target.value)}
                                    placeholder="Hyundai Heavy Industries"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="classValidUntil" className="text-sm font-medium">
                                    Klasifikasyon Geçerlilik Tarihi
                                </Label>
                                <Input
                                    id="classValidUntil"
                                    type="date"
                                    value={formData.classValidUntil}
                                    onChange={(e) => handleFormChange('classValidUntil', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Sigorta */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Sigorta Bilgileri
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="insuranceProvider" className="text-sm font-medium">
                                    Sigorta Şirketi
                                </Label>
                                <Input
                                    id="insuranceProvider"
                                    value={formData.insuranceProvider}
                                    onChange={(e) => handleFormChange('insuranceProvider', e.target.value)}
                                    placeholder="Axa Sigorta, Allianz"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="insuranceValidUntil" className="text-sm font-medium">
                                    Sigorta Geçerlilik Tarihi
                                </Label>
                                <Input
                                    id="insuranceValidUntil"
                                    type="date"
                                    value={formData.insuranceValidUntil}
                                    onChange={(e) => handleFormChange('insuranceValidUntil', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Çevreci Bilgiler */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Leaf className="h-4 w-4" />
                            Çevre Dostu Özellikler
                        </h3>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="ecoFriendly"
                                checked={formData.ecoFriendly}
                                onCheckedChange={(checked) => handleFormChange('ecoFriendly', checked)}
                            />
                            <Label htmlFor="ecoFriendly" className="flex items-center gap-2">
                                <Leaf className="h-4 w-4 text-green-600" />
                                Bu gemi çevre dostu sertifikasına sahip
                            </Label>
                        </div>

                        {formData.ecoFriendly && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label htmlFor="ecoClassification" className="text-sm font-medium">
                                        Çevre Sertifikası Türü
                                    </Label>
                                    <Input
                                        id="ecoClassification"
                                        value={formData.ecoClassification}
                                        onChange={(e) => handleFormChange('ecoClassification', e.target.value)}
                                        placeholder="Green Ship, Eco-Ship"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="ecoValidUntil" className="text-sm font-medium">
                                        Çevre Sertifikası Geçerlilik Tarihi
                                    </Label>
                                    <Input
                                        id="ecoValidUntil"
                                        type="date"
                                        value={formData.ecoValidUntil}
                                        onChange={(e) => handleFormChange('ecoValidUntil', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Operasyonel Bilgiler */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Operasyonel Bilgiler
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="nextAvailableDate" className="text-sm font-medium">
                                    Sonraki Müsait Tarih
                                </Label>
                                <Input
                                    id="nextAvailableDate"
                                    type="date"
                                    value={formData.nextAvailableDate}
                                    onChange={(e) => handleFormChange('nextAvailableDate', e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="notes" className="text-sm font-medium">
                                    Notlar
                                </Label>
                                <textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleFormChange('notes', e.target.value)}
                                    placeholder="Gemi hakkında ek bilgiler, özel durumlar..."
                                    className="mt-1 min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={createShipLoading}
                        >
                            İptal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCreateShip}
                            disabled={!isFormValid() || createShipLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {createShipLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Ekleniyor...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Gemi Ekle
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}