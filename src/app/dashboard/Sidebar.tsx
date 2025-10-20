// src/app/dashboard/Sidebar.tsx
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
    Leaf,
    MapPin,
    MessageSquare,
    Ship,
    Menu,
    X,
    CreditCard
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import loadService from "@/services/loadService";
import offerService from "@/services/offerService";
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchLoadsWithOffers } from '@/store/slices/offersSlice'
import { fetchAcceptedLoads, fetchRejectedOffers } from '@/store/slices/offersSlice'
import {
    fetchNotificationCounts,
    resetOfferCount,
    resetLoadCount,
    updateOfferCount,
    updateLoadCount,
    resetMessageCount
} from '@/store/slices/notificationsSlice'
import {fetchCurrentBrokerOffers} from "@/store/slices/brokerOffersSlice";

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { loadsWithOffers } = useAppSelector(state => state.offers);
    const { acceptedLoads, rejectedOffers } = useAppSelector(state => state.offers);
    const { pendingOffers } = useAppSelector(state => state.brokerOffers);

    const notificationCounts = counts;

    // Role-specific menu items
    const senderMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/sender/loads", label: t("dashboard.sidebar.myLoads"), icon: Package },
        {
            href: "/dashboard/sender/offers",
            label: t("dashboard.sidebar.senderoffers"),
            icon: FileText,
            badge: notificationCounts.offers
        },
        {
            href: "/dashboard/messages",
            label: t("dashboard.sidebar.messages"),
            icon: MessageSquare,
            badge: notificationCounts.messages || 0
        },
        { href: "/dashboard/sender/delivery-status", label: "Teslimat Takibi", icon: MapPin },
        { href: "/dashboard/sender/sender-completed-deliveries", label: t("dashboard.sidebar.completed"), icon: CheckCheck },
        { href: "/dashboard/sender/environmental-effect", label: t("dashboard.sidebar.environmental"), icon: Leaf },
        { href: "/dashboard/sender/payment-history", label: t("dashboard.sidebar.paymentHistory"), icon: CreditCard },
        { href: "/dashboard/sender/sender-profile", label: t("dashboard.sidebar.profile"), icon: Users },
    ];

    const carrierMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/carrier/available-loads", label: t("dashboard.sidebar.availableLoads"), icon: Package },
        {
            href: "/dashboard/carrier/my-loads",
            label: t("dashboard.sidebar.offers"),
            icon: Truck,
            badge: notificationCounts.loads
        },
        {
            href: "/dashboard/messages",
            label: t("dashboard.sidebar.messages"),
            icon: MessageSquare,
            badge: notificationCounts.messages || 0
        },
        { href: "/dashboard/carrier/delivery-tracking", label: "Teslimat Takibi", icon: MapPin },
        { href: "/dashboard/carrier/carrier-completed-deliveries", label: t("dashboard.sidebar.completed"), icon: CheckCheck },
        { href: "/dashboard/carrier/carrier-profile", label: t("dashboard.sidebar.profile"), icon: Users },
    ];

    const brokerMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/broker/available-loads", label: t("dashboard.sidebar.availableLoads"), icon: Package },
        {
            href: "/dashboard/broker/my-offers",
            label: t("dashboard.sidebar.offers"),
            icon: HandshakeIcon,
            badge: notificationCounts.offers
        },
        {
            href: "/dashboard/messages",
            label: t("dashboard.sidebar.messages"),
            icon: MessageSquare,
            badge: notificationCounts.messages || 0
        },
        { href: "/dashboard/broker/ship-portfolio", label: t("dashboard.sidebar.shipPortfolio"), icon: Truck },
        { href: "/dashboard/broker/commissions", label: t("dashboard.sidebar.commissions"), icon: DollarSign },
        { href: "/dashboard/broker/broker-profile", label: t("dashboard.sidebar.profile"), icon: Users },
    ];

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
        } else if (user.role === 'BROKER') {
            dispatch(fetchCurrentBrokerOffers());
        }
    }, [user, dispatch]);

    useEffect(() => {
        if (user?.role === 'SENDER') {
            const totalPendingOffers = loadsWithOffers.reduce(
                (total, loadWithOffers) => total + loadWithOffers.pendingOffersCount,
                0
            );
            dispatch(updateOfferCount(totalPendingOffers));
        } else if (user?.role === 'CARRIER') {
            const totalLoads = acceptedLoads.length + rejectedOffers.length;
            dispatch(updateLoadCount(totalLoads));
        } else if (user?.role === 'BROKER') {
            dispatch(updateOfferCount(pendingOffers.length));
        }
    }, [loadsWithOffers, acceptedLoads, rejectedOffers, pendingOffers, user?.role, dispatch]);

    useEffect(() => {
        if (user?.role === 'SENDER' && pathname === '/dashboard/sender/offers') {
            dispatch(resetOfferCount());
        } else if (user?.role === 'CARRIER' && pathname === '/dashboard/carrier/my-loads') {
            dispatch(resetLoadCount());
        } else if (user?.role === 'BROKER' && pathname === '/dashboard/broker/my-offers') {
            dispatch(resetOfferCount());
        } else if (pathname === '/dashboard/messages') {
            dispatch(resetMessageCount());
        }
    }, [pathname, user?.role, dispatch]);

    // Role-based menu selection
    let menuItems = senderMenuItems;
    if (user?.role === 'ADMIN') {
        menuItems = adminMenuItems;
    } else if (user?.role === 'CARRIER') {
        menuItems = carrierMenuItems;
    } else if (user?.role === 'BROKER') {
        menuItems = brokerMenuItems;
    }

    // PENDING kullanıcılar için sidebar gösterme
    if (user?.role === 'PENDING') {
        return null;
    }

    return (
        <>
            {/* Mobile Menu Button - sadece mobilde görünür */}
            <Button
                variant="ghost"
                size="sm"
                className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "bg-white h-full border-r transition-all duration-300 ease-in-out",
                // Desktop: her zaman w-64
                "md:w-64",
                // Mobile: overlay olarak açılır
                "fixed md:relative z-50 md:z-auto",
                "w-80 md:w-64",
                isMobileMenuOpen
                    ? "left-0"
                    : "-left-80 md:left-0"
            )}>
                <div className="p-4 h-full">
                    {/* Mobile'da header ekleyin */}
                    <div className="md:hidden mb-4 pt-8">
                        <div className="flex items-center gap-2 px-4">
                            <Leaf className="h-6 w-6 text-green-600" />
                            <span className="text-xl font-bold">Transyük</span>
                        </div>
                    </div>

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
                                    onClick={() => setIsMobileMenuOpen(false)}
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
        </>
    );
}