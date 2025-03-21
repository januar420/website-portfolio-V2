"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Mail, Send, Phone, MessageSquare, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "./language-provider"
import { toast } from "@/hooks/use-toast"
import { sendEmail } from "@/utils/email-service"
import EmailInitializer from "./email-initializer"

// Define form schema dengan validasi
const formSchema = z.object({
  name: z.string().min(2, { message: "Nama minimal 2 karakter" }),
  email: z.string().email({ message: "Email tidak valid" }),
  subject: z.string().min(5, { message: "Subjek minimal 5 karakter" }),
  message: z.string().min(10, { message: "Pesan minimal 10 karakter" }),
})

export default function ContactSection() {
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Data kontak yang akan digunakan
  const contactInfo = {
    email: "januargaluh3099@gmail.com",
    phone: "+6281290040769",
    whatsapp: "6281290040769",
  }

  // Setup form dengan react-hook-form dan zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  // Fungsi untuk mengirim email langsung melalui EmailJS
  const handleDirectEmail = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    
    try {
      console.log('===== FORM SUBMISSION STARTED =====');
      console.log('Environment check:');
      console.log('- Service ID:', process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'Missing');
      console.log('- Template ID:', process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'Missing');
      console.log('- User ID:', process.env.NEXT_PUBLIC_EMAILJS_USER_ID ? 'Available' : 'Missing');
      
      console.log('Attempting to send email with data:', {
        ...data,
        message: 'message content...' // Sensor isi pesan
      });
      
      // Pastikan EmailJS sudah diinisialisasi
      try {
        const emailjsModuleLoaded = !!window.emailjs;
        console.log('EmailJS module loaded:', emailjsModuleLoaded);
      } catch (e) {
        console.error('Error checking EmailJS initialization:', e);
      }
      
      // Kirim email menggunakan EmailJS
      const result = await sendEmail(data)
      
      console.log('Email sending result:', result);
      
      if (result.success) {
        form.reset()
        toast({
          title: t("contact.form.success") || "Email Berhasil Terkirim",
          description: `Pesan telah dikirim ke ${contactInfo.email}. Terima kasih!`,
          variant: "default",
        })
      } else {
        console.error('Email sending failed with error message:', result.message);
        
        toast({
          title: t("contact.form.error") || "Gagal Mengirim Email",
          description: result.message || "Terjadi kesalahan saat mengirim email. Silakan coba lagi nanti.",
          variant: "destructive",
        })
        
        // Fallback: Beri tahu pengguna untuk mencoba metode lain
        toast({
          title: "Saran",
          description: "Silakan coba mengirim melalui WhatsApp atau Email Client sebagai alternatif.",
          variant: "default",
        })
      }
    } catch (error) {
      // Log error dengan lebih detail
      console.error("===== EMAIL SUBMISSION ERROR =====");
      console.error("Error sending email:", error);
      
      let errorMessage = "Terjadi kesalahan saat mengirim email";
      
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
        console.error('Error name:', error.name);
        console.error('Error stack:', error.stack);
      } else if (error && typeof error === 'object') {
        try {
          errorMessage = `Error: ${JSON.stringify(error)}`;
        } catch (e) {
          errorMessage = 'Error tidak dapat diproses';
        }
      }
      
      toast({
        title: t("contact.form.error") || "Gagal Mengirim Email",
        description: errorMessage,
        variant: "destructive",
      })
      
      // Fallback: Beri tahu pengguna untuk mencoba metode lain
      toast({
        title: "Saran",
        description: "Silakan coba mengirim melalui WhatsApp atau Email Client sebagai alternatif.",
        variant: "default",
      })
    } finally {
      setIsSubmitting(false)
      console.log('===== FORM SUBMISSION ENDED =====');
    }
  }

  // Fungsi untuk mengirim email melalui mailto
  const handleMailtoEmail = (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    
    // Buat URL mailto dengan format yang benar
    const mailtoUrl = `mailto:${contactInfo.email}?subject=${encodeURIComponent(
      data.subject
    )}&body=${encodeURIComponent(
      `Nama: ${data.name}\nEmail: ${data.email}\n\n${data.message}`
    )}`
    
    // Buka email client
    window.open(mailtoUrl, "_blank")
    
    // Reset form dan status
    setTimeout(() => {
      setIsSubmitting(false)
      form.reset()
      toast({
        title: "Email Siap Dikirim",
        description: "Email client telah dibuka dengan pesan Anda",
      })
    }, 1000)
  }

  // Fungsi untuk mengirim WhatsApp
  const handleSendWhatsApp = (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    
    // Buat URL WhatsApp dengan format yang benar
    const whatsappUrl = `https://wa.me/${contactInfo.whatsapp}?text=${encodeURIComponent(
      `Halo, saya ${data.name}.\n\nSubjek: ${data.subject}\n\n${data.message}\n\nEmail saya: ${data.email}`
    )}`
    
    // Buka WhatsApp
    window.open(whatsappUrl, "_blank")
    
    // Reset form dan status
    setTimeout(() => {
      setIsSubmitting(false)
      form.reset()
      toast({
        title: "WhatsApp Siap Dibuka",
        description: `Menghubungi +${contactInfo.whatsapp.slice(0,2)} ${contactInfo.whatsapp.slice(2)} melalui WhatsApp`,
      })
    }, 1000)
  }

  // Fungsi untuk menangani telepon
  const handleCall = () => {
    window.open(`tel:${contactInfo.phone}`, "_self")
    toast({
      title: "Menghubungi via Telepon",
      description: "Memulai panggilan telepon",
    })
  }

  return (
    <section className="py-20 bg-background" id="contact">
      <EmailInitializer />
      <div className="container px-4 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            {t("contact.title") || "Hubungi Saya"}
          </h2>
          <p className="text-lg text-foreground/80 mb-6">
            {t("contact.subtitle") || "Silakan kirim pesan untuk diskusi, kolaborasi, atau pertanyaan."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button variant="outline" className="gap-2" onClick={() => window.open(`mailto:${contactInfo.email}`, "_blank")}>
              <Mail className="h-4 w-4" />
              {contactInfo.email}
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleCall}>
              <Phone className="h-4 w-4" />
              {contactInfo.phone}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.open(`https://wa.me/${contactInfo.whatsapp}`, "_blank")}>
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </Button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>{t("contact.form.title") || "Kirim Pesan"}</CardTitle>
              <CardDescription>
                {t("contact.form.description") || "Isi formulir di bawah ini untuk mengirim pesan via email atau WhatsApp."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(handleDirectEmail)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.form.name") || "Nama"}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("contact.form.namePlaceholder") || "Nama Anda"} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.form.email") || "Email"}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("contact.form.emailPlaceholder") || "email@contoh.com"} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.form.subject") || "Subjek"}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("contact.form.subjectPlaceholder") || "Topik pesan Anda"} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.form.message") || "Pesan"}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t("contact.form.messagePlaceholder") || "Tulis pesan Anda di sini..."} 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 justify-end">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto gap-2"
                  onClick={form.handleSubmit(handleSendWhatsApp)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("contact.form.sending") || "Mengirim..."}
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      {t("contact.form.whatsapp") || "Kirim via WhatsApp"}
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  className="w-full sm:w-auto gap-2"
                  onClick={form.handleSubmit(handleMailtoEmail)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("contact.form.sending") || "Mengirim..."}
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Email Client
                    </>
                  )}
                </Button>
              </div>
              <Button 
                type="submit"
                className="w-full sm:w-auto gap-2"
                onClick={form.handleSubmit(handleDirectEmail)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("contact.form.sending") || "Mengirim..."}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t("contact.form.emailBtn") || "Kirim Langsung"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

