// src/app/dashboard/messages/load/[loadId]/LoadMessagingContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {MessageType, MessagePriority, MessageCategory} from "@/services/messageService";
import {
    MessageSquare,
    Send,
    ArrowLeft,
    Package,
    User,
    Calendar,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import loadService from "@/services/loadService";
import messageService from "@/services/messageService";

interface LoadMessagingContentProps {
    loadId: string;
}

interface Message {
    id: string;
    content: string;
    senderUserId: string;
    senderName: string;
    senderRole: string;
    receiverUserId: string;
    receiverName: string;
    receiverRole: string;
    createdAt: string;
    isRead: boolean;
}

interface LoadInfo {
    id: string;
    title: string;
    status: string;
    origin: string;
    destination: string;
    weight: number;
    goodsType: string;
}

export default function LoadMessagingContent({ loadId }: LoadMessagingContentProps) {
    const { user } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const { toast } = useToast();


    const [messages, setMessages] = useState<Message[]>([]);
    const [loadInfo, setLoadInfo] = useState<LoadInfo | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [otherUser, setOtherUser] = useState<{ id: string; name: string; role: string } | null>(null);

    useEffect(() => {
        loadData();
    }, [loadId]);


    const loadData = async () => {
        try {
            setLoading(true);



            // Load bilgilerini getir
            const loadData = await loadService.getLoadById(loadId);
            console.log('Load data received:', loadData);
            console.log('Load data sender:', loadData.sender);
            console.log('Load data senderId:', loadData.senderId);
            console.log('Load data stringified:', JSON.stringify(loadData, null, 2));

            setLoadInfo({
                id: loadData.id,
                title: loadData.title,
                status: loadData.status,
                origin: loadData.loadingAddress,
                destination: loadData.deliveryAddress,
                weight: loadData.netWeight,
                goodsType: loadData.goodsType
            });

            // Önce sender objesini kontrol et
            if (loadData.sender?.userId) {
                console.log('Using sender object:', loadData.sender);
                setOtherUser({
                    id: loadData.sender.userId,
                    name: loadData.sender.companyName || 'Gönderici',
                    role: 'SENDER'
                });
            } else if (loadData.senderId) {
                console.log('Using senderId fallback:', loadData.senderId);
                setOtherUser({
                    id: loadData.senderId,
                    name: 'Gönderici Şirketi',
                    role: 'SENDER'
                });
            } else {
                console.error('Neither sender object nor senderId found:', { sender: loadData.sender, senderId: loadData.senderId });
                toast({
                    title: "Hata",
                    description: "Gönderici bilgisi yüklenemedi.",
                    variant: "destructive",
                });
                return;
            }

            // Mesajları getir (şimdilik mock data)
            const mockMessages: Message[] = [];
            setMessages(mockMessages);

        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            toast({
                title: "Hata",
                description: "Mesajlar yüklenirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };



    const handleSendMessage = async () => {
        if (!newMessage.trim() || !otherUser) return;

        try {
            setSending(true);

            const response = await messageService.sendMessage({
                loadId,
                receiverUserId: otherUser.id,
                subject: `Yük Mesajı: ${loadInfo?.title || ""}`,
                content: newMessage.trim(),
                messageType: MessageType.GENERAL,
                priority: MessagePriority.NORMAL,
                category: MessageCategory.GENERAL,
            });


            setMessages(prev => [
                ...prev,
                {
                    id: response.id,
                    content: response.content,
                    senderUserId: response.senderUserId,
                    senderName: response.senderFirstName + " " + response.senderLastName,
                    senderRole: response.senderRole,
                    receiverUserId: response.receiverUserId,
                    receiverName: response.receiverFirstName + " " + response.receiverLastName,
                    receiverRole: response.receiverRole,
                    createdAt: response.createdAt,
                    isRead: response.isRead
                }
            ])

            setNewMessage('');

            toast({
                title: "Başarılı",
                description: "Mesaj gönderildi.",
            });
        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);
            toast({
                title: "Hata",
                description: "Mesaj gönderilirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    };


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
            case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['SENDER', 'CARRIER', 'BROKER']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                        <span className="text-gray-600">Mesajlar yükleniyor...</span>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['SENDER', 'CARRIER', 'BROKER']}>
            <div className="p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Geri
                    </Button>

                    <div className="flex items-center gap-3">
                        <MessageSquare className="h-6 w-6 text-green-600" />
                        <div>
                            <h1 className="text-2xl font-bold">Yük Mesajları</h1>
                            <p className="text-gray-600">
                                {loadInfo?.title} - {otherUser?.name} ile konuşma
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Yük Bilgileri */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Yük Bilgileri
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loadInfo && (
                                    <>
                                        <div>
                                            <span className="font-medium">Başlık:</span>
                                            <p className="text-sm text-gray-600">{loadInfo.title}</p>
                                        </div>

                                        <div>
                                            <span className="font-medium">Durum:</span>
                                            <Badge className={`ml-2 ${getStatusColor(loadInfo.status)}`}>
                                                {loadInfo.status}
                                            </Badge>
                                        </div>

                                        <div>
                                            <span className="font-medium">Güzergah:</span>
                                            <p className="text-sm text-gray-600">
                                                {loadInfo.origin} → {loadInfo.destination}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="font-medium">Ağırlık:</span>
                                            <p className="text-sm text-gray-600">{loadInfo.weight} kg</p>
                                        </div>

                                        <div>
                                            <span className="font-medium">Yük Türü:</span>
                                            <p className="text-sm text-gray-600">{loadInfo.goodsType}</p>
                                        </div>
                                    </>
                                )}

                                {otherUser && (
                                    <>
                                        <Separator />
                                        <div>
                                            <span className="font-medium flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Konuştuğunuz Kişi:
                                            </span>
                                            <p className="text-sm text-gray-600">{otherUser.name}</p>
                                            <Badge variant="outline" className="mt-1">
                                                {otherUser.role}
                                            </Badge>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Mesajlar */}
                    <div className="lg:col-span-2">
                        <Card className="h-[600px] flex flex-col">
                            <CardHeader>
                                <CardTitle>Mesajlar</CardTitle>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col">
                                {/* Mesaj Listesi */}
                                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center text-gray-500 mt-8">
                                            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>Henüz mesaj yok. İlk mesajı siz gönderin!</p>
                                        </div>
                                    ) : (
                                        messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${
                                                    message.senderUserId === user?.id
                                                        ? 'justify-end'
                                                        : 'justify-start'
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-lg p-3 ${
                                                        message.senderUserId === user?.id
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-gray-100 text-gray-900'
                                                    }`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                    <div className={`flex items-center gap-2 mt-2 text-xs ${
                                                        message.senderUserId === user?.id
                                                            ? 'text-green-100'
                                                            : 'text-gray-500'
                                                    }`}>
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(message.createdAt)}
                                                        {message.senderUserId === user?.id && (
                                                            <span className="ml-1">
                                                                {message.isRead ? '✓✓' : '✓'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Mesaj Gönderme */}
                                <div className="border-t pt-4">
                                    <div className="flex gap-2">
                                        <Textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Mesajınızı yazın..."
                                            className="flex-1 min-h-[60px] resize-none"
                                            disabled={sending}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim() || sending}
                                            className="bg-green-600 hover:bg-green-700 self-end"
                                        >
                                            {sending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter ile gönder, Shift+Enter ile yeni satır
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}