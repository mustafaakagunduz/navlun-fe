// src/app/dashboard/carrier/delivery-tracking/StatusUpdateModal.tsx - YENİ DOSYA
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, FileText } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setShowStatusModal, updateDeliveryStatus, fetchActiveDeliveries } from '@/store/slices/deliverySlice';
import { DeliveryStep } from '@/services/deliveryService';
import deliveryService from '@/services/deliveryService';
import { useToast } from '@/hooks/use-toast';

export default function StatusUpdateModal() {
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const {
        showStatusModal,
        selectedDelivery,
        updatingStatus,
        statusUpdateError
    } = useAppSelector(state => state.delivery);

    const [formData, setFormData] = useState({
        step: DeliveryStep.ON_THE_WAY,
        location: '',
        note: ''
    });

    useEffect(() => {
        if (selectedDelivery) {
            setFormData({
                step: selectedDelivery.currentStatus,
                location: selectedDelivery.currentLocation || '',
                note: ''
            });
        }
    }, [selectedDelivery]);

    useEffect(() => {
        if (statusUpdateError) {
            toast({
                title: "Hata",
                description: statusUpdateError,
                variant: "destructive",
            });
        }
    }, [statusUpdateError, toast]);

    const handleClose = () => {
        dispatch(setShowStatusModal(false));
        setFormData({
            step: DeliveryStep.ON_THE_WAY,
            location: '',
            note: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDelivery) return;

        try {
            // DÜZELTME: selectedDelivery.loadId zaten doğru delivery status ID'si
            // Ekstra API çağrısına gerek yok
            await dispatch(updateDeliveryStatus({
                deliveryStatusId: selectedDelivery.loadId, // Bu zaten delivery status ID
                request: formData
            })).unwrap();

            toast({
                title: "Başarılı",
                description: "Teslimat durumu başarıyla güncellendi",
            });

            // Active deliveries'i yenile
            dispatch(fetchActiveDeliveries());
            handleClose();
        } catch (error) {
            // Error handling redux'ta yapılıyor
        }
    };

    const getNextPossibleSteps = (currentStep: DeliveryStep): DeliveryStep[] => {
        switch (currentStep) {
            case DeliveryStep.ON_THE_WAY:
                return [DeliveryStep.ON_THE_WAY, DeliveryStep.PICKED_UP];
            case DeliveryStep.PICKED_UP:
                return [DeliveryStep.PICKED_UP, DeliveryStep.DELIVERED];
            case DeliveryStep.DELIVERED:
                return [DeliveryStep.DELIVERED];
            default:
                return Object.values(DeliveryStep);
        }
    };

    const possibleSteps = selectedDelivery ? getNextPossibleSteps(selectedDelivery.currentStatus) : [];

    return (
        <Dialog open={showStatusModal} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Teslimat Durumu Güncelle
                    </DialogTitle>
                </DialogHeader>

                {selectedDelivery && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-muted p-3 rounded-md">
                            <h4 className="font-medium">{selectedDelivery.loadTitle}</h4>
                            <p className="text-sm text-muted-foreground">
                                Mevcut Durum: {deliveryService.getStatusDisplayName(selectedDelivery.currentStatus)}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="step">Yeni Durum</Label>
                            <Select
                                value={formData.step}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, step: value as DeliveryStep }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {possibleSteps.map((step) => (
                                        <SelectItem key={step} value={step}>
                                            {deliveryService.getStatusDisplayName(step)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Mevcut Konum</Label>
                            <Input
                                id="location"
                                placeholder="Örn: İstanbul - Kadıköy"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="note">Not (Opsiyonel)</Label>
                            <Textarea
                                id="note"
                                placeholder="Durumla ilgili açıklama..."
                                value={formData.note}
                                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1"
                            >
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                disabled={updatingStatus || !formData.step}
                                className="flex-1"
                            >
                                {updatingStatus ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Güncelleniyor...
                                    </>
                                ) : (
                                    'Güncelle'
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}