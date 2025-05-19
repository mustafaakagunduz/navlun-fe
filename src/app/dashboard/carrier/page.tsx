// src/app/dashboard/carrier/page.tsx
"use client"

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";

export default function CarrierDashboard() {
    return (
        <ProtectedRoute allowedRoles={['CARRIER']}>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Taşıyıcı Paneli</h1>



            </div>
        </ProtectedRoute>
    );
}