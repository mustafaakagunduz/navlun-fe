// src/app/components/homepage/TruckAnimation.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import { Truck, CheckCircle, X } from "lucide-react"

interface TruckAnimationProps {
    setShowConfetti: React.Dispatch<React.SetStateAction<boolean>>;
    setConfettiSize: React.Dispatch<React.SetStateAction<{width: number; height: number}>>;
}

const TruckAnimation = ({ setShowConfetti, setConfettiSize }: TruckAnimationProps) => {
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
        <div ref={animationContainerRef} className="relative h-20 w-full max-w-[900px] mx-auto mb-0 overflow-hidden">
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
    )
}

export default TruckAnimation