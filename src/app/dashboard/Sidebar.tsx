// src/app/dashboard/Sidebar.tsx
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
    FileText
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    // Role-specific menu items
    const adminMenuItems = [
        { href: "/dashboard/admin", label: "Ana Sayfa", icon: Home },
        { href: "/dashboard/admin/users", label: "Kullanıcılar", icon: Users },
        { href: "/dashboard/admin/analytics", label: "Analitik", icon: BarChart3 },
        { href: "/dashboard/admin/settings", label: "Ayarlar", icon: Settings },
    ];

    const senderMenuItems = [
        { href: "/dashboard/sender", label: "Ana Sayfa", icon: Home },
        { href: "/dashboard/sender/loads", label: "Yüklerim", icon: Package },
        { href: "/dashboard/sender/offers", label: "Gelen Teklifler", icon: FileText },
        { href: "/dashboard/sender/profile", label: "Profilim", icon: Users },
    ];

    const carrierMenuItems = [
        { href: "/dashboard/carrier", label: "Ana Sayfa", icon: Home },
        { href: "/dashboard/carrier/available-loads", label: "Yeni Yükler", icon: Package },
        { href: "/dashboard/carrier/my-loads", label: "Yüklerim", icon: Truck },
        { href: "/dashboard/carrier/schedule", label: "Takvim", icon: Calendar },
        { href: "/dashboard/carrier/profile", label: "Profilim", icon: Users },
    ];

    // Role-based menu selection
    let menuItems = senderMenuItems; // Default
    if (user?.role === 'ADMIN') {
        menuItems = adminMenuItems;
    } else if (user?.role === 'CARRIER') {
        menuItems = carrierMenuItems;
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