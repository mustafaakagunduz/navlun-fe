// components/ServicesSection.tsx
"use client"

import { Truck, Ship } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { JSX } from "react"
import { useLanguage } from "@/context/LanguageContext"

interface Service {
    icon: JSX.Element;
    titleIndex: number;
    descriptionIndex: number;
}

const ServicesSection = () => {
    const { t } = useLanguage();

    // JSON yapısında items dizisinin indekslerini kullanıyoruz
    const services: Service[] = [
        {
            icon: <Ship className="h-10 w-10 text-green-400" />,
            titleIndex: 0,
            descriptionIndex: 0,
        },
        {
            icon: <Truck className="h-10 w-10 text-green-400" />,
            titleIndex: 1,
            descriptionIndex: 1,
        },
    ]

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
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">

                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
                                    {t("services.title")}
                                </h2>
                                <p className="max-w-[900px] text-green-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    {t("services.description")}
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto flex justify-center items-stretch gap-8 py-12 flex-wrap">
                            {services.map((service, index) => (
                                <Card
                                    key={index}
                                    className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl rounded-sm animate-fade-in w-80 flex flex-col"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <CardContent className="p-6 flex-1 flex flex-col">
                                        <div className="flex flex-col items-center space-y-2 flex-1">
                                            {service.icon}
                                            <h3 className="text-xl font-bold text-white">{t(`services.items.${service.titleIndex}.title`)}</h3>
                                            <p className="text-green-100 text-center">{t(`services.items.${service.descriptionIndex}.description`)}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </CardContent>
        </Card>
    )
}

export default ServicesSection