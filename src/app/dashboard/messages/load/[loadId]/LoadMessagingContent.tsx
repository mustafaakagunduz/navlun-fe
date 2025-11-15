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
    MoreVertical,  // 👈 YENİ (⋮ ikonu)
    Edit2,         // 👈 YENİ
    Trash2,         // 👈 YENİ
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
import { formatDateTime, formatRelativeTime, parseDate } from '@/utils/dateUtils';

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
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPollingActiveRef = useRef(true);
    const { user } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const userScrolledUpRef = useRef(false);
    const previousMessageCountRef = useRef(0);

    //edit-delete işleri
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);


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

    // Scroll pozisyonunu kontrol et
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            // Kullanıcı en alttan 100px yukarıdaysa, yukarı scroll yapmış sayılır
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            const isAtBottom = distanceFromBottom < 100;

            if (!isAtBottom) {
                userScrolledUpRef.current = true;
                console.log('Kullanıcı yukarı scroll yaptı, otomatik scroll devre dışı');
            } else {
                userScrolledUpRef.current = false;
                console.log('Kullanıcı en altta, otomatik scroll aktif');
            }
        };

        container.addEventListener('scroll', handleScroll);

        // İlk mount'ta scroll pozisyonunu kontrol et
        handleScroll();

        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    // Mesajlar değiştiğinde sadece kullanıcı en alttaysa scroll yap
    useEffect(() => {
        const hasNewMessages = messages.length > previousMessageCountRef.current;
        previousMessageCountRef.current = messages.length;

        // Sadece yeni mesaj geldiyse ve kullanıcı yukarı scroll yapmadıysa scroll yap
        if (hasNewMessages && !userScrolledUpRef.current) {
            console.log('Yeni mesaj var ve kullanıcı en altta, scroll yapılıyor');
            scrollToBottom();
        } else if (hasNewMessages && userScrolledUpRef.current) {
            console.log('Yeni mesaj var ama kullanıcı yukarıda, scroll yapılmıyor');
        }
    }, [messages]);

    // Polling için useEffect
    useEffect(() => {
        if (!loadId || !user?.id || !otherUser?.id) return;

        const startPolling = () => {
            // Mevcut interval'ı temizle
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }

            pollingIntervalRef.current = setInterval(async () => {
                // Sayfa aktif değilse polling yapma
                if (document.visibilityState !== 'visible') return;

                // Polling aktif değilse (mesaj gönderiliyorsa) polling yapma
                if (!isPollingActiveRef.current) return;

                try {
                    let finalOtherUserId = null;

                    if (loadId === 'admin-support' || loadId === 'null') {
                        // Admin mesajlaşması için otherUser ID'sini direkt kullan
                        finalOtherUserId = otherUser.id;
                    } else if (user?.role === 'BROKER' || user?.role === 'CARRIER') {
                        // Broker/Carrier için sender'ın user ID'sini kullan
                        const loadData = await loadService.getLoadById(loadId);
                        finalOtherUserId = loadData.sender?.userId;
                    } else {
                        // Sender için otherUser ID'sini kullan
                        finalOtherUserId = otherUser.id;
                    }

                    if (finalOtherUserId) {
                        // "null" string'ini "admin-support" olarak değiştir
                        const apiLoadId = loadId === 'null' ? 'admin-support' : loadId;
                        const newMessages = await messageService.getLoadConversation(apiLoadId, user.id, finalOtherUserId);

                        // Null check - eğer newMessages undefined veya null ise boş array kullan
                        if (!newMessages || !Array.isArray(newMessages)) {
                            console.warn('Geçersiz mesaj response, boş array kullanılıyor');
                            return;
                        }

                        // TAMAMEN YENİ YAKLAŞIM: Tüm mesaj listesini karşılaştır
                        setMessages(prevMessages => {
                            // Aynı mesaj sayısı ve içerik varsa değişiklik yok
                            if (prevMessages.length === newMessages.length) {
                                // Her mesajı karşılaştır (content ve updatedAt)
                                const hasChanges = newMessages.some((newMsg, index) => {
                                    const prevMsg = prevMessages[index];
                                    return !prevMsg ||
                                        prevMsg.content !== newMsg.content ||
                                        prevMsg.updatedAt !== newMsg.updatedAt;
                                });

                                if (!hasChanges) {
                                    return prevMessages; // Değişiklik yok, mevcut state'i koru
                                }
                            }

                            // Değişiklik var veya yeni mesajlar var, tümünü güncelle
                            console.log('Mesajlar güncellendi (edit/delete/new)');
                            return newMessages;
                        });
                    }
                } catch (error) {
                    console.error('Polling sırasında hata:', error);
                }
            }, 3000); // 3 saniyede bir kontrol et
        };

        startPolling();

        // Cleanup function
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [loadId, user?.id, otherUser?.id, user?.role]);

// Sayfa görünürlüğü değiştiğinde polling'i kontrol et
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Sayfa görünür olduğunda polling'i yeniden başlat
                isPollingActiveRef.current = true;
            } else {
                // Sayfa görünmez olduğunda polling'i durdur
                isPollingActiveRef.current = false;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

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

            // Admin mesajlaşması için özel durum (admin-support veya null)
            if (loadId === 'admin-support' || loadId === 'null') {
                // Admin mesajlaşması için mock load bilgisi
                setLoadInfo({
                    id: 'admin-support',
                    title: 'Sistem Yöneticisi ile İletişim',
                    status: 'ACTIVE',
                    origin: 'Destek Merkezi',
                    destination: 'Yardım Masası',
                    weight: 0,
                    goodsType: 'Destek Talebi',
                    senderName: 'Admin'
                });

                // Admin kullanıcı bilgisini set et
                if (otherUserId) {
                    setOtherUser({
                        id: otherUserId,
                        name: 'Sistem Yöneticisi',
                        role: 'ADMIN'
                    });
                }
            } else {
                // Normal yük için load bilgilerini getir
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
            }

            // Mesajları getir - otherUser bilgisi belirlendikten sonra
            let finalOtherUserId = null;
            let actualLoadData = null;

            if (loadId === 'admin-support' || loadId === 'null') {
                // Admin mesajlaşması için otherUserId'yi direkt kullan
                finalOtherUserId = otherUserId;
            } else if (user?.role === 'BROKER' || user?.role === 'CARRIER') {
                // Broker/Carrier ise sender ile konuşuyor
                // sender.id profile ID'si, sender.userId ise User ID'si
                actualLoadData = await loadService.getLoadById(loadId);
                finalOtherUserId = actualLoadData.sender?.userId;
            } else {
                // Sender ise URL'den gelen otherUserId'yi kullan
                finalOtherUserId = otherUserId;
            }

            if (user?.id && finalOtherUserId) {
                console.log('Debug - Final other user ID:', finalOtherUserId);
                if (loadId !== 'admin-support' && loadId !== 'null' && actualLoadData) {
                    console.log('Debug - Sender Profile ID:', actualLoadData.sender?.id);
                    console.log('Debug - Sender User ID:', actualLoadData.sender?.userId);
                }

                // "null" string'ini "admin-support" olarak değiştir
                const apiLoadId = loadId === 'null' ? 'admin-support' : loadId;

                // loadData fonksiyonunda, mesajları aldıktan sonra:
                const messagesData = await messageService.getLoadConversation(apiLoadId, user.id, finalOtherUserId);
                console.log('Debug - Mesaj tarihleri:', messagesData.map(msg => ({
                    id: msg.id,
                    content: msg.content.substring(0, 20),
                    createdAt: msg.createdAt,
                    createdAtType: typeof msg.createdAt,
                    parsedDate: new Date(msg.createdAt),
                    isValidDate: !isNaN(new Date(msg.createdAt).getTime())
                })));
                setMessages(messagesData);
                previousMessageCountRef.current = messagesData.length;

                // İlk yükleme yapılınca en alta scroll yap
                userScrolledUpRef.current = false;

                // Biraz bekleyip scroll yap (DOM render edilene kadar)
                setTimeout(() => {
                    scrollToBottom();
                }, 100);

                // Okunmamış mesajları okundu olarak işaretle
                const unreadMessages = messagesData.filter(msg =>
                    msg.receiverUserId === user.id && !msg.isRead
                );

                for (const message of unreadMessages) {
                    try {
                        await messageService.markAsRead(message.id, user.id);
                    } catch (error) {
                        console.error('Mesaj okundu işaretlenirken hata:', error);
                    }
                }

                if (unreadMessages.length > 0) {
                    console.log(`${unreadMessages.length} mesaj okundu olarak işaretlendi`);
                }

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

    const handleEditMessage = (messageId: string, currentContent: string) => {
        setEditingMessageId(messageId);
        setEditingContent(currentContent);
    };

    const handleSaveEdit = async (messageId: string) => {
        if (!editingContent.trim() || !user?.id) return;

        try {
            const updatedMessage = await messageService.updateMessage(messageId, user.id, editingContent.trim());

            // Mesajı listede güncelle
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId ? updatedMessage : msg
                )
            );

            setEditingMessageId(null);
            setEditingContent('');

            toast({
                title: "Başarılı",
                description: "Mesaj güncellendi.",
            });
        } catch (error: any) {
            console.error('Mesaj güncelleme hatası:', error);
            toast({
                title: "Hata",
                description: error.response?.data?.message || "Mesaj güncellenirken hata oluştu.",
                variant: "destructive",
            });
        }
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditingContent('');
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!user?.id) return;

        const confirmed = window.confirm("Bu mesajı silmek istediğinizden emin misiniz?");
        if (!confirmed) return;

        try {
            setDeletingMessageId(messageId);

            await messageService.deleteMessage(messageId, user.id);

            // Mesajı listeden kaldır
            setMessages(prev => prev.filter(msg => msg.id !== messageId));

            toast({
                title: "Başarılı",
                description: "Mesaj silindi.",
            });
        } catch (error: any) {
            console.error('Mesaj silme hatası:', error);
            toast({
                title: "Hata",
                description: error.response?.data?.message || "Mesaj silinirken hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setDeletingMessageId(null);
        }
    };

    // Mesajın editlenebilir olup olmadığını kontrol et
    const canEditMessage = (message: MessageResponse) => {
        // Sadece kendi mesajlarını düzenleyebilir
        if (message.senderUserId !== user?.id) return false;

        // Mesaj tarihini parse et
        const messageTime = parseDate(message.createdAt);
        if (!messageTime) return false;

        const now = new Date();
        const diffInMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);

        // 15 dakika içinde editlenebilir
        return diffInMinutes <= 15;
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !otherUser || !user) return;

        try {
            setSending(true);

            // Mesaj gönderilirken polling'i durdur
            isPollingActiveRef.current = false;

            // "null" string'ini "admin-support" olarak değiştir
            const apiLoadId = loadId === 'null' ? 'admin-support' : loadId;

            const messageData = {
                loadId: apiLoadId,
                senderUserId: user.id,
                receiverUserId: otherUser.id,
                subject: `Yük Mesajı: ${loadInfo?.title || ""}`,
                content: newMessage.trim(),
                messageType: MessageType.GENERAL,
                priority: MessagePriority.NORMAL,
                category: MessageCategory.GENERAL,
            };

            const response = await messageService.sendMessage(messageData);

            // Mesajı listeye ekle
            setMessages(prev => [...prev, response]);
            setNewMessage('');

            // Mesaj gönderildiğinde her zaman en alta scroll yap
            userScrolledUpRef.current = false;

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

            // Mesaj gönderimi tamamlandıktan sonra polling'i tekrar başlat
            setTimeout(() => {
                isPollingActiveRef.current = true;
            }, 1000);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // formatDate artık dateUtils'den geliyor, yerel fonksiyona gerek yok

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SENDER':
                return 'bg-blue-100 text-blue-800';
            case 'BROKER':
                return 'bg-green-100 text-green-800';
            case 'CARRIER':
                return 'bg-purple-100 text-purple-800';
            case 'ADMIN':
                return 'bg-red-100 text-red-800';
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
            case 'CARRIER':
                return 'Taşıyıcı';
            case 'ADMIN':
                return 'Yönetici';
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
                        <div ref={messagesContainerRef} className="h-96 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p>Henüz mesaj bulunmuyor</p>
                                    <p className="text-sm">İlk mesajı göndererek konuşmayı başlatın</p>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const isMyMessage = message.senderUserId === user?.id;
                                    const isEditing = editingMessageId === message.id;
                                    const isDeleting = deletingMessageId === message.id;
                                    const canEdit = canEditMessage(message);

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg relative word-wrap break-word ${
                                                    isMyMessage
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                }`}
                                                style={{
                                                    overflowWrap: 'break-word',
                                                    wordBreak: 'break-word',
                                                    hyphens: 'auto'
                                                }}
                                            >
                                                {/* Edit/Delete Butonları - Sadece kendi mesajlarında */}
                                                {isMyMessage && canEdit && !isEditing && !isDeleting && (
                                                    <div className="absolute -top-2 -right-2 flex gap-1 z-10">
                                                        <button
                                                            type="button"
                                                            className="h-6 w-6 bg-white text-blue-500 hover:bg-blue-50 rounded-full shadow-md border border-gray-200 flex items-center justify-center transition-colors"
                                                            onClick={() => handleEditMessage(message.id, message.content)}
                                                        >
                                                            <Edit2 className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="h-6 w-6 bg-white text-red-500 hover:bg-red-50 rounded-full shadow-md border border-gray-200 flex items-center justify-center transition-colors"
                                                            onClick={() => handleDeleteMessage(message.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Loading indicator for deleting */}
                                                {isDeleting && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-20">
                                                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                                                    </div>
                                                )}

                                                {/* Header - User info */}
                                                <div className="flex items-center gap-2 mb-1">
                                                    <User className="h-3 w-3 flex-shrink-0" />
                                                    <span className="text-xs font-medium truncate">
            {isMyMessage ? 'Siz' :
                `${message.senderFirstName || ''} ${message.senderLastName || ''}`.trim() || 'Bilinmeyen'}
        </span>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-xs flex-shrink-0 ${
                                                            isMyMessage
                                                                ? 'bg-green-700 text-green-100'
                                                                : getRoleBadgeColor(message.senderRole)
                                                        }`}
                                                    >
                                                        {getRoleText(message.senderRole)}
                                                    </Badge>
                                                </div>

                                                {/* Message Content */}
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <Textarea
                                                            value={editingContent}
                                                            onChange={(e) => setEditingContent(e.target.value)}
                                                            className="min-h-[60px] text-sm bg-white text-gray-900 border-gray-300"
                                                            autoFocus
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleCancelEdit}
                                                                className="h-7 px-2 text-xs"
                                                            >
                                                                İptal
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleSaveEdit(message.id)}
                                                                disabled={!editingContent.trim()}
                                                                className="h-7 px-2 text-xs"
                                                            >
                                                                Kaydet
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p
                                                        className="text-sm min-w-0"
                                                        style={{
                                                            overflowWrap: 'break-word',
                                                            wordBreak: 'break-word',
                                                            whiteSpace: 'pre-wrap',
                                                            hyphens: 'auto'
                                                        }}
                                                    >
                                                        {message.content}
                                                    </p>
                                                )}

                                                {/* Footer - Date and read status */}
                                                {!isEditing && (
                                                    <div className={`flex items-center justify-between mt-2 text-xs ${
                                                        isMyMessage
                                                            ? 'text-green-100'
                                                            : 'text-gray-500'
                                                    }`}>
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            <Calendar className="h-3 w-3" />
                                                            <span className="truncate">
                    {formatDateTime(message.createdAt)}
                </span>
                                                            {(() => {
                                                                if (!message.updatedAt || !message.createdAt) return null;
                                                                const updated = parseDate(message.updatedAt);
                                                                const created = parseDate(message.createdAt);
                                                                if (!updated || !created) return null;
                                                                // Eğer updatedAt, createdAt'tan 1 saniyeden fazla sonraysa düzenlenmiştir
                                                                const diffInSeconds = Math.abs(updated.getTime() - created.getTime()) / 1000;
                                                                if (diffInSeconds > 1) {
                                                                    return <span className="ml-1 italic text-xs">(düzenlendi)</span>;
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
                                                        {isMyMessage && (
                                                            <span className="ml-1 flex-shrink-0">
                    {message.isRead ? '✓✓' : '✓'}
                </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
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