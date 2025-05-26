"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    Leaf
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const { t } = useLanguage();

    // Role-specific menu items
    const senderMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/sender/loads", label: t("dashboard.sidebar.myLoads"), icon: Package },
        { href: "/dashboard/sender/offers", label: t("dashboard.sidebar.offers"), icon: FileText },
        { href: "/dashboard/carrier/sender-completed-deliveries", label: t("dashboard.sidebar.completed"), icon: CheckCheck },
        { href: "/dashboard/carrier/environmental-effect", label: t("dashboard.sidebar.environmental"), icon: Leaf },
        { href: "/dashboard/sender/sender-profile", label: t("dashboard.sidebar.profile"), icon: Users },
    ];

    const carrierMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/carrier/available-loads", label: t("dashboard.sidebar.availableLoads"), icon: Package },
        { href: "/dashboard/carrier/my-loads", label: t("dashboard.sidebar.myLoads"), icon: Truck },
        { href: "/dashboard/carrier/carrier-completed-deliveries", label: t("dashboard.sidebar.completed"), icon: CheckCheck },
        { href: "/dashboard/carrier/carrier-profile", label: t("dashboard.sidebar.profile"), icon: Users },
    ];

    const brokerMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/broker/available-loads", label: t("dashboard.sidebar.availableLoads"), icon: Package },
        { href: "/dashboard/broker/deals", label: t("dashboard.sidebar.deals"), icon: HandshakeIcon },
        { href: "/dashboard/broker/commissions", label: t("dashboard.sidebar.commissions"), icon: DollarSign },
        { href: "/dashboard/broker/broker-profile", label: t("dashboard.sidebar.profile"), icon: Users },
    ];

    const adminMenuItems = [
        { href: "/dashboard", label: t("dashboard.sidebar.home"), icon: Home },
        { href: "/dashboard/admin/users", label: t("dashboard.sidebar.users"), icon: Users },
        { href: "/dashboard/admin/analytics", label: t("dashboard.sidebar.analytics"), icon: BarChart3 },
        { href: "/dashboard/admin/settings", label: t("dashboard.sidebar.settings"), icon: Settings },
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