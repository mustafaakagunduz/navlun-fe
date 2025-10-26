"use client"

import { ReactNode } from 'react';
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from "./Sidebar";

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
                return t("dashboard.layout.admin");
            case 'SENDER':
                return t("dashboard.layout.sender");
            case 'CARRIER':
                return t("dashboard.layout.carrier");
            case 'BROKER':
                return t("dashboard.layout.broker");
            case 'PENDING':
                return 'Beklemede';
            default:
                return role;
        }
    };

    const getRoleColorClass = (role: string) => {
        switch(role) {
            case 'ADMIN':
                return 'bg-green-100 text-green-800';
            case 'SENDER':
                return 'bg-blue-100 text-blue-800';
            case 'CARRIER':
                return 'bg-purple-100 text-purple-800';
            case 'BROKER':
                return 'bg-amber-100 text-amber-800';
            case 'PENDING':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="bg-white border-b shadow-sm">
                <div className="flex h-16 items-center justify-between px-4 w-full">
                    <div className="flex items-center">
                        {/* Mobile'da sidebar için boşluk, desktop'ta sol üstte */}
                        <div className="ml-12 md:ml-4">
                            <Link href="/dashboard">
                                <Image
                                    src="/assets/images/transyuk.png"
                                    alt="TRANSYÜK Logo"
                                    width={150}
                                    height={40}
                                    className="h-10 w-auto"
                                />
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium hidden sm:inline">
                                  {user.firstName} {user.lastName}
                                </span>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getRoleColorClass(user.role)}`}>
                                  {getRoleName(user.role)}
                                </span>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            className="border-green-600 text-green-600 hover:bg-green-50"
                            onClick={handleLogout}
                        >
                            <span className="hidden sm:inline">{t("navbar.logout")}</span>
                            <span className="sm:hidden">Çıkış</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main content with sidebar */}
            <div className="flex flex-1 relative">
                <Sidebar />
                <main className="flex-1 overflow-auto bg-gray-50 w-full md:w-auto">
                    {children}
                </main>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t py-4">
                <div className="container mx-auto px-4">
                    <p className="text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Transyük. {t("dashboard.layout.footerText")}
                    </p>
                </div>
            </footer>
        </div>
    );
}