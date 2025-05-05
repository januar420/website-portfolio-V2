import { toast } from "@/hooks/use-toast"

/**
 * Fungsi untuk mendownload CV dari Google Drive
 * 
 * Menangani proses download CV dari Google Drive dengan lebih robust
 * - Menambahkan fallback jika link utama gagal
 * - Menangani error dengan lebih baik
 * - Menambahkan logging untuk debugging
 */

/**
 * Mengubah link Google Drive menjadi direct download link
 * @param driveLink Link Google Drive
 * @returns Direct download link
 */
function convertGDriveToDirectLink(driveLink: string): string {
  try {
    // Ekstrak ID file dari URL Google Drive
    const regex = /[-\w]{25,}/;
    const match = regex.exec(driveLink);
    
    if (!match || !match[0]) {
      console.error("❌ Format Google Drive URL tidak valid");
      return driveLink; // Kembalikan link asli jika invalid
    }
    
    const fileId = match[0];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  } catch (error) {
    console.error("❌ Error mengkonversi link Google Drive:", error);
    return driveLink; // Kembalikan link asli jika terjadi error
  }
}

/**
 * Alternatif link download sebagai fallback
 */
const CV_LINKS = {
  PRIMARY: "https://drive.google.com/file/d/1bCZvP45i2XRKTRQNwR9I3DGVrK_OJvbQ/view?usp=drive_link",
  BACKUP: "https://drive.google.com/file/d/1bCZvP45i2XRKTRQNwR9I3DGVrK_OJvbQ/view?usp=sharing",
  DIRECT: "https://docs.google.com/document/d/1bCZvP45i2XRKTRQNwR9I3DGVrK_OJvbQ/export?format=pdf",
  // Path ke file PDF lokal (prioritas tertinggi)
  LOCAL: "/pdfs/Januar_Galuh_CV.pdf", 
  // Nama file untuk download
  FILENAME: "Januar_Galuh_CV.pdf"
};

/**
 * Fungsi untuk mengunduh dan membuat CV
 */
export async function generateResumePDF(): Promise<void> {
  // Fungsi helper untuk mencoba download dari URL
  const attemptDownload = (url: string, filename: string): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        console.log(`📥 Mencoba download dari: ${url}`);
        
        // Tambahkan parameter timestamp untuk mencegah caching
        const finalUrl = url.includes('?') 
          ? `${url}&t=${Date.now()}` 
          : `${url}?t=${Date.now()}`;
        
        // Buat elemen anchor untuk download
        const link = document.createElement('a');
        link.href = finalUrl;
        link.download = filename;
        link.target = "_blank"; // Untuk kompatibilitas browser
        link.rel = "noopener noreferrer"; // Untuk keamanan
        
        // Tambahkan ke DOM, klik, lalu hapus
        document.body.appendChild(link);
        setTimeout(() => {
          link.click();
          
          // Hapus setelah delay untuk memastikan download dimulai
          setTimeout(() => {
            document.body.removeChild(link);
            
            // Anggap berhasil jika tidak ada error
            resolve(true);
            
            // Tampilkan toast sukses
            try {
              if (typeof toast === 'function') {
                toast({
                  title: "Download Berhasil",
                  description: "CV Anda telah berhasil diunduh",
                });
              }
            } catch (error) {
              console.log("Toast notification tidak tersedia");
            }
          }, 100);
        }, 50);
      } catch (error) {
        console.error(`❌ Error saat download dari ${url}:`, error);
        resolve(false);
      }
    });
  };
  
  try {
    // Coba akses file PDF lokal terlebih dahulu (opsi terbaik)
    console.log("🔍 Mencoba mengunduh CV dari file lokal...");
    const localSuccess = await attemptDownload(CV_LINKS.LOCAL, CV_LINKS.FILENAME);
    
    if (!localSuccess) {
      console.log("⚠️ Download dari file lokal gagal, mencoba Google Drive...");
      
      // Langkah 1: Coba download menggunakan link direct export Google Drive
      console.log("🔄 Mencoba mengunduh dari Google Drive export link...");
      const directSuccess = await attemptDownload(CV_LINKS.DIRECT, CV_LINKS.FILENAME);
      
      if (!directSuccess) {
        console.log("⚠️ Download dari direct export gagal, mencoba link standard...");
        
        // Langkah 2: Coba download dari Google Drive URL utama 
        const primaryDownloadLink = convertGDriveToDirectLink(CV_LINKS.PRIMARY);
        console.log("🔄 Mencoba mengunduh dari Google Drive standard link...");
        const primarySuccess = await attemptDownload(primaryDownloadLink, CV_LINKS.FILENAME);
        
        // Langkah 3: Jika gagal, coba download dari URL backup
        if (!primarySuccess) {
          console.log("⚠️ Download dari link utama gagal, mencoba backup link...");
          const backupDownloadLink = convertGDriveToDirectLink(CV_LINKS.BACKUP);
          console.log("🔄 Mencoba mengunduh dari Google Drive backup link...");
          const backupSuccess = await attemptDownload(backupDownloadLink, CV_LINKS.FILENAME);
          
          // Langkah 4: Jika semua URL gagal, buka URL Google Drive di tab baru
          if (!backupSuccess) {
            console.log("⚠️ Semua metode download gagal, membuka browser tab...");
            console.log("📂 Membuka Google Drive di tab baru...");
            window.open(CV_LINKS.PRIMARY, '_blank', 'noopener,noreferrer');
            
            // Tampilkan toast sukses meskipun hanya membuka di tab
            try {
              if (typeof toast === 'function') {
                toast({
                  title: "CV Berhasil Dibuka",
                  description: "CV Anda telah dibuka di tab baru",
                });
              }
            } catch (error) {
              console.log("Toast notification tidak tersedia");
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Error saat generate/download PDF:", error);
    
    // Mencoba beberapa fallback
    try {
      console.log("🔄 Mencoba metode fallback...");
      
      // Fallback 1: Coba gunakan fetch API
      try {
        console.log("🔄 Mencoba fetch API...");
        fetch(CV_LINKS.LOCAL)
          .then(response => response.blob())
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = CV_LINKS.FILENAME;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          })
          .catch(e => {
            console.error("❌ Fetch API gagal:", e);
            throw e;
          });
      } catch (fetchError) {
        console.error("❌ Fallback dengan fetch gagal:", fetchError);
        
        // Fallback terakhir: Buka Google Drive di tab baru
        console.log("📂 Membuka Google Drive di tab baru sebagai fallback terakhir...");
        window.open(CV_LINKS.PRIMARY, '_blank', 'noopener,noreferrer');
      }
    } catch (finalError) {
      console.error("❌ Semua metode download gagal:", finalError);
      
      // Tampilkan toast error
      try {
        if (typeof toast === 'function') {
          toast({
            title: "Download Gagal",
            description: "Terjadi kesalahan saat mengunduh CV. Silakan coba lagi nanti.",
            variant: "destructive",
          });
        }
      } catch (toastError) {
        console.log("Toast notification tidak tersedia");
        alert("Terjadi kesalahan saat mengunduh CV. Silakan coba lagi nanti.");
      }
    }
  }
}

// Kode yang menggunakan jsPDF dikomentari, tetap disimpan jika diperlukan di masa depan
/* 
// Original code using jsPDF
export const generateResumePDFUsingJSPDF = async () => {
  try {
    // Show loading toast
    toast({
      title: "Generating PDF...",
      description: "Please wait while we prepare your resume",
    })

    // Dynamic import jspdf
    const { jsPDF } = await import("jspdf")
    
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Set font styles
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("Januar Galuh Prabakti", 20, 20)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("Bekasi, Indonesia | 081290040769 | januargaluh3099@gmail.com", 20, 27)

    doc.setDrawColor(100, 100, 100)
    doc.line(20, 30, 190, 30)

    doc.setFontSize(11)
    doc.text(
      [
        "Saya adalah seorang spesialis Linux dan IT Support yang berdedikasi, dengan keahlian dalam pengelolaan sistem Linux,",
        "keamanan jaringan, dan virtualisasi. Meskipun berlatar belakang dari SMA, saya secara otodidak telah",
        "mengembangkan pengetahuan mendalam tentang administrasi sistem, konfigurasi keamanan, dan pemecahan masalah IT.",
        "Saya memiliki pengalaman mengoptimalkan proses kerja melalui solusi berbasis Linux dan alat-alat open source.",
        "Motivasi saya adalah terus belajar dan mengembangkan keterampilan di bidang keamanan siber dan teknologi Linux.",
      ],
      20,
      38,
    )

    // KEAHLIAN TEKNIS & KOMPETENSI
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("KEAHLIAN TEKNIS & KOMPETENSI", 20, 70)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("Teknologi Linux & Keamanan Siber:", 20, 78)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.text(
      [
        "• Administrasi sistem Linux (instalasi, konfigurasi, manajemen pengguna)",
        "• Shell scripting dan otomatisasi tugas-tugas sistem",
        "• Konfigurasi keamanan sistem dan jaringan Linux",
        "• Virtualisasi server dan kontainer",
        "• Pemecahan masalah sistem dan troubleshooting jaringan",
      ],
      20,
      85,
    )

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("Sistem & Aplikasi:", 20, 100)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.text(
      [
        "• Distribusi Linux (Ubuntu, Debian, CentOS, Fedora)",
        "• Server Linux (Apache, Nginx, SSH, FTP)",
        "• Command Line Interface (CLI) dan Shell Scripting (Bash)",
        "• Keamanan Linux (Firewall, SELinux, AppArmor, hardening)",
        "• Virtualisasi (VMWare, Proxmox, VirtualBox, KVM)",
        "• Monitoring (Nagios, Zabbix, sistem log)",
        "• Backup & Recovery (Rsync, Bacula, solusi snapshot)",
      ],
      20,
      107,
    )

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("Keterampilan IT Support & Troubleshooting:", 20, 135)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.text([
      "• Analisis dan pemecahan masalah sistem secara efisien", 
      "• Dokumentasi teknis dan prosedur operasional standar (SOP)", 
      "• Konfigurasi dan pemeliharaan infrastruktur IT"
    ], 20, 142)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("Kemampuan Adaptasi & Pembelajaran Mandiri:", 20, 155)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.text(
      [
        "• Penguasaan cepat teknologi Linux dan solusi open source baru", 
        "• Partisipasi aktif dalam komunitas Linux dan forum keamanan IT"
      ],
      20,
      162,
    )

    // PENGALAMAN KERJA
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("PENGALAMAN KERJA", 20, 175)

    // PT. Dcika Prima Mahkota (first in chronological order)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("PT. Dcika Prima Mahkota", 20, 183)
    doc.setFont("helvetica", "italic")
    doc.text("Operator Produksi", 20, 189)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.text(
      [
        "• Mengelola proses produksi termasuk pembuatan dan pengukiran kue",
        "• Menyiapkan bahan baku dan mengoptimalkan proses pengemasan",
        "• Meningkatkan ketelitian, disiplin, dan manajemen waktu",
      ],
      20,
      196,
    )

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("Agustus 2018 - Maret 2019", 150, 183)
    doc.text("Bekasi, Indonesia", 150, 189)

    // Add a new page
    doc.addPage()

    // Notaris dan PPAT
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("Notaris dan PPAT", 20, 20)
    doc.setFont("helvetica", "italic")
    doc.text("Staff", 20, 26)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.text(
      [
        "• Menyusun dokumen legal (akta jual beli dan dokumen lain) dengan Microsoft Word",
        "• Mengatur dan mengelola berkas secara sistematis, mendukung efisiensi administratif",
      ],
      20,
      33,
    )

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("Februari 2021 - Juni 2021", 150, 20)
    doc.text("Klaten, Indonesia", 150, 26)

    // SPBU Pertamina
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("SPBU Pertamina (44.574.16)", 20, 50)
    doc.setFont("helvetica", "italic")
    doc.text("Operator", 20, 56)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.text(
      [
        "• Mengoperasikan dan memantau pompa BBM",
        "• Melayani transaksi penjualan dan mengelola kas",
        "• Memberikan pelayanan kepada pelanggan",
        "• Memeriksa serta merawat peralatan SPBU",
        "• Menjaga kebersihan dan keamanan area SPBU",
        "• Menyusun laporan harian operasional",
      ],
      20,
      63,
    )

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("Agustus 2021 - November 2021", 150, 50)
    doc.text("Klaten, Indonesia", 150, 56)

    // PT. Pedang Power
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("PT. Pedang Power", 20, 95)
    doc.setFont("helvetica", "italic")
    doc.text("Admin Logistik", 20, 101)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.text(
      [
        "• Melakukan negosiasi dengan vendor untuk pengadaan material proyek",
        "• Mengoptimalkan pencarian barang melalui platform digital untuk harga terbaik",
        "• Mendukung kelancaran logistik proyek dengan solusi IT untuk manajemen proses",
      ],
      20,
      108,
    )

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("Oktober 2022 - Maret 2023", 150, 95)
    doc.text("Jakarta, Indonesia", 150, 101)

    // PENDIDIKAN
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("PENDIDIKAN", 20, 130)

    // SD
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("SD Negeri 4 Jakasampurna", 20, 138)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("2006 - 2012", 150, 138)

    // SMP
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("SMP Negeri 4 Bekasi", 20, 148)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("2012 - 2015", 150, 148)

    // SMA
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("SMA Negeri 12 Bekasi", 20, 158)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.text(["• Mengembangkan kemampuan IT secara mandiri melalui kursus online dan pelatihan"], 20, 165)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("2015 - 2018", 150, 158)

    // SKILL BAHASA
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("SKILL BAHASA", 20, 180)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.text(["• Bahasa Indonesia: Native", "• English: Menengah"], 20, 187)

    // PENGEMBANGAN DIRI
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("PENGEMBANGAN DIRI", 20, 205)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.text(
      [
        "• Aktif mengikuti kursus dan pelatihan online di bidang administrasi Linux dan keamanan sistem",
        "• Berpartisipasi dalam proyek open source dan komunitas Linux",
        "• Membuat dan memelihara lingkungan lab Linux pribadi untuk pengujian dan pembelajaran",
        "• Terus mempelajari praktik terbaik keamanan IT melalui forum dan literatur industri",
      ],
      20,
      212,
    )

    // Save the PDF
    doc.save("Januar_Galuh_Resume.pdf")
    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    toast({
      title: "Error",
      description: "Failed to generate PDF. Please try again later.",
      variant: "destructive",
    })
    return false
  }
}
*/

