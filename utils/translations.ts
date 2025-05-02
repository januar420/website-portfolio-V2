/**
 * Sistem terjemahan yang diperbarui untuk portfolio website.
 * File ini berisi utilitas untuk mengelola terjemahan dan dapat digunakan
 * untuk mengimpor terjemahan dari file eksternal atau API.
 */

import type { Language, TranslationKeys } from '@/types/translations'

export type TranslationsType = {
  [key in Language]?: { [k in TranslationKeys]?: string }
}

/**
 * Menggabungkan terjemahan dari berbagai sumber.
 * @param sources Array dari objek terjemahan yang akan digabungkan
 * @returns Objek terjemahan gabungan
 */
export function mergeTranslations(...sources: TranslationsType[]): TranslationsType {
  const result: TranslationsType = {}
  
  for (const source of sources) {
    for (const [language, translations] of Object.entries(source)) {
      if (!result[language as Language]) {
        result[language as Language] = {}
      }
      
      result[language as Language] = {
        ...result[language as Language],
        ...translations
      }
    }
  }
  
  return result
}

/**
 * Memuat terjemahan dari JSON. Fungsi ini dapat digunakan untuk memuat
 * terjemahan dari file statis atau dari respons API.
 * @param json Terjemahan dalam format JSON
 * @returns Objek terjemahan yang dapat digunakan
 */
export function loadTranslationsFromJSON(json: any): TranslationsType {
  try {
    return json as TranslationsType
  } catch (error) {
    console.error('Error loading translations from JSON:', error)
    return {}
  }
}

/**
 * Fungsi async untuk memuat terjemahan dari endpoint API
 * @param url URL endpoint API yang menyediakan terjemahan
 * @returns Promise dengan objek terjemahan
 */
export async function fetchTranslations(url: string): Promise<TranslationsType> {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch translations: ${response.status}`)
    }
    
    const data = await response.json()
    return loadTranslationsFromJSON(data)
  } catch (error) {
    console.error('Error fetching translations:', error)
    return {}
  }
}

/**
 * Contoh terjemahan tambahan yang dapat digabungkan dengan terjemahan utama
 */
export const additionalTranslations: TranslationsType = {
  id: {
    "contact.title": "Hubungi Saya",
    "contact.subtitle": "Silakan kirim pesan untuk diskusi, kolaborasi, atau pertanyaan.",
    "contact.form.title": "Kirim Pesan",
    "contact.form.description": "Isi formulir di bawah ini untuk mengirim pesan via email atau WhatsApp.",
    "contact.form.name": "Nama",
    "contact.form.email": "Email",
    "contact.form.subject": "Subjek",
    "contact.form.message": "Pesan",
    "contact.form.namePlaceholder": "Nama Anda",
    "contact.form.emailPlaceholder": "email@contoh.com",
    "contact.form.subjectPlaceholder": "Topik pesan Anda",
    "contact.form.messagePlaceholder": "Tulis pesan Anda di sini...",
    "contact.form.emailBtn": "Kirim Langsung",
    "contact.form.sending": "Mengirim...",
    "contact.form.whatsapp": "Kirim via WhatsApp",
    "contact.form.emailClient": "Email Client",
    "contact.form.success": "Pesan terkirim!",
    "contact.form.error": "Gagal mengirim pesan. Silakan coba lagi.",
    // Terjemahan untuk nilai-nilai profesional
    "values.title": "Nilai-Nilai Profesional",
    "values.subtitle": "Komitmen saya untuk menyediakan layanan berkualitas tinggi",
    "values.security.title": "Keamanan Sistem Terdepan",
    "values.security.content": "Keamanan adalah prioritas utama dalam semua proyek saya. Saya menerapkan praktik terbaik keamanan sistem dan infrastruktur IT untuk melindungi aset digital Anda dengan standar industri tertinggi.",
    "values.security.point1": "Implementasi firewall dan sistem deteksi intrusi",
    "values.security.point2": "Audit keamanan berkala",
    "values.security.point3": "Enkripsi data end-to-end",
    "values.scalability.title": "Solusi Skalabel & Teroptimasi",
    "values.scalability.content": "Saya merancang solusi yang tidak hanya memenuhi kebutuhan Anda saat ini tetapi juga dapat berkembang bersama bisnis Anda. Arsitektur yang saya bangun sangat skalabel dan dioptimalkan untuk performa terbaik.",
    "values.scalability.point1": "Infrastruktur cloud yang dapat diskalakan",
    "values.scalability.point2": "Optimasi performa sistem",
    "values.scalability.point3": "Arsitektur microservices",
    "values.collaboration.title": "Kolaborasi & Transparansi",
    "values.collaboration.content": "Saya percaya bahwa komunikasi yang jelas dan kolaborasi yang erat adalah kunci keberhasilan proyek. Saya bekerja secara transparan dan selalu melibatkan Anda dalam setiap tahap proses pengembangan.",
    "values.collaboration.point1": "Update progres reguler",
    "values.collaboration.point2": "Dokumentasi komprehensif",
    "values.collaboration.point3": "Pendekatan agile dan fleksibel",
    "values.innovation.title": "Innovasi Berkelanjutan",
    "values.innovation.content": "Teknologi terus berkembang, begitu juga dengan pengetahuan dan keterampilan saya. Saya selalu mengikuti tren terbaru dan menerapkan solusi inovatif untuk memberikan keunggulan kompetitif bagi Anda.",
    "values.innovation.point1": "Pembelajaran teknologi baru secara konsisten",
    "values.innovation.point2": "Penerapan praktik terbaik industri",
    "values.innovation.point3": "Pendekatan pemecahan masalah yang kreatif",
    "values.commitment": "Saya berkomitmen untuk memberikan solusi berkualitas tinggi yang memenuhi kebutuhan spesifik Anda dengan standar profesional tertinggi."
  },
  en: {
    "contact.title": "Contact Me",
    "contact.subtitle": "Please send a message for discussion, collaboration, or inquiries.",
    "contact.form.title": "Send Message",
    "contact.form.description": "Fill out the form below to send a message via email or WhatsApp.",
    "contact.form.name": "Name",
    "contact.form.email": "Email",
    "contact.form.subject": "Subject",
    "contact.form.message": "Message",
    "contact.form.namePlaceholder": "Your Name",
    "contact.form.emailPlaceholder": "email@example.com",
    "contact.form.subjectPlaceholder": "Your message topic",
    "contact.form.messagePlaceholder": "Write your message here...",
    "contact.form.emailBtn": "Send Directly",
    "contact.form.sending": "Sending...",
    "contact.form.whatsapp": "Send via WhatsApp",
    "contact.form.emailClient": "Email Client",
    "contact.form.success": "Message sent!",
    "contact.form.error": "Failed to send message. Please try again.",
    // Translations for professional values
    "values.title": "Professional Values",
    "values.subtitle": "My commitment to providing high-quality services",
    "values.security.title": "Advanced System Security",
    "values.security.content": "Security is the top priority in all my projects. I implement best practices in system security and IT infrastructure to protect your digital assets with the highest industry standards.",
    "values.security.point1": "Implementation of firewalls and intrusion detection systems",
    "values.security.point2": "Regular security audits",
    "values.security.point3": "End-to-end data encryption",
    "values.scalability.title": "Scalable & Optimized Solutions",
    "values.scalability.content": "I design solutions that not only meet your current needs but can also grow with your business. The architectures I build are highly scalable and optimized for best performance.",
    "values.scalability.point1": "Scalable cloud infrastructure",
    "values.scalability.point2": "System performance optimization",
    "values.scalability.point3": "Microservices architecture",
    "values.collaboration.title": "Collaboration & Transparency",
    "values.collaboration.content": "I believe that clear communication and close collaboration are key to project success. I work transparently and always involve you in every stage of the development process.",
    "values.collaboration.point1": "Regular progress updates",
    "values.collaboration.point2": "Comprehensive documentation",
    "values.collaboration.point3": "Agile and flexible approach",
    "values.innovation.title": "Continuous Innovation",
    "values.innovation.content": "Technology is constantly evolving, and so are my knowledge and skills. I constantly follow the latest trends and implement innovative solutions to give you a competitive edge.",
    "values.innovation.point1": "Consistent learning of new technologies",
    "values.innovation.point2": "Implementation of industry best practices",
    "values.innovation.point3": "Creative problem-solving approach",
    "values.commitment": "I am committed to delivering high-quality solutions that meet your specific needs with the highest professional standards."
  },
  es: {
    // Traducciones para valores profesionales
    "values.title": "Valores Profesionales",
    "values.subtitle": "Mi compromiso de brindar servicios de alta calidad",
    "values.security.title": "Seguridad de Sistemas Avanzada",
    "values.security.content": "La seguridad es la máxima prioridad en todos mis proyectos. Implemento las mejores prácticas en seguridad de sistemas e infraestructura de TI para proteger sus activos digitales con los más altos estándares de la industria.",
    "values.security.point1": "Implementación de firewalls y sistemas de detección de intrusiones",
    "values.security.point2": "Auditorías de seguridad regulares",
    "values.security.point3": "Cifrado de datos de extremo a extremo",
    "values.scalability.title": "Soluciones Escalables y Optimizadas",
    "values.scalability.content": "Diseño soluciones que no solo satisfacen sus necesidades actuales, sino que también pueden crecer con su negocio. Las arquitecturas que construyo son altamente escalables y están optimizadas para un mejor rendimiento.",
    "values.scalability.point1": "Infraestructura de nube escalable",
    "values.scalability.point2": "Optimización del rendimiento del sistema",
    "values.scalability.point3": "Arquitectura de microservicios",
    "values.collaboration.title": "Colaboración y Transparencia",
    "values.collaboration.content": "Creo que la comunicación clara y la colaboración estrecha son clave para el éxito del proyecto. Trabajo de manera transparente y siempre lo involucro en cada etapa del proceso de desarrollo.",
    "values.collaboration.point1": "Actualizaciones regulares de progreso",
    "values.collaboration.point2": "Documentación completa",
    "values.collaboration.point3": "Enfoque ágil y flexible",
    "values.innovation.title": "Innovación Continua",
    "values.innovation.content": "La tecnología evoluciona constantemente, al igual que mis conocimientos y habilidades. Sigo constantemente las últimas tendencias e implemento soluciones innovadoras para darle una ventaja competitiva.",
    "values.innovation.point1": "Aprendizaje constante de nuevas tecnologías",
    "values.innovation.point2": "Implementación de las mejores prácticas de la industria",
    "values.innovation.point3": "Enfoque creativo para la resolución de problemas",
    "values.commitment": "Estoy comprometido a ofrecer soluciones de alta calidad que satisfagan sus necesidades específicas con los más altos estándares profesionales."
  }
}; 