"use client"
import Wrapper from "@/app/components/Wrapper";
import Image from "next/image"
import { motion } from "framer-motion"
import { CheckCircle, Leaf, Recycle } from "lucide-react"
import { Button } from "@/components/ui/button"
import TruckAnimation from "./TruckAnimation"
import { useLanguage } from "@/app/context/LanguageContext"

interface HeroSectionProps {
    setShowConfetti: React.Dispatch<React.SetStateAction<boolean>>;
    setConfettiSize: React.Dispatch<React.SetStateAction<{width: number; height: number}>>;
}

const HeroSection = ({ setShowConfetti, setConfettiSize }: HeroSectionProps) => {
    const { t } = useLanguage();

    return (
        <section
            id="hero"
            className="w-full min-h-screen flex items-center justify-center bg-green-50"
        >
            <Wrapper>
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="max-w-[800px] space-y-4 mb-8">
                        <motion.h1
                            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {t("hero.title")}
                        </motion.h1>
                        <motion.p
                            className="text-muted-foreground md:text-xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {t("hero.description")}
                        </motion.p>
                        <motion.div
                            className="flex flex-col sm:flex-row gap-3 justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button className="bg-green-600 hover:bg-green-700">
                                    {t("hero.getService")}
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                                    {t("hero.joinAsCarrier")}
                                </Button>
                            </motion.div>
                        </motion.div>
                        <div className="flex items-center justify-center gap-6 pt-4">
                            <motion.div
                                className="flex items-center gap-1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.6 }}
                            >
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-sm">{t("hero.safe")}</span>
                            </motion.div>
                            <motion.div
                                className="flex items-center gap-1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.8 }}
                            >
                                <Leaf className="h-5 w-5 text-green-600" />
                                <span className="text-sm">{t("hero.ecofriendly")}</span>
                            </motion.div>
                            <motion.div
                                className="flex items-center gap-1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 1 }}
                            >
                                <Recycle className="h-5 w-5 text-green-600" />
                                <span className="text-sm">{t("hero.sustainable")}</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* Kamyon animasyonu bileşeni */}
                    <TruckAnimation
                        setShowConfetti={setShowConfetti}
                        setConfettiSize={setConfettiSize}
                    />

                    {/* Orta büyük görsel */}
                    <motion.div
                        className="relative h-[250px] sm:h-[350px] lg:h-[400px] rounded-xl overflow-hidden w-full max-w-[800px] mx-auto"
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
            </Wrapper>
        </section>
    )
}

export default HeroSection
