// src/components/AccountTypeChangeSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import accountTypeChangeService, { CreateRequestDto, AccountTypeChangeRequest, RequestStatus } from '@/services/accountTypeChangeService';
import { RefreshCw, AlertCircle, CheckCircle, XCircle, Briefcase } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AccountTypeChangeSection() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [requestedRole, setRequestedRole] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [hasPending, setHasPending] = useState(false);
    const [myRequests, setMyRequests] = useState<AccountTypeChangeRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        loadMyRequests();
        checkPendingRequest();
    }, []);

    const loadMyRequests = async () => {
        try {
            const requests = await accountTypeChangeService.getMyRequests();
            setMyRequests(requests);
        } catch (error) {
            console.error('Load requests error:', error);
        } finally {
            setLoadingRequests(false);
        }
    };

    const checkPendingRequest = async () => {
        try {
            const pending = await accountTypeChangeService.hasPendingRequest();
            setHasPending(pending);
        } catch (error) {
            console.error('Check pending error:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!requestedRole) {
            toast({
                title: "Hata",
                description: "Lütfen yeni hesap türünü seçin",
                variant: "destructive",
            });
            return;
        }

        if (!reason.trim()) {
            toast({
                title: "Hata",
                description: "Lütfen değişiklik sebebini açıklayın",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const requestData: CreateRequestDto = {
                requestedRole,
                reason,
            };

            await accountTypeChangeService.createRequest(requestData);

            toast({
                title: "Başarılı",
                description: "Hesap türü değişiklik talebiniz admin onayına gönderildi",
            });

            setRequestedRole('');
            setReason('');
            loadMyRequests();
            checkPendingRequest();
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error.response?.data?.message || "Talep oluşturulurken bir hata oluştu",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
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

    const getStatusBadge = (status: RequestStatus) => {
        switch (status) {
            case RequestStatus.PENDING:
                return <Badge className="bg-yellow-100 text-yellow-800">Beklemede</Badge>;
            case RequestStatus.APPROVED:
                return <Badge className="bg-green-100 text-green-800">Onaylandı</Badge>;
            case RequestStatus.REJECTED:
                return <Badge className="bg-red-100 text-red-800">Reddedildi</Badge>;
        }
    };

    const getStatusIcon = (status: RequestStatus) => {
        switch (status) {
            case RequestStatus.PENDING:
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            case RequestStatus.APPROVED:
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case RequestStatus.REJECTED:
                return <XCircle className="h-4 w-4 text-red-600" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Hesap Türü Değiştirme */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Hesap Türünü Değiştir
                    </CardTitle>
                    <CardDescription>
                        Yanlış hesap türü seçtiyseniz, değişiklik talebinde bulunabilirsiniz. Talebiniz admin tarafından incelenecektir.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {hasPending ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                <p className="text-yellow-800 font-medium">
                                    Bekleyen bir hesap türü değişiklik talebiniz var
                                </p>
                            </div>
                            <p className="text-sm text-yellow-700 mt-2">
                                Talebiniz admin tarafından incelenirken yeni talep oluşturamazsınız.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="requestedRole">Yeni Hesap Türü</Label>
                                <Select value={requestedRole} onValueChange={setRequestedRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Hesap türünü seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {user?.role !== 'SENDER' && (
                                            <SelectItem value="SENDER">Mal Sahibi</SelectItem>
                                        )}
                                        {user?.role !== 'CARRIER' && (
                                            <SelectItem value="CARRIER">Taşıyıcı</SelectItem>
                                        )}
                                        {user?.role !== 'BROKER' && (
                                            <SelectItem value="BROKER">Broker</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="reason">Değişiklik Sebebi</Label>
                                <Textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Neden hesap türü değişikliği talep ediyorsunuz?"
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    'Talep Gönder'
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* Talep Geçmişi Toggle */}
            <div className="flex justify-center">
                <Button
                    variant="outline"
                    onClick={() => setShowHistory(!showHistory)}
                >
                    {showHistory ? 'Talep Geçmişini Gizle' : 'Talep Geçmişini Göster'}
                </Button>
            </div>

            {/* Talep Geçmişi */}
            {showHistory && (
                <Card>
                    <CardHeader>
                        <CardTitle>Talep Geçmişi</CardTitle>
                        <CardDescription>
                            Gönderdiğiniz hesap türü değişiklik taleplerini buradan takip edebilirsiniz
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingRequests ? (
                            <div className="text-center py-8">
                                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                <p className="text-muted-foreground mt-2">Yükleniyor...</p>
                            </div>
                        ) : myRequests.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Henüz talep oluşturmadınız</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(request.status as RequestStatus)}
                                                <span className="font-medium">
                                                    {getRoleDisplayName(request.currentRole)} → {getRoleDisplayName(request.requestedRole)}
                                                </span>
                                            </div>
                                            {getStatusBadge(request.status as RequestStatus)}
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-2">
                                            <span className="font-medium">Sebep:</span> {request.reason}
                                        </p>

                                        {request.adminNote && (
                                            <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                                                <p className="text-sm text-blue-800">
                                                    <span className="font-medium">Admin Notu:</span> {request.adminNote}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                                            <span>
                                                Oluşturulma: {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                                            </span>
                                            {request.reviewedAt && (
                                                <span>
                                                    İncelendi: {new Date(request.reviewedAt).toLocaleDateString('tr-TR')}
                                                    {request.reviewedByName && ` - ${request.reviewedByName}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
