import { motion } from "framer-motion"
import { CheckCircle, Leaf, Recycle, TruckIcon, Users, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"

const HeroSection = () => {
    const { t } = useLanguage();

    return (
        <section
            id="hero"
            className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
        >
            {/* Ana içerik */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Sol taraf - Metin içeriği */}
                    <div className="text-white">
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="space-y-4">
                                <motion.h1
                                    className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    <span className="text-green-400">{t("hero.title")}</span>
                                </motion.h1>

                                <motion.p
                                    className="text-lg sm:text-xl text-gray-200 max-w-2xl leading-relaxed"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                    {t("hero.description")}
                                </motion.p>
                            </div>

                            {/* Özellikler */}
                            <motion.div
                                className="flex flex-wrap gap-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                    <span className="text-sm font-medium">{t("hero.safe")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Leaf className="h-5 w-5 text-green-400" />
                                    <span className="text-sm font-medium">{t("hero.ecofriendly")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Recycle className="h-5 w-5 text-green-400" />
                                    <span className="text-sm font-medium">{t("hero.sustainable")}</span>
                                </div>
                            </motion.div>

                            {/* CTA Butonları */}
                            <motion.div
                                className="flex flex-col sm:flex-row gap-4 pt-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.8 }}
                            >
                                <Link href="/auth/register">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-full sm:w-auto"
                                    >
                                        <Button
                                            size="lg"
                                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white border-0 px-8 py-3 text-lg font-semibold"
                                        >
                                            <TruckIcon className="mr-2 h-5 w-5" />
                                            {t("hero.getService")}
                                        </Button>
                                    </motion.div>
                                </Link>

                                <Link href="/auth/login">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-full sm:w-auto"
                                    >
                                        <Button
                                            size="lg"
                                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white border-0 px-8 py-3 text-lg font-semibold"
                                        >
                                            <Users className="mr-2 h-5 w-5" />
                                            {t("hero.joinAsCarrier")}
                                        </Button>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Sağ taraf - İstatistikler/Bilgi kartları */}
                    <motion.div
                        className="hidden lg:block"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <div className="space-y-6">
                            {/* İstatistik kartları */}
                            <motion.div
                                className="bg-white/10  rounded-2xl p-6 border border-white/20"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-500/20 rounded-xl">
                                        <TruckIcon className="h-8 w-8 text-green-400" />
                                    </div>
                                    <div className="text-white">
                                        <div className="text-2xl font-bold">1000+</div>
                                        <div className="text-sm text-gray-300">Aktif Taşıyıcı</div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="bg-white/10  rounded-2xl p-6 border border-white/20"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/20 rounded-xl">
                                        <Building2 className="h-8 w-8 text-blue-400" />
                                    </div>
                                    <div className="text-white">
                                        <div className="text-2xl font-bold">500+</div>
                                        <div className="text-sm text-gray-300">Güvenilir Firma</div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="bg-white/10  rounded-2xl p-6 border border-white/20"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-500/20 rounded-xl">
                                        <Leaf className="h-8 w-8 text-green-400" />
                                    </div>
                                    <div className="text-white">
                                        <div className="text-2xl font-bold">%25</div>
                                        <div className="text-sm text-gray-300">Karbon Azaltma</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Alt kısım - Scroll indicator */}
            <motion.div
                className="absolute bottom-24 left-1/2 transform -translate-x-1/2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
            >
                <motion.div
                    className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <motion.div
                        className="w-1 h-3 bg-white/70 rounded-full mt-2"
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </motion.div>
            </motion.div>
        </section>
    )
}

export default HeroSection