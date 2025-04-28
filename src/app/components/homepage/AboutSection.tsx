"use client"

import Image from "next/image"
import { Globe, Leaf, Truck } from "lucide-react"
import { useLanguage } from "@/app/context/LanguageContext"

const AboutSection = () => {
    const { t } = useLanguage();

    return (
        <section id="about" className="w-full pt-8 md:pt-16 lg:pt-20 pb-12 md:pb-24 lg:pb-32 bg-background">
            <div className="mx-auto px-4 md:px-6 max-w-7xl">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800">
                            {t("about.subtitle")}
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                            {t("about.title")}
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            {t("about.description")}
                        </p>
                    </div>
                </div>

                <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                    {/* Görsel Alanı */}
                    <div className="relative h-[300px] sm:h-[400px] rounded-xl overflow-hidden shadow-md bg-white">
                        <Image
                            src="/placeholder.svg?height=400&width=600"
                            alt={t("about.title")}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Metin Alanı */}
                    <div className="flex flex-col justify-center space-y-4 p-6 shadow-md bg-white rounded-xl">
                        <ul className="grid gap-6">
                            <li>
                                <div className="grid gap-1">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-green-600" />
                                        <h3 className="text-xl font-bold">{t("about.mission.title")}</h3>
                                    </div>
                                    <p className="text-muted-foreground">
                                        {t("about.mission.description")}
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="grid gap-1">
                                    <div className="flex items-center gap-2">
                                        <Leaf className="h-5 w-5 text-green-600" />
                                        <h3 className="text-xl font-bold">{t("about.vision.title")}</h3>
                                    </div>
                                    <p className="text-muted-foreground">
                                        {t("about.vision.description")}
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="grid gap-1">
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-green-600" />
                                        <h3 className="text-xl font-bold">{t("about.values.title")}</h3>
                                    </div>
                                    <p className="text-muted-foreground">
                                        {t("about.values.description")}
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection
