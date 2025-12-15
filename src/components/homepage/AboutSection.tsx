"use client"

import { Globe, Leaf, Users } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

const AboutSection = () => {
    const { t } = useLanguage();

    return (
        <section id="about" className="w-full pt-8 md:pt-16 lg:pt-20 pb-12 md:pb-24 lg:pb-32 bg-background">
            <div className="mx-auto px-6 md:px-12 lg:px-16 max-w-[1400px]">
                {/* Başlık */}
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                        {t("about.title")}
                    </h2>
                </div>

                {/* İki sütunlu içerik */}
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Sol Sütun - Genel Açıklama */}
                    <div className="flex flex-col space-y-6">
                        <p className="text-muted-foreground text-base leading-relaxed">
                            {t("about.description")}
                        </p>
                        <p className="text-muted-foreground text-base leading-relaxed">
                            {t("about.platformValues")}
                        </p>
                        <p className="text-muted-foreground text-base leading-relaxed">
                            {t("about.differentiator")}
                        </p>
                        <p className="text-muted-foreground text-base leading-relaxed font-semibold text-green-700">
                            {t("about.contribution")}
                        </p>
                    </div>

                    {/* Sağ Sütun - Misyon, Vizyon, Ekibimiz */}
                    <div className="flex flex-col space-y-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Globe className="h-7 w-7 text-green-600" />
                                <h3 className="text-2xl font-bold">{t("about.mission.title")}</h3>
                            </div>
                            <p className="text-muted-foreground text-base leading-relaxed">
                                {t("about.mission.description")}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Leaf className="h-7 w-7 text-green-600" />
                                <h3 className="text-2xl font-bold">{t("about.vision.title")}</h3>
                            </div>
                            <p className="text-muted-foreground text-base leading-relaxed">
                                {t("about.vision.description")}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Users className="h-7 w-7 text-green-600" />
                                <h3 className="text-2xl font-bold">{t("about.team.title")}</h3>
                            </div>
                            <p className="text-muted-foreground text-base leading-relaxed">
                                {t("about.team.description")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection
