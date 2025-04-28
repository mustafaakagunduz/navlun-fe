// components/AboutSection.tsx
import Image from "next/image"
import { Globe, Leaf, Truck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const AboutSection = () => {
    return (
        <Card className="border-0 shadow-none bg-background">
            <CardContent className="p-0">
                <section id="about" className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800">Hakkımızda</div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ekolojik Taşımacılığın Öncüsü</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    2015 yılından bu yana, taşımacılık sektöründe çevre dostu çözümler sunuyoruz. Amacımız, karbon ayak
                                    izini azaltırken verimli ve ekonomik taşımacılık hizmetleri sağlamaktır.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                            <Card className="shadow-md">
                                <CardContent className="p-0">
                                    <div className="relative h-[300px] sm:h-[400px] rounded-xl overflow-hidden">
                                        <Image
                                            src="/placeholder.svg?height=400&width=600"
                                            alt="Şirketimiz hakkında"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex flex-col justify-center space-y-4">
                                        <ul className="grid gap-6">
                                            <li>
                                                <div className="grid gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="h-5 w-5 text-green-600" />
                                                        <h3 className="text-xl font-bold">Misyonumuz</h3>
                                                    </div>
                                                    <p className="text-muted-foreground">
                                                        Taşımacılık sektöründe ekolojik çözümler sunarak çevreye verilen zararı en aza indirmek ve
                                                        sürdürülebilir bir gelecek için katkıda bulunmak.
                                                    </p>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="grid gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Leaf className="h-5 w-5 text-green-600" />
                                                        <h3 className="text-xl font-bold">Vizyonumuz</h3>
                                                    </div>
                                                    <p className="text-muted-foreground">
                                                        Türkiye'nin en büyük ekolojik taşımacılık platformu olmak ve sektörde çevre dostu uygulamaların
                                                        yaygınlaşmasına öncülük etmek.
                                                    </p>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="grid gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Truck className="h-5 w-5 text-green-600" />
                                                        <h3 className="text-xl font-bold">Değerlerimiz</h3>
                                                    </div>
                                                    <p className="text-muted-foreground">
                                                        Sürdürülebilirlik, güvenilirlik, şeffaflık ve müşteri memnuniyeti temel değerlerimizdir.
                                                    </p>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </CardContent>
        </Card>
    )
}

export default AboutSection