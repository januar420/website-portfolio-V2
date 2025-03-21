import { toast } from "@/hooks/use-toast"

export const generateResumePDF = async () => {
  try {
    // Show loading toast
    toast({
      title: "Mendownload CV...",
      description: "Mohon tunggu sebentar",
    })

    // Link Google Drive yang diberikan
    const googleDriveLink = "https://drive.google.com/file/d/1VFgNKP44WNUGfgMMMLn-BYiemImh5bnQ/view?usp=sharing"
    
    // Mengubah link Google Drive menjadi link download langsung
    // Format: https://drive.google.com/uc?export=download&id=FILE_ID
    const fileId = googleDriveLink.split("/")[5] // Mengambil ID file dari URL
    const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`
    
    // Buat elemen <a> untuk melakukan download
    const downloadElement = document.createElement("a")
    downloadElement.href = downloadLink
    downloadElement.download = "Januar_Galuh_CV.pdf" // Nama file yang akan diunduh
    downloadElement.target = "_blank" // Buka di tab baru
    
    // Simulasikan klik untuk memulai download
    document.body.appendChild(downloadElement)
    downloadElement.click()
    document.body.removeChild(downloadElement)
    
    // Tampilkan toast sukses setelah beberapa detik
    setTimeout(() => {
      toast({
        title: "Berhasil!",
        description: "CV Anda sedang diunduh",
      })
    }, 1500)

    return true
  } catch (error) {
    console.error("Error downloading CV:", error)
    toast({
      title: "Error",
      description: "Gagal mengunduh CV. Silakan coba lagi nanti.",
      variant: "destructive",
    })
    return false
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

