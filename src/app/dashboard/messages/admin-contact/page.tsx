"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import adminService from '@/services/adminService';

export default function AdminContactPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const findAdminAndRedirect = async () => {
            if (!user?.id) return;

            try {
                // Admin kullanıcıları bul
                const response = await adminService.searchUsers('', 'ADMIN', undefined, 0, 1);

                if (response.content && response.content.length > 0) {
                    const adminUser = response.content[0];

                    // Özel bir "admin-support" load ID ile admin mesajlaşmasına yönlendir
                    // Bu load ID backend'de özel olarak handle edilecek
                    router.replace(`/dashboard/messages/load/admin-support?otherUserId=${adminUser.id}`);
                } else {
                    // Admin bulunamazsa mesajlar sayfasına geri dön
                    router.replace('/dashboard/messages');
                }
            } catch (error) {
                console.error('Admin bulunamadı:', error);
                router.replace('/dashboard/messages');
            }
        };

        findAdminAndRedirect();
    }, [user, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
                <p className="text-gray-600">Admin ile bağlantı kuruluyor...</p>
            </div>
        </div>
    );
}
