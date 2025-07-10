// src/app/dashboard/Sidebar.tsx dosyasının güncellenmiş hali
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
    Home,
    Package,
    Truck,
    CheckCheck,
    BarChart3,
    Users,
    Settings,
    FileText,
    DollarSign,
    HandshakeIcon,
    Leaf, MapPin, MessageSquare
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import loadService from "@/services/loadService";
import offerService from "@/services/offerService";
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchLoadsWithOffers } from '@/store/slices/offersSlice'
import { fetchAcceptedLoads, fetchRejectedOffers } from '@/store/slices/offersSlice'
import {
    fetchNotificationCounts,
    resetOfferCount,
    resetLoadCount,
    updateOfferCount, updateLoadCount, resetMessageCount
} from '@/store/slices/notificationsSlice'


// Notification Badge komponenti
const NotificationBadge = ({ count }: { count: number }) => {
    if (count <= 0) return null;

    return (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {count > 99 ? '99+' : count}
        </span>
    );
};

export default function Sidebar() {

    const pathname = usePathname();
    const { user } = useAuth();
    const { t } = useLanguage();
    const dispatch = useAppDispatch();
    const { counts } = useAppSelector(state => state.notifications);

    const { loadsWithOffers } = useAppSelector(state => state.offers);
    const { acceptedLoads, rejectedOffers } = useAppSelector(state => state.offers);

    const notificationCounts = counts;

    // Role-specific menu items
    const senderMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/sender/loads", label: t("dashboard.sidebar.myLoads"), icon: Package },
        {
            href: "/dashboard/sender/offers",
            label: t("dashboard.sidebar.offers"),
            icon: FileText,
            badge: notificationCounts.offers
        },
        {
            href: "/dashboard/messages",
            label: t("dashboard.sidebar.messages"),
            icon: MessageSquare,
            badge: notificationCounts.messages || 0  // 👈 YENİ EKLENEN
        },
        { href: "/dashboard/sender/delivery-status", label: "Teslimat Takibi", icon: MapPin },
        { href: "/dashboard/carrier/sender-completed-deliveries", label: t("dashboard.sidebar.completed"), icon: CheckCheck },
        { href: "/dashboard/carrier/environmental-effect", label: t("dashboard.sidebar.environmental"), icon: Leaf },
        { href: "/dashboard/sender/sender-profile", label: t("dashboard.sidebar.profile"), icon: Users },
    ];

// 2. carrierMenuItems güncelleme:
    const carrierMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/carrier/available-loads", label: t("dashboard.sidebar.availableLoads"), icon: Package },
        {
            href: "/dashboard/carrier/my-loads",
            label: "Tekliflerim",
            icon: Truck,
            badge: notificationCounts.loads
        },
        {
            href: "/dashboard/messages",
            label: t("dashboard.sidebar.messages"),
            icon: MessageSquare,
            badge: notificationCounts.messages || 0  // 👈 YENİ EKLENEN
        },
        { href: "/dashboard/carrier/delivery-tracking", label: "Teslimat Takibi", icon: MapPin },
        { href: "/dashboard/carrier/carrier-completed-deliveries", label: t("dashboard.sidebar.completed"), icon: CheckCheck },
        { href: "/dashboard/carrier/carrier-profile", label: t("dashboard.sidebar.profile"), icon: Users },
    ];

// 3. brokerMenuItems güncelleme:
    const brokerMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/broker/available-loads", label: t("dashboard.sidebar.availableLoads"), icon: Package },
        { href: "/dashboard/broker/offers", label: t("dashboard.sidebar.offers"), icon: HandshakeIcon },
        {
            href: "/dashboard/messages",
            label: t("dashboard.sidebar.messages"),
            icon: MessageSquare,
            badge: notificationCounts.messages || 0  // 👈 YENİ EKLENEN
        },
        { href: "/dashboard/broker/ship-portfolio", label: t("dashboard.sidebar.shipPortfolio"), icon: Truck },
        { href: "/dashboard/broker/commissions", label: t("dashboard.sidebar.commissions"), icon: DollarSign },
        { href: "/dashboard/broker/broker-profile", label: t("dashboard.sidebar.profile"), icon: Users },
    ];

// NOT: Mevcut Sidebar.tsx dosyasında bu değişiklikleri yapman gerekiyor.
// Her role için "Mesajlar" sekmesi eklendi ve notification badge'i hazır.

    const adminMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/admin/users", label: t("dashboard.sidebar.users"), icon: Users },
        { href: "/dashboard/admin/analytics", label: t("dashboard.sidebar.analytics"), icon: BarChart3 },
        { href: "/dashboard/admin/settings", label: t("dashboard.sidebar.settings"), icon: Settings },
    ];

    useEffect(() => {
        if (!user) return;

        if (user.role === 'SENDER') {
            dispatch(fetchLoadsWithOffers());
        } else if (user.role === 'CARRIER') {
            dispatch(fetchAcceptedLoads());
            dispatch(fetchRejectedOffers());
        }
    }, [user, dispatch]);

    useEffect(() => {
        // Notification counts'u her değişiklikten sonra güncelle
        if (user?.role === 'SENDER') {
            const totalPendingOffers = loadsWithOffers.reduce(
                (total, loadWithOffers) => total + loadWithOffers.pendingOffersCount,
                0
            );
            dispatch(updateOfferCount(totalPendingOffers));
        } else if (user?.role === 'CARRIER') {
            const totalLoads = acceptedLoads.length + rejectedOffers.length;
            dispatch(updateLoadCount(totalLoads));
        }
    }, [loadsWithOffers, acceptedLoads, rejectedOffers, user?.role, dispatch]);

    useEffect(() => {
        // Sayfa değişikliklerinde badge'leri sıfırla
        if (user?.role === 'SENDER' && pathname === '/dashboard/sender/offers') {
            dispatch(resetOfferCount());
        } else if (user?.role === 'CARRIER' && pathname === '/dashboard/carrier/my-loads') {
            dispatch(resetLoadCount());
        } else if (pathname === '/dashboard/messages') {
            dispatch(resetMessageCount()); // 👈 YENİ EKLENEN
        }
    }, [pathname, user?.role, dispatch]);

    // Role-based menu selection
    let menuItems = senderMenuItems; // Default
    if (user?.role === 'ADMIN') {
        menuItems = adminMenuItems;
    } else if (user?.role === 'CARRIER') {
        menuItems = carrierMenuItems;
    } else if (user?.role === 'BROKER') {
        menuItems = brokerMenuItems;
    }

    return (
        <aside className="w-64 bg-white h-full border-r">
            <div className="p-4 h-full">
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        const hasBadge = 'badge' in item && item.badge && item.badge > 0;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-md relative",
                                    isActive
                                        ? "bg-green-50 text-green-600"
                                        : "text-gray-700 hover:bg-gray-100"
                                )}
                            >
                                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-green-600" : "text-gray-400")} />
                                <span className="flex-1">{item.label}</span>
                                {hasBadge && <NotificationBadge count={item.badge as number} />}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}