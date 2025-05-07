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
            if (!animationContainerRef.current) return;

            const containerWidth = animationContainerRef.current.offsetWidth;

            const targetOffset = 64;   // Çarpı ikonunun genişliği (px)
            const truckOffset = 96;    // Kamyon ikonunun genişliği (px)
            const destination = containerWidth - targetOffset - truckOffset + 10;

            // 1️⃣ Yol gri, kamyon hareket ediyor ve yol yeşile dönüyor (aynı anda başlatıyoruz)
            await Promise.all([
                truckAnimationControls.start({
                    x: destination,
                    transition: { duration: 6, ease: "linear" }
                }),
                roadColorControls.start({
                    backgroundColor: "#86efac",
                    transition: { duration: 6, ease: "linear" }
                })
            ]);

            // 2️⃣ Hedefe ulaşıldı -> Tik'e dönüş ve konfeti
            setTruckReachedTarget(true);
            setConfettiSize({
                width: animationContainerRef.current.offsetWidth,
                height: window.innerHeight
            });
            setShowConfetti(true);

            // Konfeti 3 saniye göster
            await new Promise(resolve => setTimeout(resolve, 3000));
            setShowConfetti(false);

            // 3️⃣ Kamyon sağdan çıkıyor
            await truckAnimationControls.start({
                x: containerWidth + 100,
                transition: { duration: 2, ease: "easeIn" }
            });

            // Yol tekrar gri oluyor
            await roadColorControls.start({
                backgroundColor: "#e5e7eb",
                transition: { duration: 0.5 }
            });

            // Tik tekrar çarpıya dönüyor
            setTruckReachedTarget(false);

            // 4️⃣ Reset: Kamyon başa dönüyor
            truckAnimationControls.set({ x: -100 });

            // Döngü başa sarıyor
            setAnimationCycle(prev => prev + 1);
        };

        startTruckAnimation();
    }, [animationCycle]);

    return (
        <div
            ref={animationContainerRef}
            className="relative h-20 w-full max-w-full overflow-hidden"
        >
            {/* Hedef çarpı işareti */}
            <div
                ref={targetRef}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
            >
                <div
                    className={`flex items-center justify-center w-16 h-16 rounded-full bg-red-100 transition-all duration-300 ${
                        truckReachedTarget ? "bg-green-100" : ""
                    }`}
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
                initial={{ backgroundColor: "#e5e7eb" }}
                animate={roadColorControls}
            />
        </div>
    )
}

export default TruckAnimation