"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { CheckCircle, Leaf, Recycle } from "lucide-react"
import { Button } from "@/components/ui/button"
import TruckAnimation from "./TruckAnimation"
import { useLanguage } from "@/context/LanguageContext"

interface HeroSectionProps {
    setShowConfetti: React.Dispatch<React.SetStateAction<boolean>>;
    setConfettiSize: React.Dispatch<React.SetStateAction<{width: number; height: number}>>;
}

const HeroSection = ({ setShowConfetti, setConfettiSize }: HeroSectionProps) => {
    const { t } = useLanguage();

    return (
        <section
            id="hero"
            className="w-full h-[calc(100vh-40px)] flex flex-col bg-green-50 overflow-hidden"
        >
            {/* Kamyon Animasyonu
            <div className="w-full mt-6">
                <TruckAnimation
                    setShowConfetti={setShowConfetti}
                    setConfettiSize={setConfettiSize}
                />
            </div>  - En üstte */}

            {/* Ana içerik - tam ortalanmış */}
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-[800px] flex flex-col items-center justify-center text-center">
                    {/* Başlık */}
                    <motion.h1
                        className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {t("hero.title")}
                    </motion.h1>

                    {/* Açıklama */}
                    <motion.p
                        className="text-muted-foreground md:text-xl mx-auto mt-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {t("hero.description")}
                    </motion.p>

                    {/* Butonlar */}
                    <motion.div
                        className="flex flex-wrap justify-center gap-3 mt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        {/* Taşıma Hizmeti Al Butonu - Gönderici */}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="outline"
                                className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-white"
                            >
                                {t("hero.getService")}
                            </Button>
                        </motion.div>

                        {/* Taşımacı Olarak Katıl Butonu */}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="outline"
                                className="border-green-600 text-green-600 hover:bg-green-50 bg-white"
                            >
                                {t("hero.joinAsCarrier")}
                            </Button>
                        </motion.div>

                        {/* Aracı Olarak Katıl Butonu */}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="outline"
                                className="border-amber-600 text-amber-600 hover:bg-amber-50 bg-white"
                            >
                                {t("hero.joinAsBroker")}
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* İkonlar */}
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="flex items-center gap-1">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm">{t("hero.safe")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Leaf className="h-5 w-5 text-green-600" />
                            <span className="text-sm">{t("hero.ecofriendly")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Recycle className="h-5 w-5 text-green-600" />
                            <span className="text-sm">{t("hero.sustainable")}</span>
                        </div>
                    </div>



                    {/* Görsel */}
                    <motion.div
                        className="relative h-[200px] sm:h-[250px] rounded-xl overflow-hidden w-full max-w-[800px] mx-auto mt-8"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                    >
                        <motion.div
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            transition={{
                                duration: 2,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: "reverse",
                                ease: "easeInOut",
                            }}
                        >
                            <Image
                                src="/placeholder.svg?height=500&width=800"
                                alt="Ekolojik taşımacılık"
                                fill
                                className="object-cover"
                                priority
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection