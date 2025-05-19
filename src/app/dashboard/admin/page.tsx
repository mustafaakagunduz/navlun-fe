// src/app/dashboard/admin/page.tsx
"use client"

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";


export default function AdminDashboard() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Yönetici Paneli</h1>



            </div>
        </ProtectedRoute>
    );
}