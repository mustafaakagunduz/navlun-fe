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
        { href: "/dashboard", label: "Ana Sayfa", icon: Home },
        { href: "/dashboard/users", label: "Kullanıcılar", icon: Users },
        { href: "/dashboard/analytics", label: "Analitik", icon: BarChart3 },
        { href: "/dashboard/settings", label: "Ayarlar", icon: Settings },
    ];

    const senderMenuItems = [
        { href: "/dashboard", label: "Ana Sayfa", icon: Home },
        { href: "/dashboard/loads", label: "Yüklerim", icon: Package },
        { href: "/dashboard/offers", label: "Gelen Teklifler", icon: FileText },
        { href: "/dashboard/profile", label: "Profilim", icon: Users },
    ];

    const carrierMenuItems = [
        { href: "/dashboard", label: "Ana Sayfa", icon: Home },
        { href: "/dashboard/available-loads", label: "Yeni Yükler", icon: Package },
        { href: "/dashboard/my-loads", label: "Yüklerim", icon: Truck },
        { href: "/dashboard/schedule", label: "Takvim", icon: Calendar },
        { href: "/dashboard/profile", label: "Profilim", icon: Users },
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