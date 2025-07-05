// src/app/dashboard/messages/load/[loadId]/page.tsx
"use client"

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    Send,
    MessageSquare,
    Package,
    MapPin,
    Calendar,
    Weight,
    Shield,
    Leaf,
    Building2,
    User,
    Clock,
    Check,
    CheckCheck,
    Loader2,
    Phone,
    Mail
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
    fetchLoadConversation,
    sendMessage,
    setActiveLoadId,
    clearActiveConversation,
    markMessageAsRead
} from '@/store/slices/messagesSlice';
import { MessageRequest, MessageType, MessagePriority, MessageCategory } from '@/services/messageService';
import loadService, { Load } from '@/services/loadService';
import senderService from '@/services/senderService';

interface LoadMessagingPageProps {
    params: {
        loadId: string;


    };
}

export default function LoadMessagingPage({ params }: LoadMessagingPageProps) {
    const { loadId } = params;
    const router = useRouter();
    const searchParams = useSearchParams();
    const senderProfileId = searchParams.get('senderProfileId');
    const { user, isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const dispatch = useAppDispatch();
    const { toast } = useToast();

    // Redux state
    const {
        activeConversation,
        activeConversationLoading,
        activeConversationError,
        sendMessageLoading
    } = useAppSelector(state => state.messages);

    // Local state
    const [load, setLoad] = useState<Load | null>(null);
    const [loadLoading, setLoadLoading] = useState(true);
    const [senderUserId, setSenderUserId] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [messageSubject, setMessageSubject] = useState('');

    // Redirect unauthenticated users
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, router]);

    // Load yük bilgilerini getir
    useEffect(() => {
        const fetchLoadData = async () => {
            try {
                setLoadLoading(true);
                const loadData = await loadService.getLoadById(loadId);
                setLoad(loadData);

                // Sender profile ID'den user ID'yi bul
                if (senderProfileId) {
                    try {
                        const senderProfile = await senderService.getSenderProfileById(senderProfileId);
                        setSenderUserId(senderProfile.userId);
                    } catch (error) {
                        console.error('Sender profile fetch error:', error);
                        toast({
                            title: 'Hata',
                            description: 'Gönderici bilgileri alınamadı.',
                            variant: 'destructive',
                        });
                    }
                }
            } catch (error) {
                console.error('Load fetch error:', error);
                toast({
                    title: 'Hata',
                    description: 'Yük bilgileri alınamadı.',
                    variant: 'destructive',
                });
            } finally {
                setLoadLoading(false);
            }
        };

        if (loadId) {
            fetchLoadData();
        }
    }, [loadId, senderProfileId, toast]);

    // Konuşmayı yükle
    useEffect(() => {
        if (user?.id && senderUserId && loadId) {
            dispatch(setActiveLoadId(loadId));
            dispatch(fetchLoadConversation({ loadId, user1Id: user.id, user2Id: senderUserId }));
        }

        return () => {
            dispatch(clearActiveConversation());
        };
    }, [dispatch, loadId, user?.id, senderUserId]);

    // Mesaj konusu otomatik doldur
    useEffect(() => {
        if (load && !messageSubject) {
            setMessageSubject(`${load.goodsType} Yükü Hakkında`);
        }
    }, [load, messageSubject]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !user?.id || !senderUserId) {
            toast({
                title: 'Eksik Bilgi',
                description: 'Lütfen mesaj yazın.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const messageRequest: MessageRequest = {
                loadId: loadId,
                receiverUserId: senderUserId,
                subject: messageSubject || `${load?.goodsType} Yükü Hakkında`,
                content: messageText,
                messageType: MessageType.GENERAL_MESSAGE,
                priority: MessagePriority.NORMAL,
                category: MessageCategory.GENERAL
            };

            await dispatch(sendMessage(messageRequest)).unwrap();

            setMessageText('');

            toast({
                title: 'Başarılı',
                description: 'Mesajınız gönderildi.',
            });

        } catch (error: any) {
            console.error('Send message error:', error);
            toast({
                title: 'Hata',
                description: error.message || 'Mesaj gönderilemedi.',
                variant: 'destructive',
            });
        }
    };

    const handleMarkAsRead = async (messageId: string) => {
        if (user?.id) {
            await dispatch(markMessageAsRead({ messageId, userId: user.id }));
        }
    };

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffInDays === 1) {
            return 'Dün ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        }
    };

    const getInitials = (firstName?: string, lastName?: string, email?: string) => {
        if (firstName && lastName) {
            return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        } else if (email) {
            return email.charAt(0).toUpperCase();
        }
        return 'U';
    };

    const getUserName = (firstName?: string, lastName?: string, email?: string) => {
        if (firstName && lastName) {
            return `${firstName} ${lastName}`;
        } else if (firstName) {
            return firstName;
        } else if (email) {
            return email;
        }
        return 'Kullanıcı';
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    if (loadLoading || activeConversationLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Mesajlar yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!load) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Yük bulunamadı</h3>
                    <p className="text-gray-600 mb-4">Bu yüke ait bilgiler alınamadı.</p>
                    <Button onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Geri Dön
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-6 max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Geri
                    </Button>
                    <div className="flex items-center gap-3">
                        <MessageSquare className="h-6 w-6 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Yük Mesajlaşması</h1>
                            <p className="text-gray-600">{load.goodsType} - {load.title}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Yük Bilgileri Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    Yük Detayları
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">{load.title}</h3>
                                    <Badge className={`${getStatusBadgeColor(load.status)} border`}>
                                        {load.status === 'PENDING' ? 'Beklemede' :
                                            load.status === 'ACTIVE' ? 'Aktif' :
                                                load.status === 'COMPLETED' ? 'Tamamlandı' : load.status}
                                    </Badge>
                                </div>

                                {load.sender && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                            <Building2 className="h-4 w-4" />
                                            <span className="font-medium">Gönderici Şirket</span>
                                        </div>
                                        <p className="font-medium">{load.sender.companyName}</p>
                                        {load.sender.contactPerson && (
                                            <p className="text-sm text-gray-600">{load.sender.contactPerson}</p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Package className="h-4 w-4 text-gray-400" />
                                        <span>{load.goodsType}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Weight className="h-4 w-4 text-gray-400" />
                                        <span>{load.netWeight} kg</span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                                            <div>
                                                <span className="font-medium text-green-600">Yükleme:</span>
                                                <p className="text-gray-600">{load.loadingAddress}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                                            <div>
                                                <span className="font-medium text-red-600">Teslimat:</span>
                                                <p className="text-gray-600">{load.deliveryAddress}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span>Yükleme: {new Date(load.loadingDate).toLocaleDateString('tr-TR')}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span>Teslimat: {new Date(load.deliveryDate).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                </div>

                                {(load.insuranceRequested || load.ecoTransportRequested) && (
                                    <div className="pt-3 border-t">
                                        <div className="space-y-2">
                                            {load.insuranceRequested && (
                                                <Badge variant="secondary" className="text-xs">
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    Sigorta Talep Edildi
                                                </Badge>
                                            )}
                                            {load.ecoTransportRequested && (
                                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                                    <Leaf className="h-3 w-3 mr-1" />
                                                    Çevreci Taşıma
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {load.description && (
                                    <div className="pt-3 border-t">
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Açıklama</h4>
                                        <p className="text-sm text-gray-700">{load.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Mesajlaşma Alanı */}
                    <div className="lg:col-span-2">
                        <Card className="h-[calc(100vh-200px)]">
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center justify-between">
                                    <span>Mesajlar</span>
                                    <Badge variant="outline">
                                        {activeConversation.length} mesaj
                                    </Badge>
                                </CardTitle>
                            </CardHeader>

                            {/* Mesaj Listesi */}
                            <div className="flex flex-col h-full">
                                <ScrollArea className="flex-1 p-4">
                                    {activeConversationError ? (
                                        <div className="text-center py-8">
                                            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">Mesajlar yüklenirken hata oluştu</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => {
                                                    if (user?.id && senderUserId) {
                                                        dispatch(fetchLoadConversation({ loadId, user1Id: user.id, user2Id: senderUserId }));
                                                    }
                                                }}
                                            >
                                                Tekrar Dene
                                            </Button>
                                        </div>
                                    ) : activeConversation.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">Henüz mesaj yok</p>
                                            <p className="text-sm text-gray-400 mt-2">
                                                Bu yük için ilk mesajı gönderin
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {activeConversation.map((message) => {
                                                const isMyMessage = message.senderUserId === user?.id;

                                                return (
                                                    <div
                                                        key={message.id}
                                                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div className={`max-w-[80%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                                                            <div className={`flex items-start gap-3 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                                                <Avatar className="w-8 h-8">
                                                                    <AvatarFallback className={isMyMessage ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}>
                                                                        {getInitials(
                                                                            isMyMessage ? user?.firstName : message.senderFirstName,
                                                                            isMyMessage ? user?.lastName : message.senderLastName,
                                                                            isMyMessage ? user?.email : message.senderEmail
                                                                        )}
                                                                    </AvatarFallback>
                                                                </Avatar>

                                                                <div className={`flex-1 ${isMyMessage ? 'text-right' : 'text-left'}`}>
                                                                    <div className={`inline-block p-3 rounded-lg ${
                                                                        isMyMessage
                                                                            ? 'bg-blue-600 text-white'
                                                                            : 'bg-gray-100 text-gray-900'
                                                                    }`}>
                                                                        <p className="text-sm">{message.content}</p>
                                                                    </div>

                                                                    <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                                                                        isMyMessage ? 'justify-end' : 'justify-start'
                                                                    }`}>
                                                                        <span>
                                                                            {getUserName(
                                                                                isMyMessage ? user?.firstName : message.senderFirstName,
                                                                                isMyMessage ? user?.lastName : message.senderLastName,
                                                                                isMyMessage ? user?.email : message.senderEmail
                                                                            )}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span>{formatMessageTime(message.createdAt)}</span>
                                                                        {isMyMessage && message.isRead && (
                                                                            <CheckCheck className="h-3 w-3 text-blue-600" />
                                                                        )}
                                                                        {isMyMessage && !message.isRead && (
                                                                            <Check className="h-3 w-3 text-gray-400" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>

                                {/* Mesaj Gönderme Formu */}
                                <div className="border-t p-4">
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Mesaj konusu..."
                                                value={messageSubject}
                                                onChange={(e) => setMessageSubject(e.target.value)}
                                                className="flex-1"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Textarea
                                                placeholder="Mesajınızı yazın..."
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                className="flex-1 min-h-[80px] resize-none"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                            />
                                            <Button
                                                onClick={handleSendMessage}
                                                disabled={!messageText.trim() || sendMessageLoading}
                                                className="self-end"
                                            >
                                                {sendMessageLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>

                                        <p className="text-xs text-gray-500">
                                            Enter tuşu ile gönder, Shift+Enter ile yeni satır
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}