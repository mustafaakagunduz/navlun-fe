"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Sidebar from "@/app/dashboard/Sidebar";

export default function Dashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    // Giriş yapmamış kullanıcıları login sayfasına yönlendir
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/');
        }
    }, [isLoading, isAuthenticated, router]);

    // Yükleme durumunda gösterilecek içerik
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                    <p className="text-green-600 font-medium">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 overflow-auto bg-gray-50 p-8">
                    <div className="max-w-5xl mx-auto">
                        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

                        <div className="flex items-center justify-center h-[70vh]">
                            <Card className="w-full max-w-lg shadow-lg border-2">
                                <CardContent className="p-12">
                                    <div className="text-center">
                                        {user?.role === 'ADMIN' && (
                                            <h2 className="text-3xl font-bold text-green-600">BURASI ADMİN DASHBOARD</h2>
                                        )}

                                        {user?.role === 'SENDER' && (
                                            <h2 className="text-3xl font-bold text-blue-600">BURASI GÖNDERİCİ DASHBOARD</h2>
                                        )}

                                        {user?.role === 'CARRIER' && (
                                            <h2 className="text-3xl font-bold text-purple-600">BURASI TAŞIYICI DASHBOARD</h2>
                                        )}

                                        <p className="mt-6 text-gray-600">
                                            Merhaba, <span className="font-bold">{user?.firstName} {user?.lastName}</span>!
                                            <br />
                                            {user?.email}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}