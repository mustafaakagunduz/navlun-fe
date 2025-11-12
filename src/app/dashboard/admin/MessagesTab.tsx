"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare,
    Search,
    Loader2,
    User,
    Package,
    Clock,
    Mail,
    RefreshCcw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import messageService, { ConversationResponse } from '@/services/messageService';
import { formatDate } from '@/utils/dateUtils';

export default function MessagesTab() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [conversations, setConversations] = useState<ConversationResponse[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<ConversationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) {
            loadConversations();
            loadUnreadCount();
        }
    }, [user?.id]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredConversations(conversations);
        } else {
            const filtered = conversations.filter(conversation =>
                conversation.loadTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                conversation.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                conversation.lastMessageContent.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredConversations(filtered);
        }
    }, [searchQuery, conversations]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await messageService.getUserConversations(user!.id);
            setConversations(data);
        } catch (error) {
            console.error('Konuşmalar yüklenirken hata:', error);
            toast({
                title: "Hata",
                description: "Konuşmalar yüklenirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const count = await messageService.getUnreadCount(user!.id);
            setUnreadCount(count);
        } catch (error) {
            console.error('Okunmamış sayı yüklenirken hata:', error);
        }
    };

    const handleConversationClick = (loadId: string, otherUserId: string) => {
        router.push(`/dashboard/messages/load/${loadId}?otherUserId=${otherUserId}`);
    };

    const handleRefresh = () => {
        loadConversations();
        loadUnreadCount();
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInHours < 1) {
            return 'Az önce';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} saat önce`;
        } else if (diffInDays < 7) {
            return `${Math.floor(diffInDays)} gün önce`;
        } else {
            return formatDate(dateString);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SENDER':
                return 'bg-blue-100 text-blue-800';
            case 'CARRIER':
                return 'bg-purple-100 text-purple-800';
            case 'BROKER':
                return 'bg-amber-100 text-amber-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'SENDER':
                return 'Gönderici';
            case 'CARRIER':
                return 'Taşıyıcı';
            case 'BROKER':
                return 'Broker';
            default:
                return role;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Mesajlar
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="bg-red-500 ml-2">
                                <Mail className="h-3 w-3 mr-1" />
                                {unreadCount} okunmamış
                            </Badge>
                        )}
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Yenile
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Konuşmaları ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Conversations */}
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Konuşmalar yükleniyor...
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        {searchQuery ? (
                            <>
                                <p className="text-gray-500">Arama kriterlerinize uygun konuşma bulunamadı</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Farklı anahtar kelimelerle tekrar deneyin
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-500">Henüz konuşma bulunmuyor</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Kullanıcılar size mesaj gönderdiğinde burada görünecek
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredConversations.map((conversation) => {
                            const conversationKey = `${conversation.loadId}-${conversation.otherUserId}`;
                            const isHovered = hoveredConversation === conversationKey;
                            const hasUnread = conversation.unreadCount > 0;

                            return (
                                <div
                                    key={conversationKey}
                                    className={`
                                        group relative p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer
                                        ${hasUnread
                                            ? 'border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 hover:border-blue-400 hover:shadow-lg'
                                            : 'border-gray-200 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 hover:shadow-md'
                                        }
                                        ${isHovered ? 'scale-[1.02] shadow-xl' : 'scale-100'}
                                    `}
                                    onClick={() => handleConversationClick(conversation.loadId, conversation.otherUserId)}
                                    onMouseEnter={() => setHoveredConversation(conversationKey)}
                                    onMouseLeave={() => setHoveredConversation(null)}
                                >
                                    {/* Okunmamış gösterge çizgisi */}
                                    {hasUnread && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-xl" />
                                    )}

                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            {/* Başlık ve Okunmamış Badge */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`
                                                    p-2 rounded-lg transition-colors duration-300
                                                    ${isHovered
                                                        ? 'bg-blue-500 text-white'
                                                        : hasUnread ? 'bg-blue-400 text-white' : 'bg-blue-100 text-blue-600'
                                                    }
                                                `}>
                                                    <Package className="h-4 w-4 flex-shrink-0" />
                                                </div>
                                                <h3 className={`
                                                    font-semibold truncate transition-colors duration-300
                                                    ${isHovered ? 'text-blue-700' : hasUnread ? 'text-gray-900' : 'text-gray-800'}
                                                `}>
                                                    {conversation.loadTitle}
                                                </h3>
                                                {hasUnread && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold shadow-md animate-pulse"
                                                    >
                                                        {conversation.unreadCount}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Kullanıcı Bilgisi */}
                                            <div className="flex items-center gap-2 mb-3 ml-1">
                                                <div className={`
                                                    p-1.5 rounded-md transition-colors duration-300
                                                    ${isHovered ? 'bg-purple-100' : 'bg-gray-100'}
                                                `}>
                                                    <User className={`
                                                        h-3 w-3 transition-colors duration-300
                                                        ${isHovered ? 'text-purple-600' : 'text-gray-500'}
                                                    `} />
                                                </div>
                                                <span className={`
                                                    text-sm font-medium transition-colors duration-300
                                                    ${isHovered ? 'text-gray-900' : 'text-gray-600'}
                                                `}>
                                                    {conversation.otherUserName}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={`
                                                        text-xs font-medium transition-all duration-300
                                                        ${isHovered
                                                            ? 'border-2 shadow-sm'
                                                            : 'border'
                                                        }
                                                        ${getRoleBadgeColor(conversation.otherUserRole)}
                                                    `}
                                                >
                                                    {getRoleText(conversation.otherUserRole)}
                                                </Badge>
                                            </div>

                                            {/* Son Mesaj */}
                                            <div className={`
                                                p-3 rounded-lg mb-3 transition-all duration-300
                                                ${isHovered
                                                    ? 'bg-white/80 shadow-sm border border-blue-100'
                                                    : hasUnread ? 'bg-white/70' : 'bg-gray-50/80'
                                                }
                                            `}>
                                                <p className={`
                                                    text-sm line-clamp-2 transition-colors duration-300
                                                    ${isHovered ? 'text-gray-800' : 'text-gray-600'}
                                                    ${hasUnread ? 'font-medium' : ''}
                                                `}>
                                                    {conversation.lastMessageContent}
                                                </p>
                                            </div>

                                            {/* Alt Bilgiler */}
                                            <div className="flex items-center justify-between">
                                                <div className={`
                                                    flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-300
                                                    ${isHovered
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }
                                                `}>
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-medium">
                                                        {getRelativeTime(conversation.lastMessageAt)}
                                                    </span>
                                                </div>
                                                <div className={`
                                                    flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-300
                                                    ${isHovered
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }
                                                `}>
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-medium">
                                                        {conversation.messageCount} mesaj
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover ok ikonu */}
                                    <div className={`
                                        absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300
                                        ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
                                    `}>
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full shadow-lg">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
