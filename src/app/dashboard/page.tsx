"use client"

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
    const { user } = useAuth();
    const { t } = useLanguage();

    return (
        <div className="p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">{t("dashboard.page.title")}</h1>

                <div className="flex items-center justify-center h-[60vh]">
                    <Card className="w-full max-w-lg shadow-lg border-2">
                        <CardContent className="p-12">
                            <div className="text-center">
                                {user?.role === 'ADMIN' && (
                                    <h2 className="text-3xl font-bold text-green-600">{t("dashboard.page.adminDashboard")}</h2>
                                )}

                                {user?.role === 'SENDER' && (
                                    <h2 className="text-3xl font-bold text-blue-600">{t("dashboard.page.senderDashboard")}</h2>
                                )}

                                {user?.role === 'CARRIER' && (
                                    <h2 className="text-3xl font-bold text-purple-600">{t("dashboard.page.carrierDashboard")}</h2>
                                )}

                                {user?.role === 'BROKER' && (
                                    <h2 className="text-3xl font-bold text-amber-600">{t("dashboard.page.brokerDashboard")}</h2>
                                )}

                                <p className="mt-6 text-gray-600">
                                    {t("dashboard.page.greeting")}, <span className="font-bold">{user?.firstName} {user?.lastName}</span>!
                                    <br />
                                    {user?.email}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}