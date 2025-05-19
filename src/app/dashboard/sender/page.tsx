// src/app/dashboard/sender/page.tsx
"use client"

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import SenderDashboardStats from "@/app/dashboard/sender/SenderDashboardStats";

export default function SenderDashboard() {
    return (
        <ProtectedRoute allowedRoles={['SENDER']}>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Gönderici Paneli</h1>

                <SenderDashboardStats />


            </div>
        </ProtectedRoute>
    );
}