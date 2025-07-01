"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, AlertCircle, Leaf } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { createShip, clearCreateShipError } from '@/store/slices/shipsSlice';
import { ShipRequest } from '@/services/shipService';

interface AddShipDialogProps {
    children: React.ReactNode;
}

interface ShipFormData {
    name: string;
    shipType: string;
    imoNumber: string;
    deadweightTonnage: string;
    grossTonnage: string;
    lengthOverall: string;
    beam: string;
    draught: string;
    buildYear: string;
    flag: string;
    classificationSociety: string;
    currentPort: string;
    nextAvailableDate: string;
    ecoFriendly: boolean;
}

const initialFormData: ShipFormData = {
    name: '',
    shipType: '',
    imoNumber: '',
    deadweightTonnage: '',
    grossTonnage: '',
    lengthOverall: '',
    beam: '',
    draught: '',
    buildYear: '',
    flag: '',
    classificationSociety: '',
    currentPort: '',
    nextAvailableDate: '',
    ecoFriendly: false
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
            formData.deadweightTonnage.trim() !== '' &&
            formData.grossTonnage.trim() !== '' &&
            formData.currentPort.trim() !== '' &&
            formData.flag.trim() !== '';
    };

    const handleCreateShip = async () => {
        if (!profile?.id || !isFormValid()) return;

        const shipRequest: ShipRequest = {
            brokerProfileId: profile.id,
            name: formData.name,
            shipType: formData.shipType,
            imoNumber: formData.imoNumber,
            deadweightTonnage: Number(formData.deadweightTonnage),
            grossTonnage: Number(formData.grossTonnage),
            lengthOverall: Number(formData.lengthOverall) || 0,
            beam: Number(formData.beam) || 0,
            draught: Number(formData.draught) || 0,
            buildYear: Number(formData.buildYear) || new Date().getFullYear(),
            flag: formData.flag,
            classificationSociety: formData.classificationSociety,
            currentPort: formData.currentPort,
            nextAvailableDate: formData.nextAvailableDate,
            ecoFriendly: formData.ecoFriendly
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Yeni Gemi Ekle</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Error Message */}
                    {createShipError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{createShipError}</span>
                            </div>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Gemi Adı *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleFormChange('name', e.target.value)}
                                placeholder="Gemi adını girin"
                            />
                        </div>

                        <div>
                            <Label htmlFor="shipType">Gemi Tipi *</Label>
                            <Select
                                value={formData.shipType}
                                onValueChange={(value) => handleFormChange('shipType', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Gemi tipi seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bulk Carrier">Bulk Carrier</SelectItem>
                                    <SelectItem value="Container Ship">Container Ship</SelectItem>
                                    <SelectItem value="General Cargo">General Cargo</SelectItem>
                                    <SelectItem value="Tanker">Tanker</SelectItem>
                                    <SelectItem value="RoRo">RoRo</SelectItem>
                                    <SelectItem value="Ferry">Ferry</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="imoNumber">IMO Numarası</Label>
                            <Input
                                id="imoNumber"
                                value={formData.imoNumber}
                                onChange={(e) => handleFormChange('imoNumber', e.target.value)}
                                placeholder="IMO numarasını girin"
                            />
                        </div>

                        <div>
                            <Label htmlFor="flag">Bayrak *</Label>
                            <Input
                                id="flag"
                                value={formData.flag}
                                onChange={(e) => handleFormChange('flag', e.target.value)}
                                placeholder="Bayrak ülkesi"
                            />
                        </div>
                    </div>

                    {/* Technical Specifications */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="deadweightTonnage">DWT (ton) *</Label>
                            <Input
                                id="deadweightTonnage"
                                type="number"
                                value={formData.deadweightTonnage}
                                onChange={(e) => handleFormChange('deadweightTonnage', e.target.value)}
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <Label htmlFor="grossTonnage">GT (ton) *</Label>
                            <Input
                                id="grossTonnage"
                                type="number"
                                value={formData.grossTonnage}
                                onChange={(e) => handleFormChange('grossTonnage', e.target.value)}
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <Label htmlFor="buildYear">İnşa Yılı</Label>
                            <Input
                                id="buildYear"
                                type="number"
                                value={formData.buildYear}
                                onChange={(e) => handleFormChange('buildYear', e.target.value)}
                                placeholder="2020"
                                min="1900"
                                max="2030"
                            />
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="lengthOverall">Uzunluk (m)</Label>
                            <Input
                                id="lengthOverall"
                                type="number"
                                step="0.1"
                                value={formData.lengthOverall}
                                onChange={(e) => handleFormChange('lengthOverall', e.target.value)}
                                placeholder="0.0"
                            />
                        </div>

                        <div>
                            <Label htmlFor="beam">Genişlik (m)</Label>
                            <Input
                                id="beam"
                                type="number"
                                step="0.1"
                                value={formData.beam}
                                onChange={(e) => handleFormChange('beam', e.target.value)}
                                placeholder="0.0"
                            />
                        </div>

                        <div>
                            <Label htmlFor="draught">Draft (m)</Label>
                            <Input
                                id="draught"
                                type="number"
                                step="0.1"
                                value={formData.draught}
                                onChange={(e) => handleFormChange('draught', e.target.value)}
                                placeholder="0.0"
                            />
                        </div>
                    </div>

                    {/* Classification and Port */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="classificationSociety">Klasifikasyon</Label>
                            <Input
                                id="classificationSociety"
                                value={formData.classificationSociety}
                                onChange={(e) => handleFormChange('classificationSociety', e.target.value)}
                                placeholder="Lloyd's Register, DNV GL vs."
                            />
                        </div>

                        <div>
                            <Label htmlFor="currentPort">Mevcut Liman *</Label>
                            <Input
                                id="currentPort"
                                value={formData.currentPort}
                                onChange={(e) => handleFormChange('currentPort', e.target.value)}
                                placeholder="Mevcut liman adı"
                            />
                        </div>
                    </div>

                    {/* Next Available Date */}
                    <div>
                        <Label htmlFor="nextAvailableDate">Sonraki Müsait Tarih</Label>
                        <Input
                            id="nextAvailableDate"
                            type="date"
                            value={formData.nextAvailableDate}
                            onChange={(e) => handleFormChange('nextAvailableDate', e.target.value)}
                        />
                    </div>

                    {/* Eco Friendly Switch */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="ecoFriendly"
                            checked={formData.ecoFriendly}
                            onCheckedChange={(checked) => handleFormChange('ecoFriendly', checked)}
                        />
                        <Label htmlFor="ecoFriendly" className="flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-green-600" />
                            Çevre Dostu Gemi
                        </Label>
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