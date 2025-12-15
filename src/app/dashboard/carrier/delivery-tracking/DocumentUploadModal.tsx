// src/app/dashboard/carrier/delivery-tracking/DocumentUploadModal.tsx - YENİ DOSYA
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
    setShowDocumentModal,
    setSelectedDocumentType,
    uploadDocument,
    fetchActiveDeliveries
} from '@/store/slices/deliverySlice';
import deliveryService from '@/services/deliveryService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function DocumentUploadModal() {
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const { user } = useAuth();
    const {
        showDocumentModal,
        selectedDelivery,
        selectedDocumentType,
        uploadingDocument,
        uploadError
    } = useAppSelector(state => state.delivery);

    const [formData, setFormData] = useState({
        file: null as File | null,
        description: '',
        documentType: 'pickup' as 'pickup' | 'delivery' | 'cancellation'
    });

    const [dragActive, setDragActive] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    useEffect(() => {
        if (selectedDocumentType) {
            setFormData(prev => ({ ...prev, documentType: selectedDocumentType }));
        }
    }, [selectedDocumentType]);

    useEffect(() => {
        if (uploadError) {
            toast({
                title: "Hata",
                description: uploadError,
                variant: "destructive",
            });
        }
    }, [uploadError, toast]);

    const handleClose = () => {
        dispatch(setShowDocumentModal(false));
        dispatch(setSelectedDocumentType(null));
        setFormData({
            file: null,
            description: '',
            documentType: 'pickup'
        });
        setFileError(null);
    };

    const validateFile = (file: File): string | null => {
        if (!deliveryService.isValidFileType(file)) {
            return 'Sadece JPG, PNG ve PDF dosyaları kabul edilir.';
        }
        if (!deliveryService.isValidFileSize(file)) {
            return 'Dosya boyutu 5MB\'dan küçük olmalıdır.';
        }
        return null;
    };

    const handleFileSelect = (file: File) => {
        const error = validateFile(file);
        if (error) {
            setFileError(error);
            return;
        }

        setFileError(null);
        setFormData(prev => ({ ...prev, file }));
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDelivery || !formData.file) return;

        try {
            await dispatch(uploadDocument({
                deliveryStatusId: selectedDelivery.loadId, // Backend'den gelen loadId aslında deliveryStatusId
                file: formData.file,
                description: formData.description,
                documentType: formData.documentType
            })).unwrap();

            const docTypeText = formData.documentType === 'pickup' ? 'Alım' :
                                 formData.documentType === 'delivery' ? 'Teslimat' : 'İptal';
            toast({
                title: "Başarılı",
                description: `${docTypeText} belgesi başarıyla yüklendi`,
            });

            // Active deliveries'i yenile
            dispatch(fetchActiveDeliveries(user?.role as 'CARRIER' | 'BROKER'));
            handleClose();
        } catch (error) {
            // Error handling redux'ta yapılıyor
        }
    };

    const removeFile = () => {
        setFormData(prev => ({ ...prev, file: null }));
        setFileError(null);
    };

    return (
        <Dialog open={showDocumentModal} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Belge Yükleme
                    </DialogTitle>
                </DialogHeader>

                {selectedDelivery && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-muted p-3 rounded-md">
                            <h4 className="font-medium">{selectedDelivery.loadTitle}</h4>
                            <p className="text-sm text-muted-foreground">
                                Durum: {deliveryService.getStatusDisplayName(selectedDelivery.currentStatus)}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="documentType">Belge Türü</Label>
                            <Select
                                value={formData.documentType}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value as 'pickup' | 'delivery' | 'cancellation' }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pickup">Alım Belgesi</SelectItem>
                                    <SelectItem value="delivery">Teslimat Belgesi</SelectItem>
                                    <SelectItem value="cancellation">İptal Belgesi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* File Upload Area */}
                        <div className="space-y-2">
                            <Label>Dosya</Label>
                            {formData.file ? (
                                <div className="border rounded-md p-4 bg-green-50 border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-medium">{formData.file.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {deliveryService.formatFileSize(formData.file.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeFile}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
                                        dragActive
                                            ? 'border-primary bg-primary/5'
                                            : 'border-muted-foreground/25 hover:border-primary/50'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Dosyayı buraya sürükleyin veya seçin
                                    </p>
                                    <Input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        Dosya Seç
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        JPG, PNG, PDF (Max 5MB)
                                    </p>
                                </div>
                            )}

                            {fileError && (
                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    {fileError}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
                            <Textarea
                                id="description"
                                placeholder="Belge hakkında açıklama..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                                disabled={uploadingDocument || !formData.file || !!fileError}
                                className="flex-1"
                            >
                                {uploadingDocument ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Yükleniyor...
                                    </>
                                ) : (
                                    'Yükle'
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}