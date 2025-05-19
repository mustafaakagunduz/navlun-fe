// src/app/dashboard/layout.tsx
"use client"

import { ReactNode } from 'react';
import { Leaf } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from 'next/navigation';
import Sidebar from "@/app/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { logout, user } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const getRoleName = (role: string) => {
        switch(role) {
            case 'ADMIN':
                return 'Yönetici';
            case 'SENDER':
                return 'Gönderici';
            case 'CARRIER':
                return 'Taşıyıcı';
            default:
                return role;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="bg-white border-b shadow-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard">
                            <div className="flex items-center gap-2">
                                <Leaf className="h-6 w-6 text-green-600" />
                                <span className="text-xl font-bold">EkoTaşıma</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium hidden md:inline">
                                    {user.firstName} {user.lastName}
                                </span>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                                    user.role === 'ADMIN'
                                        ? 'bg-green-100 text-green-800'
                                        : user.role === 'SENDER'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-purple-100 text-purple-800'
                                }`}>
                                    {getRoleName(user.role)}
                                </span>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            className="border-green-600 text-green-600 hover:bg-green-50"
                            onClick={handleLogout}
                        >
                            {t("navbar.logout") || "Çıkış Yap"}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main content area with sidebar */}
            <div className="flex flex-1">
                {/* Sidebar - burada dashboard'un her sayfasında görünecek */}
                <Sidebar />

                {/* Main content */}
                <main className="flex-1 p-6 overflow-auto bg-gray-50">
                    <div className="container mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t py-4">
                <div className="container mx-auto px-4">
                    <p className="text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} EkoTaşıma. Tüm hakları saklıdır.
                    </p>
                </div>
            </footer>
        </div>
    );
}