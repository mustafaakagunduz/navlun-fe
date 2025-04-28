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
            if (animationContainerRef.current) {
                const containerWidth = animationContainerRef.current.offsetWidth

                // 1️⃣ Yol gri başlasın
                await roadColorControls.start({
                    backgroundColor: "#e5e7eb",
                    transition: { duration: 0.1 }
                })

                // 2️⃣ Kamyon hareket etmeye başlasın + Yol yeşile dönüşsün
                truckAnimationControls.start({
                    x: containerWidth - 80,
                    transition: { duration: 6, ease: "linear" }
                })

                roadColorControls.start({
                    backgroundColor: "#86efac",
                    transition: { duration: 6, ease: "linear" }
                })

                // 3️⃣ Hareket bitince hedefe ulaşıldı
                setTimeout(async () => {
                    setTruckReachedTarget(true)

                    // Konfeti patlat
                    setConfettiSize({ width: window.innerWidth, height: window.innerHeight })
                    setShowConfetti(true)

                    await new Promise((resolve) => setTimeout(resolve, 3000))
                    setShowConfetti(false)

                    // 4️⃣ Kamyon sağdan çıkıyor, tik çarpıya dönüyor, yol gri oluyor
                    await truckAnimationControls.start({
                        x: containerWidth + 100,
                        transition: { duration: 2, ease: "easeIn" }
                    })

                    await roadColorControls.start({
                        backgroundColor: "#e5e7eb",
                        transition: { duration: 0.5 }
                    })

                    setTruckReachedTarget(false)

                    // 5️⃣ Reset: Kamyon başa dönüyor
                    truckAnimationControls.set({ x: -100 })

                    setAnimationCycle(prev => prev + 1)
                }, 6000)  // Kamyonun hareket süresi kadar bekliyoruz
            }
        }

        startTruckAnimation()
    }, [animationCycle])

    return (
        <div ref={animationContainerRef} className="relative h-20 w-screen overflow-hidden">

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