import emailjs from '@emailjs/browser';

export interface EmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Fungsi untuk mengirim email langsung menggunakan EmailJS
 * 
 * @param data Data email yang akan dikirim
 * @returns Promise yang resolve ketika email berhasil dikirim
 * @throws Error jika pengiriman gagal
 */
export const sendEmail = async (data: EmailData): Promise<{ success: boolean; message: string }> => {
  // Tangkap timestamp awal untuk mengukur waktu eksekusi
  const startTime = Date.now();
  
  try {
    // Menggunakan variabel lingkungan untuk konfigurasi EmailJS
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const userId = process.env.NEXT_PUBLIC_EMAILJS_USER_ID;

    // Periksa apakah konfigurasi tersedia
    if (!serviceId || !templateId || !userId) {
      console.error('EmailJS configuration missing', {
        serviceId: serviceId ? 'Available' : 'Missing',
        templateId: templateId ? 'Available' : 'Missing',
        userId: userId ? 'Available' : 'Missing'
      });
      
      return {
        success: false,
        message: 'Konfigurasi email tidak lengkap. Silakan hubungi administrator.'
      };
    }

    // Format nomor WhatsApp jika ada
    const formatWhatsAppNumber = (phoneNumber: string) => {
      if (!phoneNumber) return '';
      // Hapus '+' jika ada dan pastikan format internasional
      return phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
    };

    // Buat tanggal dengan format lengkap termasuk waktu
    const formattedDate = new Date().toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long'
    });

    // Siapkan template parameters untuk template premium
    const templateParams = {
      // Data pengirim
      from_name: data.name,
      from_email: data.email,
      reply_to: data.email,
      from_whatsapp: formatWhatsAppNumber("6281290040769"), // Nomor WhatsApp pemilik website

      // Data penerima
      to_name: 'Admin',
      to_email: 'januargaluh3099@gmail.com',
      
      // Data pesan
      subject: data.subject,
      message: data.message,
      
      // Data tambahan
      site_name: 'Portfolio Website',
      date: formattedDate,
      year: new Date().getFullYear().toString(),
      
      // Social media links (bisa diisi sesuai kebutuhan)
      social_github: 'https://github.com/januargaluh3099',
      social_linkedin: 'https://linkedin.com/in/januar-galuh',
      social_twitter: 'https://twitter.com/januari',
      social_instagram: 'https://instagram.com/januari'
    };

    console.log(`[EmailJS] Mengirim email menggunakan:
      ServiceID: ${serviceId}
      TemplateID: ${templateId}
      UserID tersedia: ${!!userId}
    `);

    // Alternatif implementasi: Gunakan pendekatan with Promise
    try {
      // Metode 1: Menggunakan send langsung
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        userId
      );
      
      // Cek response
      console.log('EmailJS Response:', response);
      
      const duration = Date.now() - startTime;
      console.log(`Email sent successfully in ${duration}ms`);
      
      return {
        success: true,
        message: 'Email berhasil dikirim!'
      };
    } catch (sendError: any) {
      // Log error spesifik untuk send
      console.error('EmailJS Send Error:', sendError);
      
      if (sendError && sendError.text) {
        console.error('EmailJS Error Details:', sendError.text);
      }
      
      // Coba pendekatan alternatif dengan sendForm
      console.log('Mencoba metode alternatif dengan sendForm...');
      
      const dummyForm = document.createElement('form');
      Object.keys(templateParams).forEach(key => {
        const input = document.createElement('input');
        input.name = key;
        input.value = (templateParams as any)[key];
        dummyForm.appendChild(input);
      });
      
      try {
        const response = await emailjs.sendForm(
          serviceId,
          templateId,
          dummyForm,
          userId
        );
        
        console.log('EmailJS sendForm Response:', response);
        
        const duration = Date.now() - startTime;
        console.log(`Email sent successfully using alternative method in ${duration}ms`);
        
        return {
          success: true,
          message: 'Email berhasil dikirim menggunakan metode alternatif!'
        };
      } catch (formError: any) {
        console.error('EmailJS sendForm Error:', formError);
        
        // Re-throw untuk ditangani oleh catch utama
        throw formError;
      }
    }
  } catch (error: any) {
    // Log error dengan lebih detail
    console.error('Error sending email:', error);
    
    let errorMessage = 'Terjadi kesalahan saat mengirim email';
    let errorDetails = null;
    
    if (error instanceof Error) {
      errorMessage = `Gagal mengirim email: ${error.message}`;
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    } else if (error && typeof error === 'object') {
      try {
        if (error.status) {
          errorMessage = `Gagal mengirim email: HTTP Status ${error.status}`;
          errorDetails = error;
        } else if (error.text) {
          errorMessage = `Gagal mengirim email: ${error.text}`;
          errorDetails = error;
        } else {
          errorMessage = `Gagal mengirim email: ${JSON.stringify(error)}`;
          errorDetails = error;
        }
      } catch (e) {
        errorMessage = 'Gagal mengirim email: Error tidak dapat diproses';
      }
    }
    
    // Log error secara detail
    console.error('Error message:', errorMessage);
    console.error('Error details:', errorDetails);
    
    const duration = Date.now() - startTime;
    console.log(`Email sending failed after ${duration}ms`);
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

/**
 * Fungsi untuk inisialisasi EmailJS
 */
export const initEmailJS = () => {
  try {
    const userId = process.env.NEXT_PUBLIC_EMAILJS_USER_ID;
    
    if (!userId) {
      console.warn('EmailJS User ID missing');
      return;
    }
    
    emailjs.init(userId);
    console.log('EmailJS initialized successfully');
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error);
  }
}; 