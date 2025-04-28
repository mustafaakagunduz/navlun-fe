// components/ContactSection.tsx
import { Phone, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

const ContactSection = () => {
    return (
        <Card className="border-0 shadow-none bg-background">
            <CardContent className="p-0">
                <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800">İletişim</div>
                                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                                Bizimle İletişime Geçin
                                            </h2>
                                            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                                                Sorularınız, önerileriniz veya taşımacılık ihtiyaçlarınız için bizimle iletişime geçebilirsiniz.
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <Phone className="h-6 w-6 text-green-600 mt-1" />
                                                <div>
                                                    <h3 className="font-bold">Telefon</h3>
                                                    <p className="text-muted-foreground">+90 (212) 123 45 67</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <Mail className="h-6 w-6 text-green-600 mt-1" />
                                                <div>
                                                    <h3 className="font-bold">E-posta</h3>
                                                    <p className="text-muted-foreground">info@ekotasima.com</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <MapPin className="h-6 w-6 text-green-600 mt-1" />
                                                <div>
                                                    <h3 className="font-bold">Adres</h3>
                                                    <p className="text-muted-foreground">
                                                        Yeşil Vadi İş Merkezi, Kat: 5, No: 42
                                                        <br />
                                                        Levent, İstanbul
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold mb-4">Mesaj Gönder</h3>
                                    <form className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="name"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    İsim
                                                </label>
                                                <Input id="name" placeholder="İsminiz" />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="surname"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Soyisim
                                                </label>
                                                <Input id="surname" placeholder="Soyisminiz" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="email"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                E-posta
                                            </label>
                                            <Input id="email" type="email" placeholder="E-posta adresiniz" />
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="phone"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Telefon
                                            </label>
                                            <Input id="phone" placeholder="Telefon numaranız" />
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="message"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Mesaj
                                            </label>
                                            <Textarea id="message" placeholder="Mesajınız" className="min-h-[120px]" />
                                        </div>
                                        <Button className="w-full bg-green-600 hover:bg-green-700">Gönder</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </CardContent>
        </Card>
    )
}

export default ContactSection