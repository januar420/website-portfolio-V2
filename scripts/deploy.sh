#!/bin/bash

# Script deploy untuk Netlify
# Author: Januar Galuh
# Version: 1.1

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Fungsi untuk menampilkan pesan dengan warna
print_message() {
  case $1 in
    "info")
      echo -e "${BLUE}[INFO]${NC} $2"
      ;;
    "success")
      echo -e "${GREEN}[SUCCESS]${NC} $2"
      ;;
    "warning")
      echo -e "${YELLOW}[WARNING]${NC} $2"
      ;;
    "error")
      echo -e "${RED}[ERROR]${NC} $2"
      ;;
    *)
      echo -e "$2"
      ;;
  esac
}

# Fungsi untuk memeriksa status perintah
check_status() {
  if [ $? -eq 0 ]; then
    print_message "success" "$1"
  else
    print_message "error" "$2"
    exit 1
  fi
}

# Pesan pembuka
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}   DEPLOY APLIKASI KE NETLIFY        ${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# 1. Pembersihan cache dan folder build sebelumnya
print_message "info" "Membersihkan cache dan build sebelumnya..."
npm run clean
check_status "Pembersihan berhasil" "Pembersihan gagal"

# 2. Instalasi dependensi jika diminta
read -p "Apakah Anda ingin menginstal ulang dependensi? (y/n): " install_deps
if [ "$install_deps" = "y" ] || [ "$install_deps" = "Y" ]; then
  print_message "info" "Menginstal dependensi..."
  npm install
  check_status "Instalasi dependensi berhasil" "Instalasi dependensi gagal"
fi

# 3. Periksa PDF.js worker
print_message "info" "Memeriksa keberadaan file PDF.js worker..."
if [ ! -f "./public/pdf.worker.min.js" ]; then
  print_message "warning" "File PDF.js worker tidak ditemukan di folder public"
  print_message "info" "Mengunduh PDF.js worker..."
  
  curl -L https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.js -o ./public/pdf.worker.min.js
  check_status "PDF.js worker berhasil diunduh" "Gagal mengunduh PDF.js worker"
else
  print_message "success" "File PDF.js worker sudah ada"
fi

# 4. Build aplikasi
print_message "info" "Memulai proses build aplikasi..."
npm run build:netlify
check_status "Build aplikasi berhasil" "Build aplikasi gagal"

# 5. Persiapan Netlify
print_message "info" "Menjalankan script persiapan Netlify..."
npm run prepare-netlify
check_status "Persiapan Netlify berhasil" "Persiapan Netlify gagal"

# 6. Pengecekan CLI Netlify
print_message "info" "Memeriksa CLI Netlify..."
if ! command -v netlify &> /dev/null; then
  print_message "warning" "Netlify CLI tidak ditemukan"
  print_message "info" "Menginstal Netlify CLI..."
  npm install -g netlify-cli
  check_status "Instalasi Netlify CLI berhasil" "Instalasi Netlify CLI gagal"
else
  print_message "success" "Netlify CLI sudah terinstal"
fi

# 7. Login ke Netlify jika diperlukan
print_message "info" "Memeriksa status login Netlify..."
netlify status &> /dev/null
if [ $? -ne 0 ]; then
  print_message "warning" "Anda belum login ke Netlify"
  print_message "info" "Silakan login ke Netlify..."
  netlify login
  check_status "Login Netlify berhasil" "Login Netlify gagal"
else
  print_message "success" "Sudah login ke Netlify"
fi

# 8. Deploy ke Netlify
print_message "info" "Siap untuk deploy ke Netlify..."

# Tanyakan apakah deploy ke produksi atau draft
read -p "Deploy ke produksi? (y/n, n untuk draft URL): " deploy_prod

if [ "$deploy_prod" = "y" ] || [ "$deploy_prod" = "Y" ]; then
  print_message "info" "Memulai deployment ke produksi..."
  netlify deploy --prod --dir=out
  check_status "Deployment ke produksi berhasil" "Deployment ke produksi gagal"
else
  print_message "info" "Memulai deployment ke draft..."
  netlify deploy --dir=out
  check_status "Deployment ke draft berhasil" "Deployment ke draft gagal"
fi

# Pesan penutup
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}   DEPLOYMENT SELESAI                ${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
print_message "success" "Aplikasi berhasil di-deploy ke Netlify!" 