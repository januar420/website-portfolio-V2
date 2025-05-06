"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  MapPin,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Code,
  Languages,
  Lightbulb,
  Server,
  Terminal,
  Shield,
  Monitor,
  FileText,
  Layers,
  Send,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award,
  Clock,
  Cpu,
  Database,
  Lock,
  Brain,
  Download,
  Calendar,
  Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DownloadCVButton from "./download-cv-button"
import { useLanguage } from "./language-provider"
import { useRouter } from "next/navigation"

// Function untuk menghasilkan gambar abstrak yang berbeda-beda - disederhanakan
function generateAbstractBackgroundImage(width = 1200, height = 600, seed = Math.random() * 1000) {
  // Gunakan placeholder jika di server-side atau perangkat mobile
  if (typeof window === 'undefined') return '';
  
  // Menggunakan gradient statis saja untuk menghindari permasalahan render
  try {
    // Menggunakan pendekatan CSS gradients yang lebih sederhana
    const safeColors = [
      'rgba(59, 130, 246, 0.3)',  // Biru
      'rgba(139, 92, 246, 0.3)',   // Ungu
      'rgba(236, 72, 153, 0.3)',   // Merah muda
      'rgba(14, 165, 233, 0.3)',   // Cyan
      'rgba(16, 185, 129, 0.3)',   // Hijau
    ];
    
    // Pada mobile, gunakan gradient yang sangat sederhana
    if (window.innerWidth < 768) {
      return 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.3))';
    }
    
    // Simplified gradient approach
    const angle = Math.floor(Math.random() * 360);
    const color1 = safeColors[Math.floor(Math.random() * safeColors.length)];
    const color2 = safeColors[Math.floor(Math.random() * safeColors.length)];
    
    // Simple linear gradient 
    return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
  } catch (error) {
    console.error("Error generating background:", error);
    // Fallback ke gradient yang sangat sederhana
    return 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.3))';
  }
}

export default function ResumeContent() {
  const { t } = useLanguage()
  const bioRef = useRef(null)
  const skillsRef = useRef(null)
  const experienceRef = useRef(null)
  const educationRef = useRef(null)
  const router = useRouter()

  const bioInView = useInView(bioRef, { once: true, amount: 0.3 })
  const skillsInView = useInView(skillsRef, { once: true, amount: 0.3 })
  const experienceInView = useInView(experienceRef, { once: true, amount: 0.3 })
  const educationInView = useInView(educationRef, { once: true, amount: 0.3 })

  const [expandedJob, setExpandedJob] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [randomHeaderImage, setRandomHeaderImage] = useState<string>("")
  const [generatedBackground, setGeneratedBackground] = useState<string>("")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [viewportHeight, setViewportHeight] = useState("100vh")
  const [showJobDetails, setShowJobDetails] = useState<boolean[]>([])
  const detailsRef = useRef<(HTMLDivElement | null)[]>([])
  const animationRef = useRef<number>(0)

  // Function untuk memilih gambar header secara acak
  useEffect(() => {
    // Gunakan placeholder image jika gambar tidak ditemukan
    const headerImages = [
      "/placeholder.jpg", // Menggunakan placeholder sebagai fallback
    ]
    const randomIndex = Math.floor(Math.random() * headerImages.length)
    setRandomHeaderImage(headerImages[randomIndex])
    
    // Deteksi perangkat mobile
    const checkIfMobile = () => {
      const userAgent = 
        typeof window.navigator === "undefined" ? "" : navigator.userAgent;
      const mobile = Boolean(
        userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        )
      );
      setIsMobile(mobile);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [])

  // Generate abstract background image saat komponen dimount
  useEffect(() => {
    // Cek jika sudah ada background yang di-generate, jangan generate ulang
    if (!generatedBackground) {
      try {
        // Pada perangkat mobile, gunakan background yang lebih sederhana
        const backgroundImage = isMobile 
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.3))'
          : generateAbstractBackgroundImage();
        setGeneratedBackground(backgroundImage);
      } catch (error) {
        console.error("Error generating background:", error);
        // Gunakan fallback background jika gagal generate
        setGeneratedBackground("linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.3))"); 
      }
    }
  }, [generatedBackground, isMobile]);

  // Mouse movement effect - disable on mobile
  useEffect(() => {
    // Skip this effect on mobile devices
    if (isMobile) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMobile]);

  // Tambahkan useEffect untuk efek parallax - lighten on mobile
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      // Pada perangkat mobile, gunakan efek parallax yang lebih ringan
      const parallaxMultiplier = isMobile ? 0.05 : 0.1;
      document.documentElement.style.setProperty('--scroll-offset', `${window.scrollY * parallaxMultiplier}px`)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobile])

  // Tambahkan useEffect untuk memastikan section visible di mobile
  useEffect(() => {
    // Khusus untuk perangkat mobile, kita akan memaksa semua section terlihat
    if (isMobile) {
      // Force semua useInView state menjadi true pada perangkat mobile
      // untuk memastikan semua konten terlihat bahkan jika IntersectionObserver tidak berfungsi
      if (!bioInView) document.documentElement.style.setProperty('--bio-in-view', '1');
      if (!skillsInView) document.documentElement.style.setProperty('--skills-in-view', '1');
      if (!experienceInView) document.documentElement.style.setProperty('--experience-in-view', '1');
      if (!educationInView) document.documentElement.style.setProperty('--education-in-view', '1');
    }
  }, [isMobile, bioInView, skillsInView, experienceInView, educationInView]);
  
  // Hitung viewport height sekali pada saat mount untuk memastikan seluruh konten dapat diakses
  useEffect(() => {
    if (isMobile) {
      // Fix untuk Safari mobile yang memiliki masalah dengan viewport height
      const setViewportHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      setViewportHeight();
      window.addEventListener('resize', setViewportHeight);
      
      // Pastikan Education & Projects section di-render dalam viewport
      setTimeout(() => {
        const educationSection = educationRef.current;
        if (educationSection && typeof educationSection.scrollIntoView === 'function') {
          // Pastikan section terlihat di viewport pada mobile browser
          window.scrollBy(0, 1); // Trigger rendering di beberapa browser mobile
        }
      }, 500);
      
      return () => window.removeEventListener('resize', setViewportHeight);
    }
  }, [isMobile]);

  // Tambahkan useEffect untuk fallback jika IntersectionObserver tidak bekerja
  useEffect(() => {
    // Ini adalah fallback jika IntersectionObserver tidak berfungsi dengan baik
    // Biasanya terjadi pada beberapa browser mobile
    let timeout: NodeJS.Timeout;
    
    if (isMobile) {
      // Setelah waktu tertentu, jika section masih belum terlihat, paksa tampilkan
      timeout = setTimeout(() => {
        const educationElement = educationRef.current;
        if (educationElement && !educationInView) {
          // Secara manual force tampilkan education section
          console.log("Applying fallback for Education section visibility on mobile");
          document.documentElement.style.setProperty('--education-in-view', '1');
          
          // Tambahkan class mobile-visible pada semua elemen child
          const allAnimatedElements = educationElement.querySelectorAll('.motion-div');
          allAnimatedElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.classList.add('mobile-visible');
            }
          });
        }
      }, 2000); // Tunggu 2 detik sebelum fallback diterapkan
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isMobile, educationInView]);

  // Tambahkan useEffect untuk pre-render section Education & Projects
  useEffect(() => {
    if (isMobile) {
      // Pre-render education section dengan cepat pada perangkat mobile
      // dengan menonaktifkan animasi dan transisi
      document.documentElement.classList.add('reduce-animations-mobile');
      
      // Force render education section segera
      setTimeout(() => {
        const educationElement = educationRef.current;
        if (educationElement) {
          console.log("Pre-rendering education section for mobile");
          document.documentElement.style.setProperty('--education-in-view', '1');
          
          // Force menampilkan semua elemen child dengan class motion-div
          const allAnimatedElements = document.querySelectorAll('.motion-div');
          allAnimatedElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.classList.add('mobile-visible');
              el.style.opacity = '1';
              el.style.transform = 'none';
            }
          });
        }
      }, 100); // Waktu sangat pendek untuk memastikan render segera
    }
    
    return () => {
      document.documentElement.classList.remove('reduce-animations-mobile');
    };
  }, [isMobile]);

  // Tambahkan init function untuk mempersiapkan render
  useEffect(() => {
    // Fungsi untuk memastikan rendering yang optimal
    const optimizeForDevice = () => {
      // Pada mobile, gunakan DOM manipulation langsung untuk memastikan render
      if (isMobile) {
        // Nonaktifkan animasi yang kompleks
        document.querySelectorAll('.can-disable-on-mobile').forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.display = 'none';
          }
        });
        
        // Pre-load gambar utama
        const imgPreload = document.createElement('img');
        imgPreload.src = "/Photo_Profile_3.jpg";
        imgPreload.style.display = 'none';
        document.body.appendChild(imgPreload);
        setTimeout(() => {
          if (imgPreload && imgPreload.parentNode) {
            imgPreload.parentNode.removeChild(imgPreload);
          }
        }, 1000);
        
        // Force pengurangan motion
        const htmlEl = document.documentElement;
        htmlEl.style.setProperty('--reduce-motion', '1');
      }
    };
    
    optimizeForDevice();
    
    // Fallback rendering yang lebih cepat
    const fallbackTimer = setTimeout(() => {
      if (isMobile) {
        console.log("Applying quick fallback render");
        // Force render semua section
        document.documentElement.style.setProperty('--bio-in-view', '1');
        document.documentElement.style.setProperty('--skills-in-view', '1');
        document.documentElement.style.setProperty('--experience-in-view', '1');
        document.documentElement.style.setProperty('--education-in-view', '1');
      }
    }, 800);
    
    return () => clearTimeout(fallbackTimer);
  }, [isMobile]);

  const toggleJobDetails = (index: number) => {
    setExpandedJob(expandedJob === index ? null : index)
  }

  const technicalSkills = [
    {
      name: "Linux Administration",
      icon: Server,
      level: 85,
      description: "Instalasi, konfigurasi OS, shell scripting dan manajemen paket",
    },
    {
      name: "CLI & Bash Scripting",
      icon: Terminal,
      level: 80,
      description: "Command Line Interface dan Advanced Shell Scripting",
    },
    {
      name: "Linux Security",
      icon: Shield,
      level: 75,
      description: "Konfigurasi firewall, manajemen user, permission dan hardening",
    },
    { name: "Virtualization", icon: Monitor, level: 80, description: "VMWare, Proxmox, VirtualBox" },
    { name: "System Troubleshooting", icon: Code, level: 82, description: "Pemecahan masalah sistem dan jaringan" },
    { name: "Network Security", icon: Shield, level: 70, description: "Keamanan jaringan dasar dan monitoring" },
    { name: "Documentation", icon: FileText, level: 90, description: "Dokumentasi teknis dan prosedur" },
  ]

  const additionalSkills = [
    { name: "Cybersecurity Basics", icon: Lock, level: 75, description: "Prinsip-prinsip dasar keamanan siber" },
    { name: "System Administration", icon: Cpu, level: 80, description: "Administrasi sistem Linux" },
    { name: "Server Management", icon: Server, level: 78, description: "Pengelolaan server dan layanan" },
  ]

  const workExperience = [
    {
      company: "PT. Pedang Power",
      position: "Admin Logistik",
      period: "Oktober 2022 - Maret 2023",
      location: "Jakarta, Indonesia",
      responsibilities: [
        "Melakukan negosiasi dengan vendor untuk pengadaan material proyek",
        "Mengoptimalkan pencarian barang melalui platform digital untuk harga terbaik",
        "Mendukung kelancaran logistik proyek dengan solusi IT untuk manajemen proses",
      ],
      achievements: [
        "Mengoptimalkan proses pengadaan dengan implementasi sistem digital",
        "Mengurangi biaya pengadaan material hingga 15% melalui negosiasi efektif",
      ],
      tools: ["Microsoft Office", "Google Drive", "Inventory Management Systems"],
    },
    {
      company: "SPBU Pertamina (44.574.16)",
      position: "Operator",
      period: "Agustus 2021 - November 2021",
      location: "Klaten, Indonesia",
      responsibilities: [
        "Mengoperasikan dan memantau pompa BBM",
        "Melayani transaksi penjualan dan mengelola kas",
        "Memberikan pelayanan kepada pelanggan",
        "Memeriksa serta merawat peralatan SPBU",
        "Menjaga kebersihan dan keamanan area SPBU",
        "Menyusun laporan harian operasional",
      ],
      achievements: [
        "Mempertahankan akurasi kas 100% selama masa kerja",
        "Mendapatkan penghargaan karyawan terbaik bulan September 2021",
      ],
      tools: ["Point of Sale Systems", "Cash Management", "Reporting Tools"],
    },
    {
      company: "Notaris dan PPAT",
      position: "Staff",
      period: "Februari 2021 - Juni 2021",
      location: "Klaten, Indonesia",
      responsibilities: [
        "Menyusun dokumen legal (akta jual beli dan dokumen lain) dengan Microsoft Word",
        "Mengatur dan mengelola berkas secara sistematis, mendukung efisiensi administratif",
      ],
      achievements: [
        "Mengembangkan sistem pengarsipan digital untuk meningkatkan efisiensi pencarian dokumen",
        "Mengurangi waktu pemrosesan dokumen hingga 25%",
      ],
      tools: ["Microsoft Word", "Document Management Systems", "Legal Documentation"],
    },
    {
      company: "PT. Dcika Prima Mahkota",
      position: "Operator Produksi",
      period: "Agustus 2018 - Maret 2019",
      location: "Bekasi, Indonesia",
      responsibilities: [
        "Mengelola proses produksi termasuk pembuatan dan pengukiran kue",
        "Menyiapkan bahan baku dan mengoptimalkan proses pengemasan",
        "Meningkatkan ketelitian, disiplin, dan manajemen waktu",
      ],
      achievements: [
        "Meningkatkan efisiensi produksi sebesar 10% melalui optimalisasi proses",
        "Berkontribusi pada pengurangan limbah produksi",
      ],
      tools: ["Production Equipment", "Quality Control", "Inventory Management"],
    },
  ]

  const education = [
    {
      institution: "SMA Negeri 12 Bekasi",
      period: "2015 - 2018",
      details: "Mengembangkan kemampuan IT secara mandiri melalui kursus online dan pelatihan",
    },
    {
      institution: "SMP Negeri 4 Bekasi",
      period: "2012 - 2015",
      details: "Pendidikan menengah pertama dengan fokus pada pengembangan dasar akademik",
    },
    {
      institution: "SD Negeri 4 Jakasampurna",
      period: "2006 - 2012",
      details: "Pendidikan dasar dengan pengenalan awal terhadap teknologi informasi",
    },
  ]

  const certifications = [
    {
      name: "Certified Network Security Practitioner (CNSP)",
      issuer: "The SecOps Group",
      date: "2025",
      description: "Sertifikasi profesional dalam praktik keamanan jaringan yang mencakup prinsip-prinsip dasar keamanan jaringan, protokol, dan teknik-teknik perlindungan infrastruktur jaringan.",
    },
    {
      name: "CC Certified in Cybersecurity (CC)",
      issuer: "(ISC)²",
      date: "2025",
      description: "Sertifikat keahlian dalam dasar-dasar dan implementasi keamanan siber yang fokus pada perlindungan sistem, aplikasi, dan infrastruktur TI dari berbagai ancaman keamanan.",
    },
    {
      name: "CC Course Conclusion & Final Assessment",
      issuer: "(ISC)²",
      date: "2025",
      description: "Sertifikasi penyelesaian kursus keamanan siber yang mencakup prinsip-prinsip fundamental dalam mengidentifikasi, mencegah, dan menanggapi ancaman keamanan siber.",
    },
    {
      name: "CC Domain 5: Security Operations",
      issuer: "(ISC)²",
      date: "2024",
      description: "Sertifikasi dalam operasi keamanan yang membekali profesional dengan keterampilan untuk mengidentifikasi, menganalisis, dan merespon ancaman keamanan melalui prosedur operasional.",
    },
    {
      name: "CC Domain 4: Network Security",
      issuer: "(ISC)²",
      date: "2024",
      description: "Sertifikasi dalam keamanan jaringan yang mencakup metodologi, protokol, dan teknik untuk mengamankan infrastruktur jaringan dan melindungi dari serangan berbasis jaringan.",
    },
    {
      name: "CC Domain 3: Access Control Concepts",
      issuer: "(ISC)²",
      date: "2024",
      description: "Sertifikasi dalam konsep kontrol akses yang berfokus pada prinsip, mekanisme, dan praktik terbaik dalam mengelola akses ke sistem dan sumber daya informasi.",
    },
    {
      name: "CC Domain 2: Incident Response",
      issuer: "(ISC)²",
      date: "2023",
      description: "Sertifikasi dalam respons insiden dan kelangsungan bisnis yang berfokus pada metodologi untuk penanganan insiden yang efektif dan perencanaan pemulihan bencana.",
    },
    {
      name: "CC Domain 1: Security Principles",
      issuer: "(ISC)²",
      date: "2023",
      description: "Sertifikasi dalam prinsip-prinsip keamanan dasar yang membentuk fondasi untuk memahami dan menerapkan praktik dan strategi keamanan siber.",
    }
  ]

  const projects = [
    {
      name: "Implementasi Server Linux",
      date: "2022",
      description: "Mengkonfigurasi dan mengoptimalkan server Linux untuk kebutuhan hosting dan layanan internal",
      technologies: ["Linux", "Apache", "Security Hardening", "Bash Scripting"],
    },
    {
      name: "Otomatisasi IT Support",
      date: "2023",
      description: "Membuat skrip shell untuk mengotomatisasi tugas-tugas pemeliharaan dan backup sistem",
      technologies: ["Bash", "Cron", "Python", "Automation Tools"],
    },
    {
      name: "Konfigurasi Keamanan Jaringan",
      date: "2023",
      description: "Implementasi dan penyetelan firewall untuk melindungi jaringan dan sistem dari ancaman siber",
      technologies: ["Firewall", "UFW", "iptables", "Network Security"],
    },
  ]

  return (
    <div className="container mx-auto px-4">
      {/* Header with Enhanced Parallax Effect - Sangat disederhanakan pada mobile */}
      <div className={`relative h-[350px] mb-20 sm:mb-12 overflow-hidden rounded-3xl group perspective ${isMobile ? 'simplified-bg reduce-motion h-[250px]' : ''}`}>
        {/* Background simplification for mobile */}
        {isMobile ? (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-foreground/30 to-primary/40 z-[0]"></div>
        ) : (
          <div 
            className={`absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-foreground/30 to-primary/40 z-[0] animate-gradient-slow ${isMobile ? 'disable-animation' : ''}`}
            style={{
              backgroundSize: "200% 200%",
            }}
          ></div>
        )}
        
        {/* Skip complex patterns on mobile */}
        {!isMobile && (
          <div 
            className="absolute inset-0 opacity-20 z-[1]"
            style={{
              backgroundImage: "radial-gradient(circle at center, white 0.5px, transparent 0.5px), radial-gradient(circle at center, white 0.5px, transparent 0.5px)",
              backgroundSize: "20px 20px, 30px 30px",
              backgroundPosition: "0 0, 10px 10px",
              transform: "translateY(var(--scroll-offset, 0px)) scale(1.05)",
            }}
          ></div>
        )}
        
        {/* Entirely skip complex animations on mobile */}
        {!isMobile && (
          <div className="absolute inset-0 overflow-hidden z-[2] can-disable-on-mobile">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div 
                key={i}
                className="absolute rounded-full bg-white/10 blur-xl"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  top: `${Math.random() * 80}%`,
                  left: `${Math.random() * 80}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}
        
        {/* Simplified background image for mobile */}
        <div
          className={`absolute inset-0 bg-cover bg-center opacity-40 z-[3] ${isMobile ? 'simplified-bg' : ''}`}
          style={{
            background: isMobile ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.3))' : generatedBackground,
            transform: isMobile ? "none" : "translateY(var(--scroll-offset, 0px)) scale(1.1)",
            filter: isMobile ? "none" : "contrast(1.2) brightness(0.8)"
          }}
        >
          {!isMobile && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-primary-foreground/40 mix-blend-overlay"></div>
          )}
        </div>
        
        {/* Skip glass effect on mobile */}
        {!isMobile && <div className="absolute inset-0 backdrop-blur-[2px] z-[5] can-disable-on-mobile"></div>}
        
        {/* Simplified border for mobile */}
        <div className="absolute inset-0 z-[6] p-[1px] rounded-3xl overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br from-primary/50 via-white/10 to-primary-foreground/50 rounded-3xl ${isMobile ? '' : 'animate-rotate-slow'}`}></div>
        </div>
        
        {/* Content - Simplified for mobile */}
        <div className="absolute inset-0 flex items-center justify-center z-[20]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0.3 : 1, delay: isMobile ? 0 : 0.2 }}
            className="text-center px-4"
          >
            {/* Logo - Simplified for mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: isMobile ? 0.3 : 0.8, delay: 0.1 }}
              className={`mx-auto mb-5 relative ${isMobile ? 'scale-75' : ''}`}
            >
              <motion.div 
                className="w-28 h-28 rounded-full bg-gradient-to-r from-primary/80 to-primary-foreground/80 flex items-center justify-center mx-auto shadow-xl shadow-primary/30 overflow-hidden border-2 border-white/50 relative z-10 group cursor-pointer"
                whileHover={isMobile ? {} : { scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/Photo_Profile_3.jpg" 
                  alt="JGP"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  priority={true}
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-30 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary-foreground/30 opacity-0 group-hover:opacity-40 transition-opacity duration-300 mix-blend-overlay"></div>
                
                {!isMobile && (
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ opacity: 1 }}
                  >
                    <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">JGP</span>
                  </motion.div>
                )}
              </motion.div>
              
              {/* Skip animated circles on mobile */}
              {!isMobile && (
                <>
                  <motion.div 
                    className="absolute inset-[-6px] rounded-full border-2 border-white/30 z-0 can-disable-on-mobile"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div 
                    className="absolute inset-[-12px] rounded-full border-2 border-white/20 z-0 can-disable-on-mobile"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                </>
              )}
            </motion.div>
            
            {/* Simplified text animation for mobile */}
            <motion.h1 
              className={`${isMobile ? 'text-3xl' : 'text-5xl md:text-6xl'} font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/80 drop-shadow-xl`}
              initial={{ letterSpacing: isMobile ? "0.02em" : "0.05em" }}
              animate={{ letterSpacing: "0.02em" }}
              transition={{ duration: isMobile ? 0 : 2, repeat: isMobile ? 0 : Infinity, repeatType: "reverse" }}
            >
              Linux & Cybersecurity
            </motion.h1>
            
            {/* Simplified divider for mobile */}
            <motion.div 
              initial={{ width: isMobile ? "100px" : "20px", opacity: 0.5 }}
              animate={{ width: "120px", opacity: 1 }}
              transition={{ duration: isMobile ? 0.5 : 1.5, delay: isMobile ? 0.1 : 0.5, ease: "easeOut" }}
              className="h-1 bg-gradient-to-r from-transparent via-white/90 to-transparent mx-auto mb-4"
            />
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ duration: isMobile ? 0.3 : 0.8, delay: isMobile ? 0.2 : 0.7 }}
              className={`${isMobile ? 'text-xs' : 'text-sm md:text-base'} text-white/90 max-w-md mx-auto font-medium tracking-wider`}
            >
              IT & Cyber Security Enthusiast
            </motion.p>
          </motion.div>
        </div>
        
        {/* Interactive Particles - Disabled on mobile */}
        {!isMobile && (
          <div className="absolute inset-0 z-[30] opacity-0 group-hover:opacity-100 transition-opacity duration-700 can-disable-on-mobile">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div 
                key={`particle-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{ 
                  top: `${Math.random() * 100}%`, 
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  repeatDelay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bio Section with 3D Card Effect */}
      <motion.div
        ref={bioRef}
        initial={{ opacity: 0, y: 30 }}
        animate={bioInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="mb-24"
      >
        <div className="relative perspective">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-foreground/20 rounded-xl blur-xl"></div>
          <div
            className="relative bg-card/30 backdrop-blur-md border border-card/20 p-8 rounded-xl transform-gpu transition-transform duration-500 hover:rotate-y-5 hover:scale-[1.02]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-1 flex justify-center">
                <div className="relative w-64 h-64 rounded-xl overflow-hidden border-4 border-primary/20 shadow-xl transform-gpu transition-transform duration-500 hover:scale-105">
                  <Image
                    src="/Photo_Profile_3.jpg"
                    alt="Januar Galuh Prabakti"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-center">
                    <span className="text-sm font-medium">Januar Galuh Prabakti</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="h-px flex-grow bg-gradient-to-r from-primary/50 to-transparent"></div>
                  <h2 className="text-3xl font-bold px-4">Januar Galuh Prabakti</h2>
                  <div className="h-px flex-grow bg-gradient-to-l from-primary/50 to-transparent"></div>
                </div>

                <div className="mb-6">
                  <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-lg font-medium">
                    IT & Cyber Security Enthusiast
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <span className="group-hover:text-primary transition-colors">Bekasi, Indonesia</span>
                  </div>
                  <div className="flex items-center group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <span className="group-hover:text-primary transition-colors">081290040769</span>
                  </div>
                  <div className="flex items-center group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <span className="group-hover:text-primary transition-colors">januargaluh3099@gmail.com</span>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-foreground/80 leading-relaxed text-lg">
                    Saya adalah seorang spesialis Linux dan IT Support yang berdedikasi, dengan keahlian dalam pengelolaan sistem Linux, keamanan jaringan, dan virtualisasi. Meskipun berlatar belakang dari SMA, saya secara otodidak telah mengembangkan pengetahuan mendalam tentang administrasi sistem, konfigurasi keamanan, dan pemecahan masalah IT. Saya memiliki pengalaman mengoptimalkan proses kerja melalui solusi berbasis Linux dan alat-alat open source. Motivasi saya adalah terus belajar dan mengembangkan keterampilan di bidang keamanan siber dan teknologi Linux.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <DownloadCVButton className="rounded-full px-6 py-6 bg-gradient-to-r from-primary to-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:scale-105" />
                  <Button
                    variant="outline"
                    className="rounded-full px-6 py-6 border-primary/50 hover:border-primary hover:bg-primary/5 transition-all duration-300 transform hover:scale-105"
                    onClick={() => {
                      try {
                        // Jika berada di halaman resume, kembali ke halaman utama dan arahkan ke bagian kontak
                        if (typeof window !== "undefined" && window.location.pathname === "/resume") {
                          // Menggunakan router untuk navigasi yang lebih baik di Next.js
                          router.push("/#contact");
                        } else {
                          // Jika sudah berada di halaman utama, scroll ke bagian kontak
                          const contactSection = document.getElementById("contact");
                          if (contactSection) {
                            contactSection.scrollIntoView({ behavior: "smooth" });
                            // Update URL tanpa reload halaman
                            if (typeof window !== "undefined") {
                              window.history.pushState({}, "", "/#contact");
                            }
                          } else {
                            // Jika elemen contact tidak ditemukan, mungkin kita perlu navigasi ke halaman utama
                            if (typeof window !== "undefined") {
                              router.push("/#contact");
                            }
                          }
                        }
                      } catch (error) {
                        console.error("Error navigating to contact section:", error);
                        // Fallback jika terjadi kesalahan - menggunakan cara tradisional
                        if (typeof window !== "undefined") {
                          window.location.href = "/#contact";
                        }
                      }
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Contact Me
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Skills Section with 3D Tabs */}
      <motion.div
        ref={skillsRef}
        initial={{ opacity: 0, y: 30 }}
        animate={skillsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="mb-24"
      >
        <div className="flex items-center mb-12">
          <div className="h-px flex-grow bg-gradient-to-r from-transparent to-primary/50"></div>
          <h2 className="text-3xl md:text-4xl font-bold mx-6 flex items-center">
            <Code className="h-8 w-8 mr-3 text-primary" />
            Technical Expertise
          </h2>
          <div className="h-px flex-grow bg-gradient-to-l from-transparent to-primary/50"></div>
        </div>

        <Tabs defaultValue="technical" className="w-full">
          <TabsList className="w-full max-w-md mx-auto mb-8 bg-card/30 backdrop-blur-md border border-card/20 p-1 rounded-full">
            <TabsTrigger
              value="technical"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Server className="h-4 w-4 mr-2" />
              Technical Skills
            </TabsTrigger>
            <TabsTrigger
              value="additional"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Cpu className="h-4 w-4 mr-2" />
              Additional Skills
            </TabsTrigger>
            <TabsTrigger
              value="soft"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Soft Skills
            </TabsTrigger>
          </TabsList>

          <TabsContent value="technical" className="mt-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-foreground/10 rounded-xl blur-xl"></div>
              <div className="relative bg-card/30 backdrop-blur-md border border-card/20 p-8 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {technicalSkills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={skillsInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="group motion-div"
                    >
                      <div className="flex items-center mb-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-3 bg-primary/10 rounded-lg mr-4 group-hover:bg-primary/20 transition-all duration-300 transform group-hover:scale-110">
                                <skill.icon className="h-5 w-5 text-primary" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{skill.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className="font-medium text-lg">{skill.name}</span>
                      </div>
                      <div className="h-3 bg-foreground/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-primary-foreground"
                          initial={{ width: 0 }}
                          animate={skillsInView ? { width: `${skill.level}%` } : {}}
                          transition={{ duration: 1, delay: 0.2 + 0.1 * index }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-foreground/60">
                        <span>Beginner</span>
                        <span>Advanced</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="mt-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-foreground/10 rounded-xl blur-xl"></div>
              <div className="relative bg-card/30 backdrop-blur-md border border-card/20 p-8 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {additionalSkills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={skillsInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="group motion-div"
                    >
                      <div className="flex items-center mb-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-3 bg-primary/10 rounded-lg mr-4 group-hover:bg-primary/20 transition-all duration-300 transform group-hover:scale-110">
                                <skill.icon className="h-5 w-5 text-primary" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{skill.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className="font-medium text-lg">{skill.name}</span>
                      </div>
                      <div className="h-3 bg-foreground/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-primary-foreground"
                          initial={{ width: 0 }}
                          animate={skillsInView ? { width: `${skill.level}%` } : {}}
                          transition={{ duration: 1, delay: 0.2 + 0.1 * index }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-foreground/60">
                        <span>Beginner</span>
                        <span>Advanced</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="soft" className="mt-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-foreground/10 rounded-xl blur-xl"></div>
              <div className="relative bg-card/30 backdrop-blur-md border border-card/20 p-8 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-6 flex items-center">
                      <Briefcase className="h-5 w-5 mr-3 text-primary" />
                      Administrative & Managerial
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="p-1 bg-primary/10 rounded-full mr-3 mt-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-foreground/80">Negosiasi dan pengelolaan dokumen</span>
                      </li>
                      <li className="flex items-start">
                        <div className="p-1 bg-primary/10 rounded-full mr-3 mt-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-foreground/80">Optimalisasi proses kerja melalui solusi digital</span>
                      </li>
                      <li className="flex items-start">
                        <div className="p-1 bg-primary/10 rounded-full mr-3 mt-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-foreground/80">Manajemen waktu dan prioritas</span>
                      </li>
                      <li className="flex items-start">
                        <div className="p-1 bg-primary/10 rounded-full mr-3 mt-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-foreground/80">Koordinasi tim dan komunikasi efektif</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-6 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-3 text-primary" />
                      Adaptability & Self-Learning
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="p-1 bg-primary/10 rounded-full mr-3 mt-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-foreground/80">Cepat belajar dan menguasai teknologi baru</span>
                      </li>
                      <li className="flex items-start">
                        <div className="p-1 bg-primary/10 rounded-full mr-3 mt-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-foreground/80">
                          Partisipasi aktif dalam kursus online dan pelatihan IT
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="p-1 bg-primary/10 rounded-full mr-3 mt-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-foreground/80">Kemampuan beradaptasi dengan lingkungan kerja baru</span>
                      </li>
                      <li className="flex items-start">
                        <div className="p-1 bg-primary/10 rounded-full mr-3 mt-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-foreground/80">Pemecahan masalah dan berpikir analitis</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-12">
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <Languages className="h-5 w-5 mr-3 text-primary" />
                    Languages
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Bahasa Indonesia</span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">Native</span>
                      </div>
                      <div className="h-3 bg-foreground/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-primary-foreground"
                          initial={{ width: 0 }}
                          animate={skillsInView ? { width: "100%" } : {}}
                          transition={{ duration: 1, delay: 0.8 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">English</span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                          Intermediate
                        </span>
                      </div>
                      <div className="h-3 bg-foreground/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-primary-foreground"
                          initial={{ width: 0 }}
                          animate={skillsInView ? { width: "65%" } : {}}
                          transition={{ duration: 1, delay: 0.9 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Experience Section with Interactive Cards */}
      <motion.div
        ref={experienceRef}
        initial={{ opacity: 0, y: 30 }}
        animate={experienceInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="mb-24"
      >
        <div className="flex items-center mb-12">
          <div className="h-px flex-grow bg-gradient-to-r from-transparent to-primary/50"></div>
          <h2 className="text-3xl md:text-4xl font-bold mx-6 flex items-center">
            <Briefcase className="h-8 w-8 mr-3 text-primary" />
            Professional Journey
          </h2>
          <div className="h-px flex-grow bg-gradient-to-l from-transparent to-primary/50"></div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-foreground/10 rounded-xl blur-xl"></div>
          <div className="relative bg-card/30 backdrop-blur-md border border-card/20 p-8 rounded-xl">
            <div className="relative border-l-2 border-primary/30 pl-8 ml-4">
              {workExperience.map((job, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={experienceInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 * index }}
                  className="mb-12 relative last:mb-0 motion-div"
                >
                  <div className="absolute -left-[41px] top-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 rounded-full bg-background"></div>
                  </div>

                  <div className="bg-card/40 backdrop-blur-sm border border-card/30 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:bg-card/60">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                        {job.position}
                      </h3>
                      <div className="flex items-center mt-2 md:mt-0">
                        <Clock className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm text-foreground/70 bg-primary/10 px-3 py-1 rounded-full inline-block">
                          {job.period}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center mb-6">
                      <span className="font-semibold text-lg text-primary">{job.company}</span>
                      <span className="mx-2 text-foreground/40">•</span>
                      <span className="text-foreground/70 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm uppercase tracking-wider text-foreground/60 mb-2 flex items-center">
                        <div className="w-4 h-0.5 bg-primary/50 mr-2"></div>
                        Responsibilities
                      </h4>
                      <ul className="space-y-2 pl-5">
                        {job.responsibilities.map((responsibility, idx) => (
                          <li key={idx} className="text-foreground/80 relative">
                            <div className="absolute -left-5 top-2.5 w-1.5 h-1.5 rounded-full bg-primary/70"></div>
                            {responsibility}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => toggleJobDetails(index)}
                      >
                        {expandedJob === index ? (
                          <>
                            <span>Less Details</span>
                            <ChevronUp className="ml-1 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <span>More Details</span>
                            <ChevronDown className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>

                    <AnimatePresence>
                      {expandedJob === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t border-[hsl(var(--border)_/_0.3)] mt-4">
                            <div className="mb-4">
                              <h4 className="text-sm uppercase tracking-wider text-foreground/60 mb-2 flex items-center">
                                <Award className="h-4 w-4 mr-2 text-primary" />
                                Key Achievements
                              </h4>
                              <ul className="space-y-2 pl-5">
                                {job.achievements.map((achievement, idx) => (
                                  <li key={idx} className="text-foreground/80 relative">
                                    <div className="absolute -left-5 top-2.5 w-1.5 h-1.5 rounded-full bg-primary/70"></div>
                                    {achievement}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="text-sm uppercase tracking-wider text-foreground/60 mb-2 flex items-center">
                                <Code className="h-4 w-4 mr-2 text-primary" />
                                Tools & Technologies
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {job.tools.map((tool, idx) => (
                                  <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Education & Projects Section - Enhanced for mobile */}
      <motion.div
        ref={educationRef}
        initial={{ opacity: isMobile ? 1 : 0, y: isMobile ? 0 : 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-24 sm:mb-16"
        data-section="education"
        id="education-section"
      >
        <div className="flex items-center mb-12 sm:mb-8">
          <div className="h-px flex-grow bg-gradient-to-r from-transparent to-primary/50"></div>
          <h2 className="text-3xl md:text-4xl font-bold mx-6 flex flex-wrap items-center">
            <GraduationCap className="h-8 w-8 mr-3 text-primary flex-shrink-0" />
            <span className="whitespace-nowrap">Education & Projects</span>
          </h2>
          <div className="h-px flex-grow bg-gradient-to-l from-transparent to-primary/50"></div>
        </div>

        {/* Grid yang dioptimalkan untuk mobile - ubah layout menjadi 1 kolom di mobile dengan spacing lebih pendek */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-6">
          {/* Education & Certifications - Diberi masing-masing ID untuk memudahkan akses DOM */}
          <div className="relative h-full min-h-[200px]" id="education-col">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-foreground/10 rounded-xl blur-xl"></div>
            <div className="relative bg-card/30 backdrop-blur-md border border-card/20 p-4 sm:p-8 rounded-xl h-full">
              <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                <span className="break-words">Education & Certifications</span>
              </h3>

              {/* Education items dengan struktur yang dioptimalkan */}
              <div className="relative border-l-2 border-primary/30 pl-4 sm:pl-6 ml-2 sm:ml-3 mb-8 sm:mb-12">
                {education.map((edu, index) => (
                  <div
                    key={index}
                    className="mb-6 sm:mb-8 relative last:mb-0 motion-div mobile-visible opacity-100"
                    style={{ transform: 'none' }}
                    id={`education-item-${index}`}
                  >
                    <div className="absolute -left-[25px] sm:-left-[29px] top-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-background"></div>
                    </div>

                    <div className="bg-card/40 backdrop-blur-sm border border-card/30 rounded-lg p-3 sm:p-4 hover:shadow-lg transition-all duration-300">
                      <h4 className="text-lg sm:text-xl font-bold">{edu.institution}</h4>
                      <div className="text-xs sm:text-sm text-foreground/70 mb-1 sm:mb-2 flex items-center">
                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                        {edu.period}
                      </div>
                      {edu.details && <p className="text-sm sm:text-base text-foreground/80">{edu.details}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Certifications dengan rendereing yang dioptimalkan */}
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                <span className="break-words">Certifications</span>
              </h3>

              <div className="space-y-3 sm:space-y-4" id="certifications-container">
                {certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="bg-card/40 backdrop-blur-sm border border-card/30 rounded-lg p-3 sm:p-4 hover:shadow-lg transition-all duration-300 motion-div mobile-visible opacity-100"
                    style={{ transform: 'none' }}
                    id={`certification-item-${index}`}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <h4 className="font-semibold text-sm sm:text-base">{cert.name}</h4>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{cert.date}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mt-1">{cert.issuer}</p>
                    <p className="text-xs sm:text-sm mt-2">{cert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects & Achievements - Dengan rendering yang dioptimalkan */}
          <div className="relative h-full min-h-[200px]" id="projects-col">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-foreground/10 rounded-xl blur-xl"></div>
            <div className="relative bg-card/30 backdrop-blur-md border border-card/20 p-4 sm:p-8 rounded-xl h-full">
              <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center">
                <Code className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                <span className="break-words">Projects & Achievements</span>
              </h3>

              {/* Projects dengan rendering statis untuk mobile */}
              <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12" id="projects-container">
                {projects.map((project, index) => (
                  <div
                    key={index}
                    className="bg-card/40 backdrop-blur-sm border border-card/30 rounded-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group motion-div mobile-visible opacity-100"
                    style={{ transform: 'none' }}
                    id={`project-item-${index}`}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2 sm:mb-3">
                      <h4 className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors">{project.name}</h4>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {project.date}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-foreground/80 mb-3 sm:mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {project.technologies.map((tech, idx) => (
                        <span key={idx} className="bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Self Development items - rendering statis untuk performa */}
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
                <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                <span className="break-words">Self Development</span>
              </h3>

              <div className="space-y-4 sm:space-y-6 motion-div mobile-visible opacity-100" style={{ transform: 'none' }} id="self-dev-container">
                <div className="p-3 sm:p-5 bg-primary/5 rounded-lg border border-primary/10 hover:shadow-lg transition-all duration-300 hover:bg-primary/10">
                  <h4 className="font-medium mb-1 sm:mb-2 flex items-center">
                    <Terminal className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-primary flex-shrink-0" />
                    Linux Mastery
                  </h4>
                  <p className="text-sm sm:text-base text-foreground/80">
                    Secara konsisten memperdalam pengetahuan tentang administrasi Linux dan konfigurasi server melalui praktik langsung dan proyek personal
                  </p>
                </div>

                <div className="p-3 sm:p-5 bg-primary/5 rounded-lg border border-primary/10 hover:shadow-lg transition-all duration-300 hover:bg-primary/10">
                  <h4 className="font-medium mb-1 sm:mb-2 flex items-center">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-primary flex-shrink-0" />
                    Keamanan Siber
                  </h4>
                  <p className="text-sm sm:text-base text-foreground/80">
                    Terus mempelajari teknik dan praktik terbaru dalam keamanan sistem dan jaringan melalui platform pelatihan online dan komunitas Linux
                  </p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-primary/20 to-primary-foreground/20 rounded-lg text-center motion-div mobile-visible opacity-100" style={{ transform: 'none' }} id="quote-container">
                <p className="italic text-sm sm:text-lg">
                  "Berkomitmen untuk selalu mengembangkan solusi berbasis Linux yang aman, efisien, dan andal untuk menyelesaikan tantangan teknologi."
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-12"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-foreground/20 rounded-xl blur-xl"></div>
          <div className="relative bg-card/30 backdrop-blur-md border border-card/20 p-12 rounded-xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("resume.readyToCollaborate")}</h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
              {t("resume.collaborationText")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                className="rounded-full px-8 py-6 bg-gradient-to-r from-primary to-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  try {
                    // Jika berada di halaman resume, kembali ke halaman utama dan arahkan ke bagian kontak
                    if (typeof window !== "undefined" && window.location.pathname === "/resume") {
                      // Menggunakan router untuk navigasi yang lebih baik di Next.js
                      router.push("/#contact");
                    } else {
                      // Jika sudah berada di halaman utama, scroll ke bagian kontak
                      const contactSection = document.getElementById("contact");
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: "smooth" });
                        // Update URL tanpa reload halaman
                        if (typeof window !== "undefined") {
                          window.history.pushState({}, "", "/#contact");
                        }
                      } else {
                        // Jika elemen contact tidak ditemukan, mungkin kita perlu navigasi ke halaman utama
                        if (typeof window !== "undefined") {
                          router.push("/#contact");
                        }
                      }
                    }
                  } catch (error) {
                    console.error("Error navigating to contact section:", error);
                    // Fallback jika terjadi kesalahan - menggunakan cara tradisional
                    if (typeof window !== "undefined") {
                      window.location.href = "/#contact";
                    }
                  }
                }}
              >
                <Mail className="mr-2 h-5 w-5" />
                {t("resume.contactMe")}
              </Button>
              <DownloadCVButton
                variant="outline"
                className="rounded-full px-8 py-6 border-primary/50 hover:border-primary hover:bg-primary/5 transition-all duration-300 transform hover:scale-105"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

