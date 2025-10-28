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
                // Public endpoint ile admin ID'yi al (yetki gerektirmez)
                console.log('Admin aranıyor...');
                const adminId = await adminService.getSystemAdminId();
                console.log('Admin ID bulundu:', adminId);

                if (adminId) {
                    // Özel bir "admin-support" load ID ile admin mesajlaşmasına yönlendir
                    router.replace(`/dashboard/messages/load/admin-support?otherUserId=${adminId}`);
                } else {
                    console.error('Admin kullanıcı bulunamadı');
                    alert('Sistem yöneticisi bulunamadı. Lütfen daha sonra tekrar deneyin.');
                    router.replace('/dashboard/messages');
                }
            } catch (error: any) {
                console.error('Admin bulma hatası:', error);
                console.error('Error details:', error.response?.data);
                console.error('Error status:', error.response?.status);

                // Kullanıcıya hata mesajı göster
                alert(
                    'Sistem yöneticisi ile iletişim kurulamadı.\n\n' +
                    'Backend\'de /api/v1/public/system-admin-id endpoint\'i bulunamadı.\n' +
                    'Lütfen backend geliştiricisine başvurun.'
                );
                router.replace('/dashboard/messages');
            } finally {
                setLoading(false);
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
