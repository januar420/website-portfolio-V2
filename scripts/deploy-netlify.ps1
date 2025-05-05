# Script deployment Netlify untuk PowerShell
# Author: Januar Galuh
# Version: 1.0

# Fungsi untuk menampilkan pesan dengan warna
function Write-ColorMessage {
    param (
        [string]$Type,
        [string]$Message
    )
    
    switch ($Type) {
        "info" { 
            Write-Host "[INFO] $Message" -ForegroundColor Cyan 
        }
        "success" { 
            Write-Host "[SUCCESS] $Message" -ForegroundColor Green 
        }
        "warning" { 
            Write-Host "[WARNING] $Message" -ForegroundColor Yellow 
        }
        "error" { 
            Write-Host "[ERROR] $Message" -ForegroundColor Red 
        }
        default { 
            Write-Host $Message 
        }
    }
}

# Fungsi untuk memeriksa status perintah
function Test-CommandStatus {
    param (
        [string]$SuccessMessage,
        [string]$ErrorMessage
    )
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorMessage "success" $SuccessMessage
    } else {
        Write-ColorMessage "error" $ErrorMessage
        exit 1
    }
}

# Pesan pembuka
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   DEPLOY APLIKASI KE NETLIFY        " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Pembersihan cache dan folder build sebelumnya
Write-ColorMessage "info" "Membersihkan cache dan build sebelumnya..."
npm run clean
Test-CommandStatus "Pembersihan berhasil" "Pembersihan gagal"

# 2. Instalasi dependensi jika diminta
$installDeps = Read-Host "Apakah Anda ingin menginstal ulang dependensi? (y/n)"
if ($installDeps -eq "y" -or $installDeps -eq "Y") {
    Write-ColorMessage "info" "Menginstal dependensi..."
    npm install
    Test-CommandStatus "Instalasi dependensi berhasil" "Instalasi dependensi gagal"
}

# 3. Periksa PDF.js worker
Write-ColorMessage "info" "Memeriksa keberadaan file PDF.js worker..."
if (-not (Test-Path -Path "./public/pdf.worker.min.js")) {
    Write-ColorMessage "warning" "File PDF.js worker tidak ditemukan di folder public"
    Write-ColorMessage "info" "Mengunduh PDF.js worker..."
    
    Invoke-WebRequest -Uri "https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.js" -OutFile "./public/pdf.worker.min.js"
    Test-CommandStatus "PDF.js worker berhasil diunduh" "Gagal mengunduh PDF.js worker"
} else {
    Write-ColorMessage "success" "File PDF.js worker sudah ada"
}

# 4. Build aplikasi
Write-ColorMessage "info" "Memulai proses build aplikasi..."
$env:DEPLOY_TARGET = "netlify"
npm run build:netlify
Test-CommandStatus "Build aplikasi berhasil" "Build aplikasi gagal"

# 5. Persiapan Netlify
Write-ColorMessage "info" "Menjalankan script persiapan Netlify..."
npm run prepare-netlify
Test-CommandStatus "Persiapan Netlify berhasil" "Persiapan Netlify gagal"

# 6. Pengecekan CLI Netlify
Write-ColorMessage "info" "Memeriksa CLI Netlify..."
$netlifyInstalled = $null
try {
    $netlifyInstalled = Get-Command netlify -ErrorAction SilentlyContinue
} catch {
    $netlifyInstalled = $null
}

if ($null -eq $netlifyInstalled) {
    Write-ColorMessage "warning" "Netlify CLI tidak ditemukan"
    Write-ColorMessage "info" "Menginstal Netlify CLI..."
    npm install -g netlify-cli
    Test-CommandStatus "Instalasi Netlify CLI berhasil" "Instalasi Netlify CLI gagal"
} else {
    Write-ColorMessage "success" "Netlify CLI sudah terinstal"
}

# 7. Login ke Netlify jika diperlukan
Write-ColorMessage "info" "Memeriksa status login Netlify..."
$netlifyStatus = netlify status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "warning" "Anda belum login ke Netlify"
    Write-ColorMessage "info" "Silakan login ke Netlify..."
    netlify login
    Test-CommandStatus "Login Netlify berhasil" "Login Netlify gagal"
} else {
    Write-ColorMessage "success" "Sudah login ke Netlify"
}

# 8. Deploy ke Netlify
Write-ColorMessage "info" "Siap untuk deploy ke Netlify..."

# Tanyakan apakah deploy ke produksi atau draft
$deployProd = Read-Host "Deploy ke produksi? (y/n, n untuk draft URL)"

if ($deployProd -eq "y" -or $deployProd -eq "Y") {
    Write-ColorMessage "info" "Memulai deployment ke produksi..."
    netlify deploy --prod --dir=out
    Test-CommandStatus "Deployment ke produksi berhasil" "Deployment ke produksi gagal"
} else {
    Write-ColorMessage "info" "Memulai deployment ke draft..."
    netlify deploy --dir=out
    Test-CommandStatus "Deployment ke draft berhasil" "Deployment ke draft gagal"
}

# Pesan penutup
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT SELESAI                " -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-ColorMessage "success" "Aplikasi berhasil di-deploy ke Netlify!" 