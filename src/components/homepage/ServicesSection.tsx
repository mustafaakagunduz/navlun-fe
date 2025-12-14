// components/ServicesSection.tsx
"use client"

import { Truck, Ship, User, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/context/LanguageContext"

const ServicesSection = () => {
    const { t } = useLanguage();

    return (
        <Card className="border-0 shadow-none relative">
            <div className="absolute inset-0">
                <img
                    src="/assets/images/trans.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60"></div>
            </div>
            <CardContent className="p-0 relative z-10">
                <section id="services" className="w-full py-12 md:py-24 lg:py-32">
                    <div className="mx-auto px-4 md:px-6 max-w-7xl">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
                                    {t("services.title")}
                                </h2>
                            </div>
                        </div>

                        {/* User Roles Section */}
                        <div className="mx-auto flex justify-center items-stretch gap-8 py-8 flex-wrap max-w-6xl">
                            <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl rounded-lg animate-fade-in w-full sm:w-80 flex flex-col">
                                <CardContent className="p-6 flex-1 flex flex-col">
                                    <div className="flex flex-col items-center space-y-3 flex-1">
                                        <User className="h-12 w-12 text-green-400" />
                                        <h3 className="text-xl font-bold text-white text-center">{t("services.userRoles.sender.title")}</h3>
                                        <p className="text-green-100 text-center text-sm leading-relaxed">{t("services.userRoles.sender.description")}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl rounded-lg animate-fade-in w-full sm:w-80 flex flex-col" style={{ animationDelay: '0.1s' }}>
                                <CardContent className="p-6 flex-1 flex flex-col">
                                    <div className="flex flex-col items-center space-y-3 flex-1">
                                        <Ship className="h-12 w-12 text-blue-400" />
                                        <h3 className="text-xl font-bold text-white text-center">{t("services.userRoles.seaCarrier.title")}</h3>
                                        <p className="text-green-100 text-center text-sm leading-relaxed">{t("services.userRoles.seaCarrier.description")}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl rounded-lg animate-fade-in w-full sm:w-80 flex flex-col" style={{ animationDelay: '0.2s' }}>
                                <CardContent className="p-6 flex-1 flex flex-col">
                                    <div className="flex flex-col items-center space-y-3 flex-1">
                                        <Truck className="h-12 w-12 text-yellow-400" />
                                        <h3 className="text-xl font-bold text-white text-center">{t("services.userRoles.landCarrier.title")}</h3>
                                        <p className="text-green-100 text-center text-sm leading-relaxed">{t("services.userRoles.landCarrier.description")}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* How It Works Section */}
                        <div className="mx-auto max-w-6xl mt-16 space-y-8">
                            <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl rounded-lg p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-500/20 rounded-xl shrink-0">
                                        <User className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-green-100 text-sm leading-relaxed">{t("services.howItWorks.senderProcess")}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl rounded-lg p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-500/20 rounded-xl shrink-0">
                                        <Ship className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-green-100 text-sm leading-relaxed">{t("services.howItWorks.brokerProcess")}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl rounded-lg p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-yellow-500/20 rounded-xl shrink-0">
                                        <Truck className="h-6 w-6 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-green-100 text-sm leading-relaxed">{t("services.howItWorks.carrierProcess")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </CardContent>
        </Card>
    )
}

export default ServicesSection