// components/Footer.tsx
import Link from "next/link"
import { Leaf, Phone, Mail, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const Footer = () => {
    return (
        <Card className="border-0 shadow-none rounded-none bg-green-50">
            <CardContent className="p-0">
                <footer className="w-full border-t py-6 md:py-12">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-8 lg:grid-cols-4">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Leaf className="h-6 w-6 text-green-600" />
                                    <span className="text-xl font-bold">EkoTaşıma</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Taşımacıları ve taşıma hizmetine ihtiyaç duyanları birleştiren, ekolojik taşımacılığı destekleyen
                                    platform.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold">Hızlı Erişim</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <Link href="#hero" className="text-sm hover:text-green-600 transition-colors">
                                            Ana Sayfa
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#about" className="text-sm hover:text-green-600 transition-colors">
                                            Hakkımızda
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#services" className="text-sm hover:text-green-600 transition-colors">
                                            Hizmetlerimiz
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#contact" className="text-sm hover:text-green-600 transition-colors">
                                            İletişim
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold">Hizmetlerimiz</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <Link href="#" className="text-sm hover:text-green-600 transition-colors">
                                            Şehir İçi Taşımacılık
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm hover:text-green-600 transition-colors">
                                            Şehirler Arası Taşımacılık
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm hover:text-green-600 transition-colors">
                                            Uluslararası Taşımacılık
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm hover:text-green-600 transition-colors">
                                            Ev & Ofis Taşımacılığı
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold">İletişim</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">+90 (212) 123 45 67</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">info@ekotasima.com</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">Levent, İstanbul</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-xs text-muted-foreground">
                                &copy; {new Date().getFullYear()} EkoTaşıma. Tüm hakları saklıdır.
                            </p>
                            <div className="flex gap-4">
                                <Link href="#" className="text-xs hover:text-green-600 transition-colors">
                                    Gizlilik Politikası
                                </Link>
                                <Link href="#" className="text-xs hover:text-green-600 transition-colors">
                                    Kullanım Koşulları
                                </Link>
                                <Link href="#" className="text-xs hover:text-green-600 transition-colors">
                                    KVKK
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </CardContent>
        </Card>
    )
}

export default Footer