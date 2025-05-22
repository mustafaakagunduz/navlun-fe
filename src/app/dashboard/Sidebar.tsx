"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Package,
    Truck,
    Calendar,
    BarChart3,
    Users,
    Settings,
    FileText,
    DollarSign,
    HandshakeIcon,
    Building
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const { t } = useLanguage();

    // Role-specific menu items
    const adminMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/users", label: t("dashboard.sidebar.users"), icon: Users },
        { href: "/dashboard/analytics", label: t("dashboard.sidebar.analytics"), icon: BarChart3 },
        { href: "/dashboard/settings", label: t("dashboard.sidebar.settings"), icon: Settings },
    ];

    const senderMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/loads", label: t("dashboard.sidebar.myLoads"), icon: Package },
        { href: "/dashboard/offers", label: t("dashboard.sidebar.offers"), icon: FileText },
        { href: "/dashboard/sender-profile", label: t("dashboard.sidebar.profile"), icon: Users },
    ];

    const carrierMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/available-loads", label: t("dashboard.sidebar.availableLoads"), icon: Package },
        { href: "/dashboard/my-loads", label: t("dashboard.sidebar.myLoads"), icon: Truck },
        { href: "/dashboard/schedule", label: t("dashboard.sidebar.schedule"), icon: Calendar },
        { href: "/dashboard/carrier-profile", label: t("dashboard.sidebar.profile"), icon: Users },
    ];

    // Yeni eklenen broker menü öğeleri
    const brokerMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/available-loads", label: t("dashboard.sidebar.availableLoads"), icon: Package },
        { href: "/dashboard/deals", label: t("dashboard.sidebar.deals"), icon: HandshakeIcon },
        { href: "/dashboard/brokerages", label: t("dashboard.sidebar.brokerages"), icon: Building },
        { href: "/dashboard/commissions", label: t("dashboard.sidebar.commissions"), icon: DollarSign },
        { href: "/dashboard/broker-profile", label: t("dashboard.sidebar.profile"), icon: Users },
    ];

    // Role-based menu selection
    let menuItems = senderMenuItems; // Default
    if (user?.role === 'ADMIN') {
        menuItems = adminMenuItems;
    } else if (user?.role === 'CARRIER') {
        menuItems = carrierMenuItems;
    } else if (user?.role === 'BROKER') {
        menuItems = brokerMenuItems; // Broker rolü için menü öğeleri
    }

    return (
        <aside className="w-64 bg-white h-full border-r">
            <div className="p-4 h-full">
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-md",
                                    isActive
                                        ? "bg-green-50 text-green-600"
                                        : "text-gray-700 hover:bg-gray-100"
                                )}
                            >
                                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-green-600" : "text-gray-400")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}