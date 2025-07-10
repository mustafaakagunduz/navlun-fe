// src/app/dashboard/messages/load/[loadId]/LoadMessagingContent.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    MessageSquare,
    Send,
    ArrowLeft,
    Package,
    User,
    Calendar,
    Loader2,
    MapPin,
    Weight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import loadService from "@/services/loadService";
import messageService, { MessageType, MessagePriority, MessageCategory, MessageResponse } from "@/services/messageService";

interface LoadMessagingContentProps {
    loadId: string;
}

interface LoadInfo {
    id: string;
    title: string;
    status: string;
    origin: string;
    destination: string;
    weight: number;
    goodsType: string;
    senderName: string;
}

interface OtherUser {
    id: string;
    name: string;
    role: string;
}

export default function LoadMessagingContent({ loadId }: LoadMessagingContentProps) {
    const { user } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // URL'den otherUserId'yi al
    const otherUserId = searchParams.get('otherUserId');

    // State
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [loadInfo, setLoadInfo] = useState<LoadInfo | null>(null);
    const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (loadId && user?.id && otherUserId) {
            loadData();
        }
    }, [loadId, user?.id, otherUserId]);

    // Mesajlar değiştiğinde en alta scroll
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadData = async () => {
        try {
            setLoading(true);

            console.log('Debug - LoadId:', loadId);
            console.log('Debug - UserId:', user?.id);
            console.log('Debug - OtherUserId:', otherUserId);
            console.log('Debug - User Role:', user?.role);
            console.log('Debug - API URL will be:', `/messages/load/${loadId}/conversation?userId=${user?.id}&otherUserId=${otherUserId}`);

            // Load bilgilerini getir
            const loadData = await loadService.getLoadById(loadId);
            console.log('Debug - Load data:', loadData);

            setLoadInfo({
                id: loadData.id,
                title: loadData.title,
                status: loadData.status,
                origin: loadData.loadingAddress,
                destination: loadData.deliveryAddress,
                weight: loadData.netWeight || 0,
                goodsType: loadData.goodsType,
                senderName: loadData.sender?.companyName || loadData.sender?.contactPerson || "Bilinmeyen"
            });

            // Diğer kullanıcı bilgisini belirle
            if (user?.role === 'BROKER') {
                // Broker ise, sender ile konuşuyor
                if (loadData.sender?.userId) {
                    setOtherUser({
                        id: loadData.sender.userId, // User ID kullan
                        name: loadData.sender.companyName || loadData.sender.contactPerson || "Bilinmeyen",
                        role: 'SENDER'
                    });
                }
            } else if (user?.role === 'CARRIER') {
                // Carrier ise, sender ile konuşuyor
                if (loadData.sender?.userId) {
                    setOtherUser({
                        id: loadData.sender.userId, // User ID kullan
                        name: loadData.sender.companyName || loadData.sender.contactPerson || "Bilinmeyen",
                        role: 'SENDER'
                    });
                }
            } else {
                // Sender ise, broker/carrier ile konuşuyor (otherUserId'den belirle)
                if (otherUserId) {
                    setOtherUser({
                        id: otherUserId,
                        name: "Taşıyıcı/Broker", // Bu bilgi daha detaylı API'den alınabilir
                        role: 'CARRIER' // Default olarak carrier, gerçekte API'den alınmalı
                    });
                }
            }

            // Mesajları getir - otherUser bilgisi belirlendikten sonra
            let finalOtherUserId = null;

            if (user?.role === 'BROKER' || user?.role === 'CARRIER') {
                // Broker/Carrier ise sender ile konuşuyor
                // sender.id profile ID'si, sender.userId ise User ID'si
                finalOtherUserId = loadData.sender?.userId;
            } else {
                // Sender ise URL'den gelen otherUserId'yi kullan
                finalOtherUserId = otherUserId;
            }

            if (user?.id && finalOtherUserId) {
                console.log('Debug - Final other user ID:', finalOtherUserId);
                console.log('Debug - Sender Profile ID:', loadData.sender?.id);
                console.log('Debug - Sender User ID:', loadData.sender?.userId);
                const messagesData = await messageService.getLoadConversation(loadId, user.id, finalOtherUserId);
                setMessages(messagesData);
            }

        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            toast({
                title: "Hata",
                description: "Veriler yüklenirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !otherUser || !user) return;

        try {
            setSending(true);

            const messageData = {
                loadId,
                senderUserId: user.id,
                receiverUserId: otherUser.id,
                subject: `Yük Mesajı: ${loadInfo?.title || ""}`,
                content: newMessage.trim(),
                messageType: MessageType.GENERAL,
                priority: MessagePriority.NORMAL,
                category: MessageCategory.GENERAL,
            };

            console.log('Debug - Message data being sent:', messageData);
            console.log('Debug - OtherUser state:', otherUser);


            const response = await messageService.sendMessage(messageData);

            // Mesajı listeye ekle
            setMessages(prev => [...prev, response]);
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

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SENDER':
                return 'bg-blue-100 text-blue-800';
            case 'BROKER':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'SENDER':
                return 'Gönderici';
            case 'BROKER':
                return 'Broker';
            default:
                return role;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Mesajlar yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!otherUserId) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-red-600">Geçersiz mesajlaşma parametresi</p>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/dashboard/messages')}
                            className="mt-4"
                        >
                            Mesajlara Dön
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/dashboard/messages')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Mesajlara Dön
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {loadInfo?.title || 'Yük Mesajlaşması'}
                        </h1>
                        <p className="text-gray-600">
                            {otherUser?.name} ile mesajlaşma ({getRoleText(otherUser?.role || '')})
                        </p>
                    </div>
                </div>

                {/* Yük Bilgileri */}
                {loadInfo && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Yük Detayları
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Nereden</p>
                                        <p className="font-medium">{loadInfo.origin}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Nereye</p>
                                        <p className="font-medium">{loadInfo.destination}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Weight className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Ağırlık</p>
                                        <p className="font-medium">{loadInfo.weight} ton</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Mesajlaşma */}
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Mesajlar
                            <Badge variant="outline" className="ml-auto">
                                {messages.length} mesaj
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Mesaj Listesi */}
                        <div className="h-96 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p>Henüz mesaj bulunmuyor</p>
                                    <p className="text-sm">İlk mesajı göndererek konuşmayı başlatın</p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${
                                            message.senderUserId === user?.id ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                                                message.senderUserId === user?.id
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <User className="h-3 w-3" />
                                                <span className="text-xs font-medium">
                                                    {message.senderUserId === user?.id ? 'Siz' :
                                                        `${message.senderFirstName || ''} ${message.senderLastName || ''}`.trim() || 'Bilinmeyen'}
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-xs ${
                                                        message.senderUserId === user?.id
                                                            ? 'bg-green-700 text-green-100'
                                                            : getRoleBadgeColor(message.senderRole)
                                                    }`}
                                                >
                                                    {getRoleText(message.senderRole)}
                                                </Badge>
                                            </div>

                                            <p className="text-sm whitespace-pre-wrap">
                                                {message.content}
                                            </p>

                                            <div className={`flex items-center justify-between mt-2 text-xs ${
                                                message.senderUserId === user?.id
                                                    ? 'text-green-100'
                                                    : 'text-gray-500'
                                            }`}>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(message.createdAt)}
                                                </div>
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
                            <div ref={messagesEndRef} />
                        </div>

                        <Separator />

                        {/* Mesaj Gönderme */}
                        <div className="p-4">
                            <div className="flex gap-2">
                                <Textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Mesajınızı yazın... (Enter ile gönder)"
                                    className="flex-1 min-h-[60px] resize-none"
                                    disabled={sending}
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
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}