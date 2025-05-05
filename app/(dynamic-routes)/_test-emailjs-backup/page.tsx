"use client"

import type { Metadata } from 'next'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendEmail } from '@/utils/email-service'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import emailjs from '@emailjs/browser'
import Footer from '@/components/footer'
import { Suspense } from 'react'

// Menambahkan konfigurasi untuk memaksa halaman menjadi dinamis dan tidak di-prerender
export const dynamic = 'force-dynamic'

// Komponen yang hanya merender di sisi klien
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <>{children}</>
}

export default function TestEmailJS() {
  const [isInitializing, setIsInitializing] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<any>(null)
  const [credentials, setCredentials] = useState({
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
    templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
    userId: process.env.NEXT_PUBLIC_EMAILJS_USER_ID || ''
  })
  
  // Formulir test
  const [formData, setFormData] = useState({
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Email dari Testing Page',
    message: 'Ini adalah test email yang dikirim dari halaman testing EmailJS.',
    phone: '08123456789'
  })

  // Update fungsi runCorsPrecheck dan checkCORS untuk hanya berjalan di client-side
  const runCorsPrecheck = useEffect(() => {
    // Pastikan kode hanya dijalankan di browser
    if (typeof window === 'undefined') return;
    
    const timeout = setTimeout(() => {
      try {
        console.log('Running silent CORS pre-check...')
        const xhr = new XMLHttpRequest()
        xhr.open('GET', 'https://api.emailjs.com/api/v1.0/email/test', true)
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('CORS pre-check: Success')
            console.log('Domain that passed CORS check:', window.location.origin)
          } else {
            console.warn('CORS pre-check: API responded but with error status', {
              status: xhr.status,
              response: xhr.responseText
            })
          }
        }
        
        xhr.onerror = () => {
          console.error('CORS pre-check failed')
          
          if (xhr.status === 0) {
            console.error(`
==== CORS ISSUE DETECTED ====
Domain ${window.location.origin} may not be allowed by EmailJS API.
Please register your domain in EmailJS Dashboard > Integration > Website Integration.
For development, add http://localhost:3000 to the list of allowed domains.
            `)
            
            // Set status pada state
            setSendResult((prev: any) => {
              if (prev) return prev;
              return {
                success: false,
                error: "CORS issue terdeteksi secara otomatis",
                detail: `Domain ${window.location.origin} tidak terdaftar di EmailJS Dashboard. Silakan tambahkan di Integration > Website Integration.`,
                timestamp: new Date().toISOString()
              }
            })
          }
        }
        
        xhr.timeout = 5000
        xhr.ontimeout = () => {
          console.warn('CORS pre-check timed out')
        }
        
        xhr.send()
      } catch (error) {
        console.error('Error in CORS pre-check:', error)
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Check for CORS issues
  const checkCORS = () => {
    if (typeof window === 'undefined') return;
    
    try {
      console.log('===== CORS TEST STARTED =====')
      
      // Test standard CORS request
      const xhr = new XMLHttpRequest()
      xhr.open('GET', 'https://api.emailjs.com/api/v1.0/email/test', true)
      
      // Set explicit headers
      xhr.setRequestHeader('Content-Type', 'application/json')
      
      // Add more detailed event listeners
      xhr.onload = () => {
        console.log('CORS test response:', {
          status: xhr.status,
          responseText: xhr.responseText,
          responseHeaders: xhr.getAllResponseHeaders()
        })
        
        if (xhr.status >= 200 && xhr.status < 300) {
          toast({
            title: "CORS Test Berhasil",
            description: "Koneksi ke EmailJS API berhasil. Tidak ada masalah CORS.",
            variant: "default",
          })
          
          // Tambahkan info domain ke console
          console.log('Domain yang teruji sukses:', window.location.origin)
          console.log('Pastikan domain ini terdaftar di EmailJS Dashboard > Integration > Website Integration')
        } else {
          toast({
            title: "CORS Test Berhasil Tapi API Error",
            description: `Status: ${xhr.status}, Response: ${xhr.responseText || 'Empty Response'}`,
            variant: "destructive",
          })
        }
      }
      
      xhr.onerror = (e) => {
        console.error('CORS test failed - Network error:', e)
        console.error('Status:', xhr.status)
        console.error('ReadyState:', xhr.readyState)
        
        // Periksa apakah ini kemungkinan masalah CORS
        let corsMessage = "Kemungkinan masalah CORS terdeteksi. "
        
        if (xhr.status === 0) {
          corsMessage += `
Domain ${window.location.origin} sepertinya tidak diizinkan oleh EmailJS API. 
Pastikan domain ini terdaftar di EmailJS Dashboard > Integration > Website Integration.
Untuk development, tambahkan http://localhost:3000 ke daftar allowed domains.`
        }
        
        toast({
          title: "CORS Test Gagal",
          description: corsMessage,
          variant: "destructive",
        })
        
        // Log instruksi di console
        console.error('CORS Fix Instructions:')
        console.error('1. Buka EmailJS Dashboard: https://dashboard.emailjs.com/');
        console.error('2. Pilih "Integration" > "Website Integration"');
        console.error('3. Tambahkan domain berikut:', window.location.origin);
        console.error('4. Untuk development, tambahkan: http://localhost:3000');
      }
      
      // Timeout handler
      xhr.timeout = 10000; // 10 seconds
      xhr.ontimeout = () => {
        console.error('CORS test timeout')
        toast({
          title: "CORS Test Timeout",
          description: "Koneksi ke EmailJS API timeout setelah 10 detik.",
          variant: "destructive",
        })
      }
      
      // Send the request
      xhr.send()
      console.log('CORS test request sent to:', 'https://api.emailjs.com/api/v1.0/email/test')
    } catch (error) {
      console.error('Error in CORS test:', error)
      toast({
        title: "CORS Test Error",
        description: error instanceof Error ? error.message : "Error tidak diketahui",
        variant: "destructive",
      })
    } finally {
      console.log('===== CORS TEST ENDED =====')
    }
  }

  // Inisialisasi EmailJS
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsInitializing(true)
    try {
      console.log('Initializing EmailJS for testing...')
      
      if (!credentials.userId) {
        throw new Error('EmailJS Public Key (userId) tidak ditemukan')
      }
      
      // Tambahkan event listener untuk error XMLHttpRequest
      const originalSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function(...args) {
        this.addEventListener('error', function(e) {
          console.error('XMLHttpRequest Error (Captured by listener):', e);
          console.error('XMLHttpRequest Status:', this.status);
          console.error('XMLHttpRequest Response:', this.response);
          console.error('XMLHttpRequest Ready State:', this.readyState);
          
          // Coba deteksi apakah ini masalah CORS
          if (this.status === 0) {
            console.error('Kemungkinan terjadi masalah CORS - XMLHttpRequest tidak dapat dijangkau');
          }
        });
        
        return originalSend.apply(this, args);
      };
      
      // Initialize EmailJS dengan konfigurasi yang benar
      emailjs.init(credentials.userId);
      
      // Log status inisialisasi untuk debugging
      console.log('EmailJS initialized successfully with public key:', credentials.userId);
      
      setIsInitialized(true);
      setInitError(null);
    } catch (error) {
      console.error('Error initializing EmailJS:', error)
      if (error instanceof Error) {
        setInitError(error.message)
      } else {
        setInitError('Terjadi kesalahan saat menginisialisasi EmailJS')
      }
      setIsInitialized(false)
    } finally {
      setIsInitializing(false)
    }
  }, [credentials.userId])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handle credential change
  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials({ ...credentials, [name]: value })
  }

  // Test kirim email
  const handleTestEmail = async () => {
    setIsSending(true)
    try {
      console.log('===== TEST EMAIL SUBMISSION STARTED =====')
      console.log('Using credentials:', {
        serviceId: credentials.serviceId ? 'Available' : 'Missing',
        templateId: credentials.templateId ? 'Available' : 'Missing',
        userId: credentials.userId ? 'Available' : 'Missing'
      })
      
      // Send test email
      const result = await sendEmail(formData)
      console.log('Test email result:', result)
      setSendResult(result)
      
      if (result.success) {
        toast({
          title: "Email Test Berhasil",
          description: "Email test berhasil dikirim!",
          variant: "default",
        })
      } else {
        toast({
          title: "Email Test Gagal",
          description: result.message || "Gagal mengirim email test.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error in test email:', error)
      let errorMessage = 'Terjadi kesalahan saat mengirim email test'
      
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`
      } else if (error && typeof error === 'object') {
        try {
          errorMessage = `Error: ${JSON.stringify(error)}`
        } catch (e) {
          errorMessage = 'Error tidak dapat diproses'
        }
      }
      
      setSendResult({ success: false, error: errorMessage })
      
      toast({
        title: "Error Test Email",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
      console.log('===== TEST EMAIL SUBMISSION ENDED =====')
    }
  }

  // Test EmailJS sending directly
  const handleDirectTest = async () => {
    setIsSending(true)
    try {
      console.log('===== DIRECT EMAILJS TEST STARTED =====')
      
      // Log informasi credentials sebelum mengirim
      console.log('Using credentials:', {
        serviceId: credentials.serviceId,
        templateId: credentials.templateId,
        userId: credentials.userId ? `${credentials.userId.substring(0, 3)}...` : 'Missing'
      })
      
      // Validasi credentials
      if (!credentials.serviceId || !credentials.templateId || !credentials.userId) {
        throw new Error('Kredensial EmailJS tidak lengkap. Pastikan semua ID tersedia.')
      }
      
      // Test directly with emailjs.send
      console.log('Attempting to send with EmailJS...')
      
      const templateParams = {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        subject: formData.subject,
        phone: formData.phone,
        to_name: 'Admin',
        reply_to: formData.email,
        from_name: formData.name,
        from_email: formData.email,
      }
      console.log('Template parameters:', templateParams)
      
      const result = await emailjs.send(
        credentials.serviceId,
        credentials.templateId,
        templateParams,
        credentials.userId
      )
      
      console.log('Direct test result:', result)
      setSendResult(result)
      
      toast({
        title: "Direct EmailJS Test Berhasil",
        description: `Status: ${result.status}, Text: ${result.text}`,
        variant: "default",
      })
    } catch (error) {
      console.error('Error in direct test:', error)
      
      // Inspeksi error secara lebih detail
      if (error === null || error === undefined) {
        console.error('Error is null or undefined')
      } else if (typeof error === 'object' && error !== null && Object.keys(error).length === 0) {
        console.error('Error is an empty object. This usually indicates a CORS issue.')
        
        // Lakukan tes CORS langsung
        checkCORS();
        
        // Gunakan error custom
        error = new Error('Kemungkinan masalah CORS. Pastikan domain Anda terdaftar di EmailJS Dashboard.')
      }
      
      let errorMessage = 'Terjadi kesalahan pada direct test'
      let errorDetail = ''
      
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`
        errorDetail = error.stack || ''
        console.error('Error stack:', error.stack)
      } else if (error && typeof error === 'object') {
        try {
          // Coba ekstrak informasi bermanfaat dari object
          const anyError = error as any; // Type assertion untuk akses properti dinamis
          
          if (anyError.text) {
            errorMessage = `Error: ${anyError.text}`
            errorDetail = JSON.stringify(anyError)
          } else if (anyError.status) {
            errorMessage = `Error status: ${anyError.status}`
            errorDetail = JSON.stringify(anyError)
          } else {
            const errorStr = JSON.stringify(error)
            errorMessage = `Error: ${errorStr === '{}' ? 'Empty error object (kemungkinan CORS)' : errorStr}`
            errorDetail = 'Periksa Console untuk detail lebih lanjut'
          }
        } catch (e) {
          errorMessage = 'Error tidak dapat diproses'
          errorDetail = 'Error tidak dapat di-stringify'
        }
      }
      
      setSendResult({ 
        success: false, 
        error: errorMessage,
        detail: errorDetail,
        timestamp: new Date().toISOString()
      })
      
      toast({
        title: "Error Direct Test",
        description: errorMessage,
        variant: "destructive",
      })
      
      // Tampilkan toast khusus untuk empty error
      if (typeof error === 'object' && error !== null && Object.keys(error).length === 0) {
        toast({
          title: "Kemungkinan Masalah CORS",
          description: "Pastikan domain Anda (termasuk localhost) sudah terdaftar di EmailJS Dashboard",
          variant: "destructive",
        })
      }
    } finally {
      setIsSending(false)
      console.log('===== DIRECT EMAILJS TEST ENDED =====')
    }
  }

  return (
    <>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">EmailJS Testing Page</h1>
        <p className="mb-4 text-muted-foreground">Halaman ini digunakan untuk menguji koneksi EmailJS dan debug masalah pengiriman email.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status EmailJS</CardTitle>
              <CardDescription>Status koneksi dan konfigurasi EmailJS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Inisialisasi:</span>
                  <span className={isInitialized ? "text-green-500" : "text-red-500"}>
                    {isInitializing ? "Sedang diinisialisasi..." : isInitialized ? "Berhasil" : "Gagal"}
                  </span>
                </div>
                
                {initError && (
                  <div className="text-red-500 text-sm mt-2">
                    <p className="font-semibold">Error:</p>
                    <p>{initError}</p>
                  </div>
                )}
                
                <Separator />
                
                <p className="text-sm font-semibold">Credentials Check:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Service ID:</span>
                    <span className={credentials.serviceId ? "text-green-500" : "text-red-500"}>
                      {credentials.serviceId ? "Tersedia" : "Tidak Tersedia"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Template ID:</span>
                    <span className={credentials.templateId ? "text-green-500" : "text-red-500"}>
                      {credentials.templateId ? "Tersedia" : "Tidak Tersedia"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>User ID:</span>
                    <span className={credentials.userId ? "text-green-500" : "text-red-500"}>
                      {credentials.userId ? "Tersedia" : "Tidak Tersedia"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={checkCORS}>
                Tes CORS
              </Button>
            </CardFooter>
          </Card>
          
          {/* Results Card */}
          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian</CardTitle>
              <CardDescription>Hasil terakhir dari test pengiriman email</CardDescription>
            </CardHeader>
            <CardContent>
              {sendResult ? (
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-semibold">Status:</span>
                      <span className={sendResult.success || sendResult.status === 200 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                        {sendResult.success || sendResult.status === 200 ? "Berhasil" : "Gagal"}
                      </span>
                    </div>
                    
                    {sendResult.timestamp && (
                      <div className="flex justify-between mt-1">
                        <span>Waktu:</span>
                        <span className="text-xs">{new Date(sendResult.timestamp).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                  
                  {(sendResult.message || sendResult.error) && (
                    <div className="bg-muted p-3 rounded-md">
                      {sendResult.message && (
                        <div className="mb-2">
                          <p className="font-semibold text-sm">Pesan:</p>
                          <p className="text-sm break-words bg-card p-2 rounded-sm">{sendResult.message}</p>
                        </div>
                      )}
                      
                      {sendResult.error && (
                        <div>
                          <p className="font-semibold text-sm text-red-500">Error:</p>
                          <p className="text-sm break-words bg-card p-2 rounded-sm">{sendResult.error}</p>
                          
                          {sendResult.detail && (
                            <div className="mt-2">
                              <p className="font-semibold text-xs">Detail Error:</p>
                              <div className="text-xs break-words bg-card/50 p-2 rounded-sm mt-1 max-h-[100px] overflow-y-auto">
                                <pre className="whitespace-pre-wrap">{sendResult.detail}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {(sendResult.status || sendResult.text) && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="font-semibold text-sm mb-1">Response API:</p>
                      
                      {sendResult.status && (
                        <div className="flex justify-between text-sm bg-card p-2 rounded-sm mb-2">
                          <span>HTTP Status:</span>
                          <span className={sendResult.status >= 200 && sendResult.status < 300 ? "text-green-500" : "text-red-500"}>
                            {sendResult.status}
                          </span>
                        </div>
                      )}
                      
                      {sendResult.text && (
                        <div className="text-sm">
                          <p className="text-xs">Response Text:</p>
                          <p className="text-xs bg-card p-2 rounded-sm mt-1 break-words">{sendResult.text}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Panduan troubleshooting */}
                  {!sendResult.success && sendResult.status !== 200 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-md">
                      <p className="font-semibold text-sm mb-1">Saran Troubleshooting:</p>
                      <ul className="text-xs space-y-1 list-disc pl-4">
                        {sendResult.error && sendResult.error.includes("CORS") && (
                          <>
                            <li>Periksa apakah domain <ClientOnly><code className="bg-card px-1">{window.location.origin}</code></ClientOnly> terdaftar di EmailJS</li>
                            <li>Gunakan tombol "Tes CORS" untuk detail lebih lanjut</li>
                          </>
                        )}
                        <li>Verifikasi kredensial EmailJS (Service ID, Template ID, Public Key)</li>
                        <li>Periksa apakah EmailJS terinisialisasi dengan benar</li>
                        <li>Pastikan parameter template sesuai dengan yang diharapkan</li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Belum ada hasil pengujian</p>
                  <p className="text-xs mt-2">Klik salah satu tombol test di bawah untuk memulai</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Credentials Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi EmailJS</CardTitle>
              <CardDescription>Edit kredensial untuk pengujian</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceId">Service ID</Label>
                  <Input
                    id="serviceId"
                    name="serviceId"
                    value={credentials.serviceId}
                    onChange={handleCredentialChange}
                    placeholder="service_xxxxxxxxxxxxxxxx"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="templateId">Template ID</Label>
                  <Input
                    id="templateId"
                    name="templateId"
                    value={credentials.templateId}
                    onChange={handleCredentialChange}
                    placeholder="template_xxxxxxxxxxxxxxxx"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID (Public Key)</Label>
                  <Input
                    id="userId"
                    name="userId"
                    value={credentials.userId}
                    onChange={handleCredentialChange}
                    placeholder="xxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  window.location.reload();
                }}
                disabled={isInitializing}
              >
                Reinisialisasi EmailJS
              </Button>
            </CardFooter>
          </Card>
          
          {/* Test Form */}
          <Card>
            <CardHeader>
              <CardTitle>Form Pengujian</CardTitle>
              <CardDescription>Kirim email test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Pesan</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 items-stretch sm:flex-row sm:items-center">
              <Button 
                onClick={handleTestEmail} 
                disabled={isSending || !isInitialized}
                className="w-full sm:w-auto"
              >
                {isSending ? "Mengirim..." : "Test dengan utils/email-service"}
              </Button>
              <Button 
                onClick={handleDirectTest} 
                disabled={isSending || !isInitialized}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {isSending ? "Mengirim..." : "Direct EmailJS Test"}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Informasi CORS EmailJS</h2>
            <Card>
              <CardHeader>
                <CardTitle>Cara Mengatasi Masalah CORS</CardTitle>
                <CardDescription>
                  CORS (Cross-Origin Resource Sharing) adalah mekanisme keamanan yang mencegah permintaan dari domain yang tidak diizinkan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-md text-sm">
                    <p className="font-semibold">Domain yang perlu didaftarkan:</p>
                    <ClientOnly>
                      <div className="flex flex-col gap-1 mt-2">
                        <code className="bg-background p-2 rounded text-xs break-all">
                          {window.location.origin}
                        </code>
                        {window.location.hostname === 'localhost' && (
                          <code className="bg-background p-2 rounded text-xs">
                            http://localhost:3000
                          </code>
                        )}
                      </div>
                    </ClientOnly>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-sm mb-2">Langkah-langkah mendaftarkan domain di EmailJS:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li className="pb-2 border-b border-[hsl(var(--border)_/_0.5)]">
                        <span className="font-medium">Login ke Dashboard EmailJS</span>
                        <div className="pl-6 mt-1 text-xs">
                          Buka <a href="https://dashboard.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">dashboard.emailjs.com</a> dan login ke akun Anda
                        </div>
                      </li>
                      <li className="pb-2 border-b border-[hsl(var(--border)_/_0.5)]">
                        <span className="font-medium">Buka Integration Settings</span>
                        <div className="pl-6 mt-1 text-xs">
                          Klik menu <strong>Integration</strong> di sidebar, kemudian pilih <strong>Website Integration</strong>
                        </div>
                      </li>
                      <li className="pb-2 border-b border-[hsl(var(--border)_/_0.5)]">
                        <span className="font-medium">Tambahkan Domain</span>
                        <div className="pl-6 mt-1 text-xs">
                          Di bagian <strong>Restrict access to domains</strong>, tambahkan domain Anda dan klik <strong>Add</strong>
                        </div>
                      </li>
                      <li>
                        <span className="font-medium">Tunggu Perubahan Diterapkan</span>
                        <div className="pl-6 mt-1 text-xs">
                          Perubahan mungkin memerlukan waktu beberapa menit untuk diterapkan
                        </div>
                      </li>
                    </ol>
                  </div>
                  
                  <div className="p-3 bg-card/50 rounded-md">
                    <p className="font-semibold text-sm mb-2">Mengapa Terjadi Error CORS?</p>
                    <p className="text-xs">
                      Saat menggunakan API EmailJS, browser akan mengirim permintaan ke domain <code className="bg-background px-1">api.emailjs.com</code>.
                      Jika domain Anda tidak terdaftar di Dashboard EmailJS, permintaan ini akan ditolak dengan error CORS.
                      Error seperti <code className="bg-background px-1">{}</code> (empty object) atau status 0 biasanya menandakan masalah CORS.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-2">Informasi Debug EmailJS</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <ClientOnly>
                    <p className="text-sm">
                      <strong>Runtime Environment:</strong> {window.navigator.userAgent}
                    </p>
                  </ClientOnly>
                  
                  <div>
                    <p className="font-semibold">Langkah-langkah troubleshooting:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm mt-2">
                      <li>Periksa kredensial (Service ID, Template ID, dan User ID) di EmailJS Dashboard</li>
                      <li>Pastikan domain Anda terdaftar di EmailJS Dashboard (termasuk localhost untuk pengembangan)</li>
                      <li>Periksa apakah ada masalah CORS dengan menggunakan tombol "Tes CORS"</li>
                      <li>Periksa apakah variabel lingkungan (.env.local) sudah dikonfigurasi dengan benar</li>
                      <li>Pastikan EmailJS sudah diinisialisasi dengan benar sebelum mengirim email</li>
                      <li>Periksa template email di EmailJS Dashboard dan pastikan semua parameter yang diperlukan sudah disediakan</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Toaster />
      </div>
      
      <Suspense fallback={<div className="mt-20">Loading footer...</div>}>
        <Footer />
      </Suspense>
    </>
  )
} 