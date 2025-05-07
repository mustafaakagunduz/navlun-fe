// components/ServicesSection.tsx
"use client"

import { Truck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
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
            icon: <Truck className="h-10 w-10 text-green-600" />,
            titleIndex: 0,
            descriptionIndex: 0,
        },
        {
            icon: <Truck className="h-10 w-10 text-green-600" />,
            titleIndex: 1,
            descriptionIndex: 1,
        },
        {
            icon: <Truck className="h-10 w-10 text-green-600" />,
            titleIndex: 2,
            descriptionIndex: 2,
        },
        {
            icon: <Truck className="h-10 w-10 text-green-600" />,
            titleIndex: 3,
            descriptionIndex: 3,
        },
        {
            icon: <Truck className="h-10 w-10 text-green-600" />,
            titleIndex: 4,
            descriptionIndex: 4,
        },
        {
            icon: <Truck className="h-10 w-10 text-green-600" />,
            titleIndex: 5,
            descriptionIndex: 5,
        },
    ]

    return (
        <Card className="border-0 shadow-none bg-green-50">
            <CardContent className="p-0">
                <section id="services" className="w-full py-12 md:py-24 lg:py-32">
                    <div className="mx-auto px-4 md:px-6 max-w-7xl">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800">
                                    {t("services.subtitle")}
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    {t("services.title")}
                                </h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    {t("services.description")}
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
                            {services.map((service, index) => (
                                <Card key={index} className="shadow-md">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col items-center space-y-2">
                                            {service.icon}
                                            <h3 className="text-xl font-bold">{t(`services.items.${service.titleIndex}.title`)}</h3>
                                            <p className="text-muted-foreground text-center">{t(`services.items.${service.descriptionIndex}.description`)}</p>
                                            <Button variant="link" className="text-green-600 mt-2">
                                                {t("services.moreInfo")} <ArrowRight className="ml-1 h-4 w-4" />
                                            </Button>
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