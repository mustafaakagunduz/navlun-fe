// components/HeroSection.tsx
"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import { Truck, Leaf, CheckCircle, Recycle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface HeroSectionProps {
    setShowConfetti: React.Dispatch<React.SetStateAction<boolean>>;
    setConfettiSize: React.Dispatch<React.SetStateAction<{width: number; height: number}>>;
}

const HeroSection = ({ setShowConfetti, setConfettiSize }: HeroSectionProps) => {
    // Kamyon animasyonu için state ve ref'ler
    const [truckReachedTarget, setTruckReachedTarget] = useState<boolean>(false)
    const [animationCycle, setAnimationCycle] = useState<number>(0)
    const truckAnimationControls = useAnimation()
    const roadColorControls = useAnimation() // Yol rengi için animasyon kontrolü
    const targetRef = useRef<HTMLDivElement>(null)
    const animationContainerRef = useRef<HTMLDivElement>(null)

    // Kamyon animasyonunu başlat
    useEffect(() => {
        const startTruckAnimation = async () => {
            // Animasyon konteynerinin boyutlarını al
            if (animationContainerRef.current) {
                const containerWidth = animationContainerRef.current.offsetWidth

                // Yol rengini başlangıçta gri yap
                await roadColorControls.start({
                    backgroundColor: "#e5e7eb", // bg-gray-200
                    transition: { duration: 0.1 }
                })

                // Kamyonu soldan sağa doğru hareket ettir (6 saniye)
                await truckAnimationControls.start({
                    x: containerWidth - 50, // Kamyonun genişliğini hesaba katarak
                    transition: {
                        duration: 6,
                        ease: "linear",
                    },
                })

                // Kamyon hedefe ulaştığında
                setTruckReachedTarget(true)

                // Yol rengini yeşil yap
                await roadColorControls.start({
                    backgroundColor: "#86efac", // bg-green-300
                    transition: { duration: 0.5 }
                })

                // Konfeti efektini göster
                if (targetRef.current) {
                    setConfettiSize({
                        width: window.innerWidth,
                        height: window.innerHeight,
                    })
                    setShowConfetti(true)

                    // 3 saniye sonra konfetileri kaldır
                    await new Promise((resolve) => setTimeout(resolve, 3000))
                    setShowConfetti(false)

                    // Kamyonu sağdan dışarı çıkar
                    await truckAnimationControls.start({
                        x: containerWidth + 100,
                        transition: {
                            duration: 2,
                            ease: "easeIn",
                        },
                    })

                    // Kamyonu doğrudan sol başlangıç noktasına ayarla ve görünür yap
                    truckAnimationControls.set({ x: -50 })

                    // Tik işaretini çarpıya geri döndür
                    setTruckReachedTarget(false)

                    // Animasyon döngüsünü artır
                    setAnimationCycle((prev) => prev + 1)

                    // Animasyonu tekrar başlat (1 saniye bekle)
                    setTimeout(() => {
                        startTruckAnimation()
                    }, 1000)
                }
            }
        }

        // Sayfa yüklendikten 1 saniye sonra animasyonu başlat
        const timer = setTimeout(() => {
            startTruckAnimation()
        }, 1000)

        return () => clearTimeout(timer)
    }, [animationCycle, setShowConfetti, setConfettiSize, truckAnimationControls, roadColorControls])

    return (
        <Card className="border-0 shadow-none bg-gradient-to-b from-green-50 to-white">
            <CardContent className="p-0">
                <section
                    id="hero"
                    className="w-full py-12 md:py-24 lg:py-32 overflow-hidden"
                >
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="max-w-[800px] space-y-4 mb-8">
                                <motion.h1
                                    className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    Ekolojik Taşımacılık Çözümleri
                                </motion.h1>
                                <motion.p
                                    className="text-muted-foreground md:text-xl mx-auto"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    Taşımacıları ve taşıma hizmetine ihtiyaç duyanları birleştiriyoruz. Çevre dostu, verimli ve ekonomik
                                    taşımacılık için doğru adres.
                                </motion.p>
                                <motion.div
                                    className="flex flex-col sm:flex-row gap-3 justify-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button className="bg-green-600 hover:bg-green-700">Taşıma Hizmeti Al</Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                                            Taşımacı Olarak Katıl
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
                                        <span className="text-sm">%100 Güvenli</span>
                                    </motion.div>
                                    <motion.div
                                        className="flex items-center gap-1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.8 }}
                                    >
                                        <Leaf className="h-5 w-5 text-green-600" />
                                        <span className="text-sm">Çevre Dostu</span>
                                    </motion.div>
                                    <motion.div
                                        className="flex items-center gap-1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 1 }}
                                    >
                                        <Recycle className="h-5 w-5 text-green-600" />
                                        <span className="text-sm">Sürdürülebilir</span>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Kamyon animasyonu - Özelliklerden hemen sonra */}
                            <div ref={animationContainerRef} className="relative h-20 w-full max-w-[900px] mx-auto mb-12 overflow-hidden">
                                {/* Hedef çarpı işareti */}
                                <div ref={targetRef} className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
                                    <div
                                        className={`p-2 rounded-full bg-red-100 transition-all duration-300 ${truckReachedTarget ? "scale-150 bg-green-100" : ""}`}
                                    >
                                        {truckReachedTarget ? (
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        ) : (
                                            <X className="h-8 w-8 text-red-600" />
                                        )}
                                    </div>
                                </div>

                                {/* Animasyonlu kamyon */}
                                <motion.div
                                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20"
                                    animate={truckAnimationControls}
                                    initial={{ x: -50 }}
                                >
                                    <Truck className={`h-16 w-16 ${truckReachedTarget ? "text-green-600" : "text-gray-700"}`} />
                                </motion.div>

                                {/* Yol çizgisi - uçtan uca ve kamyonun altında */}
                                <motion.div
                                    className="absolute left-0 right-0 bottom-3 h-1 rounded-full"
                                    initial={{ backgroundColor: "#e5e7eb" }} // bg-gray-200
                                    animate={roadColorControls}
                                />
                            </div>

                            {/* Orta büyük görsel */}
                            <motion.div
                                className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden w-full max-w-[800px] mx-auto"
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
            </CardContent>
        </Card>
    )
}

export default HeroSection