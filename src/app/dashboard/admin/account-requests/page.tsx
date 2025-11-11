// src/app/dashboard/admin/account-requests/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import accountTypeChangeService, { AccountTypeChangeRequest, ReviewRequestDto } from '@/services/accountTypeChangeService';
import { RefreshCw, CheckCircle, XCircle, User, Mail, Phone, MessageSquare } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function AccountRequestsPage() {
    const { toast } = useToast();
    const [requests, setRequests] = useState<AccountTypeChangeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<AccountTypeChangeRequest | null>(null);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
    const [adminNote, setAdminNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadPendingRequests();
    }, []);

    const loadPendingRequests = async () => {
        setLoading(true);
        try {
            const data = await accountTypeChangeService.getAllPendingRequests();
            setRequests(data);
        } catch (error) {
            toast({
                title: "Hata",
                description: "Talepler yüklenirken bir hata oluştu",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const openReviewDialog = (request: AccountTypeChangeRequest, action: 'approve' | 'reject') => {
        setSelectedRequest(request);
        setReviewAction(action);
        setAdminNote('');
        setReviewDialogOpen(true);
    };

    const handleReview = async () => {
        if (!selectedRequest) return;

        if (reviewAction === 'reject' && !adminNote.trim()) {
            toast({
                title: "Uyarı",
                description: "Reddetme sebebini belirtmelisiniz",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        try {
            const reviewData: ReviewRequestDto = {
                approved: reviewAction === 'approve',
                adminNote: adminNote.trim() || undefined,
            };

            await accountTypeChangeService.reviewRequest(selectedRequest.id, reviewData);

            toast({
                title: "Başarılı",
                description: reviewAction === 'approve' ? "Talep onaylandı" : "Talep reddedildi",
            });

            setReviewDialogOpen(false);
            setSelectedRequest(null);
            setAdminNote('');
            loadPendingRequests();
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error.response?.data?.message || "İşlem sırasında bir hata oluştu",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'SENDER':
                return 'Mal Sahibi';
            case 'CARRIER':
                return 'Taşıyıcı';
            case 'BROKER':
                return 'Broker';
            default:
                return role;
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Hesap Türü Değişiklik Talepleri</h1>
                    <p className="text-muted-foreground">
                        Kullanıcıların hesap türü değişiklik taleplerini inceleyin ve onaylayın
                    </p>
                </div>
                <Button onClick={loadPendingRequests} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Yenile
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Yükleniyor...</span>
                </div>
            ) : requests.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Bekleyen Talep Yok</h3>
                        <p className="text-muted-foreground text-center">
                            Şu anda onay bekleyen hesap türü değişiklik talebi bulunmuyor
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {requests.map((request) => (
                        <Card key={request.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            {request.userFirstName} {request.userLastName}
                                        </CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-4 w-4" />
                                                {request.userEmail}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                        Beklemede
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Değişiklik Bilgisi */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground mb-1">Mevcut</p>
                                                <Badge variant="outline" className="text-base">
                                                    {getRoleDisplayName(request.currentRole)}
                                                </Badge>
                                            </div>
                                            <div className="text-2xl text-blue-600">→</div>
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground mb-1">Talep Edilen</p>
                                                <Badge className="bg-blue-600 text-white text-base">
                                                    {getRoleDisplayName(request.requestedRole)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sebep */}
                                    <div>
                                        <Label className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Değişiklik Sebebi
                                        </Label>
                                        <div className="bg-muted rounded-lg p-3">
                                            <p className="text-sm">{request.reason}</p>
                                        </div>
                                    </div>

                                    {/* Tarih */}
                                    <div className="text-xs text-muted-foreground">
                                        Talep Tarihi: {new Date(request.createdAt).toLocaleString('tr-TR')}
                                    </div>

                                    {/* İşlem Butonları */}
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            onClick={() => openReviewDialog(request, 'approve')}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Onayla
                                        </Button>
                                        <Button
                                            onClick={() => openReviewDialog(request, 'reject')}
                                            variant="destructive"
                                            className="flex-1"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reddet
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Review Dialog */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {reviewAction === 'approve' ? 'Talebi Onayla' : 'Talebi Reddet'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedRequest && (
                                <>
                                    <span className="font-medium">
                                        {selectedRequest.userFirstName} {selectedRequest.userLastName}
                                    </span>{' '}
                                    kullanıcısının hesap türünü{' '}
                                    <span className="font-medium">
                                        {getRoleDisplayName(selectedRequest.currentRole)}
                                    </span>
                                    {' '}→{' '}
                                    <span className="font-medium">
                                        {getRoleDisplayName(selectedRequest.requestedRole)}
                                    </span>
                                    {' '}olarak değiştirme talebini{' '}
                                    {reviewAction === 'approve' ? 'onaylamak' : 'reddetmek'} üzeresiniz.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="adminNote">
                                {reviewAction === 'approve' ? 'Not (Opsiyonel)' : 'Reddetme Sebebi *'}
                            </Label>
                            <Textarea
                                id="adminNote"
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder={
                                    reviewAction === 'approve'
                                        ? 'Kullanıcıya iletilecek bir not ekleyebilirsiniz...'
                                        : 'Neden reddedildiğini açıklayın...'
                                }
                                rows={4}
                                className="resize-none"
                            />
                        </div>

                        {reviewAction === 'approve' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm text-yellow-800">
                                    <strong>Uyarı:</strong> Bu işlem kullanıcının eski profilini silecek ve
                                    yeni bir profil oluşturacaktır. Bu işlem geri alınamaz.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setReviewDialogOpen(false)}
                            disabled={submitting}
                        >
                            İptal
                        </Button>
                        <Button
                            onClick={handleReview}
                            disabled={submitting}
                            className={
                                reviewAction === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : ''
                            }
                            variant={reviewAction === 'reject' ? 'destructive' : 'default'}
                        >
                            {submitting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    İşleniyor...
                                </>
                            ) : (
                                <>
                                    {reviewAction === 'approve' ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Onayla
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reddet
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
