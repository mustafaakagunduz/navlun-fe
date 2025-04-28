// components/ServicesSection.tsx
import { Truck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { JSX } from "react"

interface Service {
    icon: JSX.Element;
    title: string;
    description: string;
}

const ServicesSection = () => {
    const services: Service[] = [
        {
            icon: <Truck className="h-10 w-10 text-green-600" />,
            title: "Şehir İçi Taşımacılık",
            description: "Şehir içinde hızlı ve güvenilir taşımacılık hizmetleri sunuyoruz.",
        },
        {
            icon: <Truck className="h-10 w-10 text-green-600" />,
            title: "Şehirler Arası Taşımacılık",
            description: "Şehirler arası ekolojik ve ekonomik taşımacılık çözümleri.",
        },
        {
            icon: <Truck className="h-10 w-10 text-green-600" />,
            title: "Uluslararası Taşımacılık",
            description: "Sınırları aşan, çevre dostu uluslararası taşımacılık hizmetleri.",
        },
        {
            icon: <Truck className="h-10 w-10 text-green-600" />,
            title: "Özel Eşya Taşımacılığı",
            description: "Değerli ve hassas eşyalarınız için özel taşımacılık çözümleri.",
        },
        {
            icon: <Truck className="h-10 w-10 text-green-600" />,
            title: "Ev & Ofis Taşımacılığı",
            description: "Ev ve ofis taşımacılığında profesyonel ve ekolojik hizmet.",
        },
        {
            icon: <Truck className="h-10 w-10 text-green-600" />,
            title: "Lojistik Danışmanlık",
            description: "Şirketiniz için sürdürülebilir lojistik çözümleri ve danışmanlık.",
        },
    ]

    return (
        <Card className="border-0 shadow-none bg-green-50">
            <CardContent className="p-0">
                <section id="services" className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800">
                                    Hizmetlerimiz
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ekolojik Taşımacılık Çözümlerimiz</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    İhtiyacınıza uygun, çevre dostu taşımacılık hizmetlerimiz ile tanışın.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
                            {services.map((service, index) => (
                                <Card key={index} className="shadow-md">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col items-center space-y-2">
                                            {service.icon}
                                            <h3 className="text-xl font-bold">{service.title}</h3>
                                            <p className="text-muted-foreground text-center">{service.description}</p>
                                            <Button variant="link" className="text-green-600 mt-2">
                                                Detaylı Bilgi <ArrowRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </CardContent>
        </Card>
    )
}

export default ServicesSection